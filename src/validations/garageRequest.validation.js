import { z } from "zod";

export const garageRequestIdParamSchema = z.object({
  params: z.object({
    requestId: z.string().uuid("Invalid request ID"),
  }),
});

export const rejectGarageRequestSchema = z.object({
  params: z.object({
    requestId: z.string().uuid("Invalid request ID"),
  }),
  body: z.object({
    note: z.string().max(500, "Note cannot exceed 500 characters").optional(),
  }),
});

export const acceptGarageRequestSchema = z.object({
  params: z.object({
    requestId: z.string().uuid("Invalid request ID"),
  }),
  body: z.object({
    note: z.string().max(500, "Note cannot exceed 500 characters").optional(),
  }),
});