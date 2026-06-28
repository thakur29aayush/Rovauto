ALTER TABLE "Payment" RENAME COLUMN "razorpayOrderId" TO "cashfreeOrderId";
ALTER TABLE "Payment" RENAME COLUMN "razorpayPaymentId" TO "cashfreePaymentId";
ALTER TABLE "Payment" RENAME COLUMN "razorpaySignature" TO "cashfreePaymentSessionId";

ALTER TABLE "WalletTransaction" RENAME COLUMN "razorpayOrderId" TO "cashfreeOrderId";
ALTER TABLE "WalletTransaction" RENAME COLUMN "razorpayPaymentId" TO "cashfreePaymentId";

ALTER TABLE "GarageWalletTransaction" RENAME COLUMN "razorpayOrderId" TO "cashfreeOrderId";
ALTER TABLE "GarageWalletTransaction" RENAME COLUMN "razorpayPaymentId" TO "cashfreePaymentId";

ALTER INDEX IF EXISTS "Payment_razorpayOrderId_key" RENAME TO "Payment_cashfreeOrderId_key";
ALTER INDEX IF EXISTS "Payment_razorpayPaymentId_key" RENAME TO "Payment_cashfreePaymentId_key";
