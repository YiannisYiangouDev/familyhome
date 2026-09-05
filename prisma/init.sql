CREATE TABLE IF NOT EXISTS "Season" (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  rate INT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  UNIQUE(year, "startDate", "endDate")
);

CREATE TABLE IF NOT EXISTS "Booking" (
  id SERIAL PRIMARY KEY,
  "checkIn" DATE NOT NULL,
  "checkOut" DATE NOT NULL,
  nights INT NOT NULL,
  "guestName" TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  adults INT NOT NULL DEFAULT 2,
  children INT NOT NULL DEFAULT 0,
  "totalCents" INT NOT NULL,
  "depositCents" INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  "stripeSessionId" TEXT UNIQUE,
  "stripePaymentId" TEXT,
  notes TEXT NOT NULL DEFAULT '',
  "seasonId" INT REFERENCES "Season"(id),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Booking_checkIn_checkOut_idx" ON "Booking"("checkIn", "checkOut");

CREATE TABLE IF NOT EXISTS "BlockedDate" (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason TEXT NOT NULL DEFAULT 'blocked'
);

CREATE TABLE IF NOT EXISTS "Setting" (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO "Setting" (key, value) VALUES
  ('deposit_pct', '30'),
  ('min_nights', '3'),
  ('cleaning_fee', '0'),
  ('base_rate', '200'),
  ('contact_email', 'yiannis@yiangouweb.com'),
  ('contact_phone', '+357XXXXXXXX')
ON CONFLICT (key) DO NOTHING;

SELECT tablename FROM pg_tables WHERE schemaname='public';
