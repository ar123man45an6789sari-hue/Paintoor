import type { Metadata } from "next";
import { I18nProvider } from "@/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import localFont from "next/font/local";
import "./globals.css";

/* Fonts repo mein bundled hain — build kabhi Google network pe depend nahi karega. */
const noto = localFont({
  src: [
    { path: "./fonts/noto-sans-latin.woff2", style: "normal", weight: "400 900" },
    { path: "./fonts/noto-sans-devanagari.woff2", style: "normal", weight: "400 900" },
  ],
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