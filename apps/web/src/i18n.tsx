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
/* D2 — extension pack: auth, forms, browse, brand (added with total-localisation mandate). */
const D2: Record<Lang, Record<string, string>> = {
  en: {
    "brand.pre": "Ghar", "brand.post": "Sahayak",
    "auth.hello": "Welcome to GharSahayak", "auth.newq": "New here? Create an account. Already with us? Log in.",
    "auth.create": "Create account", "auth.createSub": "New to GharSahayak — choose your role",
    "auth.login": "Log in", "auth.loginSub": "Existing account — verify with OTP",
    "auth.roleQ": "Which best describes you?", "auth.roleSub": "Pick your side — the form adapts to you.",
    "auth.back": "← Back", "auth.loginTitle": "Log in to your account", "auth.loginSub2": "We will verify with a 6-digit code.",
    "auth.identifier": "Mobile number or email", "auth.idPh": "+91 98765 43210 · you@mail.com",
    "auth.google": "Continue with Google", "auth.or": "OR", "auth.send": "Send code",
    "auth.otpTitle": "Enter the 6-digit code", "auth.otpSub": "Sent to your mobile or email.",
    "auth.demo": "Demo mode: any 6 digits work.", "auth.verify": "Verify & continue",
    "auth.doneTitle": "Welcome to GharSahayak!", "auth.doneLogin": "Welcome back!",
    "auth.doneDash": "Your dashboard is on the way.", "auth.close": "Done",
    "st.entry": "Welcome", "st.form": "Almost there", "st.otp": "Verify mobile", "st.done": "All set",
    "role.c.t": "I need work done", "role.c.b": "Post a job, compare verified workers, pay safely.",
    "role.p.t": "I'm a skilled worker", "role.p.b": "Daily leads, fair prices, on-time payouts.",
    "role.s.t": "I run a store", "role.s.b": "Sell paint, hardware & sanitary to jobs near you.",
    "sf.c.t": "Create your customer account", "sf.c.b": "Just the essentials — nothing hidden.",
    "sf.p.t": "Create your worker profile", "sf.p.b": "Your skill is your identity here.",
    "sf.s.t": "Put your store on the map", "sf.s.b": "Your digital counter opens after a quick verification.",
    "f.name": "Full name", "f.nameAadhaar": "Full name (as per Aadhaar)", "f.phone": "Mobile number",
    "f.phonePh": "+91 98765 43210", "f.email": "Email (for easy login later)", "f.emailPh": "you@mail.com",
    "f.lang": "Preferred language", "f.skill": "Primary skill", "f.exp": "Years of experience",
    "f.zone": "Your area", "f.shop": "Store name", "f.owner": "Owner name", "f.cat": "Store category",
    "f.gstin": "GSTIN (optional for small shops)", "f.continue": "Continue → OTP",
    "f.consent": "I agree to the Terms of Use and Privacy Policy, and to GharSahayak storing my details for this journey.",
    "done.c": "Post your first job — verified workers respond in minutes.",
    "done.p": "Complete KYC next to start receiving leads.",
    "done.s": "Add your first 10 products to open your digital counter.",
    "prov.city": "City", "prov.area": "Area", "prov.skill": "Skill",
    "prov.allIndia": "All India", "prov.allAreas": "All areas", "prov.allSkills": "All skills",
    "prov.workers": "verified workers available", "prov.empty": "No workers match this combination yet — widen the city or skill filter.",
    "ba.h": "See the difference", "ba.p": "Drag the handle — this is what a GharSahayak finish looks like.",
    "ba.before": "Before", "ba.after": "After",
  },
  hi: {
    "brand.pre": "घर", "brand.post": "सहायक",
    "auth.hello": "घरसहायक में स्वागत है", "auth.newq": "नए हैं? अकाउंट बनाइए। पहले से हैं? लॉग इन कीजिए।",
    "auth.create": "अकाउंट बनाएं", "auth.createSub": "घरसहायक पर नए — अपनी भूमिका चुनें",
    "auth.login": "लॉग इन", "auth.loginSub": "मौजूदा अकाउंट — OTP से पुष्टि",
    "auth.roleQ": "आप कौन हैं?", "auth.roleSub": "अपनी ओर चुनिए — फ़ॉर्म ढल जाएगा।",
    "auth.back": "← पीछे", "auth.loginTitle": "अपने अकाउंट में लॉग इन करें", "auth.loginSub2": "हम 6 अंकों के कोड से पुष्टि करेंगे।",
    "auth.identifier": "मोबाइल नंबर या ईमेल", "auth.idPh": "+91 98765 43210 · you@mail.com",
    "auth.google": "Google से जारी रखें", "auth.or": "या", "auth.send": "कोड भेजें",
    "auth.otpTitle": "6 अंकों का कोड डालें", "auth.otpSub": "आपके मोबाइल या ईमेल पर भेजा गया।",
    "auth.demo": "डेमो मोड: कोई भी 6 अंक चलेंगे।", "auth.verify": "सत्यापित करें",
    "auth.doneTitle": "घरसहायक में स्वागत है!", "auth.doneLogin": "वापसी पर स्वागत है!",
    "auth.doneDash": "आपका डैशबोर्ड तैयार हो रहा है।", "auth.close": "पूर्ण",
    "st.entry": "स्वागत", "st.form": "बस थोड़ा और", "st.otp": "मोबाइल पुष्टि", "st.done": "हो गया",
    "role.c.t": "मुझे काम कराना है", "role.c.b": "जॉब पोस्ट करें, वेरिफाइड वर्कर तुलना करें, सुरक्षित भुगतान।",
    "role.p.t": "मैं हुनरमंद वर्कर हूँ", "role.p.b": "रोज़ लीड, सही दाम, समय पर भुगतान।",
    "role.s.t": "मेरी दुकान है", "role.s.b": "पास के jobs को पेंट, हार्डवेयर, सैनिटरी बेचें।",
    "sf.c.t": "अपना ग्राहक अकाउंट बनाएं", "sf.c.b": "सिर्फ़ ज़रूरी — कुछ छिपा नहीं।",
    "sf.p.t": "अपना वर्कर प्रोफ़ाइल बनाएं", "sf.p.b": "आपका हुनर ही आपकी पहचान है।",
    "sf.s.t": "अपनी दुकान नक्शे पर लाएं", "sf.s.b": "त्वरित सत्यापन के बाद आपका डिजिटल काउंटर खुलेगा।",
    "f.name": "पूरा नाम", "f.nameAadhaar": "पूरा नाम (आधार के अनुसार)", "f.phone": "मोबाइल नंबर",
    "f.phonePh": "+91 98765 43210", "f.email": "ईमेल (बाद में आसान लॉगिन हेतु)", "f.emailPh": "you@mail.com",
    "f.lang": "पसंदीदा भाषा", "f.skill": "मुख्य कौशल", "f.exp": "वर्षों का अनुभव",
    "f.zone": "आपका क्षेत्र", "f.shop": "दुकान का नाम", "f.owner": "मालिक का नाम", "f.cat": "दुकान श्रेणी",
    "f.gstin": "GSTIN (छोटी दुकान के लिए वैकल्पिक)", "f.continue": "आगे → OTP",
    "f.consent": "मैं उपयोग शर्तों और गोपनीयता नीति से सहमत हूँ, और इस यात्रा हेतु अपना विवरण सुरक्षित रखने दें।",
    "done.c": "पहली जॉब पोस्ट करें — वेरिफाइड वर्कर मिनटों में जवाब देंगे।",
    "done.p": "लीड पाने के लिए आगे KYC पूरा करें।",
    "done.s": "डिजिटल काउंटर खोलने हेतु पहले 10 प्रोडक्ट जोड़ें।",
    "prov.city": "शहर", "prov.area": "क्षेत्र", "prov.skill": "कौशल",
    "prov.allIndia": "पूरा भारत", "prov.allAreas": "सभी क्षेत्र", "prov.allSkills": "सभी कौशल",
    "prov.workers": "वेरिफाइड वर्कर उपलब्ध", "prov.empty": "इस जोड़ से कोई वर्कर नहीं मिला — शहर या कौशल बदलें।",
    "ba.h": "फ़र्क देखिए", "ba.p": "हैंडल खींचिए — घरसहायक फ़िनिश ऐसी होती है।",
    "ba.before": "पहले", "ba.after": "बाद में",
  },
  gu: {
    "brand.pre": "ઘર", "brand.post": "સહાયક",
    "auth.hello": "ઘરસહાયકમાં સ્વાગત છે", "auth.newq": "નવા છો? એકાઉન્ટ બનાવો. પહેલેથી છો? લોગ ઇન કરો.",
    "auth.create": "એકાઉન્ટ બનાવો", "auth.createSub": "ઘરસહાયક પર નવા — તમારી ભૂમિકા પસંદ કરો",
    "auth.login": "લોગ ઇન", "auth.loginSub": "હાલનું એકાઉન્ટ — OTP થી ખાતરી",
    "auth.roleQ": "તમે કોણ છો?", "auth.roleSub": "તમારી બાજુ પસંદ કરો — ફોર્મ ઢળી જશે.",
    "auth.back": "← પાછળ", "auth.loginTitle": "તમારા એકાઉન્ટમાં લોગ ઇન કરો", "auth.loginSub2": "અમે 6 અંકના કોડથી ખાતરી કરીશું.",
    "auth.identifier": "મોબાઇલ નંબર અથવા ઈમેલ", "auth.idPh": "+91 98765 43210 · you@mail.com",
    "auth.google": "Google થી ચાલુ રાખો", "auth.or": "અથવા", "auth.send": "કોડ મોકલો",
    "auth.otpTitle": "6 અંકનો કોડ દાખલ કરો", "auth.otpSub": "તમારા મોબાઇલ કે ઈમેલ પર મોકલ્યો.",
    "auth.demo": "ડેમો મોડ: ગમે તે 6 અંક ચાલશે.", "auth.verify": "ખાતરી કરો",
    "auth.doneTitle": "ઘરસહાયકમાં સ્વાગત છે!", "auth.doneLogin": "પાછા સ્વાગત છે!",
    "auth.doneDash": "તમારું ડેશબોર્ડ તૈયાર થઈ રહ્યું છે.", "auth.close": "પૂર્ણ",
    "st.entry": "સ્વાગત", "st.form": "થોડું જ બાકી", "st.otp": "મોબાઇલ ખાતરી", "st.done": "થઈ ગયું",
    "role.c.t": "મને કામ કરાવવું છે", "role.c.b": "જોબ પોસ્ટ કરો, વેરિફાઇડ કામદારો સરખાવો, સુરક્ષિત ચુકવણી.",
    "role.p.t": "હું હુનરમંદ કામદાર છું", "role.p.b": "રોજ લીડ, સાચો ભાવ, સમયસર ચુકવણી.",
    "role.s.t": "મારી દુકાન છે", "role.s.b": "નજીકના jobs ને પેઇન્ટ, હાર્ડવેર, સેનિટરી વેચો.",
    "sf.c.t": "તમારું ગ્રાહક એકાઉન્ટ બનાવો", "sf.c.b": "ફક્ત જરૂરી — કંઈ છુપું નહીં.",
    "sf.p.t": "તમારો કામદાર પ્રોફાઇલ બનાવો", "sf.p.b": "તમારું કૌશલ્ય જ તમારી ઓળખ છે.",
    "sf.s.t": "તમારી દુકાન નકશા પર લાવો", "sf.s.b": "ઝડપી ખાતરી પછી તમારું ડિજિટલ કાઉન્ટર ખૂલશે.",
    "f.name": "પૂરું નામ", "f.nameAadhaar": "પૂરું નામ (આધાર મુજબ)", "f.phone": "મોબાઇલ નંબર",
    "f.phonePh": "+91 98765 43210", "f.email": "ઈમેલ (પછી સહેલા લોગિન માટે)", "f.emailPh": "you@mail.com",
    "f.lang": "પસંદની ભાષા", "f.skill": "મુખ્ય કૌશલ્ય", "f.exp": "વર્ષોનો અનુભવ",
    "f.zone": "તમારો વિસ્તાર", "f.shop": "દુકાનનું નામ", "f.owner": "માલિકનું નામ", "f.cat": "દુકાન શ્રેણી",
    "f.gstin": "GSTIN (નાની દુકાન માટે વૈકલ્પિક)", "f.continue": "આગળ → OTP",
    "f.consent": "હું શરતો અને ગોપનીયતા નીતિ સાથે સંમત છું, અને આ સફર માટે મારી વિગતો સાચવવા દઉં છું.",
    "done.c": "પહેલી જોબ પોસ્ટ કરો — વેરિફાઇડ કામદારો મિનિટોમાં જવાબ આપશે.",
    "done.p": "લીડ મેળવવા આગળ KYC પૂર્ણ કરો.",
    "done.s": "ડિજિટલ કાઉન્ટર ખોલવા પહેલા 10 પ્રોડક્ટ ઉમેરો.",
    "prov.city": "શહેર", "prov.area": "વિસ્તાર", "prov.skill": "કૌશલ્ય",
    "prov.allIndia": "આખું ભારત", "prov.allAreas": "બધા વિસ્તારો", "prov.allSkills": "બધા કૌશલ્ય",
    "prov.workers": "વેરિફાઇડ કામદારો ઉપલબ્ધ", "prov.empty": "આ જોડાણથી કોઈ કામદાર મળ્યો નહીં — શહેર કે કૌશલ્ય બદલો.",
    "ba.h": "ફરક જુઓ", "ba.p": "હેન્ડલ ખેંચો — ઘરસહાયક ફિનિશ આવી હોય છે.",
    "ba.before": "પહેલાં", "ba.after": "પછી",
  },
};
/* D3 — page-level strings that earlier leaked in English (server components). */
const D3: Record<Lang, Record<string, string>> = {
  en: {
    "prov.tag": "Marketplace", "prov.h": "Find verified workers near you",
    "prov.p": "Pick a location to see who is available there — or keep All India to see everyone. Ratings, rates and badges come from verified jobs only.",
    "sk.painting": "Painting", "sk.electrical": "Electrical", "sk.plumbing": "Plumbing", "sk.carpentry": "Carpentry", "sk.cleaning": "Cleaning",
    "fl.about": "About us", "fl.careers": "Careers", "fl.blog": "Blog", "fl.press": "Press kit",
    "fl.refund": "Refund policy", "fl.terms": "Terms", "fl.privacy": "Privacy", "fl.safety": "Safety centre",
    "fl.worker": "Become a worker", "fl.store": "Add your store", "fl.rwa": "RWA / societies",
    "foot.made": "Made in Vadodara 🧡",
  },
  hi: {
    "prov.tag": "मार्केटप्लेस", "prov.h": "आपके निकट वेरिफाइड वर्कर खोजें",
    "prov.p": "उपलब्ध वर्कर देखने हेतु लोकेशन चुनें — या पूरा भारत रखिए। रेटिंग, रेट और बैज केवल सत्यापित जॉब से आते हैं।",
    "sk.painting": "पेंटिंग", "sk.electrical": "इलेक्ट्रिकल", "sk.plumbing": "प्लंबिंग", "sk.carpentry": "कारपेंट्री", "sk.cleaning": "क्लीनिंग",
    "fl.about": "हमारे बारे में", "fl.careers": "करियर", "fl.blog": "ब्लॉग", "fl.press": "प्रेस किट",
    "fl.refund": "रिफंड नीति", "fl.terms": "शर्तें", "fl.privacy": "गोपनीयता", "fl.safety": "सुरक्षा केंद्र",
    "fl.worker": "वर्कर बनें", "fl.store": "दुकान जोड़ें", "fl.rwa": "RWA / सोसायटी",
    "foot.made": "वडोदरा में निर्मित 🧡",
  },
  gu: {
    "prov.tag": "માર્કેટપ્લેસ", "prov.h": "તમારી નજીક વેરિફાઇડ કામદારો શોધો",
    "prov.p": "ઉપલબ્ધ કામદારો જોવા સ્થળ પસંદ કરો — અથવા આખું ભારત રાખો. રેટિંગ, રેટ અને બેજ માત્ર ખાતરી થયેલ જોબથી આવે છે.",
    "sk.painting": "પેઇન્ટિંગ", "sk.electrical": "ઇલેક્ટ્રિકલ", "sk.plumbing": "પ્લમ્બિંગ", "sk.carpentry": "કાર્પેન્ટ્રી", "sk.cleaning": "સફાઈ",
    "fl.about": "અમારા વિશે", "fl.careers": "કારકિર્દી", "fl.blog": "બ્લોગ", "fl.press": "પ્રેસ કિટ",
    "fl.refund": "રિફંડ નીતિ", "fl.terms": "શરતો", "fl.privacy": "ગોપનીયતા", "fl.safety": "સુરક્ષા કેન્દ્ર",
    "fl.worker": "કામદાર બનો", "fl.store": "દુકાન ઉમેરો", "fl.rwa": "RWA / સોસાયટી",
    "foot.made": "વડોદરામાં બનેલું 🧡",
  },
};
/* D4 — tabs, login extras, dashboard shell. */
const D4: Record<Lang, Record<string, string>> = {
  en: {
    "tab.signup": "Create account", "tab.login": "Log in",
    "login.online": "Start online after login", "login.counter": "Open counter after login", "login.remember": "Remember this device",
    "dash.hi": "Welcome", "dash.c": "Customer dashboard", "dash.p": "Provider dashboard", "dash.s": "Store dashboard",
    "dash.next": "Your full workspace arrives in the next sessions — the auth, roles and data loop behind it are already wired.",
    "dash.logout": "Log out", "dash.open": "Dashboard",
    "chip.c": "Customer", "chip.p": "Worker", "chip.s": "Store",
  },
  hi: {
    "tab.signup": "अकाउंट बनाएं", "tab.login": "लॉग इन",
    "login.online": "लॉगिन के बाद ऑनलाइन शुरू करें", "login.counter": "लॉगिन के बाद काउंटर खोलें", "login.remember": "इस डिवाइस को याद रखें",
    "dash.hi": "स्वागत है", "dash.c": "ग्राहक डैशबोर्ड", "dash.p": "वर्कर डैशबोर्ड", "dash.s": "दुकान डैशबोर्ड",
    "dash.next": "आपकी पूरी वर्कस्पेस अगले sessions में आएगी — पीछे का auth, roles और data loop पहले से wired है।",
    "dash.logout": "लॉग आउट", "dash.open": "डैशबोर्ड",
    "chip.c": "ग्राहक", "chip.p": "वर्कर", "chip.s": "दुकान",
  },
  gu: {
    "tab.signup": "એકાઉન્ટ બનાવો", "tab.login": "લોગ ઇન",
    "login.online": "લોગિન પછી ઓનલાઇન શરૂ કરો", "login.counter": "લોગિન પછી કાઉન્ટર ખોલો", "login.remember": "આ ઉપકરણ યાદ રાખો",
    "dash.hi": "સ્વાગત છે", "dash.c": "ગ્રાહક ડેશબોર્ડ", "dash.p": "કામદાર ડેશબોર્ડ", "dash.s": "દુકાન ડેશબોર્ડ",
    "dash.next": "તમારું પૂરું વર્કસ્પેસ આગળના sessions માં આવશે — પાછળનો auth, roles અને data loop પહેલેથી wired છે.",
    "dash.logout": "લોગ આઉટ", "dash.open": "ડેશબોર્ડ",
    "chip.c": "ગ્રાહક", "chip.p": "કામદાર", "chip.s": "દુકાન",
  },
};
/* D5 — customer workspace (wizard, requests, tabs). */
const D5: Record<Lang, Record<string, string>> = {
  en: {
    "wiz.title": "Post a job", "wiz.step": "Step", "wiz.next": "Next", "wiz.back": "Back", "wiz.submit": "Post request",
    "wiz.cat": "What needs doing?", "wiz.desc": "Describe the work", "wiz.descPh": "e.g. Two bedrooms need painting, walls have small cracks…",
    "wiz.photos": "Photos (optional)", "wiz.city": "City", "wiz.area": "Area / locality", "wiz.areaPh": "e.g. Alkapuri",
    "wiz.land": "Landmark (optional)", "wiz.date": "Preferred date", "wiz.slot": "Time slot",
    "slot.m": "Morning", "slot.a": "Afternoon", "slot.e": "Evening", "slot.f": "Flexible",
    "wiz.budget": "Budget range", "bud.e": "Economy", "bud.s": "Standard", "bud.p": "Premium",
    "wiz.mat": "Material included (worker arranges)",
    "req.mine": "My requests", "req.empty": "No requests yet — post your first job.", "req.open": "Open",
    "dash.tab.over": "Overview", "dash.tab.find": "Find workers", "dash.tab.post": "Post a job", "dash.tab.req": "My requests",
  },
  hi: {
    "wiz.title": "जॉब पोस्ट करें", "wiz.step": "चरण", "wiz.next": "आगे", "wiz.back": "पीछे", "wiz.submit": "रिक्वेस्ट पोस्ट करें",
    "wiz.cat": "क्या काम कराना है?", "wiz.desc": "काम का वर्णन", "wiz.descPh": "जैसे: दो बेडरूम पेंट करने हैं, दीवारों में छोटी दरारें हैं…",
    "wiz.photos": "फोटो (वैकल्पिक)", "wiz.city": "शहर", "wiz.area": "क्षेत्र / मोहल्ला", "wiz.areaPh": "जैसे: अलकापुरी",
    "wiz.land": "लैंडमार्क (वैकल्पिक)", "wiz.date": "पसंदीदा तारीख", "wiz.slot": "समय स्लॉट",
    "slot.m": "सुबह", "slot.a": "दोपहर", "slot.e": "शाम", "slot.f": "लचीला",
    "wiz.budget": "बजट रेंज", "bud.e": "इकॉनमी", "bud.s": "स्टैंडर्ड", "bud.p": "प्रीमियम",
    "wiz.mat": "मटीरियल शामिल (वर्कर लाएगा)",
    "req.mine": "मेरी रिक्वेस्ट", "req.empty": "अभी कोई रिक्वेस्ट नहीं — पहली जॉब पोस्ट करें।", "req.open": "खुली",
    "dash.tab.over": "ओवरव्यू", "dash.tab.find": "वर्कर खोजें", "dash.tab.post": "जॉब पोस्ट करें", "dash.tab.req": "मेरी रिक्वेस्ट",
  },
  gu: {
    "wiz.title": "જોબ પોસ્ટ કરો", "wiz.step": "પગલું", "wiz.next": "આગળ", "wiz.back": "પાછળ", "wiz.submit": "રિક્વેસ્ટ પોસ્ટ કરો",
    "wiz.cat": "શું કામ કરાવવું છે?", "wiz.desc": "કામનું વર્ણન", "wiz.descPh": "દા.ત. બે બેડરૂમ પેઇન્ટ કરવા છે, દીવાલોમાં નાની તિરાડો છે…",
    "wiz.photos": "ફોટા (વૈકલ્પિક)", "wiz.city": "શહેર", "wiz.area": "વિસ્તાર", "wiz.areaPh": "દા.ત. અલકાપુરી",
    "wiz.land": "લેન્ડમાર્ક (વૈકલ્પિક)", "wiz.date": "પસંદની તારીખ", "wiz.slot": "સમય સ્લોટ",
    "slot.m": "સવાર", "slot.a": "બપોર", "slot.e": "સાંજ", "slot.f": "લવચીક",
    "wiz.budget": "બજેટ રેન્જ", "bud.e": "ઇકોનોમી", "bud.s": "સ્ટાન્ડર્ડ", "bud.p": "પ્રીમિયમ",
    "wiz.mat": "મટીરિયલ સહિત (કામદાર લાવશે)",
    "req.mine": "મારી રિક્વેસ્ટ", "req.empty": "હજી કોઈ રિક્વેસ્ટ નથી — પહેલી જોબ પોસ્ટ કરો.", "req.open": "ખુલ્લી",
    "dash.tab.over": "ઝાંખી", "dash.tab.find": "કામદારો શોધો", "dash.tab.post": "જોબ પોસ્ટ કરો", "dash.tab.req": "મારી રિક્વેસ્ટ",
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

  const t = (k: string) => ({ ...D[lang], ...D2[lang], ...D3[lang], ...D4[lang] })[k] ?? D.en[k] ?? D2.en[k] ?? D3.en[k] ?? D4.en[k] ?? k;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}