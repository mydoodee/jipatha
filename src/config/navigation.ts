export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

export const mainNavigation: NavItem[] = [
  { label: "หน้าแรก", href: "/" },
  { label: "สินค้าทั้งหมด", href: "/products" },
  { label: "หมวดหมู่", href: "/categories" },
  { label: "บทความ", href: "/blog" },
];

export const footerNavigation = {
  main: [
    { label: "หน้าแรก", href: "/" },
    { label: "สินค้าทั้งหมด", href: "/products" },
    { label: "หมวดหมู่", href: "/categories" },
    { label: "บทความ", href: "/blog" },
  ],
  legal: [
    { label: "เกี่ยวกับเรา", href: "/about" },
    { label: "ติดต่อเรา", href: "/contact" },
    { label: "นโยบายความเป็นส่วนตัว", href: "/privacy-policy" },
  ],
};

export const adminNavigation: NavItem[] = [
  { label: "แดชบอร์ด", href: "/admin/dashboard" },
  { label: "สินค้า", href: "/admin/products" },
  { label: "Shopee Sync (ร้านตัวเอง)", href: "/admin/shopee-sync" },
  { label: "ระบบดึงออโต้", href: "/admin/auto-import" },
  { label: "หมวดหมู่", href: "/admin/categories" },
  { label: "บทความ", href: "/admin/posts" },
  { label: "Affiliate", href: "/admin/affiliate" },
  { label: "สื่อ", href: "/admin/media" },
  { label: "วิเคราะห์", href: "/admin/analytics" },
  { label: "ตั้งค่า", href: "/admin/settings" },
];
