-- Module 2.6 — shopkeeper flow: shop profile, catalog, stock and orders.
-- Every write runs through a SECURITY DEFINER function that reads the signed-in
-- profile from JWT claims, so no client can touch another shop's rows.
-- Verification rule: an unapproved shopkeeper may only save drafts, and a job
-- can never be created for a partner whose KYC is not approved.

-- ---------- owner visibility (public policies hide blocked / unlisted rows) ----------
CREATE POLICY shop_owner_read ON "Shop" FOR SELECT TO authenticated
  USING ("ownerId" = public.current_profile_id() OR public.is_admin());

CREATE POLICY product_owner_read ON "Product" FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM "Shop" s
                  WHERE s.id = "shopId"
                    AND (s."ownerId" = public.current_profile_id() OR public.is_admin())));

-- ---------- shop profile ----------
CREATE OR REPLACE FUNCTION public.upsert_shop(
  p_name text, p_address text, p_city text, p_zone text, p_gstin text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  me uuid := public.current_profile_id();
  sid uuid;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'NOT_SIGNED_IN'; END IF;
  IF public.current_profile_role() IS DISTINCT FROM 'shopkeeper' THEN
    RAISE EXCEPTION 'SHOPKEEPERS_ONLY';
  END IF;
  IF EXISTS (SELECT 1 FROM "Profile" WHERE id = me AND blocked) THEN
    RAISE EXCEPTION 'PROFILE_BLOCKED';
  END IF;
  IF char_length(btrim(COALESCE(p_name, ''))) < 2 THEN RAISE EXCEPTION 'BAD_SHOP_NAME'; END IF;
  IF char_length(btrim(COALESCE(p_city, ''))) < 2 THEN RAISE EXCEPTION 'BAD_CITY'; END IF;

  SELECT id INTO sid FROM "Shop" WHERE "ownerId" = me;
  BEGIN
    IF sid IS NULL THEN
      INSERT INTO "Shop" ("ownerId", name, address, city, zone, gstin)
      VALUES (me, btrim(p_name), btrim(COALESCE(p_address, '')), btrim(lower(p_city)),
              btrim(lower(COALESCE(p_zone, ''))), NULLIF(btrim(upper(COALESCE(p_gstin, ''))), ''))
      RETURNING id INTO sid;
    ELSE
      UPDATE "Shop"
         SET name = btrim(p_name),
             address = btrim(COALESCE(p_address, address)),
             city = btrim(lower(p_city)),
             zone = btrim(lower(COALESCE(p_zone, zone))),
             gstin = COALESCE(NULLIF(btrim(upper(COALESCE(p_gstin, ''))), ''), gstin)
       WHERE id = sid
      RETURNING id INTO sid;
    END IF;
  EXCEPTION
    WHEN unique_violation THEN RAISE EXCEPTION 'GSTIN_ALREADY_USED';
  END;
  RETURN sid;
END;
$$;

-- ---------- catalog ----------
CREATE OR REPLACE FUNCTION public.save_product(
  p_id uuid, p_brand text, p_name text, p_category text, p_finish text,
  p_size_l numeric, p_price_paise integer, p_mrp_paise integer,
  p_stock integer, p_listed boolean
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  me uuid := public.current_profile_id();
  sid uuid;
  kyc text;
  pid uuid := p_id;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'NOT_SIGNED_IN'; END IF;
  SELECT "kycStatus"::text INTO kyc FROM "Profile" WHERE id = me;
  SELECT id INTO sid FROM "Shop" WHERE "ownerId" = me;
  IF sid IS NULL THEN RAISE EXCEPTION 'NO_SHOP'; END IF;
  IF EXISTS (SELECT 1 FROM "Shop" WHERE id = sid AND blocked) THEN RAISE EXCEPTION 'SHOP_BLOCKED'; END IF;

  -- Verification gate: only an approved shopkeeper may publish a product.
  IF COALESCE(p_listed, TRUE) AND kyc IS DISTINCT FROM 'approved' THEN
    RAISE EXCEPTION 'KYC_NOT_APPROVED';
  END IF;

  IF char_length(btrim(COALESCE(p_name, ''))) < 2 THEN RAISE EXCEPTION 'BAD_PRODUCT_NAME'; END IF;
  IF COALESCE(p_price_paise, 0) <= 0 THEN RAISE EXCEPTION 'BAD_PRICE'; END IF;
  IF COALESCE(p_mrp_paise, p_price_paise) < p_price_paise THEN RAISE EXCEPTION 'MRP_BELOW_PRICE'; END IF;
  IF COALESCE(p_stock, 0) < 0 THEN RAISE EXCEPTION 'BAD_STOCK'; END IF;
  IF COALESCE(p_size_l, 0) <= 0 THEN RAISE EXCEPTION 'BAD_SIZE'; END IF;

  IF pid IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM "Product" WHERE id = pid AND "shopId" = sid) THEN
      RAISE EXCEPTION 'NOT_YOUR_PRODUCT';
    END IF;
    IF EXISTS (SELECT 1 FROM "Product" WHERE id = pid AND "removedByAdmin") THEN
      RAISE EXCEPTION 'REMOVED_BY_ADMIN';
    END IF;
    UPDATE "Product"
       SET brand = btrim(COALESCE(p_brand, brand)),
           name = btrim(p_name),
           category = btrim(lower(COALESCE(p_category, category))),
           finish = btrim(lower(COALESCE(p_finish, finish))),
           "sizeL" = p_size_l,
           "pricePaise" = p_price_paise,
           "mrpPaise" = COALESCE(p_mrp_paise, "mrpPaise"),
           stock = COALESCE(p_stock, stock),
           listed = COALESCE(p_listed, listed)
     WHERE id = pid;
  ELSE
    INSERT INTO "Product" ("shopId", brand, name, category, finish, "sizeL",
                           "pricePaise", "mrpPaise", stock, listed)
    VALUES (sid, btrim(COALESCE(p_brand, '')), btrim(p_name),
            btrim(lower(COALESCE(p_category, 'other'))), btrim(lower(COALESCE(p_finish, 'matte'))),
            p_size_l, p_price_paise, COALESCE(p_mrp_paise, p_price_paise),
            COALESCE(p_stock, 0), COALESCE(p_listed, TRUE))
    RETURNING id INTO pid;
  END IF;
  RETURN pid;
END;
$$;

CREATE OR REPLACE FUNCTION public.adjust_product_stock(p_product uuid, p_delta integer)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  me uuid := public.current_profile_id();
  sid uuid;
  next_stock integer;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'NOT_SIGNED_IN'; END IF;
  SELECT id INTO sid FROM "Shop" WHERE "ownerId" = me;
  IF sid IS NULL THEN RAISE EXCEPTION 'NO_SHOP'; END IF;

  SELECT stock INTO next_stock FROM "Product"
   WHERE id = p_product AND "shopId" = sid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_YOUR_PRODUCT'; END IF;

  next_stock := next_stock + COALESCE(p_delta, 0);
  IF next_stock < 0 THEN RAISE EXCEPTION 'STOCK_CANNOT_GO_NEGATIVE'; END IF;
  UPDATE "Product" SET stock = next_stock WHERE id = p_product;
  RETURN next_stock;
END;
$$;

-- ---------- orders ----------
CREATE OR REPLACE FUNCTION public.place_shop_order(p_shop uuid, p_job uuid, p_items jsonb)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  me uuid := public.current_profile_id();
  item jsonb;
  pid uuid;
  qty integer;
  price integer;
  on_hand integer;
  pname text;
  total integer := 0;
  pids uuid[] := '{}';
  qtys integer[] := '{}';
  oid uuid;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'NOT_SIGNED_IN'; END IF;
  IF EXISTS (SELECT 1 FROM "Profile" WHERE id = me AND blocked) THEN
    RAISE EXCEPTION 'PROFILE_BLOCKED';
  END IF;
  IF p_shop IS NULL OR NOT EXISTS (SELECT 1 FROM "Shop" WHERE id = p_shop AND NOT blocked) THEN
    RAISE EXCEPTION 'SHOP_UNAVAILABLE';
  END IF;
  IF p_job IS NOT NULL AND NOT EXISTS (
       SELECT 1 FROM "Job" WHERE id = p_job AND ("customerId" = me OR "partnerId" = me)) THEN
    RAISE EXCEPTION 'JOB_NOT_YOURS';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'EMPTY_ORDER';
  END IF;
  IF jsonb_array_length(p_items) > 40 THEN RAISE EXCEPTION 'TOO_MANY_ITEMS'; END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    pid := NULLIF(item->>'productId', '')::uuid;
    qty := COALESCE((item->>'qty')::integer, 0);
    IF pid IS NULL OR qty <= 0 OR qty > 500 THEN RAISE EXCEPTION 'BAD_ITEM'; END IF;
    IF pid = ANY (pids) THEN RAISE EXCEPTION 'DUPLICATE_ITEM'; END IF;

    SELECT "pricePaise", stock, name INTO price, on_hand, pname
      FROM "Product"
     WHERE id = pid AND "shopId" = p_shop AND listed AND NOT "removedByAdmin"
     FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'PRODUCT_UNAVAILABLE'; END IF;
    IF on_hand < qty THEN RAISE EXCEPTION 'OUT_OF_STOCK: %', pname; END IF;

    UPDATE "Product" SET stock = stock - qty WHERE id = pid;
    total := total + price * qty;
    pids := pids || pid;
    qtys := qtys || qty;
  END LOOP;

  INSERT INTO "ShopOrder" ("shopId", "buyerId", "jobId", zone, "totalPaise", status, "windowEndsAt")
  VALUES (p_shop, me, p_job, (SELECT zone FROM "Shop" WHERE id = p_shop), total, 'new',
          now() + interval '2 hours')
  RETURNING id INTO oid;

  FOR i IN 1 .. array_length(pids, 1) LOOP
    INSERT INTO "ShopOrderItem" ("orderId", "productId", qty) VALUES (oid, pids[i], qtys[i]);
  END LOOP;
  RETURN oid;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_shop_order_status(p_order uuid, p_status text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  me uuid := public.current_profile_id();
  sid uuid;
  cur text;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'NOT_SIGNED_IN'; END IF;
  SELECT status::text, "shopId" INTO cur, sid FROM "ShopOrder" WHERE id = p_order FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ORDER_NOT_FOUND'; END IF;
  IF NOT EXISTS (SELECT 1 FROM "Shop" WHERE id = sid AND "ownerId" = me) THEN
    RAISE EXCEPTION 'NOT_YOUR_ORDER';
  END IF;
  IF p_status IS NULL OR p_status NOT IN ('accepted', 'delivered') THEN
    RAISE EXCEPTION 'BAD_STATUS';
  END IF;
  IF cur = 'delivered' THEN RAISE EXCEPTION 'ALREADY_DELIVERED'; END IF;
  IF cur = 'accepted' AND p_status <> 'delivered' THEN RAISE EXCEPTION 'BAD_TRANSITION'; END IF;

  UPDATE "ShopOrder" SET status = p_status::"OrderStatus" WHERE id = p_order;
  RETURN p_status;
END;
$$;

-- ---------- verification lock: a job needs an approved partner ----------
CREATE OR REPLACE FUNCTION public.guard_job_partner_kyc() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  kyc text;
BEGIN
  SELECT "kycStatus"::text INTO kyc FROM "Profile" WHERE id = NEW."partnerId";
  IF kyc IS DISTINCT FROM 'approved' THEN
    RAISE EXCEPTION 'PARTNER_KYC_NOT_APPROVED';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER job_partner_kyc
  BEFORE INSERT ON "Job" FOR EACH ROW
  EXECUTE FUNCTION public.guard_job_partner_kyc();

-- ---------- grants ----------
REVOKE ALL ON FUNCTION public.upsert_shop(text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_product(uuid, text, text, text, text, numeric, integer, integer, integer, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.adjust_product_stock(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.place_shop_order(uuid, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_shop_order_status(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.upsert_shop(text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_product(uuid, text, text, text, text, numeric, integer, integer, integer, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_product_stock(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.place_shop_order(uuid, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_shop_order_status(uuid, text) TO authenticated;