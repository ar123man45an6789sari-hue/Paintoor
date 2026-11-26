-- Module 2.6 — full product removal. A product that already appears in past
-- orders cannot be deleted (order history must stay truthful); the guard says
-- so in plain words and the shopkeeper unlists it instead.
CREATE OR REPLACE FUNCTION public.delete_product(p_product uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  me uuid := public.current_profile_id();
  sid uuid;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'NOT_SIGNED_IN'; END IF;
  SELECT id INTO sid FROM "Shop" WHERE "ownerId" = me;
  IF sid IS NULL THEN RAISE EXCEPTION 'NO_SHOP'; END IF;
  IF NOT EXISTS (SELECT 1 FROM "Product" WHERE id = p_product AND "shopId" = sid) THEN
    RAISE EXCEPTION 'NOT_YOUR_PRODUCT';
  END IF;
  IF EXISTS (SELECT 1 FROM "ShopOrderItem" WHERE "productId" = p_product) THEN
    RAISE EXCEPTION 'PRODUCT_IN_ORDERS';
  END IF;
  DELETE FROM "Product" WHERE id = p_product AND "shopId" = sid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_product(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_product(uuid) TO authenticated;