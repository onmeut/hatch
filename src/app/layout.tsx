import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SiteFooter } from "@/components/site-footer";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "هچ | پلتفرم رویدادها",
  description: "رویدادت رو بساز و با بقیه به اشتراک بذار",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        {children}
        <SiteFooter />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
