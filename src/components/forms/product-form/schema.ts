import { insertProductSchema } from "@/db/postgres/schema/product";
import { z } from "zod";

export const formSchema = insertProductSchema.merge(
  z.object({
    images: z
      .object({
        id: z.number().int().positive().optional(),
        name: z.string(),
        s3name: z.string(),
        url: z.string(),
        presignedUrl: z.string().optional(),
        file: z.instanceof(File).optional(),
        size: z.number().int(),
        type: z.string(),
        progress: z.number().default(1.0).optional(),
        active: z.boolean().default(true).optional(),
      })
      .array()
      .nullish(),
  })
);

export type FormType = z.infer<typeof formSchema>;
