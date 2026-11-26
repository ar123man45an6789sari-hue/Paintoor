-- Fix: inside SECURITY DEFINER, current_user = owner, so the old guard
-- never fired. Gate on JWT claims instead: claims present + not admin = reject.
CREATE OR REPLACE FUNCTION public.log_admin(actor uuid, action text, target text)
RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rid bigint;
BEGIN
  IF public.current_profile_role() IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'log_admin: admin only';
  END IF;
  INSERT INTO "AdminAuditLog" ("actorId", "action", "target")
  VALUES (actor, action, target)
  RETURNING id INTO rid;
  RETURN rid;
END $$;