/* D5 pack — customer workspace strings (tabs, wizard, requests).
   Separate file by design: dictionary packs never require editing i18n.tsx. */
import type { Lang } from "./i18n";

export const D5: Record<Lang, Record<string, string>> = {
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
    "dash.friend": "friend",
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
    "dash.friend": "दोस्त",
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
    "dash.friend": "મિત્ર",
  },
};