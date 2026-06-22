import { z } from "zod";

export const createSosSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid("Invalid vehicle ID"),

    latitude: z.number({
      required_error: "Latitude is required",
    }).min(-90).max(90),

    longitude: z.number({
      required_error: "Longitude is required",
    }).min(-180).max(180),

    address: z.string().max(500).optional(),

    note: z.string().max(1000).optional(),
  }),
});

export const sosIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid SOS request ID"),
  }),
});