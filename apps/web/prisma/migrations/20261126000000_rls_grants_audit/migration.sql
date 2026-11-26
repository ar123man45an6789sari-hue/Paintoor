-- Module 2.3 — Row-Level Security, role grants, audit function.
-- Lock #2: the database itself enforces per-user row visibility,
-- independent of any bug in application code.

-- ---------- actor helpers (claims set per transaction by the app) ----------
CREATE OR REPLACE FUNCTION public.current_profile_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT (NULLIF(current_setting('request.jwt.claims', TRUE), '')::json->>'sub')::uuid
$$;

CREATE OR REPLACE FUNCTION public.current_profile_role() RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', TRUE), '')::json->>'role'
$$;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(public.current_profile_role() = 'admin', FALSE)
$$;

-- ---------- enable RLS on every table ----------
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Partner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Shop" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RequestLead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobMilestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShopOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShopOrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Settlement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Incident" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminAuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Banner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuthOtp" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

-- ---------- deterministic baseline: no role has anything until granted ----------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- ---------- anon (logged-out public site): catalog + safe profile fields ----------
GRANT SELECT ON "Shop", "Product", "Partner", "Banner" TO anon;
GRANT SELECT ("id", "fullName", "city", "role", "kycStatus") ON "Profile" TO anon;

-- ---------- authenticated (signed-in users): reads only.
-- Writes arrive later through SECURITY DEFINER functions (modules 2.4-2.6).
GRANT SELECT ON "Profile", "Partner", "Shop", "Product", "ServiceRequest",
  "RequestLead", "Job", "JobMilestone", "ShopOrder", "ShopOrderItem",
  "Settlement", "Incident", "Banner", "AdminAuditLog" TO authenticated;
GRANT UPDATE ("fullName", "city") ON "Profile" TO authenticated;

-- ---------- policies: who sees which rows ----------
CREATE POLICY profile_anon_read ON "Profile" FOR SELECT TO anon
  USING (NOT blocked);
CREATE POLICY profile_self_read ON "Profile" FOR SELECT TO authenticated
  USING (id = public.current_profile_id() OR public.is_admin());
CREATE POLICY profile_self_update ON "Profile" FOR UPDATE TO authenticated
  USING (id = public.current_profile_id())
  WITH CHECK (id = public.current_profile_id());

CREATE POLICY partner_public_read ON "Partner" FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY shop_public_read ON "Shop" FOR SELECT TO anon, authenticated
  USING (NOT blocked);

CREATE POLICY product_public_read ON "Product" FOR SELECT TO anon, authenticated
  USING (listed AND NOT "removedByAdmin");

CREATE POLICY banner_read ON "Banner" FOR SELECT TO anon, authenticated
  USING (live OR public.is_admin());

CREATE POLICY request_parties_read ON "ServiceRequest" FOR SELECT TO authenticated
  USING ("customerId" = public.current_profile_id()
      OR "acceptedPartnerId" = public.current_profile_id()
      OR public.is_admin());

CREATE POLICY lead_parties_read ON "RequestLead" FOR SELECT TO authenticated
  USING ("partnerId" = public.current_profile_id()
      OR EXISTS (SELECT 1 FROM "ServiceRequest" r
                  WHERE r.id = "requestId"
                    AND r."customerId" = public.current_profile_id())
      OR public.is_admin());

CREATE POLICY job_parties_read ON "Job" FOR SELECT TO authenticated
  USING ("customerId" = public.current_profile_id()
      OR "partnerId" = public.current_profile_id()
      OR public.is_admin());

CREATE POLICY milestone_parties_read ON "JobMilestone" FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM "Job" j
                  WHERE j.id = "jobId"
                    AND (j."customerId" = public.current_profile_id()
                         OR j."partnerId" = public.current_profile_id()))
      OR public.is_admin());

CREATE POLICY order_parties_read ON "ShopOrder" FOR SELECT TO authenticated
  USING ("buyerId" = public.current_profile_id()
      OR EXISTS (SELECT 1 FROM "Shop" s
                  WHERE s.id = "shopId" AND s."ownerId" = public.current_profile_id())
      OR public.is_admin());

CREATE POLICY order_item_parties_read ON "ShopOrderItem" FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM "ShopOrder" o
                  WHERE o.id = "orderId"
                    AND (o."buyerId" = public.current_profile_id()
                         OR EXISTS (SELECT 1 FROM "Shop" s
                                     WHERE s.id = o."shopId"
                                       AND s."ownerId" = public.current_profile_id())))
      OR public.is_admin());

CREATE POLICY settlement_shop_read ON "Settlement" FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM "Shop" s
                  WHERE s.id = "shopId" AND s."ownerId" = public.current_profile_id())
      OR public.is_admin());

CREATE POLICY incident_parties_read ON "Incident" FOR SELECT TO authenticated
  USING ("reportedById" = public.current_profile_id()
      OR "resolvedById" = public.current_profile_id()
      OR public.is_admin());

CREATE POLICY audit_admin_read ON "AdminAuditLog" FOR SELECT TO authenticated
  USING (public.is_admin());

-- AuthOtp + Session: engine-private. No grants, no policies —
-- only the postgres connection (auth engine) can touch them.

-- ---------- append-only audit writer (DEFINER = bypasses RLS safely) ----------
CREATE OR REPLACE FUNCTION public.log_admin(actor uuid, action text, target text)
RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rid bigint;
BEGIN
  IF NOT (public.is_admin() OR current_user IN ('postgres', 'supabase_admin')) THEN
    RAISE EXCEPTION 'log_admin: admin only';
  END IF;
  INSERT INTO "AdminAuditLog" ("actorId", "action", "target")
  VALUES (actor, action, target)
  RETURNING id INTO rid;
  RETURN rid;
END $$;

GRANT EXECUTE ON FUNCTION public.log_admin(uuid, text, text) TO authenticated;