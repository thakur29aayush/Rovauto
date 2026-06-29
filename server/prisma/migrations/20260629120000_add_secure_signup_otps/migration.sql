CREATE TABLE "pending_signups" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
  "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
  "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pending_signups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "email_otps" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "otpHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "email_otps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "phone_otps" (
  "id" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "otpHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "phone_otps_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pending_signups_email_key" ON "pending_signups"("email");
CREATE UNIQUE INDEX "pending_signups_phone_key" ON "pending_signups"("phone");
CREATE INDEX "pending_signups_email_idx" ON "pending_signups"("email");
CREATE INDEX "pending_signups_phone_idx" ON "pending_signups"("phone");
CREATE INDEX "pending_signups_expiresAt_idx" ON "pending_signups"("expiresAt");
CREATE INDEX "email_otps_email_idx" ON "email_otps"("email");
CREATE INDEX "email_otps_expiresAt_idx" ON "email_otps"("expiresAt");
CREATE INDEX "phone_otps_phone_idx" ON "phone_otps"("phone");
CREATE INDEX "phone_otps_expiresAt_idx" ON "phone_otps"("expiresAt");
