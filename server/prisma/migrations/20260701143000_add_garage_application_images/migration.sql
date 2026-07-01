-- CreateTable
CREATE TABLE "GarageApplicationImage" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isThumbnail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GarageApplicationImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GarageApplicationImage_applicationId_idx" ON "GarageApplicationImage"("applicationId");

-- CreateIndex
CREATE INDEX "GarageApplicationImage_isThumbnail_idx" ON "GarageApplicationImage"("isThumbnail");

-- AddForeignKey
ALTER TABLE "GarageApplicationImage" ADD CONSTRAINT "GarageApplicationImage_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "GarageApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
