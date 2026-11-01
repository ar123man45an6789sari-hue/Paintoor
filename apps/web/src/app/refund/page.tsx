import type { Lang } from "@/i18n";
import { LegalPage, type LegalCopy } from "@/components/LegalPage";

const COPY: Record<Lang, LegalCopy> = {
  en: {
    title: "Refund policy",
    updated: "Updated October 2026 · Pilot phase, Mumbai",
    sections: [
      { h: "Approval-first money", p: "Your payment stays protected until you approve the finished work. Work you never approve is never paid out to the partner." },
      { h: "Free re-work", p: "If the finished job does not match the agreed scope or shade card, the partner corrects it at no extra cost within 7 days of completion." },
      { h: "Refunds", p: "If re-work still does not resolve the issue, the protected amount is refunded to your original payment method within 5–7 working days." },
      { h: "Cancellations", p: "Cancelling before the partner starts prep is free. After materials are tinted or the site is set up, actual material and visit costs are deducted from the refund." },
      { h: "How to raise a request", p: "Email support with your booking ID, or use the Safety centre link in the footer. We acknowledge every request within 24 hours." },
      { h: "Pilot note", p: "During the pilot, payments run on partner invoices with protected release. Exact escrow timelines appear on your booking summary before you pay." },
    ],
  },
  hi: {
    title: "रिफंड नीति",
    updated: "अपडेट: अक्टूबर 2026 · पायलट चरण, मुंबई",
    sections: [
      { h: "Approval-first पैसा", p: "आपका भुगतान तब तक सुरक्षित रहता है जब तक आप पूरा काम स्वीकार नहीं करते। जो काम आप स्वीकार ही नहीं करते, उसका भुगतान पार्टनर को कभी नहीं होता।" },
      { h: "मुफ्त दोबारा काम", p: "पूरा हुआ काम तय दायरे या शेड कार्ड से मेल नहीं खाता तो पार्टनर उसे 7 दिन के भीतर बिना अतिरिक्त शुल्क सुधारता है।" },
      { h: "रिफंड", p: "दोबारा काम के बाद भी समस्या न सुलझे तो सुरक्षित राशि 5–7 कार्यदिवसों में आपके मूल भुगतान माध्यम में लौटा दी जाती है।" },
      { h: "कैंसिलेशन", p: "पार्टनर की तैयारी शुरू होने से पहले कैंसिल करना मुफ्त है। मैटेरियल टिंट होने या साइट सेटअप के बाद असली मैटेरियल व विज़िट लागत रिफंड से काटी जाती है।" },
      { h: "अनुरोध कैसे करें", p: "बुकिंग ID के साथ सपोर्ट को ईमेल करें, या फुटर के Safety centre लिंक का उपयोग करें। हर अनुरोध की पावती 24 घंटे में मिलती है।" },
      { h: "पायलट नोट", p: "पायलट में भुगतान पार्टनर इनवॉइस पर सुरक्षित रिलीज़ के साथ चलते हैं। सटीक escrow समय-रेखा भुगतान से पहले आपकी बुकिंग समरी में दिखती है।" },
    ],
  },
  gu: {
    title: "રિફંડ નીતિ",
    updated: "અપડેટ: ઑક્ટોબર 2026 · પાયલટ તબક્કો, મુંબઈ",
    sections: [
      { h: "Approval-first નાણાં", p: "તમારું ચુકવણી ત્યાં સુધી સુરક્ષિત રહે છે જ્યાં સુધી તમે પૂરું કામ મંજૂર ન કરો. જે કામ તમે મંજૂર જ ન કરો તેનું ચુકવણી પાર્ટનરને ક્યારેય થતું નથી." },
      { h: "મફત ફરી કામ", p: "પૂરું થયેલું કામ નક્કી કરેલી વ્યાપ્તિ કે શેડ કાર્ડ સાથે મેળ ન ખાય તો પાર્ટનર તે 7 દિવસમાં વધારાના ખર્ચ વગર સુધારે છે." },
      { h: "રિફંડ", p: "ફરી કામ પછી પણ સમસ્યા ન સુધરે તો સુરક્ષિત રકમ 5–7 કાર્યદિવસોમાં તમારી મૂળ ચુકવણી રીતે પરત કરવામાં આવે છે." },
      { h: "રદ કરવી", p: "પાર્ટનરની તૈયારી શરૂ થાય તે પહેલાં રદ કરવી મફત છે. મટિરિયલ ટિંટ થયાં કે સાઇટ સેટઅપ પછી સાચા મટિરિયલ અને મુલાકાત ખર્ચ રિફંડમાંથી કપાય છે." },
      { h: "વિનંતી કેવી રીતે કરવી", p: "બુકિંગ ID સાથે સપોર્ટને ઈમેલ કરો, અથવા ફૂટરની Safety centre લિંક વાપરો. દરેક વિનંતીની પાવતી 24 કલાકમાં મળે છે." },
      { h: "પાયલટ નોંધ", p: "પાયલટમાં ચુકવણી પાર્ટનર ઇન્વોઇસ પર સુરક્ષિત રિલીઝ સાથે ચાલે છે. ચોક્કસ escrow સમયરેખા ચુકવણી પહેલાં તમારા બુકિંગ સારાંશમાં દેખાય છે." },
    ],
  },
};

export const metadata = { title: "Refund policy — Paintoor" };

export default function RefundPage() {
  return <LegalPage copy={COPY} />;
}