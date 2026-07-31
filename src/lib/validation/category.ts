import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "กรุณาระบุชื่อหมวดหมู่")
    .max(100, "ชื่อหมวดหมู่ต้องไม่เกิน 100 ตัวอักษร"),
  slug: z
    .string()
    .min(1, "กรุณาระบุ Slug")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug ต้องเป็นตัวพิมพ์เล็ก ตัวเลข และ - เท่านั้น"
    ),
  description: z
    .string()
    .max(500, "รายละเอียดต้องไม่เกิน 500 ตัวอักษร")
    .optional(),
  image: z.string().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  status: z.enum(["active", "inactive"]),
  sortOrder: z.number().int().min(0),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
