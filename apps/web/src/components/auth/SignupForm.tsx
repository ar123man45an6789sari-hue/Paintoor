import type { FormEvent } from "react";
import type { Role } from "./types";

type Field = {
  name: string;
  label: string;
  type: "text" | "tel" | "number" | "select" | "email";
  options?: string[];
  placeholder?: string;
  required?: boolean;
};

/**
 * Schema-driven forms: each role declares its fields, one renderer draws them.
 * Adding a field later = one line here, no JSX changes.
 */
const FORMS: Record<Role, { title: string; blurb: string; fields: Field[] }> = {
  customer: {
    title: "Create your customer account",
    blurb: "Three fields. Nothing more, nothing hidden.",
    fields: [
      { name: "full_name", label: "Full name", type: "text", required: true, placeholder: "Ramesh Patel" },
      { name: "phone", label: "Mobile number", type: "tel", required: true, placeholder: "+91 98765 43210" },
      { name: "email", label: "Email (for easy login later)", type: "email", required: true, placeholder: "you@mail.com" },
      { name: "language", label: "Preferred language", type: "select", options: ["English", "Hindi", "Gujarati"], required: true },
    
    ],
  },
  provider: {
    title: "Create your worker profile",
    blurb: "Your skill is your identity here.",
    fields: [
      { name: "full_name", label: "Full name (as per Aadhaar)", type: "text", required: true },
      { name: "phone", label: "Mobile number", type: "tel", required: true, placeholder: "+91 98765 43210" },
     { name: "email", label: "Email (for easy login later)", type: "email", required: true, placeholder: "you@mail.com" },
      { name: "primary_skill", label: "Primary skill", type: "select", options: ["Painting", "Electrical", "Plumbing", "Carpentry", "Cleaning"], required: true },
      { name: "experience_years", label: "Years of experience", type: "number", required: true, placeholder: "12" },
      { name: "zone", label: "Your area in Vadodara", type: "text", required: true, placeholder: "Alkapuri" },
    ],
  },
  shopkeeper: {
    title: "Put your store on the map",
    blurb: "Your digital counter opens after a quick verification.",
    fields: [
      { name: "shop_name", label: "Store name", type: "text", required: true, placeholder: "Gupta Paints & Hardware" },
      { name: "owner_name", label: "Owner name", type: "text", required: true },
     { name: "email", label: "Email (for easy login later)", type: "email", required: true, placeholder: "you@mail.com" },
      { name: "phone", label: "Mobile number", type: "tel", required: true, placeholder: "+91 98765 43210" },
      { name: "shop_category", label: "Store category", type: "select", options: ["Paints", "Hardware", "Sanitary", "Electrical goods", "Tools"], required: true },
      { name: "zone", label: "Store area in Vadodara", type: "text", required: true, placeholder: "Sama" },
      { name: "gstin", label: "GSTIN (optional for small shops)", type: "text", placeholder: "24XXXXX1Z1X1X" },
    ],
  },
};

type Props = {
  role: Role;
  onBack: () => void;
  onSubmit: (data: Record<string, string>) => void;
};

export function SignupForm({ role, onBack, onSubmit }: Props) {
  const form = FORMS[role];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-extrabold text-navy">{form.title}</h3>
        <p className="text-sm text-muted">{form.blurb}</p>
      </div>

      {form.fields.map((field) => (
        <label key={field.name} className="block">
          <span className="mb-1 block text-sm font-bold text-ink">{field.label}</span>
          {field.type === "select" ? (
            <select name={field.name} required={field.required} className="w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-saffron">
              {field.options?.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              name={field.name}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              className="w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-saffron"
            />
          )}
        </label>
      ))}

      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-saffron" />
        I agree to the Terms of Use and Privacy Policy, and to GharSahayak storing my
        details for this booking journey.
      </label>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onBack} className="rounded-control border-2 border-line px-4 py-2.5 text-sm font-extrabold text-muted hover:border-navy hover:text-navy">
          Back
        </button>
        <button type="submit" className="flex-1 rounded-control bg-saffron px-4 py-2.5 text-sm font-extrabold text-white hover:shadow-lift">
          Continue → OTP
        </button>
      </div>
    </form>
  );
}