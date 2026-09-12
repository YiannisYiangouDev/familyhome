ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Booking_status_expiresAt_idx" ON "Booking"(status, "expiresAt");
