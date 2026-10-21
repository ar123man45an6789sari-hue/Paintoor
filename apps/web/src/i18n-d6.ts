/* D6 pack — request management strings. */
import type { Lang } from "./i18n";

export const D6: Record<Lang, Record<string, string>> = {
  en: {
    "req.cancel": "Cancel request", "req.confirmQ": "Cancel this request?",
    "req.yes": "Yes, cancel", "req.no": "Keep it",
    "req.photos": "photo(s) attached",
    "req.next": "Partners near you will respond soon — you'll be notified the moment someone accepts.",
  },
  hi: {
    "req.cancel": "रिक्वेस्ट रद्द करें", "req.confirmQ": "यह रिक्वेस्ट रद्द करें?",
    "req.yes": "हाँ, रद्द करें", "req.no": "रहने दें",
    "req.photos": "फोटो जुड़ी हैं",
    "req.next": "आस-पास के पार्टनर जल्द जवाब देंगे — किसी के accept करते ही आपको सूचना मिलेगी।",
  },
  gu: {
    "req.cancel": "રિક્વેસ્ટ રદ કરો", "req.confirmQ": "આ રિક્વેસ્ટ રદ કરવી છે?",
    "req.yes": "હા, રદ કરો", "req.no": "રહેવા દો",
    "req.photos": "ફોટા જોડાયેલ છે",
    "req.next": "નજીકના પાર્ટનરો જલદી જવાબ આપશે — કોઈ સ્વીકારે તરત તમને જાણ થશે.",
  },
};