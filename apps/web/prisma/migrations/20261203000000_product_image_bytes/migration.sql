-- Module 2.6 — device photo upload for catalog products. Bytes live in their
-- own table so catalog list queries stay light; a public media route streams
-- them with cache headers. Self-hosted: no third-party storage, no secrets.
CREATE TABLE "ProductImage" (
  "productId" uuid NOT NULL PRIMARY KEY REFERENCES "Product"(id) ON DELETE CASCADE,
  mime text NOT NULL,
  bytes bytea NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "ProductImage" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "ProductImage" FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_product_image(p_product uuid, p_mime text, p_bytes bytea)
RETURNS void
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
  IF p_mime NOT IN ('image/jpeg', 'image/png', 'image/webp') THEN
    RAISE EXCEPTION 'BAD_IMAGE_TYPE';
  END IF;
  IF octet_length(p_bytes) = 0 THEN RAISE EXCEPTION 'EMPTY_IMAGE'; END IF;
  IF octet_length(p_bytes) > 3000000 THEN RAISE EXCEPTION 'IMAGE_TOO_LARGE'; END IF;

  INSERT INTO "ProductImage" ("productId", mime, bytes)
  VALUES (p_product, p_mime, p_bytes)
  ON CONFLICT ("productId") DO UPDATE
    SET mime = EXCLUDED.mime, bytes = EXCLUDED.bytes, "createdAt" = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_product_image(p_product uuid) RETURNS void
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
  DELETE FROM "ProductImage" WHERE "productId" = p_product;
END;
$$;

REVOKE ALL ON FUNCTION public.set_product_image(uuid, text, bytea) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.remove_product_image(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_product_image(uuid, text, bytea) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_product_image(uuid) TO authenticated;