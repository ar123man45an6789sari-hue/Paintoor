/* One static explanation page per service: /services/interior, /services/
   exterior … Only the six catalogue ids exist; anything else is a 404. */
import type { Metadata } from "next";
import { SERVICES } from "@/lib/services";
import { ServiceDetail } from "@/components/services/ServiceDetail";

type Params = { id: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return SERVICES.map((s) => ({ id: s.id }));
}

export function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return params.then(({ id }) => {
    const sv = SERVICES.find((s) => s.id === id);
    const name = sv ? id.charAt(0).toUpperCase() + id.slice(1) : "Service";
    return {
      title: `${name} painting in Mumbai`,
      description: `How Paintoor runs ${name.toLowerCase()} jobs: what is included, how the price is built, the crew process and ₹0 advance escrow.`,
      alternates: { canonical: `/services/${id}` },
    };
  });
}

export default async function ServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return <ServiceDetail id={id} />;
}