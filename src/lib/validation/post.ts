import { z } from "zod";

export const postSchema = z.object({
  title: z
    .string()
    .min(1, "กรุณาระบุหัวข้อบทความ")
    .max(200, "หัวข้อต้องไม่เกิน 200 ตัวอักษร"),
  slug: z
    .string()
    .min(1, "กรุณาระบุ Slug")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug ต้องเป็นตัวพิมพ์เล็ก ตัวเลข และ - เท่านั้น"
    ),
  excerpt: z
    .string()
    .min(1, "กรุณาระบุบทคัดย่อ")
    .max(300, "บทคัดย่อต้องไม่เกิน 300 ตัวอักษร"),
  content: z.string().min(1, "กรุณาระบุเนื้อหาบทความ"),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()),
  status: z.enum(["draft", "published"]),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

export type PostFormData = z.infer<typeof postSchema>;
