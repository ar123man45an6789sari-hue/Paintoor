/* FAQ content, trilingual. Lives next to the code (like the legal pages)
   because it is editorial content, not UI chrome. */
import type { Lang } from "@/i18n";

export type FaqCat = "payments" | "booking" | "trust" | "studio" | "account";
export const FAQ_CATS: FaqCat[] = ["payments", "booking", "trust", "studio", "account"];

export type FaqItem = { id: string; cat: FaqCat; q: string; a: string };

export const FAQ_UI: Record<
  Lang,
  {
    h: string;
    sub: string;
    seeAll: string;
    filterAll: string;
    cat: Record<FaqCat, string>;
    askTitle: string;
    askSub: string;
    openChat: string;
    soon: string;
    soonSub: string;
    hello: string;
    inputPh: string;
    close: string;
    send: string;
    helpName: string;
  }
> = {
  en: {
    h: "Questions, answered plainly",
    sub: "Everything a first-time visitor wonders about — money, trust, photos and bookings.",
    seeAll: "See all FAQs",
    filterAll: "All",
    cat: {
      payments: "Payments",
      booking: "Booking & partners",
      trust: "Trust & safety",
      studio: "Studio & photos",
      account: "Account",
    },
    askTitle: "Still have a question?",
    askSub: "Ask it here — the answer assistant is being trained on Paintoor's own playbook.",
    openChat: "Open message box",
    soon: "Conversation features will be added soon",
    soonSub: "Right now this box is a preview. Messages you type are not sent yet.",
    hello: "Hi! I'm the Paintoor help box. Conversations open here once the feature goes live.",
    inputPh: "Type your question…",
    close: "Close",
    send: "Send",
    helpName: "Paintoor Help",
  },
  hi: {
    h: "सवाल, सीधे जवाब",
    sub: "पहली बार आने वाले के हर सवाल — पैसा, भरोसा, फोटो और बुकिंग।",
    seeAll: "सारे FAQ देखें",
    filterAll: "सभी",
    cat: {
      payments: "भुगतान",
      booking: "बुकिंग और पार्टनर",
      trust: "भरोसा और सुरक्षा",
      studio: "Studio और फोटो",
      account: "अकाउंट",
    },
    askTitle: "अब भी कोई सवाल है?",
    askSub: "यहाँ पूछिए — जवाब सहायक Paintoor की अपनी प्लेबुक पर तैयार हो रहा है।",
    openChat: "मैसेज बॉक्स खोलें",
    soon: "Conversation features will be added soon",
    soonSub: "अभी यह बॉक्स प्रीव्यू है। आपके लिखे मैसेज अभी भेजे नहीं जाते।",
    hello: "नमस्ते! मैं Paintoor हेल्प बॉक्स हूँ। फीचर लाइव होते ही बातचीत यहाँ खुलेगी।",
    inputPh: "अपना सवाल लिखिए…",
    close: "बंद करें",
    send: "भेजें",
    helpName: "Paintoor सहायता",
  },
  gu: {
    h: "સવાલ, સીધા જવાબ",
    sub: "પહેલી વાર આવનારના દરેક સવાલ — નાણાં, ભરોસો, ફોટા અને બુકિંગ.",
    seeAll: "બધા FAQ જુઓ",
    filterAll: "બધા",
    cat: {
      payments: "ચુકવણી",
      booking: "બુકિંગ અને પાર્ટનર",
      trust: "ભરોસો અને સુરક્ષા",
      studio: "Studio અને ફોટા",
      account: "એકાઉન્ટ",
    },
    askTitle: "હજી કોઈ સવાલ છે?",
    askSub: "અહીં પૂછો — જવાબ સહાયક Paintoorની પોતાની પ્લેબુક પર તૈયાર થઈ રહ્યો છે.",
    openChat: "મેસેજ બૉક્સ ખોલો",
    soon: "Conversation features will be added soon",
    soonSub: "અત્યારે આ બૉક્સ પ્રીવ્યૂ છે. તમારા લખેલા મેસેજ હજી મોકલાતા નથી.",
    hello: "નમસ્તે! હું Paintoor હેલ્પ બૉક્સ છું. ફીચર લાઇવ થતાં વાતચીત અહીં ખૂલશે.",
    inputPh: "તમારો સવાલ લખો…",
    close: "બંધ",
    send: "મોકલો",
    helpName: "Paintoor સહાય",
  },
};

