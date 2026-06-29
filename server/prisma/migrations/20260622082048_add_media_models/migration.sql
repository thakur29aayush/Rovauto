-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "adminReply" TEXT,
ADD COLUMN     "resolvedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN     "avatarPublicId" TEXT;

-- CreateTable
CREATE TABLE "GarageImage" (
    "id" TEXT NOT NULL,
    "garageId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isThumbnail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GarageImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GarageVideo" (
    "id" TEXT NOT NULL,
    "garageId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GarageVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintImage" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplaintImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GarageImage_garageId_idx" ON "GarageImage"("garageId");

-- CreateIndex
CREATE INDEX "GarageImage_isThumbnail_idx" ON "GarageImage"("isThumbnail");

-- CreateIndex
CREATE INDEX "GarageVideo_garageId_idx" ON "GarageVideo"("garageId");

-- CreateIndex
CREATE INDEX "ComplaintImage_complaintId_idx" ON "ComplaintImage"("complaintId");

-- AddForeignKey
ALTER TABLE "GarageImage" ADD CONSTRAINT "GarageImage_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "Garage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarageVideo" ADD CONSTRAINT "GarageVideo_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "Garage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintImage" ADD CONSTRAINT "ComplaintImage_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
