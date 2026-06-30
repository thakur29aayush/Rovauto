ALTER TABLE "Booking" ADD COLUMN "totalServiceMaxAmount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BookingService" ADD COLUMN "estimatedMinPrice" INTEGER;
ALTER TABLE "BookingService" ADD COLUMN "estimatedMaxPrice" INTEGER;

UPDATE "BookingService"
SET "estimatedMinPrice" = "estimatedPrice",
    "estimatedMaxPrice" = CASE
      WHEN "estimatedPrice" IS NULL THEN NULL
      ELSE "estimatedPrice" + 500
    END
WHERE "estimatedMinPrice" IS NULL
  AND "estimatedMaxPrice" IS NULL;

UPDATE "Booking"
SET "totalServiceMaxAmount" = "totalServiceAmount" + 500
WHERE "totalServiceMaxAmount" = 0
  AND "totalServiceAmount" > 0;
