-- Module 2.6 polish — catalog images. The link is optional; cards fall back
-- to a brand initial when a product has no photo yet.
ALTER TABLE "Product" ADD COLUMN "imageUrl" TEXT;

CREATE OR REPLACE FUNCTION public.save_product(
  p_id uuid, p_brand text, p_name text, p_category text, p_finish text,
  p_size_l numeric, p_price_paise integer, p_mrp_paise integer,
  p_stock integer, p_listed boolean, p_image_url text
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
           listed = COALESCE(p_listed, listed),
           "imageUrl" = COALESCE(p_image_url, "imageUrl")
     WHERE id = pid;
  ELSE
    INSERT INTO "Product" ("shopId", brand, name, category, finish, "sizeL",
                           "pricePaise", "mrpPaise", stock, listed, "imageUrl")
    VALUES (sid, btrim(COALESCE(p_brand, '')), btrim(p_name),
            btrim(lower(COALESCE(p_category, 'other'))), btrim(lower(COALESCE(p_finish, 'matte'))),
            p_size_l, p_price_paise, COALESCE(p_mrp_paise, p_price_paise),
            COALESCE(p_stock, 0), COALESCE(p_listed, TRUE), p_image_url)
    RETURNING id INTO pid;
  END IF;
  RETURN pid;
END;
$$;

REVOKE ALL ON FUNCTION public.save_product(uuid, text, text, text, text, numeric, integer, integer, integer, boolean) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.save_product(uuid, text, text, text, text, numeric, integer, integer, integer, boolean, text) TO authenticated;