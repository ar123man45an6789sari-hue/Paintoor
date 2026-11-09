/* i18n core — EN default, HI/GU live, globe switcher + browser-locale detect.
   Production adds a geo-IP default and per-city language packs. */
"use client";

import { REQS } from "./i18n-requests";
import { CUST } from "./i18n-customer";
import { PROV } from "./i18n-provider";
import { MATCH } from "./i18n-matched";
import { SHOPK } from "./i18n-shop";
import { CHATQ } from "./i18n-chat";
import { SITE } from "./i18n-site";
import { TEASER } from "./i18n-teaser";
import { COMPANY } from "./i18n-company";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { SHADES } from "./i18n-shades";
import { STUDIO } from "./i18n-studio";
import { ABOUT } from "./i18n-about";
import { JRNL } from "./i18n-journal";
import { GEO } from "./i18n-geo";
import { PARTNERS } from "./i18n-partners";
export type Lang = "en" | "hi" | "gu";

const D: Record<Lang, Record<string, string>> = {
  en: {
    "nav.services": "Services", "nav.how": "How it works", "nav.partners": "Our partners", "nav.why": "Why us",
    "nav.login": "Log in", "nav.signup": "Register", "nav.entrance": "Sign in", "nf.p": "The page you are looking for does not exist or has moved.", "nf.home": "Back to home", "nf.soon": "Paintoor is growing city by city across India. If we have not reached yours yet — we will.", "nf.cities": "See the cities we serve", "nav.menu": "Menu", "menu.theme": "Theme",
    "hero.badge": "Now serving {cities} cities · {partners} verified partners",
    "hero.w1": "Every", "hero.w2": "home,", "hero.w3": "painted", "hero.w4": "with", "hero.w5": "pride.",
    "hero.sub": "Meet verified painters near you, compare honest rates and real reviews, and pay only when the finish makes you smile. Your money stays protected until you approve the work.",
    "hero.cta1": "Register", "hero.cta2": "See how it works",
    "pulse.l1": "jobs running today", "pulse.l2": "verified partners · 4.6★ average", "pulse.l3": "partner stores (paint & hardware)", "pulse.l4": "jobs finished on time",
    "story.h": "One painting job, start to finish — in 10 seconds", "story.p": "Keep scrolling · each act changes on its own",
    "a1.h": "“I need my bedroom painted”", "a1.p": "A photo, an area, a budget — posted in two minutes. No calls, no chaos.",
    "a2.h": "Six painters, full profiles", "a2.p": "Ratings, past-work photos, rate ranges, distance — compared, then chosen by the customer.",
    "a3.h": "Itemized quote — no hidden costs", "a3.p": "Labour + material with store names + GST. What you see is what you pay.",
    "a4.h": "Money locked, work begins", "a4.p": "The advance sits in escrow. The partner knows payment is guaranteed; you know it can't vanish.",
    "a5.h": "Approve the work, release the pay", "a5.p": "Checklist ticked, balance released, invoice and warranty issued — and the next neighbour asks: “who did your walls?”",
    "cats.h": "One service. Every brand you already trust.", "cats.p": "Paintoor is the service behind the paint brands you know. Our KYC-verified partners buy genuine stock, follow each brand's own system — primer, coats, curing — and hand back a home cleaner than they found it.",
    "sn.eyebrow": "How it works", "sn.h": "Six stops, one straight line — no guessing.", "sn.p": "From the job you post to the payment you release, every step sits on the same painted line. Scroll and the line fills itself.", "sn1.t": "Step 01 · Request", "sn1.h": "“I need my bedroom painted”", "sn1.p": "A photo, the area, your budget — posted in two minutes. No calls, no chasing, no site visit first.", "sn1.m": "Free to post · 2 minutes", "sn2.t": "Step 02 · Verify", "sn2.h": "Only verified partners see your job", "sn2.p": "ID, past-work photos and real customer reviews are checked before a painter is allowed to bid.", "sn2.m": "2,923 verified partners", "sn3.t": "Step 03 · Quote", "sn3.h": "Itemized quote — no hidden costs", "sn3.p": "Labour, primer, topcoat, brand and GST listed line by line. You see every rupee before you say yes.", "sn3.m": "Every line item visible", "sn4.t": "Step 04 · Escrow", "sn4.h": "Money locked, work begins", "sn4.p": "Payment sits safely with Paintoor. The painter is booked and informed — but not paid yet.", "sn4.m": "Escrow protected", "sn5.t": "Step 05 · Work", "sn5.h": "Daily photos, daily progress", "sn5.p": "Each evening the day’s work lands in your app with photos. Questions answered the same day.", "sn5.m": "Same-day support", "sn6.t": "Step 06 · Approve", "sn6.h": "Happy? Release the payment", "sn6.p": "The money moves only on your yes. Not happy — we get it fixed before anyone is paid.", "sn6.m": "You hold the release",
    "c1.t": "Painting", "c1.r": "From ₹16/sqft · fair range shown per city", "c2.t": "Electrical", "c2.r": "Visit ₹199 (adjusted in quote)", "c3.t": "Plumbing", "c3.r": "Leaks to full bathroom fittings", "c4.t": "Carpentry", "c4.r": "Furniture, wardrobe, door repair", "c5.t": "Cleaning", "c5.r": "Deep clean, sofa, water tank", "c6.t": "AC & Appliances", "c6.r": "Service · gas · repair",
    "partners.h": "Not “partners” — skilled sahayaks of your city", "partners.p": "Scroll — real faces, real work, real reviews",
    "escrow.h": "Escrow — locked until you love the work", "escrow.p": "Watch the money travel — you control every step.",
    "e1.h": "1 · You pay", "e1.p": "The advance goes straight to escrow (RBI-authorised partner) — never into our account.",
    "e2.h": "2 · Work happens", "e2.p": "OTP start, photo milestones. You approve every step.",
    "e3.h": "3 · Approve → release", "e3.p": "Only your yes moves the money. Not happy? The dispute desk stands with you.",
    "lens.h": "One platform, three lenses", "lens.p": "Three worlds that need each other — and everything links up: a partner who joins today appears in a customer's search tomorrow; a store's prices flow into every quote.",
    "l1.t": "For customers","l1.1": "Post with photos and a short description", "l1.2": "Compare verified profiles & itemized quotes", "l1.3": "Pay into escrow, approve to release",
    "l2.t": "For skilled partners", "l2.1": "Leads from your zone and your skill", "l2.2": "Clear itemized quotes, line by line", "l2.3": "On-time payouts — no chasing",
    "l3.t": "For stores", "l3.1": "Orders from jobs near your shop", "l3.2": "Your live prices flow into every quote", "l3.3": "Deliveries and settlements tracked",
    "foot.about": "Home work, done with trust. Starting in Mumbai, built for all of India.",
        "foot.h1": "Company", "foot.h2": "Trust", "foot.h3": "Partners", "foot.regd": "Registered Office:",
  },
  hi: {
    "nav.services": "सेवाएं", "nav.how": "कैसे काम करता है", "nav.partners": "हमारे पार्टनर", "nav.why": "हम क्यों",
   "nav.login": "लॉग इन", "nav.signup": "रजिस्टर करें", "nav.entrance": "प्रवेश", "nf.p": "यह पेज मौजूद नहीं है या हटा दिया गया है।", "nf.home": "होम पेज पर जाएँ", "nf.soon": "Paintoor भारत में शहर दर शहर बढ़ रहा है। अभी तक आपके शहर तक नहीं पहुँचे — जल्द पहुँचेंगे।", "nf.cities": "जिन शहरों में हम हैं, उन्हें देखें", "nav.menu": "मेन्यू", "menu.theme": "थीम",
    "hero.badge": "अब {cities} शहरों में · {partners} वेरिफाइड पार्टनर",
    "hero.w1": "हर", "hero.w2": "घर,", "hero.w3": "गर्व", "hero.w4": "से", "hero.w5": "रंगा।",
    "hero.sub": "अपने पास के वेरिफाइड पेंटर से मिलिए — साफ़ रेट, असली रिव्यू और ऐसा फिनिश जिस पर आप मुस्कुराएँ। जब तक आप काम को मंज़ूरी न दें, तब तक आपका पैसा पूरी तरह सुरक्षित।",
    "hero.cta1": "रजिस्टर करें", "hero.cta2": "देखिए कैसे काम करता है",
    "pulse.l1": "आज चल रहे काम", "pulse.l2": "वेरिफाइड पार्टनर · 4.6★ औसत", "pulse.l3": "पार्टनर दुकानें (पेंट व हार्डवेयर)", "pulse.l4": "काम समय पर पूरे",
    "story.h": "एक पेंटिंग जॉब, शुरू से अंत — 10 सेकंड में", "story.p": "स्क्रॉल करते रहिए · हर act अपने आप बदलेगा",
    "a1.h": "“बेडरूम पेंट कराना है”", "a1.p": "रमेश ने फोटो लिया, एरिया बोला, बजट चुना — 2 मिनट में पोस्ट। न कॉल, न झंझट।",
    "a2.h": "6 पेंटर, पूरे प्रोफ़ाइल के साथ", "a2.p": "रेटिंग, पुराने काम की फोटो, रेट रेंज, दूरी — तुलना करके खुद चुना।",
    "a3.h": "आइटमाइज़्ड क्वोट — कोई छिपा खर्च नहीं", "a3.p": "लेबर + मटीरियल (दुकान के नाम सहित) + GST। जो दिखा वही भरा।",
    "a4.h": "पैसा लॉक, काम शुरू", "a4.p": "एडवांस escrow में। पार्टनर को भरोसा पैसा पक्का है; आपको भरोसा पैसा डूबेगा नहीं।",
    "a5.h": "काम मंज़ूर → पैसा रिलीज़", "a5.p": "चेकलिस्ट टिक, बैलेंस रिलीज़, इनवॉइस + वारंटी — और अगला पड़ोसी पूछने आया: “किसे से करवाया?”",
    "cats.h": "एक सेवा। हर वो ब्रांड जिस पर आप भरोसा करते हैं।", "cats.p": "Paintoor उन पेंट ब्रांड्स के पीछे की सेवा है जिन्हें आप जानते हैं। हमारे KYC-वेरिफाइड पार्टनर असली स्टॉक लाते हैं, हर ब्रांड का अपना तरीका अपनाते हैं — प्राइमर, कोट, क्योरिंग — और घर को पहले से साफ़ लौटाते हैं।",
    "sn.eyebrow": "कैसे काम करता है", "sn.h": "छह पड़ाव, एक सीधी लाइन — कोई अटकलबाज़ी नहीं", "sn.p": "जॉब पोस्ट करने से लेकर पेमेंट रिलीज़ करने तक, हर स्टेप उसी पेंटेड लाइन पर है। स्क्रॉल कीजिए और लाइन खुद भरती जाती है।", "sn1.t": "स्टेप 01 · रिक्वेस्ट", "sn1.h": "“मुझे अपना बेडरूम पेंट कराना है”", "sn1.p": "एक फोटो, एरिया और आपका बजट — दो मिनट में पोस्ट। ना फोन, ना पीछा, ना पहले साइट विज़िट।", "sn1.m": "पोस्ट करना मुफ़्त · 2 मिनट", "sn2.t": "स्टेप 02 · वेरीफ़ाई", "sn2.h": "आपकी जॉब सिर्फ़ वेरिफाइड पार्टनर देखते हैं", "sn2.p": "बोली लगाने से पहले ID, पिछले काम की फोटो और असली रिव्यू चेक किए जाते हैं।", "sn2.m": "2,923 वेरीफ़ाइड पार्टनर", "sn3.t": "स्टेप 03 · कोट", "sn3.h": "आइटमाइज़्ड कोट — कोई छुपा खर्च नहीं", "sn3.p": "लेबर, प्राइमर, टॉपकोट, ब्रांड और GST, लाइन-बाय-लाइन। हाँ कहने से पहले हर रुपया दिखता है।", "sn3.m": "हर लाइन आइटम नज़र में", "sn4.t": "स्टेप 04 · एस्क्रो", "sn4.h": "पैसा लॉक, काम शुरू", "sn4.p": "पेमेंट Paintoor के पास सुरक्षित रहता है। पेंटर बुक हो जाता है, पैसा अभी नहीं मिलता।", "sn4.m": "एस्क्रो प्रोटेक्टेड", "sn5.t": "स्टेप 05 · काम", "sn5.h": "रोज़ फोटो, रोज़ प्रोग्रेस", "sn5.p": "हर शाम दिन का काम फोटो के साथ आपके ऐप में आता है। सवाल का जवाब उसी दिन।", "sn5.m": "उसी दिन सपोर्ट", "sn6.t": "स्टेप 06 · अप्रूव", "sn6.h": "खुश? पेमेंट रिलीज़ करें", "sn6.p": "पैसा सिर्फ़ आपकी “हाँ” पर मूव करता है। पसंद नहीं आया — पेमेंट से पहले ठीक करवाते हैं।", "sn6.m": "रिलीज़ आपके हाथ में","c1.t": "पेंटिंग", "c1.r": "₹16/sqft से · हर शहर की fair range", "c2.t": "इलेक्ट्रिकल", "c2.r": "विज़िट ₹199 (क्वोट में एडजस्ट)", "c3.t": "प्लंबिंग", "c3.r": "लीकेज से बाथरूम फ़िटिंग तक", "c4.t": "कारपेंट्री", "c4.r": "फ़र्नीचर, वॉर्डरोब, दरवाज़ा", "c5.t": "क्लीनिंग", "c5.r": "डीप क्लीन, सोफ़ा, टंकी", "c6.t": "AC व अपलायंस", "c6.r": "सर्विस · गैस · मरम्मत",
    "partners.h": "ये सिर्फ़ “पार्टनर” नहीं, हुनरमंद सहायक हैं", "partners.p": "स्क्रॉल कीजिए — असली चेहरे, असली काम, असली रिव्यू",
    "escrow.h": "Escrow — जब तक काम पसंद न आए, पैसा लॉक", "escrow.p": "देखिए पैसा कैसे सफ़र करता है — हर कदम पर आपका नियंत्रण।",
    "e1.h": "1 · आप भुगतान करते हैं", "e1.p": "एडवांस सीधा escrow (RBI-प्राधिकृत पार्टनर) में — हमारे खाते में कभी नहीं।",
    "e2.h": "2 · काम होता है", "e2.p": "OTP से शुरू, फोटो माइलस्टोन। हर कदम आप मंज़ूर करते हैं।",
    "e3.h": "3 · मंज़ूरी → रिलीज़", "e3.p": "सिर्फ़ आपकी हाँ से पैसा चलता है। पसंद न आए? डिस्प्यूट डेस्क आपके साथ।",
    "lens.h": "एक प्लेटफ़ॉर्म, तीन नज़रिए", "lens.p": "तीन दुनिया जो एक-दूसरे की मोहताज हैं — और सब जुड़ा हुआ: आज जुड़ा पार्टनर कल किसी ग्राहक की सर्च में दिखता है; दुकान के rates हर क्वोट में बहते हैं।",
    "l1.t": "ग्राहकों के लिए", "l1.1": "फोटो और छोटे विवरण के साथ जॉब पोस्ट करें", "l1.2": "वेरिफाइड प्रोफ़ाइल और आइटमाइज़्ड क्वोट तुलना करें", "l1.3": "Escrow में भुगतान, मंज़ूरी पर रिलीज़",
    "l2.t": "हुनरमंद पार्टनर्स के लिए", "l2.1": "अपने zone और skill के leads", "l2.2": "साफ़ आइटमाइज़्ड क्वोट, लाइन दर लाइन", "l2.3": "समय पर भुगतान — पीछा नहीं",
    "l3.t": "दुकानों के लिए", "l3.1": "पास के jobs से ऑर्डर", "l3.2": "आपके live rates हर quote में", "l3.3": "डिलीवरी और settlement ट्रैक्ड",
    "foot.about": "घर का काम, भरोसे के साथ। मुंबई से शुरू, पूरे भारत के लिए।",
    "foot.h1": "कंपनी", "foot.h2": "भरोसा", "foot.h3": "पार्टनर्स", "foot.regd": "पंजीकृत कार्यालय:",
  },
  gu: {
    "nav.services": "સેવાઓ", "nav.how": "કેવી રીતે કામ કરે છે", "nav.partners": "અમારા પાર્ટનરો", "nav.why": "શા માટે અમે",
    "nav.login": "લોગ ઇન", "nav.signup": "રજિસ્ટર કરો", "nav.entrance": "સાઇન ઇન", "nf.p": "આ પેજ હાલ અસ્તિત્વમાં નથી અથવા ખસેડવામાં આવ્યું છે.", "nf.home": "હોમ પેજ પર જાઓ", "nf.soon": "Paintoor ભારતમાં શહેર દર શહેર વધી રહ્યું છે. હજી તમારા શહેર સુધી પહોંચ્યા નથી — જલ્દી પહોંચીશું.", "nf.cities": "અમે જે શહેરોમાં છીએ તે જુઓ", "nav.menu": "મેનૂ", "menu.theme": "થીમ",
    "hero.badge": "હવે {cities} શહેરોમાં · {partners} વેરિફાઇડ પાર્ટનરો",
    "hero.w1": "દરેક", "hero.w2": "ઘર,", "hero.w3": "ગર્વ", "hero.w4": "સાથે", "hero.w5": "રંગાયેલું.",
    "hero.sub": "તમારી નજીકના વેરિફાઇડ પેઇન્ટરને મળો — સાચા રેટ, સાચા રિવ્યુ અને એવું ફિનિશ કે જેના પર તમે મુસ્કુરાવો. જ્યાં સુધી તમે કામ મંજૂર ન કરો ત્યાં સુધી તમારા પૈસા સંપૂર્ણ સુરક્ષિત.",
    "hero.cta1": "રજિસ્ટર કરો", "hero.cta2": "જુઓ કેવી રીતે કામ કરે છે",
    "pulse.l1": "આજે ચાલતા કામ", "pulse.l2": "વેરિફાઇડ પાર્ટનરો · 4.6★ સરેરાશ", "pulse.l3": "પાર્ટનર દુકાનો (પેઇન્ટ અને હાર્ડવેર)", "pulse.l4": "કામ સમયસર પૂર્ણ",
    "story.h": "એક પેઇન્ટિંગ જોબ, શરૂઆતથી અંત સુધી — 10 સેકન્ડમાં", "story.p": "સ્ક્રોલ કરતા રહો · દરેક act જાતે બદલાશે",
    "a1.h": "“બેડરૂમ પેઇન્ટ કરાવવો છે”", "a1.p": "ફોટો, વિસ્તાર, બજેટ — 2 મિનિટમાં પોસ્ટ. ન કોલ, ન ઝંઝટ.",
    "a2.h": "6 પેઇન્ટર, આખા પ્રોફાઇલ સાથે", "a2.p": "રેટિંગ, જૂના કામના ફોટા, રેટ રેન્જ, અંતર — સરખાવીને પોતે પસંદ કર્યું.",
    "a3.h": "આઇટમાઇઝ્ડ ક્વોટ — કોઈ છુપો ખર્ચ નહીં", "a3.p": "લેબર + મટીરિયલ (દુકાનના નામ સાથે) + GST. જે દેખાય તે જ ભરાય.",
    "a4.h": "પૈસા લોક, કામ શરૂ", "a4.p": "એડવાન્સ escrow માં. પાર્ટનરને ખાતરી ચુકવણી પક્કી; તમને ખાતરી પૈસા ડૂબશે નહીં.",
    "a5.h": "કામ મંજૂર → પૈસા રિલીઝ", "a5.p": "ચેકલિસ્ટ ટિક, બેલેન્સ રિલીઝ, ઇન્વોઇસ + વોરંટી — અને આગલો પાડોશી પૂછવા આવ્યો: “કોની પાસે કરાવ્યું?”",
    "cats.h": "એક સેવા. દરેક બ્રાન્ડ જેના પર તમે ભરોસો કરો છો.", "cats.p": "Paintoor એ પેઇન્ટ બ્રાન્ડ્સ પાછળની સેવા છે જેને તમે જાણો છો. અમારા KYC-વેરિફાઇડ પાર્ટનર સાચો સ્ટૉક લાવે છે, દરેક બ્રાન્ડની પોતાની પદ્ધતિ અપનાવે છે — પ્રાઇમર, કોટ, ક્યુરિંગ — અને ઘરને પહેલાં કરતાં સાફ પાછું આપે છે.",
    "sn.eyebrow": "કેવી રીતે કામ કરે છે", "sn.h": "છ પડાવ, એક સીધી લાઇન — કોઈ અટકલ નહીં", "sn.p": "જોબ પોસ્ટ કરવાથી લઈને પેમેન્ટ રિલીઝ કરવા સુધી, દરેક સ્ટેપ એ જ પેઇન્ટેડ લાઇન પર છે. સ્ક્રોલ કરો અને લાઇન જાતે ભરાય છે.", "sn1.t": "સ્ટેપ 01 · રિક્વેસ્ટ", "sn1.h": "“મારે મારો બેડરૂમ પેઇન્ટ કરાવવો છે”", "sn1.p": "એક ફોટો, એરિયા અને તમારું બજેટ — બે મિનિટમાં પોસ્ટ. કોઈ ફોન નહીં, કોઈ પીછો નહીં, પહેલાં સાઇટ વિઝિટ નહીં.", "sn1.m": "પોસ્ટ કરવું મફત · 2 મિનિટ", "sn2.t": "સ્ટેપ 02 · વેરિફાઇ", "sn2.h": "તમારી જોબ ફક્ત વેરિફાઇડ પાર્ટનર જુએ છે", "sn2.p": "બોલી લગાવતા પહેલાં ID, પહેલાંના કામના ફોટા અને સાચા રિવ્યૂ ચેક થાય છે.", "sn2.m": "2,923 વેરિફાઇડ પાર્ટનર", "sn3.t": "સ્ટેપ 03 · ક્વોટ", "sn3.h": "આઇટમાઇઝ્ડ ક્વોટ — કોઈ છુપો ખર્ચ નહીં", "sn3.p": "લેબર, પ્રાઇમર, ટોપકોટ, બ્રાન્ડ અને GST, લાઇન-બાય-લાઇન. હા કહો તે પહેલાં દરેક રૂપિયો દેખાય.", "sn3.m": "દરેક લાઇન આઇટમ દેખાય", "sn4.t": "સ્ટેપ 04 · એસ્ક્રો", "sn4.h": "પૈસા લોક, કામ શરૂ", "sn4.p": "પેમેન્ટ Paintoor પાસે સુરક્ષિત રહે છે. પેઇન્ટર બુક થાય છે, પૈસા હજુ મળતા નથી.", "sn4.m": "એસ્ક્રો પ્રોટેક્ટેડ", "sn5.t": "સ્ટેપ 05 · કામ", "sn5.h": "રોજ ફોટા, રોજ પ્રોગ્રેસ", "sn5.p": "દર સાંજે દિવસનું કામ ફોટા સાથે એપમાં આવે છે. સવાલનો જવાબ તે જ દિવસે.", "sn5.m": "તે જ દિવસે સપોર્ટ", "sn6.t": "સ્ટેપ 06 · અપ્રૂવ", "sn6.h": "ખુશ? પેમેન્ટ રિલીઝ કરો", "sn6.p": "પૈસા ફક્ત તમારી “હા” પર જ મૂવ થાય છે. ગમ્યું નહીં — પેમેન્ટ પહેલાં બરાબર કરાવીએ.", "sn6.m": "રિલીઝ તમારા હાથમાં",
    "c1.t": "પેઇન્ટિંગ", "c1.r": "₹16/sqft થી · દરેક શહેરની fair range", "c2.t": "ઇલેક્ટ્રિકલ", "c2.r": "વિઝિટ ₹199 (ક્વોટમાં એડજસ્ટ)", "c3.t": "પ્લમ્બિંગ", "c3.r": "લીકેજથી બાથરૂમ ફિટિંગ સુધી", "c4.t": "કારપેન્ટ્રી", "c4.r": "ફર્નિચર, વોર્ડરોબ, દરવાજા", "c5.t": "સફાઈ", "c5.r": "ડીપ ક્લીન, સોફા, ટાંકી", "c6.t": "AC અને એપ્લાયન્સ", "c6.r": "સર્વિસ · ગેસ · સમારકામ",
    "partners.h": "આ માત્ર “પાર્ટનરો” નથી, હુનરમંદ સહાયક છે", "partners.p": "સ્ક્રોલ કરો — સાચાં ચહેરા, સાચું કામ, સાચા રિવ્યુ",
    "escrow.h": "Escrow — જ્યાં સુધી કામ ગમે નહીં, પૈસા લોક", "escrow.p": "જુઓ પૈસા કેવી રીતે મુસાફરી કરે છે — દરેક પગલે તમારો કાબૂ.",
    "e1.h": "1 · તમે ચૂકવો છો", "e1.p": "એડવાન્સ સીધું escrow (RBI-માન્ય પાર્ટનર) માં — અમારા ખાતામાં ક્યારેય નહીં.",
    "e2.h": "2 · કામ થાય છે", "e2.p": "OTP થી શરૂ, ફોટા માઇલસ્ટોન. દરેક પગલું તમે મંજૂર કરો છો.",
    "e3.h": "3 · મંજૂરી → રિલીઝ", "e3.p": "ફક્ત તમારા હા થી પૈસા ખસે છે. ગમ્યું નહીં? ડિસ્પ્યુટ ડેસ્ક તમારી સાથે.",
    "lens.h": "એક પ્લેટફોર્મ, ત્રણ નજર", "lens.p": "ત્રણ દુનિયા જે એકબીજાની જરૂર છે — અને બધું જોડાયેલું: આજે જોડાયેલો પાર્ટનર કાલે ગ્રાહકની શોધમાં દેખાય છે; દુકાનના rates દરેક ક્વોટમાં વહે છે.",
    "l1.t": "ગ્રાહકો માટે", "l1.1": "ફોટા અને ટૂંકા વર્ણન સાથે જોબ પોસ્ટ કરો", "l1.2": "વેરિફાઇડ પ્રોફાઇલ અને આઇટમાઇઝ્ડ ક્વોટ સરખાવો", "l1.3": "Escrow માં ચુકવણી, મંજૂરી પર રિલીઝ",
    "l2.t": "હુનરમંદ પાર્ટનરો માટે", "l2.1": "તમારા zone અને skill ની લીડ", "l2.2": "સાફ આઇટમાઇઝ્ડ ક્વોટ, લાઇન દર લાઇન", "l2.3": "સમયસર ચુકવણી — પાછળ લાગ્યા વગર",
    "l3.t": "દુકાનો માટે", "l3.1": "નજીકના jobs થી ઓર્ડર", "l3.2": "તમારા live rates દરેક quote માં", "l3.3": "ડિલિવરી અને settlement ટ્રેક્ડ",
    "foot.about": "ઘરનું કામ, ભરોસા સાથે. મુંબઈથી શરૂ, આખા ભારત માટે.",
    "foot.h1": "કંપની", "foot.h2": "ભરોસો", "foot.h3": "પાર્ટનર્સ", "foot.regd": "નોંધાયેલ કાર્યાલય:",
  },
};
/* D2 — extension pack: auth, forms, browse, brand (added with total-localisation mandate). */
const D2: Record<Lang, Record<string, string>> = {
  en: {

    "auth.hello": "Welcome to Paintoor", "auth.newq": "New here? Create an account. Already with us? Log in.",
    "auth.create": "Register", "auth.createSub": "New to Paintoor — choose your role",
    "auth.login": "Log in", "auth.loginSub": "Existing account — verify with OTP",
    "auth.roleQ": "Which best describes you?", "auth.roleSub": "Pick your side — the form adapts to you.",
    "auth.back": "← Back", "auth.loginTitle": "Log in to your account", "auth.loginSub2": "We will verify with a 6-digit code.",
    "auth.identifier": "Mobile number or email", "auth.idPh": "+91 98765 43210 · you@mail.com",
    "auth.google": "Continue with Google", "auth.or": "OR", "auth.send": "Send code",
    "auth.otpTitle": "Enter the 6-digit code", "auth.otpSub": "Sent to your mobile or email.",
    "auth.demo": "Demo mode: any 6 digits work.", "auth.verify": "Verify & continue",
    "auth.doneTitle": "Welcome to Paintoor!", "auth.doneLogin": "Welcome back!",
    "auth.doneDash": "Your dashboard is on the way.", "auth.close": "Done",
    "st.entry": "Welcome", "st.form": "Almost there", "st.otp": "Verify mobile", "st.done": "All set",
    "role.c.t": "I need work done", "role.c.b": "Post a job, compare verified partners, pay safely.",
    "role.p.t": "I'm a skilled partner", "role.p.b": "Daily leads, fair prices, on-time payouts.",
    "role.s.t": "I run a store", "role.s.b": "Sell paint, hardware & sanitary to jobs near you.",
    "sf.c.t": "Create your customer account", "sf.c.b": "Just the essentials — nothing hidden.",
    "sf.p.t": "Create your partner profile", "sf.p.b": "Your skill is your identity here.",
    "sf.s.t": "Put your store on the map", "sf.s.b": "Your digital counter opens after a quick verification.",
    "f.name": "Full name", "f.nameAadhaar": "Full name (as per Aadhaar)", "f.phone": "Mobile number",
    "f.phonePh": "+91 98765 43210", "f.email": "Email (for easy login later)", "f.emailPh": "you@mail.com",
    "f.lang": "Preferred language", "f.skill": "Primary skill", "f.exp": "Years of experience",
    "f.zone": "Your area", "f.shop": "Store name", "f.owner": "Owner name", "f.cat": "Store category",
    "f.gstin": "GSTIN (optional for small shops)", "f.continue": "Continue → OTP",
    "f.consent": "I agree to the Terms of Use and Privacy Policy, and to Paintoor storing my details for this journey.",
    "done.c": "Post your first job — verified partners respond in minutes.",
    "done.p": "Complete KYC next to start receiving leads.",
    "done.s": "Add your first 10 products to open your digital counter.",
    "prov.city": "City", "prov.area": "Area", "prov.skill": "Skill",
    "prov.allIndia": "All India", "prov.allAreas": "All areas", "prov.allSkills": "All skills",
    "prov.partners": "verified partners available", "prov.empty": "No partners match this combination yet — widen the city or skill filter.",
  },
  hi: {

    "auth.hello": "Paintoor में स्वागत है", "auth.newq": "नए हैं? अकाउंट बनाइए। पहले से हैं? लॉग इन कीजिए।",
    "auth.create": "रजिस्टर करें", "auth.createSub": "Paintoor पर नए — अपनी भूमिका चुनें",
    "auth.login": "लॉग इन", "auth.loginSub": "मौजूदा अकाउंट — OTP से पुष्टि",
    "auth.roleQ": "आप कौन हैं?", "auth.roleSub": "अपनी ओर चुनिए — फ़ॉर्म ढल जाएगा।",
    "auth.back": "← पीछे", "auth.loginTitle": "अपने अकाउंट में लॉग इन करें", "auth.loginSub2": "हम 6 अंकों के कोड से पुष्टि करेंगे।",
    "auth.identifier": "मोबाइल नंबर या ईमेल", "auth.idPh": "+91 98765 43210 · you@mail.com",
    "auth.google": "Google से जारी रखें", "auth.or": "या", "auth.send": "कोड भेजें",
    "auth.otpTitle": "6 अंकों का कोड डालें", "auth.otpSub": "आपके मोबाइल या ईमेल पर भेजा गया।",
    "auth.demo": "डेमो मोड: कोई भी 6 अंक चलेंगे।", "auth.verify": "सत्यापित करें",
    "auth.doneTitle": "Paintoor में स्वागत है!", "auth.doneLogin": "वापसी पर स्वागत है!",
    "auth.doneDash": "आपका डैशबोर्ड तैयार हो रहा है।", "auth.close": "पूर्ण",
    "st.entry": "स्वागत", "st.form": "बस थोड़ा और", "st.otp": "मोबाइल पुष्टि", "st.done": "हो गया",
    "role.c.t": "मुझे काम कराना है", "role.c.b": "जॉब पोस्ट करें, वेरिफाइड पार्टनर तुलना करें, सुरक्षित भुगतान।",
    "role.p.t": "मैं हुनरमंद पार्टनर हूँ", "role.p.b": "रोज़ लीड, सही दाम, समय पर भुगतान।",
    "role.s.t": "मेरी दुकान है", "role.s.b": "पास के jobs को पेंट, हार्डवेयर, सैनिटरी बेचें।",
    "sf.c.t": "अपना ग्राहक रजिस्टर करें", "sf.c.b": "सिर्फ़ ज़रूरी — कुछ छिपा नहीं।",
    "sf.p.t": "अपना पार्टनर प्रोफ़ाइल बनाएं", "sf.p.b": "आपका हुनर ही आपकी पहचान है।",
    "sf.s.t": "अपनी दुकान नक्शे पर लाएं", "sf.s.b": "त्वरित सत्यापन के बाद आपका डिजिटल काउंटर खुलेगा।",
    "f.name": "पूरा नाम", "f.nameAadhaar": "पूरा नाम (आधार के अनुसार)", "f.phone": "मोबाइल नंबर",
    "f.phonePh": "+91 98765 43210", "f.email": "ईमेल (बाद में आसान लॉगिन हेतु)", "f.emailPh": "you@mail.com",
    "f.lang": "पसंदीदा भाषा", "f.skill": "मुख्य कौशल", "f.exp": "वर्षों का अनुभव",
    "f.zone": "आपका क्षेत्र", "f.shop": "दुकान का नाम", "f.owner": "मालिक का नाम", "f.cat": "दुकान श्रेणी",
    "f.gstin": "GSTIN (छोटी दुकान के लिए वैकल्पिक)", "f.continue": "आगे → OTP",
    "f.consent": "मैं उपयोग शर्तों और गोपनीयता नीति से सहमत हूँ, और इस यात्रा हेतु अपना विवरण सुरक्षित रखने दें।",
    "done.c": "पहली जॉब पोस्ट करें — वेरिफाइड पार्टनर मिनटों में जवाब देंगे।",
    "done.p": "लीड पाने के लिए आगे KYC पूरा करें।",
    "done.s": "डिजिटल काउंटर खोलने हेतु पहले 10 प्रोडक्ट जोड़ें।",
    "prov.city": "शहर", "prov.area": "क्षेत्र", "prov.skill": "कौशल",
    "prov.allIndia": "पूरा भारत", "prov.allAreas": "सभी क्षेत्र", "prov.allSkills": "सभी कौशल",
    "prov.partners": "वेरिफाइड पार्टनर उपलब्ध", "prov.empty": "इस जोड़ से कोई पार्टनर नहीं मिला — शहर या कौशल बदलें।",
  },
  gu: {

    "auth.hello": "Paintoorમાં સ્વાગત છે", "auth.newq": "નવા છો? રજિસ્ટર કરો. પહેલેથી છો? લોગ ઇન કરો.",
    "auth.create": "રજિસ્ટર કરો", "auth.createSub": "Paintoor પર નવા — તમારી ભૂમિકા પસંદ કરો",
    "auth.login": "લોગ ઇન", "auth.loginSub": "હાલનું એકાઉન્ટ — OTP થી ખાતરી",
    "auth.roleQ": "તમે કોઈ છો?", "auth.roleSub": "તમારી બજળવળતર પડતર  — ഫോർമ തിരിച്ചുവരുന്നത്.",
    "auth.identifier": "મોબાઇલ નંબર અથવા ઈમેલ", "auth.idPh": "+91 98765 43210 · you@mail.com",
    "auth.google": "Google થી ચાલુ રાખો", "auth.or": "અથવા", "auth.send": "કોડ મોકલો",
    "auth.otpTitle": "6 અંકનો કોડ દાખલ કરો", "auth.otpSub": "તમારા મોબાઇલ કે ઈમેલ પર મોકલ્યો.",
    "auth.demo": "ડેમો મોડ: ગમે તે 6 અંક ચાલશે.", "auth.verify": "ખાતરી કરો",
    "auth.doneTitle": "Paintoorમાં સ્વાગત છે!", "auth.doneLogin": "પાછા સ્વાગત છે!",
    "auth.doneDash": "તમારું ડેશબોર્ડ તૈયાર થઈ રહ્યું છે.", "auth.close": "પૂર્ણ",
    "st.entry": "સ્વાગત", "st.form": "થોડું જ બાકી", "st.otp": "મોબાઇલ ખાતરી", "st.done": "થઈ ગયું",
    "role.c.t": "મને કામ કરાવવું છે", "role.c.b": "જોબ પોસ્ટ કરો, વેરિફાઇડ પાર્ટનરો સરખાવો, સુરક્ષિત ચુકવણી.",
    "role.p.t": "હું હુનરમંદ પાર્ટનર છું", "role.p.b": "રોજ લીડ, સાચો ભાવ, સમયસર ચુકવણી.",
    "role.s.t": "મારી દુકાન છે", "role.s.b": "નજીકના jobs ને પેઇન્ટ, હાર્ડવેર, સેનિટરી વેચો.",
    "sf.c.t": "તમારું ગ્રાહક રજિસ્ટર કરો", "sf.c.b": "ફક્ત જરૂરી — કંઈ છુપું નહીં.",
    "sf.p.t": "તમારો પાર્ટનર પ્રોફાઇલ બનાવો", "sf.p.b": "તમારું કૌશલ્ય જ તમારી ઓળખ છે.",
    "sf.s.t": "તમારી દુકાન નકશા પર લાવો", "sf.s.b": "ઝડપી ખાતરી પછી તમારું ડિજિટલ કાઉન્ટર ખૂલશે.",
    "f.name": "પૂરું નામ", "f.nameAadhaar": "પૂરું નામ (આધાર મુજબ)", "f.phone": "મોબાઇલ નંબર",
    "f.phonePh": "+91 98765 43210", "f.email": "ઈમેલ (પછી સહેલા લોગિન માટે)", "f.emailPh": "you@mail.com",
    "f.lang": "પસંદની ભાષા", "f.skill": "મુખ્ય કૌશલ્ય", "f.exp": "વર્ષોનો અનુભવ",
    "f.zone": "તમારો વિસ્તાર", "f.shop": "દુકાનનું નામ", "f.owner": "માલિકનું નામ", "f.cat": "દુકાન શ્રેણી",
    "f.gstin": "GSTIN (નાની દુકાન માટે વૈકલ્પિક)", "f.continue": "આગળ → OTP",
    "f.consent": "હું શરતો અને ગોપનીયતા નીતિ સાથે સંમત છું, અને આ સફર માટે મારી વિગતો સાચવવા દઉં છું.",
    "done.c": "પહેલી જોબ પોસ્ટ કરો — વેરિફાઇડ પાર્ટનરો મિનિટોમાં જવાબ આપશે.",
    "done.p": "લીડ મેળવવા આગળ KYC પૂર્ણ કરો.",
    "done.s": "ડિજિટલ કાઉન્ટર ખોલવા પહેલા 10 પ્રોડક્ટ ઉમેરો.",
    "prov.city": "શહેર", "prov.area": "વિસ્તાર", "prov.skill": "કૌશલ્ય",
    "prov.allIndia": "આખું ભારત", "prov.allAreas": "બધા વિસ્તારો", "prov.allSkills": "બધા કૌશલ્ય",
    "prov.partners": "વેરિફાઇડ પાર્ટનરો ઉપલબ્ધ", "prov.empty": "આ જોડાણથી કોઈ પાર્ટનર મળ્યો નહીં — શહેર કે કૌશલ્ય બદલો.",
  },
};
/* D3 — page-level strings that earlier leaked in English (server components). */
const D3: Record<Lang, Record<string, string>> = {
  en: {
    "prov.tag": "Marketplace", "prov.h": "Find verified partners near you",
    "prov.p": "Pick a location to see who is available there — or keep All India to see everyone. Ratings, rates and badges come from verified jobs only.",
    "sk.painting": "Painting", "sk.electrical": "Electrical", "sk.plumbing": "Plumbing", "sk.carpentry": "Carpentry", "sk.cleaning": "Cleaning",
    "fl.about": "About us", "fl.careers": "Careers", "fl.blog": "Blog", "fl.press": "Press kit",
    "fl.refund": "Refund policy", "fl.terms": "Terms", "fl.privacy": "Privacy", "fl.safety": "Safety centre",
    "fl.partner": "Become a partner", "fl.store": "Add your store", "fl.rwa": "RWA / societies",
    "foot.made": "Made in Mumbai 🧡",
  },
  hi: {
    "prov.tag": "मार्केटप्लेस", "prov.h": "आपके निकट वेरिफाइड पार्टनर खोजें",
    "prov.p": "उपलब्ध पार्टनर देखने हेतु लोकेशन चुनें — या पूरा भारत रखिए। रेटिंग, रेट और बैज केवल सत्यापित जॉब से आते हैं।",
    "sk.painting": "पेंटिंग", "sk.electrical": "इलेक्ट्रिकल", "sk.plumbing": "प्लंबिंग", "sk.carpentry": "कारपेंट्री", "sk.cleaning": "क्लीनिंग",
    "fl.about": "हमारे बारे में", "fl.careers": "करियर", "fl.blog": "ब्लॉग", "fl.press": "प्रेस किट",
    "fl.refund": "रिफंड नीति", "fl.terms": "शर्तें", "fl.privacy": "गोपनीयता", "fl.safety": "सुरक्षा केंद्र",
    "fl.partner": "पार्टनर बनें", "fl.store": "दुकान जोड़ें", "fl.rwa": "RWA / सोसायटी",
    "foot.made": "मुंबई में निर्मित 🧡",
  },
  gu: {
    "prov.tag": "માર્કેટપ્લેસ", "prov.h": "તમારી નજીક વેરિફાઇડ પાર્ટનરો શોધો",
    "prov.p": "ઉપલબ્ધ પાર્ટનરો જોવા સ્થળ પસંદ કરો — અથવા આખું ભારત રાખો. રેટિંગ, રેટ અને બેજ માત્ર ખાતરી થયેલ જોબથી આવે છે.",
    "sk.painting": "પેઇન્ટિંગ", "sk.electrical": "ઇલેક્ટ્રિકલ", "sk.plumbing": "પ્લમ્બિંગ", "sk.carpentry": "કાર્પેન્ટ્રી", "sk.cleaning": "સફાઈ",
    "fl.about": "અમારા વિશે", "fl.careers": "કારકિર્દી", "fl.blog": "બ્લોગ", "fl.press": "પ્રેસ કિટ",
    "fl.refund": "રિફંડ નીતિ", "fl.terms": "શરતો", "fl.privacy": "ગોપનીયતા", "fl.safety": "સુરક્ષા કેન્દ્ર",
    "fl.partner": "પાર્ટનર બનો", "fl.store": "દુકાન ઉમેરો", "fl.rwa": "RWA / સોસાયટી",
    "foot.made": "મુંબઈમાં બનેલું 🧡",
  },
};
/* D4 — tabs, login extras, dashboard shell. */
const D4: Record<Lang, Record<string, string>> = {
  en: {
    "tab.signup": "Register", "tab.login": "Log in",
    "login.online": "Start online after login", "login.counter": "Open counter after login", "login.remember": "Remember this device",
       "dash.hi": "Welcome", "dash.c": "Customer dashboard", "dash.p": "Partner dashboard", "dash.s": "Store dashboard",
    "dash.next": "Your full workspace arrives in the next sessions — the auth, roles and data loop behind it are already wired.",
    "dash.logout": "Log out", "dash.open": "Dashboard",
    "chip.c": "Customer", "chip.p": "Partner", "chip.s": "Store",
  },
  hi: {
    "tab.signup": "रजिस्टर करें", "tab.login": "लॉग इन",
    "login.online": "लॉगिन के बाद ऑनलाइन शुरू करें", "login.counter": "लॉगिन के बाद काउंटर खोलें", "login.remember": "इस डिवाइस को याद रखें",
    "dash.hi": "स्वागत है", "dash.c": "ग्राहक डैशबोर्ड", "dash.p": "पार्टनर डैशबोर्ड", "dash.s": "दुकान डैशबोर्ड",
    "dash.next": "आपकी पूरी वर्कस्पेस अगले sessions में आएगी — पीछे का auth, roles और data loop पहले से wired है।",
    "dash.logout": "लॉग आउट", "dash.open": "डैशबोर्ड",
    "chip.c": "ग्राहक", "chip.p": "पार्टनर", "chip.s": "दुकान",
  },
  gu: {
    "tab.signup": "રજિસ્ટર કરો", "tab.login": "લોગ ઇન",
    "login.online": "લોગિન પછી ઓનલાઇન શરૂ કરો", "login.counter": "લોગિન પછી કાઉન્ટર ખોલો", "login.remember": "આ ઉપકરણ યાદ રાખો",
    "dash.hi": "સ્વાગત છે", "dash.c": "ગ્રાહક ડેશબોર્ડ", "dash.p": "પાર્ટનર ડેશબોર્ડ", "dash.s": "દુકાન ડેશબોર્ડ",
    "dash.next": "તમારું પૂરું વર્કસ્પેસ આગળના sessions માં આવશે — પાછળનો auth, roles અને data loop પહેલેથી wired છે.",
    "dash.logout": "લોગ આઉટ", "dash.open": "ડેશબોર્ડ",
    "chip.c": "ગ્રાહક", "chip.p": "પાર્ટનર", "chip.s": "દુકાન",
  },
};

/* Built once at module load instead of on every t() call. Spread order is
   identical to the previous per-call merge, so later packs still win — this
   is a pure performance change, not a precedence change. */
const MERGED: Record<Lang, Record<string, string>> = { en: {}, hi: {}, gu: {} };
const EN_FALLBACK: Record<string, string> = {};

for (const lang of ["en", "hi", "gu"] as Lang[]) {
  for (const pack of [D, D2, D3, D4, CUST, REQS, PROV, MATCH, SHOPK, CHATQ, SITE, TEASER, COMPANY, SHADES, STUDIO, ABOUT, JRNL, GEO, PARTNERS]) {
    Object.assign(MERGED[lang], pack[lang]);
  }
}
Object.assign(EN_FALLBACK, MERGED.en);


type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string, params?: Record<string, string | number>) => string };
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

   const t = (k: string, params?: Record<string, string | number>) => {
    const v = MERGED[lang][k] ?? EN_FALLBACK[k] ?? k;
    if (v === k && process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] missing key: ${k}`);
    }
    if (!params) return v;
    return v.replace(/\{(\w+)\}/g, (match: string, token: string) =>
      token in params ? String(params[token]) : match,
    );
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}