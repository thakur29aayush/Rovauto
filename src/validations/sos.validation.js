const { z } = require("zod");

const createSosSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid("Invalid vehicle ID"),

    latitude: z.coerce
      .number({
        required_error: "Latitude is required",
      })
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),

    longitude: z.coerce
      .number({
        required_error: "Longitude is required",
      })
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),

    address: z.string().max(500).optional(),

    note: z.string().max(1000).optional(),
  }),
});

const sosIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid SOS request ID"),
  }),
});

module.exports = {
  createSosSchema,
  sosIdParamSchema,
};