CREATE TYPE "GarageApplicationStatus" AS ENUM ('PENDING', 'CHANGES_REQUESTED', 'APPROVED', 'DENIED');

ALTER TABLE "Garage" ADD COLUMN "applicationId" TEXT;

CREATE TABLE "GarageApplication" (
    "id" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "garageName" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "GarageApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedGarageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GarageApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Garage_applicationId_key" ON "Garage"("applicationId");
CREATE UNIQUE INDEX "GarageApplication_approvedGarageId_key" ON "GarageApplication"("approvedGarageId");
CREATE INDEX "GarageApplication_email_idx" ON "GarageApplication"("email");
CREATE INDEX "GarageApplication_phone_idx" ON "GarageApplication"("phone");
CREATE INDEX "GarageApplication_status_idx" ON "GarageApplication"("status");
CREATE INDEX "GarageApplication_createdAt_idx" ON "GarageApplication"("createdAt");
