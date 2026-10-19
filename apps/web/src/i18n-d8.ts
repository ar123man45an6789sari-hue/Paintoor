/* D8 pack — S10 customer-side matched view (EN/HI/GU). */
import type { Lang } from "./i18n";

export const D8: Record<Lang, Record<string, string>> = {
  en: {
    "req.with": "with {name}",
    "notif.close": "Close",
    "notif.newLead.title": "New Lead",
    "notif.newLead.body": "You have a new lead in {category} for {zone}.",
    "req.talkNext": "Talk to {name} and finalise the quote — chat arrives in S12.",
  },
  hi: {
    "req.with": "{name} के साथ",
    "notif.close": "बंद करें",
    "req.talkNext": "{name} से बात करके क्वोट पक्का करें — चैट S12 में आएगी।",
  },
  gu: {
    "req.with": "{name} સાથે",
    "notif.close": "બંધ કરો",
    "req.talkNext": "{name} સાથે વાત કરી ક્વોટ નક્કી કરો — ચેટ S12 માં આવશે.",
  },
};