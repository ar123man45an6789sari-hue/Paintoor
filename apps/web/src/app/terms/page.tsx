import type { Lang } from "@/i18n";
import { LegalPage, type LegalCopy } from "@/components/LegalPage";

const COPY: Record<Lang, LegalCopy> = {
  en: {
    title: "Terms of use",
    updated: "Updated October 2026 · Pilot phase, Mumbai",
    sections: [
      { h: "What Paintoor is", p: "Paintoor is a marketplace that connects customers with verified painting partners, itemised quotes and rate ranges. During the pilot, booking and payment features roll out area by area." },
      { h: "Your account", p: "Keep your login details private. Information you provide (name, phone, address, job photos) must be accurate and yours to share." },
      { h: "Quotes and scope", p: "Partner quotes are estimates based on the details you post. The final scope, shade and price are agreed between you and the partner before work starts." },
      { h: "Payments", p: "Pilot bookings follow approval-first money: the amount stays protected and is released to the partner only after you approve the finished work." },
      { h: "Fair use", p: "No unlawful content, no spam, no contacting partners outside the platform to avoid fees, and no copying of other members' photos or reviews." },
      { h: "Changes to these terms", p: "We may update these terms as the platform grows. Continued use after an update means you accept the new version." },
    ],
  },
  hi: {
    title: "उपयोग की शर्तें",
    updated: "अपडेट: अक्टूबर 2026 · पायलट चरण, मुंबई",
    sections: [
      { h: "Paintoor क्या है", p: "Paintoor एक मार्केटप्लेस है जो ग्राहकों को वेरिफाइड पेंटिंग पार्टनर, आइटमाइज़्ड कोट और रेट रेंज से जोड़ता है। पायलट में बुकिंग और भुगतान सुविधाएं क्षेत्रवार खुलती हैं।" },
      { h: "आपका अकाउंट", p: "अपनी लॉगिन जानकारी गुप्त रखें। जो जानकारी आप देते हैं (नाम, फोन, पता, काम की फोटो) वह सही और आपकी साझा करने योग्य होनी चाहिए।" },
      { h: "कोट और कार्य-दायरा", p: "पार्टनर के कोट आपकी दी जानकारी पर आधारित अनुमान हैं। अंतिम दायरा, शेड और कीमत काम शुरू होने से पहले आप और पार्टनर तय करते हैं।" },
      { h: "भुगतान", p: "पायलट बुकिंग में approval-first पैसा चलता है: राशि सुरक्षित रहती है और पार्टनर को तभी मिलती है जब आप पूरा काम स्वीकार करते हैं।" },
      { h: "उचित उपयोग", p: "कोई गैरकानूनी सामग्री नहीं, स्पैम नहीं, फीस बचाने के लिए पार्टनर से प्लेटफॉर्म के बाहर संपर्क नहीं, और दूसरों की फोटो/समीक्षाएं कॉपी नहीं।" },
      { h: "शर्तों में बदलाव", p: "प्लेटफॉर्म बढ़ने के साथ ये शर्तें अपडेट हो सकती हैं। अपडेट के बाद उपयोग जारी रखना नई शर्तों की स्वीकृति है।" },
    ],
  },
  gu: {
    title: "વપરાશની શરતો",
    updated: "અપડેટ: ઑક્ટોબર 2026 · પાયલટ તબક્કો, મુંબઈ",
    sections: [
      { h: "Paintoor શું છે", p: "Paintoor એક માર્કેટપ્લેસ છે જે ગ્રાહકોને વેરિફાઇડ પેઇન્ટિંગ પાર્ટનર, આઇટમાઇઝ્ડ કોટ અને રેટ રેન્જ સાથે જોડે છે. પાયલટમાં બુકિંગ અને ચુકવણી સુવિધાઓ વિસ્તારવાર ખૂલે છે." },
      { h: "તમારું એકાઉન્ટ", p: "તમારી લૉગિન માહિતી ગુપ્ત રાખો. તમે આપો છો તે માહિતી (નામ, ફોન, સરનામું, કામના ફોટા) સાચી અને શેર કરવા યોગ્ય હોવી જોઈએ." },
      { h: "કોટ અને કાર્ય-વ્યાપ્તિ", p: "પાર્ટનરના કોટ તમે આપેલી માહિતી પર આધારિત અંદાજ છે. અંતિમ વ્યાપ્તિ, શેડ અને કિંમત કામ શરૂ થતાં પહેલાં તમે અને પાર્ટનર નક્કી કરો છો." },
      { h: "ચુકવણી", p: "પાયલટ બુકિંગમાં approval-first નાણાં ચાલે છે: રકમ સુરક્ષિત રહે છે અને પાર્ટનરને ત્યારે જ મળે છે જ્યારે તમે પૂરું કામ મંજૂર કરો છો." },
      { h: "યોગ્ય વપરાશ", p: "કોઈ ગેરકાયદેસર સામગ્રી નહીં, સ્પામ નહીં, ફી બચાવવા પાર્ટનર સાથે પ્લેટફોર્મ બહાર સંપર્ક નહીં, અને બીજાની ફોટો/સમીક્ષાઓ કૉપિ નહીં." },
      { h: "શરતોમાં ફેરફાર", p: "પ્લેટફોર્મ વધવા સાથે આ શરતો અપડેટ થઈ શકે છે. અપડેટ પછી વપરાશ ચાલુ રાખવો એ નવી શરતોની સ્વીકૃતિ છે." },
    ],
  },
};

export const metadata = { title: "Terms of use — Paintoor" };

export default function TermsPage() {
  return <LegalPage copy={COPY} />;
}