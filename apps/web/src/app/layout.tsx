import type { Metadata } from "next";
import { I18nProvider } from "@/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

/* Devanagari subset rides along so Hindi renders without a second webfont. */
const noto = Noto_Sans({
  subsets: ["latin", "devanagari"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paintoor — Home services, delivered with trust",
  description:
    "Verified painters, electricians and plumbers in Vadodara. Compare itemized quotes, pay safely into escrow, approve the work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={noto.variable}>
       <body className="font-sans">
        <I18nProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}