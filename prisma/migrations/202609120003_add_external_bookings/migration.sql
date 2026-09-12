CREATE TABLE "ExternalBooking" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "checkIn" DATE NOT NULL,
    "checkOut" DATE NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'external',
    "summary" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExternalBooking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExternalBooking_uid_key" ON "ExternalBooking"("uid");
