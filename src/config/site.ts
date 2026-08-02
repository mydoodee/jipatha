export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "CCTV Master",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  description:
    "CCTV Master — ศูนย์รวมเปรียบเทียบราคากล้องวงจรปิด พร้อม AI ช่วยเลือกกล้องวงจรปิดตามงบประมาณ สเปค และการใช้งาน คัดสรรดีลคุ้มที่สุดจาก Shopee",
  locale: "th_TH",
  language: "th",
  themeColor: "#EE4D2D",
  author: "CCTV Master Team",
  keywords: [
    "กล้องวงจรปิด",
    "CCTV",
    "เปรียบเทียบราคากล้องวงจรปิด",
    "AI แนะนำกล้องวงจรปิด",
    "กล้องไร้สาย",
    "กล้องโซล่าเซลล์",
    "กล้อง 4G ใส่ซิม",
    "กล้องติดรถยนต์",
    "กล้องวงจรปิด Shopee",
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
