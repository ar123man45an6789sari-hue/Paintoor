import type { Metadata } from "next";
import { AboutStory } from "@/components/home/AboutStory";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Paintoor started in Mumbai, how painters and shops get verified, and how escrow keeps your money safe until you approve the work.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutStory />;
}