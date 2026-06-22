import { z } from "zod";

export const serviceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid service ID"),
  }),
});

export const createServiceSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid("Invalid category ID"),
    name: z.string().min(2, "Service name is required"),
    description: z.string().max(2000).optional(),
    basePrice: z.number().int().positive().optional(),
    minPrice: z.number().int().positive().optional(),
    maxPrice: z.number().int().positive().optional(),
    durationMin: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateServiceSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid service ID"),
  }),
  body: z.object({
    categoryId: z.string().uuid("Invalid category ID").optional(),
    name: z.string().min(2, "Service name is required").optional(),
    description: z.string().max(2000).optional(),
    basePrice: z.number().int().positive().optional(),
    minPrice: z.number().int().positive().optional(),
    maxPrice: z.number().int().positive().optional(),
    durationMin: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createServiceCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name is required"),
    description: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
  }),
});