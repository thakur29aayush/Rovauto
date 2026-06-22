import { z } from "zod";

export const serviceMediaTypeEnum = z.enum(["IMAGE", "VIDEO"]);

export const serviceIdParamSchema = z.object({
  params: z.object({
    serviceId: z.string().uuid("Invalid service ID"),
  }),
});

export const serviceMediaIdParamSchema = z.object({
  params: z.object({
    mediaId: z.string().uuid("Invalid media ID"),
  }),
});

export const addServiceMediaSchema = z.object({
  params: z.object({
    serviceId: z.string().uuid("Invalid service ID"),
  }),
  body: z.object({
    mediaType: serviceMediaTypeEnum,
    url: z.string().url("Invalid media URL"),
    publicId: z.string().min(1, "Public ID is required"),
    order: z.coerce.number().int().min(0).optional(),
    isThumbnail: z.coerce.boolean().optional(),
    durationSeconds: z.coerce.number().int().positive().optional(),
    sizeBytes: z.coerce.number().int().positive().optional(),
  }),
});

export const updateServiceMediaSchema = z.object({
  params: z.object({
    mediaId: z.string().uuid("Invalid media ID"),
  }),
  body: z.object({
    order: z.coerce.number().int().min(0).optional(),
    isThumbnail: z.coerce.boolean().optional(),
  }),
});