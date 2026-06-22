import { z } from "zod";

export const walletRechargeSchema = z.object({
  body: z.object({
    amount: z
      .number({
        required_error: "Recharge amount is required",
      })
      .int()
      .min(1, "Recharge amount must be at least ₹1"),

    paymentMethod: z.enum(["RAZORPAY", "UPI"]).optional(),
  }),
});

export const useWalletSchema = z.object({
  body: z.object({
    amount: z
      .number({
        required_error: "Wallet amount is required",
      })
      .int()
      .min(1, "Wallet amount must be at least 1 coin"),
  }),
});

export const walletTransactionQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    type: z
      .enum([
        "CREDIT",
        "DEBIT",
        "RECHARGE",
        "REFUND",
        "CASHBACK",
        "BOOKING_PAYMENT",
        "BOOKING_REFUND",
        "GARAGE_ACCEPT_FEE",
        "SOS_DEDUCTION",
      ])
      .optional(),
  }),
});