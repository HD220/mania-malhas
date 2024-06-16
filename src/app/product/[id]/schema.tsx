import { z } from "zod";

export const formSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.coerce.number(),
  images:
    window === undefined
      ? z.any().array().optional()
      : z
          .object({ file: z.instanceof(File) })
          .array()
          .optional(),
});

export type formType = z.infer<typeof formSchema>;
