/* Dashboard is a client component too, so its tab title comes from this
   pass-through layout. robots.txt already keeps /dashboard out of the index. */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}