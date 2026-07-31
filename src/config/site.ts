export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Jipatha (จิปาถะ)",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  description:
    "Jipatha (จิปาถะ) — รวบรวมรีวิวสินค้าคุณภาพ เปรียบเทียบราคา พร้อมดีลพิเศษจาก Shopee ช่วยคุณตัดสินใจซื้อสินค้าที่ดีที่สุด",
  locale: "th_TH",
  language: "th",
  themeColor: "#EE4D2D",
  author: "Jipatha Team",
  keywords: [
    "จิปาถะ",
    "Jipatha",
    "รีวิวสินค้า",
    "เปรียบเทียบราคา",
    "ดีลสินค้า",
    "Shopee",
    "สินค้าแนะนำ",
    "ช้อปปิ้งออนไลน์",
  ],
  social: {
    facebook: "",
    twitter: "",
    instagram: "",
    line: "",
  },
  affiliateDisclosure:
    "เว็บไซต์นี้มีลิงก์ Affiliate เราอาจได้รับค่าคอมมิชชันเมื่อคุณซื้อสินค้าผ่านลิงก์ของเรา โดยไม่มีค่าใช้จ่ายเพิ่มเติมสำหรับคุณ",
} as const;

export type SiteConfig = typeof siteConfig;
