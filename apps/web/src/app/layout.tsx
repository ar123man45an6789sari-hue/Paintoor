import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { I18nProvider } from "@/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import localFont from "next/font/local";
import "./globals.css";

/* Fonts are bundled in the repo so builds never depend on the Google network. */
const noto = localFont({
  src: [
    { path: "./fonts/noto-sans-latin.woff2", style: "normal", weight: "400 900" },
    { path: "./fonts/noto-sans-devanagari.woff2", style: "normal", weight: "400 900" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Paintoor — Home services, delivered with trust",
    template: "%s — Paintoor",
  },
  description:
    "Verified painters in Mumbai and Vadodara. Compare itemized quotes, pay safely into escrow, and release the money only after you approve the work.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    title: "Paintoor — Home services, delivered with trust",
    description:
      "Verified painters in Mumbai and Vadodara. Compare itemized quotes, pay safely into escrow, approve the work.",
    images: [
      { url: "/paintoor-horizontal.png", width: 1000, height: 263, alt: "Paintoor" },
    ],
  },
  twitter: { card: "summary_large_image" },
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