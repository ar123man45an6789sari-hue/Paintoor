import type { Metadata } from "next";
import { PaintStudio } from "@/components/studio/PaintStudio";

export const metadata: Metadata = {
  title: "Paintoor Studio — repaint your wall before anyone paints",
  description:
    "Upload a photo of your room, tap the wall colour and try any paint shade in its real light. Everything runs on your device — photos never leave it.",
};

export default function StudioPage() {
  return <PaintStudio />;
}