import { redirect } from "next/navigation";

/** The marketplace was renamed to /partners. Keep the old URL working so
 *  existing links, cached sitemaps and bookmarks never dead-end. */
export default function ProvidersPage() {
  redirect("/partners");
}