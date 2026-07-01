CREATE TYPE "BookingPhotoPhase" AS ENUM ('PICKUP', 'DELIVERY');

CREATE TABLE "BookingInspectionImage" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "garageId" TEXT NOT NULL,
    "phase" "BookingPhotoPhase" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BookingInspectionImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BookingInspectionImage_bookingId_phase_order_key" ON "BookingInspectionImage"("bookingId", "phase", "order");
CREATE INDEX "BookingInspectionImage_bookingId_idx" ON "BookingInspectionImage"("bookingId");
CREATE INDEX "BookingInspectionImage_garageId_idx" ON "BookingInspectionImage"("garageId");
CREATE INDEX "BookingInspectionImage_phase_idx" ON "BookingInspectionImage"("phase");

ALTER TABLE "BookingInspectionImage" ADD CONSTRAINT "BookingInspectionImage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingInspectionImage" ADD CONSTRAINT "BookingInspectionImage_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "Garage"("id") ON DELETE CASCADE ON UPDATE CASCADE;