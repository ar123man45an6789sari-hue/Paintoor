-- Module 2.5 — partner flow: open-request browsing + lead/job writers.
-- All state changes run inside SECURITY DEFINER functions with actor,
-- role and state guards; the authenticated role keeps zero write grants.

CREATE POLICY request_open_browse ON "ServiceRequest" FOR SELECT TO authenticated
  USING (public.current_profile_role() = 'partner'
     AND status IN ('open', 'interested')
     AND city = (SELECT city FROM "Profile" WHERE id = public.current_profile_id()));

CREATE OR REPLACE FUNCTION public.express_interest(p_request uuid, p_partner uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE st "RequestStatus";
BEGIN
  IF public.current_profile_id() IS DISTINCT FROM p_partner THEN
    RAISE EXCEPTION 'express_interest: actor mismatch';
  END IF;
  IF (SELECT role FROM "Profile" WHERE id = p_partner) IS DISTINCT FROM 'partner'::"Role" THEN
    RAISE EXCEPTION 'express_interest: partners only';
  END IF;
  SELECT status INTO st FROM "ServiceRequest" WHERE id = p_request FOR UPDATE;
  IF st IS DISTINCT FROM 'open'::"RequestStatus" THEN
    RAISE EXCEPTION 'express_interest: request not open';
  END IF;
  IF EXISTS (SELECT 1 FROM "RequestLead" WHERE "requestId" = p_request AND "partnerId" = p_partner) THEN
    RAISE EXCEPTION 'express_interest: already responded';
  END IF;
  INSERT INTO "RequestLead" ("requestId", "partnerId", status)
  VALUES (p_request, p_partner, 'interested');
  UPDATE "ServiceRequest" SET status = 'interested' WHERE id = p_request;
  RETURN TRUE;
END $$;

CREATE OR REPLACE FUNCTION public.decline_lead(p_request uuid, p_partner uuid, p_reason text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.current_profile_id() IS DISTINCT FROM p_partner THEN
    RAISE EXCEPTION 'decline_lead: actor mismatch';
  END IF;
  UPDATE "RequestLead" SET status = 'declined'
    WHERE "requestId" = p_request AND "partnerId" = p_partner AND status = 'interested';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'decline_lead: no active lead';
  END IF;
  RETURN TRUE;
END $$;

CREATE OR REPLACE FUNCTION public.advance_job(p_job uuid, p_partner uuid, p_day integer, p_pct integer)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rec record;
BEGIN
  IF public.current_profile_id() IS DISTINCT FROM p_partner THEN
    RAISE EXCEPTION 'advance_job: actor mismatch';
  END IF;
  SELECT "partnerId", status, "totalDays" INTO rec FROM "Job" WHERE id = p_job FOR UPDATE;
  IF rec."partnerId" IS DISTINCT FROM p_partner THEN
    RAISE EXCEPTION 'advance_job: not your job';
  END IF;
  IF rec.status IS DISTINCT FROM 'live'::"JobStatus" THEN
    RAISE EXCEPTION 'advance_job: job not live';
  END IF;
  IF p_day < 1 OR p_day > rec."totalDays" THEN
    RAISE EXCEPTION 'advance_job: day out of range';
  END IF;
  IF p_pct < 0 OR p_pct > 100 THEN
    RAISE EXCEPTION 'advance_job: pct out of range';
  END IF;
  UPDATE "Job"
     SET day = p_day,
         pct = p_pct,
         status = CASE WHEN p_pct >= 100 THEN 'done'::"JobStatus" ELSE 'live'::"JobStatus" END
   WHERE id = p_job;
  RETURN TRUE;
END $$;

CREATE OR REPLACE FUNCTION public.hire_partner(p_request uuid, p_customer uuid, p_partner uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rec record; jid uuid; start date;
BEGIN
  IF public.current_profile_id() IS DISTINCT FROM p_customer THEN
    RAISE EXCEPTION 'hire_partner: actor mismatch';
  END IF;
  SELECT "customerId", status, "budgetPaise", "preferredDate", zone, city INTO rec
    FROM "ServiceRequest" WHERE id = p_request FOR UPDATE;
  IF rec."customerId" IS DISTINCT FROM p_customer THEN
    RAISE EXCEPTION 'hire_partner: not your request';
  END IF;
  IF rec.status IS DISTINCT FROM 'interested'::"RequestStatus" THEN
    RAISE EXCEPTION 'hire_partner: request not in interested state';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM "RequestLead"
                  WHERE "requestId" = p_request AND "partnerId" = p_partner AND status = 'interested') THEN
    RAISE EXCEPTION 'hire_partner: partner has no active lead';
  END IF;
  IF EXISTS (SELECT 1 FROM "Job" WHERE "requestId" = p_request) THEN
    RAISE EXCEPTION 'hire_partner: job already exists';
  END IF;
  start := COALESCE(rec."preferredDate", current_date);
  INSERT INTO "Job" ("code", "requestId", "customerId", "partnerId", "addressLabel", "city",
                     "totalPaise", day, "totalDays", pct, "startedAt", "endsAt")
  VALUES ('PT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
          p_request, p_customer, p_partner, rec.zone || ', ' || rec.city, rec.city,
          rec."budgetPaise", 1, 5, 0, start, start + 4)
  RETURNING id INTO jid;
  INSERT INTO "JobMilestone" ("jobId", seq, "labelKey", pct, "amountPaise")
  VALUES (jid, 1, 'prep',   30, round(rec."budgetPaise" * 0.30)::integer),
         (jid, 2, 'paint',  30, round(rec."budgetPaise" * 0.30)::integer),
         (jid, 3, 'finish', 40, round(rec."budgetPaise" * 0.40)::integer);
  UPDATE "ServiceRequest" SET status = 'accepted', "acceptedPartnerId" = p_partner
    WHERE id = p_request;
  RETURN jid;
END $$;

GRANT EXECUTE ON FUNCTION public.express_interest(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_lead(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.advance_job(uuid, uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hire_partner(uuid, uuid, uuid) TO authenticated;