import { z } from "zod";

export const affiliateLinkSchema = z.object({
  productId: z.string().min(1, "กรุณาระบุรหัสสินค้า"),
  platform: z.literal("shopee"),
  originalUrl: z.string().url("URL ต้นทางไม่ถูกต้อง"),
  affiliateUrl: z.string().url("Affiliate URL ไม่ถูกต้อง"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type AffiliateLinkFormData = z.infer<typeof affiliateLinkSchema>;
