/* Location-sensing copy (EN/HI/GU). City names themselves stay untranslated. */
import type { Lang } from "./i18n";

export const GEO: Record<Lang, Record<string, string>> = {
  en: {
    "geo.detecting": "Finding your city…",
    "geo.cityPh": "Search your city…",
    "geo.setCity": "Set {city} as my city",
  },
  hi: {
    "geo.detecting": "आपका शहर खोजा जा रहा है…",
    "geo.cityPh": "अपना शहर खोजें…",
    "geo.setCity": "{city} को मेरा शहर बनाएं",
  },
  gu: {
    "geo.detecting": "તમારું શહેર શોધી રહ્યાં છીએ…",
    "geo.cityPh": "તમારું શહેર શોધો…",
    "geo.setCity": "{city} ને મારું શહેર બનાવો",
  },
};
