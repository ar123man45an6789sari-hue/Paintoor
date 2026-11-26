-- Module 2.4 — customer request flow writers (SECURITY DEFINER).
-- Authenticated role has NO insert/update grants; every state change
-- goes through these functions, which re-check actor + rules inside DB.

CREATE OR REPLACE FUNCTION public.create_request(
  p_customer uuid,
  p_city text,
  p_zone text,
  p_category text,
  p_description text,
  p_budget_paise integer,
  p_material_needed boolean,
  p_preferred_date date,
  p_slot text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rid uuid;
BEGIN
  IF public.current_profile_id() IS DISTINCT FROM p_customer THEN
    RAISE EXCEPTION 'create_request: actor mismatch';
  END IF;
  IF (SELECT role FROM "Profile" WHERE id = p_customer) IS DISTINCT FROM 'customer'::"Role" THEN
    RAISE EXCEPTION 'create_request: customers only';
  END IF;
  INSERT INTO "ServiceRequest"
    ("customerId", "city", "zone", "category", "description",
     "budgetPaise", "materialNeeded", "preferredDate", "slot")
  VALUES
    (p_customer, p_city, p_zone, p_category, p_description,
     p_budget_paise, p_material_needed, p_preferred_date, p_slot)
  RETURNING id INTO rid;
  RETURN rid;
END $$;

CREATE OR REPLACE FUNCTION public.cancel_request(p_request uuid, p_actor uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rec record;
BEGIN
  IF public.current_profile_id() IS DISTINCT FROM p_actor THEN
    RAISE EXCEPTION 'cancel_request: actor mismatch';
  END IF;
  SELECT "customerId", "status" INTO rec
    FROM "ServiceRequest" WHERE id = p_request FOR UPDATE;
  IF rec."customerId" IS NULL THEN
    RAISE EXCEPTION 'cancel_request: not found';
  END IF;
  IF rec."customerId" IS DISTINCT FROM p_actor THEN
    RAISE EXCEPTION 'cancel_request: not your request';
  END IF;
  IF rec."status" NOT IN ('open', 'interested') THEN
    RAISE EXCEPTION 'cancel_request: too late to cancel';
  END IF;
  IF EXISTS (SELECT 1 FROM "Job" WHERE "requestId" = p_request) THEN
    RAISE EXCEPTION 'cancel_request: job already started';
  END IF;
  UPDATE "ServiceRequest" SET "status" = 'cancelled' WHERE id = p_request;
  RETURN TRUE;
END $$;

GRANT EXECUTE ON FUNCTION public.create_request(uuid, text, text, text, text, integer, boolean, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_request(uuid, uuid) TO authenticated;