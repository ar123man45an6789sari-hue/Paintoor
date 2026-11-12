import type { Lang } from "@/i18n";
import { LegalPage, type LegalCopy } from "@/components/LegalPage";

const COPY: Record<Lang, LegalCopy> = {
  en: {
    title: "Privacy policy",
    updated: "Updated October 2026 · Pilot phase, Mumbai",
    sections: [
      { h: "Studio photos stay on your device", p: "The wall-paint simulator runs entirely inside your browser. Your photos are never uploaded to or stored on Paintoor servers." },
      { h: "What we collect", p: "Account details you provide (name, phone, email), job posts you create, and basic device information needed for security and login." },
      { h: "What we do not do", p: "We do not sell personal data, and the pilot runs without third-party advertising trackers." },
      { h: "Who sees your information", p: "Only the partner you choose to book sees the job details needed to quote and do the work. Shops see only orders you place with them." },
      { h: "Your rights", p: "Email support to access, correct or delete your personal data. We respond within 30 days, in line with India's DPDP Act 2023." },
      { h: "Retention", p: "Job and booking records stay while your account is active, plus the minimum period required by tax and consumer law." },
    ],
  },
  hi: {
    title: "गोपनीयता नीति",
    updated: "अपडेट: अक्टूबर 2026 · पायलट चरण, मुंबई",
    sections: [
      { h: "Studio की फोटो आपके डिवाइस पर ही रहती हैं", p: "वॉल-पेंट सिम्युलेटर पूरी तरह आपके ब्राउज़र में चलता है। आपकी फोटो Paintoor सर्वर पर कभी अपलोड या स्टोर नहीं होतीं।" },
      { h: "हम क्या संग्रह करते हैं", p: "आपकी दी अकाउंट जानकारी (नाम, फोन, ईमेल), आपके बनाए जॉब पोस्ट, और सुरक्षा/लॉगिन के लिए जरूरी मूल डिवाइस जानकारी।" },
      { h: "हम क्या नहीं करते", p: "हम व्यक्तिगत डेटा बेचते नहीं, और पायलट में किसी तीसरे पक्ष के विज्ञापन ट्रैकर नहीं चलते।" },
      { h: "आपकी जानकारी कौन देखता है", p: "जिस पार्टनर को आप बुक करते हैं वही काम-कोट के लिए जरूरी विवरण देखता है। दुकानें केवल वही ऑर्डर देखती हैं जो आप उनके साथ करते हैं।" },
      { h: "आपके अधिकार", p: "अपना डेटा देखने, सुधारने या हटाने के लिए सपोर्ट को ईमेल करें। भारत के DPDP Act 2023 के अनुरूप हम 30 दिन में जवाब देते हैं।" },
      { h: "संग्रह अवधि", p: "जॉब और बुकिंग रिकॉर्ड तब तक रहते हैं जब तक अकाउंट सक्रिय है, साथ में कर व उपभोक्ता कानून की न्यूनतम अवधि।" },
    ],
  },
  gu: {
    title: "ગોપનીયતા નીતિ",
    updated: "અપડેટ: ઑક્ટોબર 2026 · પાયલટ તબક્કો, મુંબઈ",
    sections: [
      { h: "Studio ના ફોટા તમારા ડિવાઇસ પર જ રહે છે", p: "વૉલ-પેઇન્ટ સિમ્યુલેટર સંપૂર્ણપણે તમારા બ્રાઉઝરમાં ચાલે છે. તમારા ફોટા Paintoor સર્વર પર ક્યારેય અપલોડ કે સ્ટોર થતા નથી." },
      { h: "અમે શું એકઠું કરીએ છીએ", p: "તમે આપેલી એકાઉન્ટ માહિતી (નામ, ફોન, ઈમેલ), તમારા બનાવેલા જોબ પોસ્ટ, અને સુરક્ષા/લૉગિન માટે જરૂરી મૂળભૂત ડિવાઇસ માહિતી." },
      { h: "અમે શું કરતા નથી", p: "અમે વ્યક્તિગત ડેટા વેચતા નથી, અને પાયલટમાં કોઈ ત્રીયા-પક્ષ જાહેરાત ટ્રૅકર ચાલતા નથી." },
      { h: "તમારી માહિતી કોણ જુએ છે", p: "જે પાર્ટનરને તમે બુક કરો છો તે જ કામ-કોટ માટે જરૂરી વિગતો જુએ છે. દુકાનો ફક્ત તે જ ઓર્ડર જુએ છે જે તમે તેમની સાથે કરો છો." },
      { h: "તમારા અધિકારો", p: "તમારો ડેટા જોવા, સુધારવા કે કાઢી નાખવા સપોર્ટને ઈમેલ કરો. ભારતના DPDP Act 2023 મુજબ અમે 30 દિવસમાં જવાબ આપીએ છીએ." },
      { h: "જાળવણી સમય", p: "જોબ અને બુકિંગ રેકોર્ડ ત્યાં સુધી રહે છે જ્યાં સુધી એકાઉન્ટ સક્રિય છે, સાથે કર વ ગ્રાહક કાયદાનો ન્યૂનતમ સમયગાળો." },
    ],
  },
};

export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return <LegalPage copy={COPY} />;
}