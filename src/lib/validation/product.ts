import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "กรุณาระบุชื่อสินค้า")
    .max(500, "ชื่อสินค้าต้องไม่เกิน 500 ตัวอักษร"),
  slug: z
    .string()
    .min(1, "กรุณาระบุ Slug")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug ต้องเป็นตัวพิมพ์เล็ก ตัวเลข และ - เท่านั้น"
    ),
  shortDescription: z
    .string()
    .min(1, "กรุณาระบุรายละเอียดสั้น"),
  description: z.string().min(1, "กรุณาระบุรายละเอียดสินค้า"),
  images: z.array(z.string()),
  price: z.number().min(0, "ราคาต้องมากกว่าหรือเท่ากับ 0"),
  originalPrice: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  rating: z.number().min(0).max(5).optional(),
  categoryId: z.string().min(1, "กรุณาเลือกหมวดหมู่"),
  tags: z.array(z.string()),
  platform: z.literal("shopee"),
  affiliateLinkId: z.string(),
  affiliateUrl: z.string().optional(),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
