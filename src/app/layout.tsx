import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { constructMetadata } from "@/lib/seo/metadata";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${notoThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 pb-16 md:pb-0">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
