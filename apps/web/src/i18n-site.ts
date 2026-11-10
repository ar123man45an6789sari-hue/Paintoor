/* Site-wide strings: cities, search, nav and auth warmth. */
import type { Lang } from "./i18n";

export const SITE: Record<Lang, Record<string, string>> = {
  en: {
    "nav.marketplace": "Marketplace", "nav.partners": "Partners", "nav.blog": "Blog", "nav.about": "About",
    "nav.cities": "Cities", "cities.more": "More cities coming soon",
    "search.ph": "Search painting work…", "search.locPh": "Search your area…",
    "search.useLoc": "Use my current location", "search.locFound": "Location set: {city}",
    "search.locDenied": "Couldn't sense location — search your area instead",
    "auth.roleQ": "Who are you on Paintoor?", "auth.roleSub": "Tap yourself — everything will adapt to you.",
    "role.c.t": "Customer", "role.p.t": "Partner", "role.s.t": "Store",
    "role.c.tag": "I need work done", "role.p.tag": "I am a skilled partner", "role.s.tag": "I run a store",
    "auth.welcomeBack": "Welcome back 👋", "auth.welcomeBackSub": "Good to see you again — log in and pick up where you left off.",
    "auth.newHere": "New here? Let's begin 🎉", "auth.newHereSub": "Two minutes to set up — then post your first job.",
  },
  hi: {
    "nav.marketplace": "मार्केटप्लेस", "nav.partners": "पार्टनर्स", "nav.blog": "ब्लॉग", "nav.about": "हमारे बारे में",
    "nav.cities": "शहर", "cities.more": "और शहर जल्द आ रहे हैं",
    "search.ph": "पेंटिंग का काम खोजें…", "search.locPh": "अपना क्षेत्र खोजें…",
    "search.useLoc": "मेरी अभी की लोकेशन लो", "search.locFound": "लोकेशन सेट: {city}",
    "search.locDenied": "लोकेशन नहीं मिली — अपना क्षेत्र खुद खोजें",
    "auth.roleQ": "आप Paintoor पे कौन हैं?",     "auth.roleSub": "खुद को चुनिए — जो आप हैं वही tap कीजिए, पूरी site ढल जाएगी।",
    "role.c.t": "ग्राहक", "role.p.t": "पार्टनर", "role.s.t": "दुकान",
    "role.c.tag": "मुझे काम कराना है", "role.p.tag": "मैं हुनरमंद पार्टनर हूँ", "role.s.tag": "मेरी दुकान है",
    "auth.welcomeBack": "वापसी पर स्वागत है 👋", "auth.welcomeBackSub": "आपको देख कर खुशी हुई — लॉग इन कीजिए और वहीं से शुरू कीजिए।",
    "auth.newHere": "पहली बार यहाँ? शुरुआत करें 🎉", "auth.newHereSub": "दो मिनट में सेटअप — फिर पहली जॉब पोस्ट करें।",
  },
  gu: {
    "nav.marketplace": "માર્કેટપ્લેસ", "nav.partners": "પાર્ટનર્સ", "nav.blog": "બ્લોગ", "nav.about": "અમારા વિશે",
    "nav.cities": "શહેરો", "cities.more": "વધુ શહેરો જલ્દી આવશે",
    "search.ph": "પેઇન્ટિંગ કામ શોધો…", "search.locPh": "તમારો વિસ્તાર શોધો…",
    "search.useLoc": "મારી હાલની લોકેશન વાપરો", "search.locFound": "લોકેશન સેટ: {city}",
    "search.locDenied": "લોકેશન મળી નથી — તમારો વિસ્તાર શોધો",
    "auth.roleQ": "તમે Paintoor પર કોણ છો?", "auth.roleSub": "તમે જે છો એ પસંદ કરો — આખી સાઇટ ઢળી જશે.",
    "role.c.t": "ગ્રાહક", "role.p.t": "પાર્ટનર", "role.s.t": "દુકાન",
    "role.c.tag": "મને કામ કરાવવું છે", "role.p.tag": "હું હુનરમંદ પાર્ટનર છું", "role.s.tag": "મારી દુકાન છે",
    "auth.welcomeBack": "પાછા સ્વાગત છે 👋", "auth.welcomeBackSub": "તમને જોઈ સારું લાગ્યું — લોગ ઇન કરો અને જ્યાં છોડ્યું ત્યાંથી શરૂ કરો.",
    "auth.newHere": "પહેલી વાર અહીં? શરૂ કરીએ 🎉", "auth.newHereSub": "બે મિનિટમાં સેટઅપ — પછી પહેલી જોબ પોસ્ટ કરો.",
  },
};
