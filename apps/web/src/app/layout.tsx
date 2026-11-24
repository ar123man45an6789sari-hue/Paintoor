import type { Metadata, Viewport } from "next";
import { PILOT_CITY_LINE, SITE_NAME, SITE_URL } from "@/lib/site";
import { I18nProvider } from "@/i18n";
import { SiteChrome } from "@/components/SiteChrome";
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
  description: `Verified painters in ${PILOT_CITY_LINE}. Compare itemized quotes, pay safely into escrow, approve the work.`,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    title: "Paintoor — Home services, delivered with trust",
    description: `Verified painters in ${PILOT_CITY_LINE}. Compare itemized quotes, pay safely into escrow, and release the money only after you approve the work.`,
    images: [
      { url: "/paintoor-horizontal.png", width: 1000, height: 263, alt: "Paintoor" },
    ],
  },
  twitter: { card: "summary_large_image" },
};

/* Theme-colours match the light/dark chuna backgrounds so the browser
   chrome (Android status bar, tab strip) follows the visitor's mode. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFB" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1013" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <html lang="en" className={noto.variable} suppressHydrationWarning>
        <head>
        {/* Apply the saved theme before first paint so dark-mode visitors
            never see a white flash on load. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Paintoor" />
        <link rel="apple-touch-icon" href="/paintoor-mark.png" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("gs_theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}',
          }}
        />
      </head>
       <body className="font-sans">
          <I18nProvider>
          <SiteChrome>{children}</SiteChrome>
        </I18nProvider>
      </body>
    </html>
  );
}