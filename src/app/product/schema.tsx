import { z } from "zod";

export const ProductSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string(),
  price: z.coerce.number(),
  images: z
    .object({
      s3_name: z.string(),
      name: z.string(),
      size: z.number().int(),
      type: z.string(),
      url: z.string(),
    })
    .array()
    .optional(),
});

export type ProductType = z.infer<typeof ProductSchema>;