export const FAQS: Record<Lang, FaqItem[]> = {
  en: [
    {
      id: "p1",
      cat: "payments",
      q: "When does my money leave my hand?",
      a: "Only after you approve. The paid amount stays protected while the work happens and is released to the partner once you confirm the job finished as agreed. Work you never approve is never paid out.",
    },
    {
      id: "p2",
      cat: "payments",
      q: "What if I don't like the finished paint job?",
      a: "The partner re-does the mismatched area free of cost within 7 days. If it still isn't right, the protected amount returns to your original payment method within 5–7 working days.",
    },
    {
      id: "p3",
      cat: "payments",
      q: "Are there hidden charges on top of the quote?",
      a: "No. Every quote lists labour and material separately, and any Paintoor fee appears as its own line before you pay. What you approve is exactly what you pay.",
    },
    {
      id: "b1",
      cat: "booking",
      q: "How fast will a partner reply to my job post?",
      a: "Most verified partners respond within 24 hours in pilot areas. Urgent jobs can be flagged so partners promise a visit slot sooner.",
    },
    {
      id: "b2",
      cat: "booking",
      q: "Can I supply my own paint and hire labour only?",
      a: "Yes. Post the job as labour-only and partners quote for workmanship alone. Or ask for a material-inclusive quote if you prefer one bill and one warranty.",
    },
    {
      id: "b3",
      cat: "booking",
      q: "Is Paintoor live in my city?",
      a: "The pilot runs in Mumbai and the partner network grows city by city. The marketplace always shows exactly which areas are live right now.",
    },
    {
      id: "t1",
      cat: "trust",
      q: "How are painting partners verified?",
      a: "Every partner submits ID, address and photos of past work. During the pilot, our help centre in Kandivali East meets and onboards each partner in person before their profile goes live.",
    },
    {
      id: "t2",
      cat: "trust",
      q: "What if a partner leaves the job halfway?",
      a: "Payment stays protected until your approval, so unfinished work earns nothing. The help centre then re-assigns your job to another verified partner.",
    },
    {
      id: "s1",
      cat: "studio",
      q: "Does the wall-paint Studio upload my photos?",
      a: "No. The simulator runs entirely inside your browser — your photos never leave your device and nothing is stored on Paintoor servers.",
    },
    {
      id: "s2",
      cat: "studio",
      q: "I liked a colour in Studio. How do I buy the real paint?",
      a: "Note the shade from your saved result and share it with your partner, or order the same brand and shade from a partner paint shop on the marketplace.",
    },
    {
      id: "a1",
      cat: "account",
      q: "Do I need an account just to look around?",
      a: "No. Browsing partners, rates and the Studio works without login. You sign in only when you post a job or accept a booking.",
    },
  ],
  hi: [
    {
      id: "p1",
      cat: "payments",
      q: "मेरा पैसा कब मेरे हाथ से निकलता है?",
      a: "सिर्फ आपकी मंजूरी के बाद। राशि काम के दौरान सुरक्षित रहती है और तय शर्तों पर काम पूरा होने की पुष्टि के बाद ही पार्टनर को मिलती है। बिना मंजूरी वाले काम का भुगतान कभी नहीं होता।",
    },
    {
      id: "p2",
      cat: "payments",
      q: "अगर पूरा हुआ पेंट काम मुझे पसंद न आए तो?",
      a: "पार्टनर 7 दिन के भीतर बेमेल हिस्सा मुफ्त दोबारा करता है। फिर भी सही न हो तो सुरक्षित राशि 5–7 कार्यदिवसों में आपके मूल भुगतान माध्यम में लौट आती है।",
    },
    {
      id: "p3",
      cat: "payments",
      q: "कोट के ऊपर कोई छिपा शुल्क तो नहीं?",
      a: "नहीं। हर कोट में लेबर और मटेरियल अलग-अलग दिखते हैं, और Paintoor की फीस भुगतान से पहले अलग लाइन में दिखती है। जो आप मंजूर करते हैं, वही भरते हैं।",
    },
    {
      id: "b1",
      cat: "booking",
      q: "मेरे जॉब पोस्ट पर पार्टनर कितनी जल्दी जवाब देगा?",
      a: "पायलट क्षेत्रों में ज़्यादातर वेरिफाइड पार्टनर 24 घंटे में जवाब देते हैं। जरूरी काम को फ्लैग किया जा सकता है ताकि विज़िट स्लॉट जल्दी तय हो।",
    },
    {
      id: "b2",
      cat: "booking",
      q: "क्या मैं अपना पेंट खुद लाकर सिर्फ लेबर रख सकता हूँ?",
      a: "हाँ। जॉब को labour-only पोस्ट करें, पार्टनर सिर्फ कामगारी का कोट देंगे। या एक बिल और एक वारंटी के लिए material-inclusive कोट मांगें।",
    },
    {
      id: "b3",
      cat: "booking",
      q: "क्या Paintoor मेरे शहर में चल रहा है?",
      a: "पायलट मुंबई में है और पार्टनर नेटवर्क शहर-दर-शहर बढ़ रहा है। मार्केटप्लेस पर हमेशा साफ दिखता है कि कौन से इलाके अभी लाइव हैं।",
    },
    {
      id: "t1",
      cat: "trust",
      q: "पेंटिंग पार्टनर वेरिफाई कैसे होते हैं?",
      a: "हर पार्टनर ID, पता और पुराने काम की फोटो देता है। पायलट में हमारा कोंडिवाली ईस्ट हेल्प सेंटर हर पार्टनर से मिलकर ऑनबोर्डिंग करता है, तभी प्रोफाइल लाइव होती है।",
    },
    {
      id: "t2",
      cat: "trust",
      q: "अगर पार्टनर बीच में काम छोड़ दे तो?",
      a: "आपकी मंजूरी तक पैसा सुरक्षित रहता है, इसलिए अधूरा काम कुछ नहीं कमाता। हेल्प सेंटर आपका जॉब दूसरे वेरिफाइड पार्टनर को सौंपता है।",
    },
    {
      id: "s1",
      cat: "studio",
      q: "क्या वॉल-पेंट Studio मेरी फोटो अपलोड करता है?",
      a: "नहीं। सिम्युलेटर पूरी तरह आपके ब्राउज़र में चलता है — फोटो डिवाइस से बाहर नहीं जातीं और सर्वर पर कुछ स्टोर नहीं होता।",
    },
    {
      id: "s2",
      cat: "studio",
      q: "Studio का रंग पसंद आया। असली पेंट कैसे लूँ?",
      a: "सेव किए नतीजे से शेड नोट करें और पार्टनर को बताएं, या मार्केटप्लेस की पार्टनर पेंट शॉप से उसी ब्रांड व शेड का मटीरियल ऑर्डर करें।",
    },
    {
      id: "a1",
      cat: "account",
      q: "सिर्फ देखने के लिए अकाउंट जरूरी है क्या?",
      a: "नहीं। पार्टनर, रेट और Studio बिना लॉगिन चलते हैं। जॉब पोस्ट या बुकिंग मंजूर करते समय ही साइन-इन चाहिए।",
    },
  ],
  gu: [
    {
      id: "p1",
      cat: "payments",
      q: "મારો પૈસો મારા હાથમાંથી ક્યારે નીકળે છે?",
      a: "ફક્ત તમારી મંજૂરી પછી. રકમ કામ દરમિયાન સુરક્ષિત રહે છે અને તયાર શરતો પર કામ પૂરું થયાની પુષ્ટિ પછી જ પાર્ટનરને મળે છે. બિનમંજૂર કામની ચુકવણી ક્યારેય થતી નથી.",
    },
    {
      id: "p2",
      cat: "payments",
      q: "જો પૂરું થયેલું પેઇન્ટ કામ મને ગમે નહીં તો?",
      a: "પાર્ટનર 7 દિવસમાં બિનમેળ ભાગ મફત ફરી કરે છે. છતાં સાચું ન થાય તો સુરક્ષિત રકમ 5–7 કાર્યદિવસોમાં તમારી મૂળ ચુકવણી રીતે પાછી મળે છે.",
    },
    {
      id: "p3",
      cat: "payments",
      q: "કોટ ઉપર કોઈ છુપો ચાર્જ તો નથી ને?",
      a: "ના. દરેક કોટમાં લેબર અને મટિરિયલ અલગ દેખાય છે, અને Paintoorની ફી ચુકવણી પહેલાં અલગ લીટીમાં દેખાય છે. જે મંજૂર કરો એ જ ચૂકવો.",
    },
    {
      id: "b1",
      cat: "booking",
      q: "મારા જોબ પોસ્ટ પર પાર્ટનર કેટલી જલદી જવાબ આપશે?",
      a: "પાયલટ વિસ્તારોમાં મોટાભાગના વેરિફાઇડ પાર્ટનર 24 કલાકમાં જવાબ આપે છે. અતિજરૂરી કામને ફ્લેગ કરી શકાય જેથી મુલાકાત સ્લોટ જલદી નક્કી થાય.",
    },
    {
      id: "b2",
      cat: "booking",
      q: "શું હું મારું પેઇન્ટ જાતે લાવીને ફક્ત લેબર રાખી શકું?",
      a: "હા. જોબને labour-only પોસ્ટ કરો, પાર્ટનર ફક્ત કામગીરી માટે કોટ આપશે. અથવા એક બિલ અને એક વૉરંટી માટે material-inclusive કોટ માંગો.",
    },
    {
      id: "b3",
      cat: "booking",
      q: "શું Paintoor મારા શહેરમાં ચાલુ છે?",
      a: "પાયલટ મુંબઈમાં છે અને પાર્ટનર નેટવર્ક શહેરે શહેર વધે છે. માર્કેટપ્લેસ પર હંમેશા સાફ દેખાય છે કે કયા વિસ્તારો હમણાં લાઇવ છે.",
    },
    {
      id: "t1",
      cat: "trust",
      q: "પેઇન્ટિંગ પાર્ટનર કેવી રીતે વેરિફાઇ થાય છે?",
      a: "દરેક પાર્ટનર ID, સરનામું અને જૂના કામના ફોટા આપે છે. પાયલટમાં અમારું કાંડિવલી ઇસ્ટ હેલ્પ સેન્ટર દરેક પાર્ટનરને મળીને ઓનબોર્ડ કરે છે, પછી જ પ્રોફાઇલ લાઇવ થાય છે.",
    },
    {
      id: "t2",
      cat: "trust",
      q: "જો પાર્ટનર વચ્ચે કામ છોડી દે તો?",
      a: "તમારી મંજૂરી સુધી પૈસો સુરક્ષિત રહે છે, તેથી અધૂરા કામને કશું મળતું નથી. હેલ્પ સેન્ટર તમારું કામ બીજા વેરિફાઇડ પાર્ટનરને સોંપે છે.",
    },
    {
      id: "s1",
      cat: "studio",
      q: "શું વૉલ-પેઇન્ટ Studio મારા ફોટા અપલોડ કરે છે?",
      a: "ના. સિમ્યુલેટર સંપૂર્ણપણે તમારા બ્રાઉઝરમાં ચાલે છે — ફોટા ડિવાઇસ બહાર જતા નથી અને સર્વર પર કશું સ્ટોર થતું નથી.",
    },
    {
      id: "s2",
      cat: "studio",
      q: "Studioનો રંગ ગમ્યો. સાચું પેઇન્ટ કેવી રીતે લઉં?",
      a: "સેવ કરેલા પરિણામથી શેડ નોંધો અને પાર્ટનરને જણાવો, અથવા માર્કેટપ્લેસની પાર્ટનર પેઇન્ટ શૉપ પાસેથી તે જ બ્રાન્ડ અને શેડનું મટિરિયલ ઓર્ડર કરો.",
    },
    {
      id: "a1",
      cat: "account",
      q: "ફક્ત જોવા માટે એકાઉન્ટ જરૂરી છે?",
      a: "ના. પાર્ટનર, રેટ અને Studio લૉગિન વગર ચાલે છે. જોબ પોસ્ટ કે બુકિંગ મંજૂર કરતી વખતે જ સાઇન-ઇન જોઈએ.",
    },
  ],
};

/** The four doubts a first-time visitor carries — shown on the landing. */
export const FAQ_PICKS = ["p1", "b1", "t1", "s1"];