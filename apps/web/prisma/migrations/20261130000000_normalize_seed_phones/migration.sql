-- Canonical phone format is 10-digit national; strip the +91 prefix
-- from the original seed fixtures so OTP login matches them.
UPDATE "Profile" SET phone = substr(phone, 4) WHERE phone LIKE '+91%';