/* D8 pack — S10 customer-side matched view (EN/HI/GU). */
import type { Lang } from "./i18n";

export const D8: Record<Lang, Record<string, string>> = {
  en: {
    "req.with": "with {name}",
    "req.talkNext": "Talk to {name} and finalise the quote — chat arrives in S12.",
  },
  hi: {
    "req.with": "{name} के साथ",
    "req.talkNext": "{name} से बात करके क्वोट पक्का करें — चैट S12 में आएगी।",
  },
  gu: {
    "req.with": "{name} સાથે",
    "req.talkNext": "{name} સાથે વાત કરી ક્વોટ નક્કી કરો — ચેટ S12 માં આવશે.",
  },
};