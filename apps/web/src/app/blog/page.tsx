import type { Metadata } from "next";
import { JournalIndex } from "@/components/journal/JournalIndex";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Painting guides, honest price explainers and Mumbai monsoon advice — written by the people who run the jobs.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return <JournalIndex />;
}