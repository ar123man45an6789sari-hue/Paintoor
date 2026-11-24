/* PWA manifest — Next serves this at /manifest.webmanifest automatically.
   The existing brand mark (720×715) clears Chrome's 192px installability
   bar, so this step ships zero new binary assets. */
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Paintoor — Home services, delivered with trust",
    short_name: "Paintoor",
    description:
      "Verified painters, live paint-store prices and escrow-protected payments in your city.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#FAFAFB",
    theme_color: "#E00048",
    icons: [
      {
        src: "/paintoor-mark.png",
        sizes: "720x715",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}