/* i18n core v1 — EN default, HI/GU live, globe switcher + browser-locale detect.
   Production adds geo-IP default + more packs (Blueprint Ch. 40). */
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "hi" | "gu";

const D: Record<Lang, Record<string, string>> = {
  en: {
    "nav.services": "Services", "nav.how": "How it works", "nav.workers": "Our workers", "nav.why": "Why us",
    "nav.login": "Log in", "nav.signup": "Create account", "nav.entrance": "Entrance",
    "hero.badge": "Now serving 4 cities · 240+ verified workers",
    "hero.w1": "Every", "hero.w2": "home", "hero.w3": "job,", "hero.w4": "with", "hero.w5": "trust.",
    "hero.sub": "See verified painters, electricians and plumbers near you — their work, their rates, their reviews. Compare quotes, keep your money safe, approve the work.",
    "hero.cta1": "Create account", "hero.cta2": "See how it works",
    "pulse.l1": "jobs running today", "pulse.l2": "verified workers · 4.6★ average", "pulse.l3": "partner stores (paint & hardware)", "pulse.l4": "jobs finished on time",
    "story.h": "One painting job, start to finish — in 10 seconds", "story.p": "Keep scrolling · each act changes on its own",
    "a1.h": "“I need my bedroom painted”", "a1.p": "A photo, an area, a budget — posted in two minutes. No calls, no chaos.",
    "a2.h": "Six painters, full profiles", "a2.p": "Ratings, past-work photos, rate ranges, distance — compared, then chosen by the customer.",
    "a3.h": "Itemized quote — no hidden costs", "a3.p": "Labour + material with store names + GST. What you see is what you pay.",
    "a4.h": "Money locked, work begins", "a4.p": "The advance sits in escrow. The worker knows payment is guaranteed; you know it can't vanish.",
    "a5.h": "Approve the work, release the pay", "a5.p": "Checklist ticked, balance released, invoice and warranty issued — and the next neighbour asks: “who did your walls?”",
    "cats.h": "Everything your home needs", "cats.p": "Verified workers, fair rate ranges and quality checklists in every category — clear before you book.",
    "c1.t": "Painting", "c1.r": "From ₹16/sqft · fair range shown per city", "c2.t": "Electrical", "c2.r": "Visit ₹199 (adjusted in quote)", "c3.t": "Plumbing", "c3.r": "Leaks to full bathroom fittings", "c4.t": "Carpentry", "c4.r": "Furniture, wardrobe, door repair", "c5.t": "Cleaning", "c5.r": "Deep clean, sofa, water tank", "c6.t": "AC & Appliances", "c6.r": "Service · gas · repair",
    "workers.h": "Not “workers” — skilled sahayaks of your city", "workers.p": "Scroll — real faces, real work, real reviews",
    "escrow.h": "Escrow — locked until you love the work", "escrow.p": "Watch the money travel — you control every step.",
    "e1.h": "1 · You pay", "e1.p": "The advance goes straight to escrow (RBI-authorised partner) — never into our account.",
    "e2.h": "2 · Work happens", "e2.p": "OTP start, photo milestones. You approve every step.",
    "e3.h": "3 · Approve → release", "e3.p": "Only your yes moves the money. Not happy? The dispute desk stands with you.",
    "lens.h": "One platform, three lenses", "lens.p": "Three worlds that need each other — and everything links up: a worker who joins today appears in a customer's search tomorrow; a store's prices flow into every quote.",
    "l1.t": "For customers", "l1.1": "Post with photos, voice or text", "l1.2": "Compare verified profiles & itemized quotes", "l1.3": "Pay into escrow, approve to release",
    "l2.t": "For skilled workers", "l2.1": "Leads from your zone and your skill", "l2.2": "AI-assisted itemized quotes in minutes", "l2.3": "On-time payouts — no chasing",
    "l3.t": "For stores", "l3.1": "Orders from jobs near your shop", "l3.2": "Your live prices flow into every quote", "l3.3": "Deliveries and settlements tracked",
    "foot.about": "Home work, done with trust. Starting in Vadodara, built for all of India.",
    "foot.help": "Helpline: 1800-XXX-XXXX · AI Saathi 24×7",
    "foot.h1": "Company", "foot.h2": "Trust", "foot.h3": "Partners",
  },
  hi: {
    "nav.services": "सेवाएं", "nav.how": "कैसे काम करता है", "nav.workers": "हमारे वर्कर", "nav.why": "हम क्यों",
    "nav.login": "लॉग इन", "nav.signup": "अकाउंट बनाएं", "nav.entrance": "प्रवेश",
    "hero.badge": "अब 4 शहरों में · 240+ वेरिफाइड वर्कर",
    "hero.w1": "हर", "hero.w2": "घर", "hero.w3": "का काम,", "hero.w4": "भरोसे", "hero.w5": "के साथ।",
    "hero.sub": "अपने पास के वेरिफाइड पेंटर, इलेक्ट्रीशियन और प्लंबर देखें — उनका काम, रेट और रिव्यू। क्वोट तुलना करें, पैसा सुरक्षित रखें, काम मंज़ूर करें।",
    "hero.cta1": "अकाउंट बनाएं", "hero.cta2": "देखिए कैसे काम करता है",
    "pulse.l1": "आज चल रहे काम", "pulse.l2": "वेरिफाइड वर्कर · 4.6★ औसत", "pulse.l3": "पार्टनर दुकानें (पेंट व हार्डवेयर)", "pulse.l4": "काम समय पर पूरे",
    "story.h": "एक पेंटिंग जॉब, शुरू से अंत — 10 सेकंड में", "story.p": "स्क्रॉल करते रहिए · हर act अपने आप बदलेगा",
    "a1.h": "“बेडरूम पेंट कराना है”", "a1.p": "रमेश ने फोटो लिया, एरिया बोला, बजट चुना — 2 मिनट में पोस्ट। न कॉल, न झंझट।",
    "a2.h": "6 पेंटर, पूरे प्रोफ़ाइल के साथ", "a2.p": "रेटिंग, पुराने काम की फोटो, रेट रेंज, दूरी — तुलना करके खुद चुना।",
    "a3.h": "आइटमाइज़्ड क्वोट — कोई छिपा खर्च नहीं", "a3.p": "लेबर + मटीरियल (दुकान के नाम सहित) + GST। जो दिखा वही भरा।",
    "a4.h": "पैसा लॉक, काम शुरू", "a4.p": "एडवांस escrow में। वर्कर को भरोसा पैसा पक्का है; आपको भरोसा पैसा डूबेगा नहीं।",
    "a5.h": "काम मंज़ूर → पैसा रिलीज़", "a5.p": "चेकलिस्ट टिक, बैलेंस रिलीज़, इनवॉइस + वारंटी — और अगला पड़ोसी पूछने आया: “किसे से करवाया?”",
    "cats.h": "घर की हर ज़रूरत, एक जगह", "cats.p": "हर कैटेगरी में वेरिफाइड वर्कर, उचित रेट रेंज और क्वालिटी चेकलिस्ट — बुकिंग से पहले सब साफ़।",
    "c1.t": "पेंटिंग", "c1.r": "₹16/sqft से · हर शहर की fair range", "c2.t": "इलेक्ट्रिकल", "c2.r": "विज़िट ₹199 (क्वोट में एडजस्ट)", "c3.t": "प्लंबिंग", "c3.r": "लीकेज से बाथरूम फ़िटिंग तक", "c4.t": "कारपेंट्री", "c4.r": "फ़र्नीचर, वॉर्डरोब, दरवाज़ा", "c5.t": "क्लीनिंग", "c5.r": "डीप क्लीन, सोफ़ा, टंकी", "c6.t": "AC व अपलायंस", "c6.r": "सर्विस · गैस · मरम्मत",
    "workers.h": "ये सिर्फ़ “वर्कर” नहीं, हुनरमंद सहायक हैं", "workers.p": "स्क्रॉल कीजिए — असली चेहरे, असली काम, असली रिव्यू",
    "escrow.h": "Escrow — जब तक काम पसंद न आए, पैसा लॉक", "escrow.p": "देखिए पैसा कैसे सफ़र करता है — हर कदम पर आपका नियंत्रण।",
    "e1.h": "1 · आप भुगतान करते हैं", "e1.p": "एडवांस सीधा escrow (RBI-प्राधिकृत पार्टनर) में — हमारे खाते में कभी नहीं।",
    "e2.h": "2 · काम होता है", "e2.p": "OTP से शुरू, फोटो माइलस्टोन। हर कदम आप मंज़ूर करते हैं।",
    "e3.h": "3 · मंज़ूरी → रिलीज़", "e3.p": "सिर्फ़ आपकी हाँ से पैसा चलता है। पसंद न आए? डिस्प्यूट डेस्क आपके साथ।",
    "lens.h": "एक प्लेटफ़ॉर्म, तीन नज़रिए", "lens.p": "तीन दुनिया जो एक-दूसरे की मोहताज हैं — और सब जुड़ा हुआ: आज जुड़ा वर्कर कल किसी ग्राहक की सर्च में दिखता है; दुकान के rates हर क्वोट में बहते हैं।",
    "l1.t": "ग्राहकों के लिए", "l1.1": "फोटो, आवाज़ या टेक्स्ट से जॉब पोस्ट करें", "l1.2": "वेरिफाइड प्रोफ़ाइल और आइटमाइज़्ड क्वोट तुलना करें", "l1.3": "Escrow में भुगतान, मंज़ूरी पर रिलीज़",
    "l2.t": "हुनरमंद वर्कर्स के लिए", "l2.1": "अपने zone और skill के leads", "l2.2": "AI से मिनटों में आइटमाइज़्ड क्वोट", "l2.3": "समय पर भुगतान — पीछा नहीं",
    "l3.t": "दुकानों के लिए", "l3.1": "पास के jobs से ऑर्डर", "l3.2": "आपके live rates हर quote में", "l3.3": "डिलीवरी और settlement ट्रैक्ड",
    "foot.about": "घर का काम, भरोसे के साथ। वडोदरा से शुरू, पूरे भारत के लिए।",
    "foot.help": "हेल्पलाइन: 1800-XXX-XXXX · AI साथी 24×7",
    "foot.h1": "कंपनी", "foot.h2": "भरोसा", "foot.h3": "पार्टनर्स",
  },
  gu: {
    "nav.services": "સેવાઓ", "nav.how": "કેવી રીતે કામ કરે છે", "nav.workers": "અમારા કામદારો", "nav.why": "શા માટે અમે",
    "nav.login": "લોગ ઇન", "nav.signup": "એકાઉન્ટ બનાવો", "nav.entrance": "પ્રવેશ",
    "hero.badge": "હવે 4 શહેરોમાં · 240+ વેરિફાઇડ કામદારો",
    "hero.w1": "દરેક", "hero.w2": "ઘરનું", "hero.w3": "કામ,", "hero.w4": "ભરોસા", "hero.w5": "સાથે.",
    "hero.sub": "તમારી નજીકના વેરિફાઇડ પેઇન્ટર, ઇલેક્ટ્રિશિયન અને પ્લમ્બર જુઓ — તેમનું કામ, રેટ અને રિવ્યુ. ક્વોટ સરખાવો, પૈસા સુરક્ષિત રાખો, કામ મંજૂર કરો.",
    "hero.cta1": "એકાઉન્ટ બનાવો", "hero.cta2": "જુઓ કેવી રીતે કામ કરે છે",
    "pulse.l1": "આજે ચાલતા કામ", "pulse.l2": "વેરિફાઇડ કામદારો · 4.6★ સરેરાશ", "pulse.l3": "પાર્ટનર દુકાનો (પેઇન્ટ અને હાર્ડવેર)", "pulse.l4": "કામ સમયસર પૂર્ણ",
    "story.h": "એક પેઇન્ટિંગ જોબ, શરૂઆતથી અંત સુધી — 10 સેકન્ડમાં", "story.p": "સ્ક્રોલ કરતા રહો · દરેક act જાતે બદલાશે",
    "a1.h": "“બેડરૂમ પેઇન્ટ કરાવવો છે”", "a1.p": "ફોટો, વિસ્તાર, બજેટ — 2 મિનિટમાં પોસ્ટ. ન કોલ, ન ઝંઝટ.",
    "a2.h": "6 પેઇન્ટર, આખા પ્રોફાઇલ સાથે", "a2.p": "રેટિંગ, જૂના કામના ફોટા, રેટ રેન્જ, અંતર — સરખાવીને પોતે પસંદ કર્યું.",
    "a3.h": "આઇટમાઇઝ્ડ ક્વોટ — કોઈ છુપો ખર્ચ નહીં", "a3.p": "લેબર + મટીરિયલ (દુકાનના નામ સાથે) + GST. જે દેખાય તે જ ભરાય.",
    "a4.h": "પૈસા લોક, કામ શરૂ", "a4.p": "એડવાન્સ escrow માં. કામદારને ખાતરી ચુકવણી પક્કી; તમને ખાતરી પૈસા ડૂબશે નહીં.",
    "a5.h": "કામ મંજૂર → પૈસા રિલીઝ", "a5.p": "ચેકલિસ્ટ ટિક, બેલેન્સ રિલીઝ, ઇન્વોઇસ + વોરંટી — અને આગલો પાડોશી પૂછવા આવ્યો: “કોની પાસે કરાવ્યું?”",
    "cats.h": "ઘરની દરેક જરૂર, એક જગ્યાએ", "cats.p": "દરેક કેટેગરીમાં વેરિફાઇડ કામદારો, યોગ્ય રેટ રેન્જ અને ક્વોલિટી ચેકલિસ્ટ — બુકિંગ પહેલાં બધું સ્પષ્ટ.",
    "c1.t": "પેઇન્ટિંગ", "c1.r": "₹16/sqft થી · દરેક શહેરની fair range", "c2.t": "ઇલેક્ટ્રિકલ", "c2.r": "વિઝિટ ₹199 (ક્વોટમાં એડજસ્ટ)", "c3.t": "પ્લમ્બિંગ", "c3.r": "લીકેજથી બાથરૂમ ફિટિંગ સુધી", "c4.t": "કારપેન્ટ્રી", "c4.r": "ફર્નિચર, વોર્ડરોબ, દરવાજા", "c5.t": "સફાઈ", "c5.r": "ડીપ ક્લીન, સોફા, ટાંકી", "c6.t": "AC અને એપ્લાયન્સ", "c6.r": "સર્વિસ · ગેસ · સમારકામ",
    "workers.h": "આ માત્ર “કામદારો” નથી, હુનરમંદ સહાયક છે", "workers.p": "સ્ક્રોલ કરો — સાચાં ચહેરા, સાચું કામ, સાચા રિવ્યુ",
    "escrow.h": "Escrow — જ્યાં સુધી કામ ગમે નહીં, પૈસા લોક", "escrow.p": "જુઓ પૈસા કેવી રીતે મુસાફરી કરે છે — દરેક પગલે તમારો કાબૂ.",
    "e1.h": "1 · તમે ચૂકવો છો", "e1.p": "એડવાન્સ સીધું escrow (RBI-માન્ય પાર્ટનર) માં — અમારા ખાતામાં ક્યારેય નહીં.",
    "e2.h": "2 · કામ થાય છે", "e2.p": "OTP થી શરૂ, ફોટા માઇલસ્ટોન. દરેક પગલું તમે મંજૂર કરો છો.",
    "e3.h": "3 · મંજૂરી → રિલીઝ", "e3.p": "ફક્ત તમારા હા થી પૈસા ખસે છે. ગમ્યું નહીં? ડિસ્પ્યુટ ડેસ્ક તમારી સાથે.",
    "lens.h": "એક પ્લેટફોર્મ, ત્રણ નજર", "lens.p": "ત્રણ દુનિયા જે એકબીજાની જરૂર છે — અને બધું જોડાયેલું: આજે જોડાયેલો કામદાર કાલે ગ્રાહકની શોધમાં દેખાય છે; દુકાનના rates દરેક ક્વોટમાં વહે છે.",
    "l1.t": "ગ્રાહકો માટે", "l1.1": "ફોટા, અવાજ કે ટેક્સ્ટથી જોબ પોસ્ટ કરો", "l1.2": "વેરિફાઇડ પ્રોફાઇલ અને આઇટમાઇઝ્ડ ક્વોટ સરખાવો", "l1.3": "Escrow માં ચુકવણી, મંજૂરી પર રિલીઝ",
    "l2.t": "હુનરમંદ કામદારો માટે", "l2.1": "તમારા zone અને skill ની લીડ", "l2.2": "AI થી મિનિટોમાં આઇટમાઇઝ્ડ ક્વોટ", "l2.3": "સમયસર ચુકવણી — પાછળ લાગ્યા વગર",
    "l3.t": "દુકાનો માટે", "l3.1": "નજીકના jobs થી ઓર્ડર", "l3.2": "તમારા live rates દરેક quote માં", "l3.3": "ડિલિવરી અને settlement ટ્રેક્ડ",
    "foot.about": "ઘરનું કામ, ભરોસા સાથે. વડોદરાથી શરૂ, આખા ભારત માટે.",
    "foot.help": "હેલ્પલાઇન: 1800-XXX-XXXX · AI સાથી 24×7",
    "foot.h1": "કંપની", "foot.h2": "ભરોસો", "foot.h3": "પાર્ટનર્સ",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  /* Stored choice jeet-ta hai, phir browser locale; SSR-hydration safe. */
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("gs_lang");
    } catch {
      saved = null;
    }
    const nav = (navigator.language || "en").toLowerCase();
    const detected: Lang =
      saved === "en" || saved === "hi" || saved === "gu"
        ? saved
        : nav.startsWith("hi")
          ? "hi"
          : nav.startsWith("gu")
            ? "gu"
            : "en";
    setLangState(detected);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem("gs_lang", l);
    } catch {
      /* private mode — ignore */
    }
  }

  const t = (k: string) => D[lang][k] ?? D.en[k] ?? k;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}