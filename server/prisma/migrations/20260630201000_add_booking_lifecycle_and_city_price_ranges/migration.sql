ALTER TABLE "Booking" ADD COLUMN "searchExpiresAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "handoverOtpHash" TEXT;
ALTER TABLE "Booking" ADD COLUMN "handoverOtpExpiresAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "handoverOtpVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "deliveredAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "customerAcceptedAt" TIMESTAMP(3);

CREATE TABLE "CityServicePriceRange" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "vehicleBrand" TEXT,
    "vehicleModel" TEXT,
    "fuelType" "FuelType",
    "minPrice" INTEGER NOT NULL,
    "maxPrice" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CityServicePriceRange_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CityServicePriceRange_city_idx" ON "CityServicePriceRange"("city");
CREATE INDEX "CityServicePriceRange_serviceId_idx" ON "CityServicePriceRange"("serviceId");
CREATE INDEX "CityServicePriceRange_vehicleBrand_idx" ON "CityServicePriceRange"("vehicleBrand");
CREATE INDEX "CityServicePriceRange_vehicleModel_idx" ON "CityServicePriceRange"("vehicleModel");
CREATE INDEX "CityServicePriceRange_fuelType_idx" ON "CityServicePriceRange"("fuelType");
CREATE INDEX "CityServicePriceRange_isActive_idx" ON "CityServicePriceRange"("isActive");

ALTER TABLE "CityServicePriceRange" ADD CONSTRAINT "CityServicePriceRange_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
