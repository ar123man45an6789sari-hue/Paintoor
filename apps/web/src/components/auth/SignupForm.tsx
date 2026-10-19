/* SignupForm v3 — schema-driven, fully localised, email on every role. */
"use client";

import type { FormEvent } from "react";
import type { Role } from "./types";
import { useI18n } from "@/i18n";

type Field = {
  name: string;
  labelKey: string;
  type: "text" | "tel" | "number" | "email" | "select";
  options?: string[];
  placeholderKey?: string;
  required?: boolean;
};

const FORMS: Record<Role, { titleKey: string; blurbKey: string; fields: Field[] }> = {
  customer: {
    titleKey: "sf.c.t",
    blurbKey: "sf.c.b",
    fields: [
      { name: "full_name", labelKey: "f.name", type: "text", required: true },
      { name: "phone", labelKey: "f.phone", type: "tel", required: true, placeholderKey: "f.phonePh" },
      { name: "email", labelKey: "f.email", type: "email", required: true, placeholderKey: "f.emailPh" },
      { name: "language", labelKey: "f.lang", type: "select", options: ["English", "हिंदी", "ગુજરાતી"], required: true },
    ],
  },
  provider: {
    titleKey: "sf.p.t",
    blurbKey: "sf.p.b",
    fields: [
      { name: "full_name", labelKey: "f.nameAadhaar", type: "text", required: true },
      { name: "phone", labelKey: "f.phone", type: "tel", required: true, placeholderKey: "f.phonePh" },
      { name: "email", labelKey: "f.email", type: "email", required: true, placeholderKey: "f.emailPh" },
      { name: "primary_skill", labelKey: "f.skill", type: "select", options: ["Painting", "Electrical", "Plumbing", "Carpentry", "Cleaning"], required: true },
      { name: "experience_years", labelKey: "f.exp", type: "number", required: true },
      { name: "zone", labelKey: "f.zone", type: "text", required: true },
    ],
  },
  shopkeeper: {
    titleKey: "sf.s.t",
    blurbKey: "sf.s.b",
    fields: [
      { name: "shop_name", labelKey: "f.shop", type: "text", required: true },
      { name: "owner_name", labelKey: "f.owner", type: "text", required: true },
      { name: "phone", labelKey: "f.phone", type: "tel", required: true, placeholderKey: "f.phonePh" },
      { name: "email", labelKey: "f.email", type: "email", required: true, placeholderKey: "f.emailPh" },
      { name: "shop_category", labelKey: "f.cat", type: "select", options: ["Paints", "Hardware", "Sanitary", "Electrical goods", "Tools"], required: true },
      { name: "zone", labelKey: "f.zone", type: "text", required: true },
      { name: "gstin", labelKey: "f.gstin", type: "text" },
    ],
  },
};

type Props = {
  role: Role;
  onBack: () => void;
  onSubmit: (data: Record<string, string>) => void;
};

export function SignupForm({ role, onBack, onSubmit }: Props) {
  const { t } = useI18n();
  const form = FORMS[role];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    onSubmit(data);
  }

  const inputClass = "w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-saffron";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-extrabold text-navy">{t(form.titleKey)}</h3>
        <p className="text-sm text-muted">{t(form.blurbKey)}</p>
      </div>

      {form.fields.map((field) => (
        <label key={field.name} className="block">
          <span className="mb-1 block text-sm font-bold text-ink">{t(field.labelKey)}</span>
          {field.type === "select" ? (
            <select name={field.name} required={field.required} className={inputClass}>
              {field.options?.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              name={field.name}
              type={field.type}
              required={field.required}
              placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
              className={inputClass}
            />
          )}
        </label>
      ))}

      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-saffron" />
        {t("f.consent")}
      </label>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onBack} className="rounded-control border-2 border-line px-4 py-2.5 text-sm font-extrabold text-muted hover:border-navy hover:text-navy">
          {t("auth.back")}
        </button>
        <button type="submit" className="flex-1 rounded-control bg-saffron px-4 py-2.5 text-sm font-extrabold text-white hover:shadow-lift">
          {t("f.continue")}
        </button>
      </div>
    </form>
  );
}