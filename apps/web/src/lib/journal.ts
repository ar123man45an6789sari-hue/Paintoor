/* Journal content: static editorial data, statically generated into /blog/[slug].
   Titles, excerpts and UI chrome ship in all three languages. English bodies
   live here; Hindi bodies live in journal-hi and Gujarati in journal-gu, which
   the export map below wires into each post. */
import type { Lang } from "@/i18n";
import { JOURNAL_BODIES_HI } from "./journal-hi";
import { JOURNAL_BODIES_GU } from "./journal-gu";

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; text: string };

export type Category = "cost" | "trust" | "seasonal" | "guide" | "planning";

export const CATEGORIES: Category[] = ["cost", "trust", "seasonal", "guide", "planning"];

export interface Post {
  slug: string;
  category: Category;
  date: string;
  readMins: number;
  cover: string;
  featured?: boolean;
  title: Record<Lang, string>;
  excerpt: Record<Lang, string>;
  body: Record<Lang, Block[]>;
}

type EnPost = Omit<Post, "body"> & { body: { en: Block[] } };

const EN_POSTS: EnPost[] = [
  {
    slug: "cost-guide",
    category: "cost",
    date: "2026-10-14",
    readMins: 7,
    cover: "/blog/cost-guide.png",
    featured: true,
    title: {
      en: "Why painting quotes vary so much — and how to actually read one",
      hi: "पेंटिंग क्वोट इतने अलग क्यों — और एक क्वोट असल में कैसे पढ़ें",
      gu: "પેઇન્ટિંગ ક્વોટ આટલા અલગ કેમ — અને ક્વોટ ખરેખર કેમ વાંચવો",
    },
    excerpt: {
      en: "Two painters, the same bedroom, wildly different numbers. Here is exactly what hides inside a quote, so ₹14,000 vs ₹28,000 stops being a mystery.",
      hi: "एक ही बेडरूम, दो पेंटर्स, बिल्कुल अलग रकम। क्वोट के अंदर क्या-क्या छिपता है, ताकि ₹14,000 बनाम ₹28,000 रहस्य न रहे।",
      gu: "એક જ બેડરૂમ, બે પેઇન્ટર, તદ્દન અલગ રકમ. ક્વોટની અંદર શું છુપાયેલું છે, જેથી ₹14,000 બદલે ₹28,000 રહસ્ય ન રહે.",
    },
    body: {
      en: [
        { kind: "p", text: "A customer in Andheri West once sent us two quotes for the same bedroom: ₹14,200 and ₹27,800. Both painters were verified, both were polite, and both were sure the other one was cheating. Neither was. The two numbers were simply counting different things, and nobody had written down what." },
        { kind: "h2", text: "A quote is four numbers wearing one jacket" },
        { kind: "p", text: "Almost every painting quote in Mumbai is four costs stacked together: surface preparation, putty and primer, the paint labour itself, and the material. A low total usually means one of the four is missing — not that the painter is generous." },
        { kind: "ul", items: [
          "Preparation: scraping loose paint, sanding, treating fungus, filling cracks. Skipped most often, regretted most often.",
          "Putty and primer: the layers that make colour sit even and last. Count the coats, not just the word putty.",
          "Labour: quoted per square foot of wall area, not floor area. A 100 sqft bedroom carries roughly 320 to 360 sqft of paintable wall.",
          "Material: brand, product line and litres. The same shade in an economy line and a premium line can differ by twice the price.",
        ] },
        { kind: "h2", text: "The sqft rate is a labour rate, not a job price" },
        { kind: "p", text: "Partner profiles on Paintoor show painting labour around ₹16 to ₹24 per square foot in Mumbai. On a 340 sqft wall area that is ₹5,400 to ₹8,200 of labour — which means everything above that in a ₹14,000 quote is preparation and material, and everything above it in a ₹28,000 quote is better material, more coats, or both." },
        { kind: "p", text: "This is also why two honest painters can differ by forty percent before anyone is being dishonest. One is pricing a wall that needs two coats of putty and an exterior-grade primer on the rain side; the other is pricing the same wall as if it were new." },
        { kind: "quote", text: "The cheapest quote is usually the one with the most work left out." },
        { kind: "h2", text: "How to read a quote in ninety seconds" },
        { kind: "ol", items: [
          "Find the preparation line. If it says as required with no price, ask what it becomes when required — because it will be.",
          "Count primer and putty coats. One coat of putty on a flaking wall is a discount you pay for later.",
          "Check the product line and the litres, not just the brand. Two quotes can both say the same brand and describe completely different paints.",
          "Read the exclusions: furniture shifting, seepage patchwork, ceilings above a certain height. These become change orders mid-job if they are not in writing.",
        ] },
        { kind: "h2", text: "What Paintoor changes about this" },
        { kind: "p", text: "Every partner profile carries a rate range, so you know the market before you message anyone. Quotes arrive in the job chat as an itemized card — labour and material separately, with the store name and GST on the material line — and two quotes can be compared side by side on the same screen. Nothing is averaged into one mysterious total." },
        { kind: "p", text: "The ₹14,000 quote and the ₹28,000 quote stopped being an argument the moment the customer could see that one included two coats of putty, an exterior-grade primer on the rain wall and a premium washable emulsion — and the other included none of the three. Different scopes, different prices. That is not cheating; that is arithmetic." },
        { kind: "p", text: "Read the four lines before you read the total, and the total will finally make sense." },
      ],
    },
  },
  {
    slug: "escrow-trust",
    category: "trust",
    date: "2026-10-21",
    readMins: 6,
    cover: "/blog/escrow-trust.png",
    featured: true,
    title: {
      en: "What 'your money stays safe until you approve' actually means",
      hi: "'जब तक आप मंज़ूरी न दें, पैसा सुरक्षित' — इसका असल मतलब",
      gu: "'જ્યાં સુધી તમે મંજૂરી ન આપો ત્યાં સુધી પૈસા સુરક્ષિત' — સાચો અર્થ",
    },
    excerpt: {
      en: "Escrow sounds like banking jargon until the day a job goes sideways. Here is the plain-language version, with a real booking walked through step by step.",
      hi: "Escrow बैंकिंग शब्द लगता है, जब तक कोई काम बीच में न बिगड़े। आसान भाषा में, एक असली बुकिंग के साथ, कदम-दर-कदम।",
      gu: "એસ્ક્રો બેંકિંગ પરિભાષા લાગે છે, જ્યાં સુધી કામ અધવચ્ચે ન બગડે. સરળ ભાષામાં, એક સાચી બુકિંગ સાથે, પગલું-દર-પગલું.",
    },
    body: {
      en: [
        { kind: "p", text: "'Your money stays safe until you approve the work' is the sentence we get asked about most. Fair question: every platform says something like this, and most of them mean a refund policy buried in a PDF. On Paintoor it describes the actual path the money takes." },
        { kind: "p", text: "So here is the plain-language version, walked through with a real booking shape: a two-bedroom repaint in Bandra West, quoted at ₹41,000, with a ₹10,000 advance." },
        { kind: "h2", text: "The old way, and why it hurts" },
        { kind: "p", text: "The traditional pattern is a fifty percent advance in cash the day before work starts. From that moment the customer holds all of the risk: the advance is spent on material within days, the painter has three other sites running, and the leverage flips completely. If the finish turns out poor in week two, the argument happens with money already gone." },
        { kind: "h2", text: "The five steps of approval-first money" },
        { kind: "ol", items: [
          "You pay the advance at booking. It moves to an escrow account held by an RBI-authorised partner — not to Paintoor, not to the painter.",
          "The partner sees the escrow confirmation and starts work. Payment is guaranteed, so there is no reason to cut corners or chase you for cash mid-job.",
          "Work proceeds against the agreed checklist: preparation, coats, clean-up. Progress updates and photos land in the job chat.",
          "You inspect. The checklist is ticked with you, on site or over photos, and you approve or raise rework.",
          "On approval the balance releases from escrow, and the invoice and warranty are issued. If you raise rework, the money simply stays put until it is done.",
        ] },
        { kind: "quote", text: "Approval-first money changes behaviour on both sides of the wall." },
        { kind: "h2", text: "What happens when you do not approve" },
        { kind: "p", text: "Nothing dramatic — and that is the point. The release does not happen on a timer; it happens on your approval. If the work genuinely does not match the checklist, the partner fixes it and then gets paid. If you and the partner disagree about scope, the job record — checklist, photos, the quote card — is what the resolution follows. The money waiting in escrow is why both sides stay at the table." },
        { kind: "h2", text: "Who actually holds the money" },
        { kind: "p", text: "Not us. Paintoor never touches the advance; the escrow partner holds it under their own compliance, and the release instruction is triggered by your approval. It is the same mechanic high-trust marketplaces use for large transactions, applied to a 2BHK in Powai." },
        { kind: "p", text: "So when the landing page says money stays safe until you approve, read it literally: there is a locked account with your name on the release key, and nobody — not the painter, not the platform — can turn it without you." },
      ],
    },
  },
  {
    slug: "monsoon-walls",
    category: "seasonal",
    date: "2026-06-02",
    readMins: 5,
    cover: "/blog/monsoon.png",
    title: {
      en: "Mumbai monsoon and your walls: what to fix before the first rain lands",
      hi: "मुंबई का मॉनसून और आपकी दीवारें: पहली बारिश से पहले क्या ठीक करें",
      gu: "મુંબઈનો ચોમાસું અને તમારી દીવાલો: પહેલા વરસાદ પહેલાં શું સુધારવું",
    },
    excerpt: {
      en: "Seepage, flaking paint and fungus show up in June but are actually decided in April. A short prep list for coastal weather, ordered by what costs you most if skipped.",
      hi: "सीपन, उड़ती पेंट और फफूंद जून में दिखती है, पर असल में अप्रैल में तय होती है। समंदरी मौसम के लिए छोटी prep सूची — सबसे महंगी चूक पहले।",
      gu: "સીપન, ઊડતી પેઇન્ટ અને ફૂગ જૂનમાં દેખાય છે, પણ ખરેખર એપ્રિલમાં નક્કી થાય છે. દરિયાઈ હવામાન માટે નાની prep યાદી — સૌથી ખર્ચાળ ચૂક પહેલી.",
    },
    body: {
      en: [
        { kind: "p", text: "Mumbai walls do not fail in June. They fail in June because of what was left undone in April. Humidity above eighty percent, salt-laden wind on the western faces and four months of driven rain will find every shortcut taken last season — and price it at monsoon rates, when good slots are scarce." },
        { kind: "h2", text: "Why paint fails here specifically" },
        { kind: "p", text: "Three patterns cover most of what we see on site visits between Andheri and Thakur Complex, and each one has a different source even when the wall looks the same." },
        { kind: "ul", items: [
          "Seepage trails from terrace parapets and window frames: water enters above, travels inside the plaster, and blooms on an interior wall a floor or two below.",
          "Flaking on rain-facing walls: exterior-grade paint was never used, or was applied over damp plaster, so the film loses its grip coat by coat.",
          "Fungus in ceiling corners and behind wardrobes: condensation plus poor ventilation, usually in corners that never see winter sun.",
        ] },
        { kind: "h2", text: "The pre-monsoon order of work" },
        { kind: "p", text: "Order matters more than speed. Paint over an active leak and you have bought yourself a repaint for October." },
        { kind: "ol", items: [
          "Fix the water source first: terrace cracks, chajja joints, window frame sealant, AC sleeve holes.",
          "Let plaster dry and cut out soft putty. Damp plaster under a fresh film is a blister waiting for July.",
          "Prime the repaired areas; on rain-facing walls use an exterior-grade primer, not the interior tin left over from last time.",
          "Finish rain-facing walls with exterior emulsion, and keep the sheen you like for the interior faces.",
        ] },
        { kind: "p", text: "None of this needs a heroic budget. A terrace crack stitched and sealed in May costs a fraction of the interior repaint it causes by September — and the same visit can carry the rain-wall coats while ropes or scaffolding are already up." },
        { kind: "quote", text: "Paint is the last layer of a waterproofing decision, not the first." },
        { kind: "h2", text: "Questions worth asking your painter in May" },
        { kind: "ul", items: [
          "Will you check moisture before putty, and with what?",
          "Which walls get exterior-grade paint, and which product line?",
          "How many hours between coats in this humidity — and what happens to the schedule if it rains for three days straight?",
          "What is excluded if we find seepage behind the old paint once it is scraped?",
        ] },
        { kind: "p", text: "Interior rooms can be painted year-round with cross-ventilation; it is the exterior and terrace-adjacent walls that reward an early calendar. Fix the source in April or May, carry the paint in the same visit, and June becomes scenery instead of an emergency." },
      ],
    },
  },
  {
    slug: "repaint-signs",
    category: "planning",
    date: "2026-08-17",
    readMins: 5,
    cover: "/blog/repaint-signs.png",
    title: {
      en: "Seven honest signs it is time to repaint — before the wall becomes the expensive part",
      hi: "सात साफ़ संकेत कि दीवार को repainting चाहिए — देर होने से पहले",
      gu: "સાત સ્પષ્ટ સંકેત કે દીવાલને repainting જોઈએ — મોડું થાય તે પહેલાં",
    },
    excerpt: {
      en: "Faded colour is cosmetic. These are the signs that say the surface itself is ageing — and why acting on them early is usually half the cost.",
      hi: "फीका रंग सजावटी बात है। ये संकेत कहते हैं कि सतह बूढ़ी हो रही है — और समय रहते काम करना आधा खर्च होता है।",
      gu: "ફિક્કો રંગ સુશોભનની વાત છે. આ સંકેતો કહે છે કે સપાટી જૂની થઈ રહી છે — અને સમયસર કામ કરવું અડધો ખર્ચ છે.",
    },
    body: {
      en: [
        { kind: "p", text: "Faded colour is a cosmetic complaint; it annoys you but it does not cost you. The signs below are different. They say the surface under the paint is ageing, and acting on them while they are small is usually the difference between a maintenance bill and a repair bill." },
        { kind: "h2", text: "The seven honest signs" },
        { kind: "ol", items: [
          "Chalking: wipe the wall with your palm and a chalky powder stays on the skin. The binder is gone; the next coat needs a proper primer, not colour straight over the top.",
          "Hairline cracks that widen: one season they are a line, the next they hold dust. Moving cracks need flexible filler, not a paint film stretched over them.",
          "Flaking around windows and grills: moisture is entering at the metal-to-plaster joint, and it will not stop on its own.",
          "Fungus specks in ceiling corners: black-green dots that return after wiping mean damp, not dirt.",
          "Putty popping off in sheets: the layer under the paint has lost adhesion, and new paint over it will follow it down.",
          "Patchwork colour: every touch-up now reads as a darker island, because the old film has changed sheen and no local repair can match it.",
          "A damp smell after rain: the wall is holding water somewhere, and paint will not negotiate with it.",
        ] },
        { kind: "h2", text: "A two-minute test before you call anyone" },
        { kind: "p", text: "Press a dry hand flat on the suspect area for ten seconds; grit or powder on the palm means chalking. Tap lightly with a coin across the flaking edge — a hollow, papery sound marks where putty has detached from plaster. Photograph both in daylight. Those two answers tell a painter whether the quote should carry preparation hours or repair hours, and they are exactly what stops two quotes from being incomparable." },
        { kind: "quote", text: "Repainting on time is a maintenance expense. Repainting late is a repair expense." },
        { kind: "h2", text: "What acting early saves" },
        { kind: "p", text: "A wall that only needs scraping, sanding and two coats stays in the labour-plus-material bracket. The same wall left for two more seasons can need plaster cut-out, waterproofing patchwork and a full putty redo — easily double the preparation lines of the quote, before a single litre of colour is opened. The colour you pick is never the expensive part; the surface underneath is." },
        { kind: "p", text: "If two or more of the seven signs are on your wall today, post the photos with the job. A verified partner can then price the preparation honestly instead of discovering it on day two — which is exactly how mid-job surprises are born, on both sides of the argument." },
      ],
    },
  },
  {
    slug: "finishes",
    category: "guide",
    date: "2026-09-09",
    readMins: 6,
    cover: "/blog/finishes.png",
    title: {
      en: "Matt, satin or emulsion sheen? Choosing a finish room by room",
      hi: "Matt, satin या emulsion sheen? कमरे-कमरे का सही finish चुनना",
      gu: "Matt, satin કે emulsion sheen? ઓરડા-ઓરડાનો સાચો finish પસંદ કરો",
    },
    excerpt: {
      en: "The same colour reads completely different in two finishes. What each sheen hides, what it shows, and where it belongs in a Mumbai home.",
      hi: "एक ही रंग दो finishes में बिल्कुल अलग दिखता है। हर sheen क्या छिपाती है, क्या दिखाती है, और कहाँ चलती है — आसान भाषा में।",
      gu: "એ જ રંગ બે finishes માં તદ્દન અલગ દેખાય છે. દરેક sheen શું છુપાવે, શું બતાવે અને ક્યાં ચાલે — સરળ ભાષામાં.",
    },
    body: {
      en: [
        { kind: "p", text: "Two walls, the same colour code, different finish — and they look like different paints. Sheen changes how light bounces off a wall, how many wipe-downs the film survives, and how honestly your plaster is displayed to the world. Choosing it room by room is the cheapest design decision in a repaint." },
        { kind: "h2", text: "The three dials: sheen, scrub and stain" },
        { kind: "p", text: "Sheen runs from dead matt to glossy. Scrub resistance is how many cleanings the film takes before it polishes or thins. Stain behaviour is what happens in the first thirty seconds after a chai splash. The dials move together: more sheen usually means more scrub life and easier stain release." },
        { kind: "ul", items: [
          "Distemper and economy matt: low cost, low scrub life; fine for ceilings and rental touch-ups.",
          "Premium matt emulsion: soft, even light; hides plaster undulations beautifully; needs care while cleaning.",
          "Satin and low-sheen emulsion: the working middle — wipeable, tolerant of kids and light switches, with a slight glow under grazing light.",
          "Semi-gloss and enamel: doors, windows, grills and kitchen splash zones; shows every plaster defect, so preparation must be sharp.",
        ] },
        { kind: "quote", text: "Higher sheen hides stains and shows defects. Lower sheen hides defects and shows stains." },
        { kind: "h2", text: "A room-by-room shortlist" },
        { kind: "ul", items: [
          "Ceilings: matt, always. Grazing light from windows would turn any sheen into a map of the trowel.",
          "Living rooms and bedrooms: premium matt or low-sheen; walls read calmer and touch-ups blend in.",
          "Kids' rooms and passages: satin — fingerprints and pencil marks wipe off without polishing a shine patch.",
          "Kitchens and bathrooms: satin or semi-gloss over an anti-fungal base; steam and splashes live here daily.",
          "Doors, windows and railings: enamel or semi-gloss, tinted a shade deeper than the walls.",
        ] },
        { kind: "h2", text: "Where samples lie" },
        { kind: "p", text: "A shade card under showroom lights is not your wall at seven in the evening under a tube light. Sheen looks quieter in bright light and louder in dim light, so judge the shortlisted finish in the room it will live in, at the hour you actually use that room. A painted A4 sample board costs one evening and prevents a five-year regret." },
        { kind: "h2", text: "Comparing quotes on finish, not just colour" },
        { kind: "p", text: "When two quotes carry the same colour name, ask for the product line and the litres on each. A premium washable emulsion and an economy matt can share a shade card and completely different scrub life; the quote card in the job chat lists material with store name and GST, so the comparison stays line-by-line instead of vibe-by-vibe. If a partner suggests a cheaper line for a high-touch room, have that conversation before booking, not after." },
        { kind: "p", text: "Finish is the one choice you live with every night, not in the store for ten minutes. Decide it per room, write it into the quote, and the wall will look like the sample you approved — in the light you actually live in." },
      ],
    },
  },
  {
    slug: "festive-planning",
    category: "planning",
    date: "2026-09-28",
    readMins: 5,
    cover: "/blog/festive-planning.jpg",
    title: {
      en: "Painting before festive season? A week-by-week plan that actually holds",
      hi: "त्योहारों से पहले पेंटिंग? एक हफ्ता-दर-हफ्ता प्लान जो असल में चलता है",
      gu: "તહેવાર પહેલાં પેઇન્ટિંગ? અઠવાડિયા-દર-અઠવાડિયાની યોજના જે ખરેખર ચાલે",
    },
    excerpt: {
      en: "Diwali slots in Mumbai fill by early October. A realistic four-week timeline — drying times included — so the house is ready before guests arrive, not during.",
      hi: "मुंबई में दिवाली के slots अक्टूबर शुरू तक भर जाते हैं। चार हफ्ते का realistic timeline — सूखने का समय समेत — ताकि घर मेहमानों से पहले तैयार हो।",
      gu: "મુંબઈમાં દિવાળીના slots ઑક્ટોબર શરૂ થતાં ભરાઈ જાય છે. ચાર અઠવાડિયાની વાસ્તવિક ટાઇમલાઇન — સૂકાવાના સમય સહિત — જેથી ઘર મહેમાનો પહેલાં તૈયાર થાય.",
    },
    body: {
      en: [
        { kind: "p", text: "Every October the same story: a family books a painter on the twelfth, wants the house done by the twentieth, and discovers that drying time does not negotiate with festivals. Mumbai's festive slots fill by early October; the houses that look effortless in November were planned in September." },
        { kind: "h2", text: "Work backwards from guest day" },
        { kind: "ol", items: [
          "Week 4 — empty and repair: furniture out or centred and covered, cracks opened and filled, seepage spots treated, electrical chasing closed.",
          "Week 3 — prep and prime: scraping, sanding, putty coats with full drying between them, primer over every repaired inch.",
          "Week 2 — colour: first coat, inspection in daylight, second coat; ceilings and cut-lines first, fields after.",
          "Week 1 — finish and return: touch-ups, deep clean, furniture back, curtains up. The paint cures undisturbed while the house gets decorated.",
        ] },
        { kind: "h2", text: "Drying time is the hidden calendar" },
        { kind: "p", text: "Putty needs four to six hours between coats in good weather and longer in humidity; primer wants two to four; emulsion three to four between coats and a full day before gentle cleaning. Real washability arrives only after a couple of weeks of cure. None of this is a painter being slow — it is chemistry with a queue. Compress it and the festive sheen arrives with festive blisters." },
        { kind: "quote", text: "Festive painting fails in the calendar, not on the wall." },
        { kind: "h2", text: "The three things that slip" },
        { kind: "ul", items: [
          "Furniture that was never moved: cutting lines around a full room doubles the time and halves the finish.",
          "Ceilings left for last: drips land on finished walls, and the touch-up shows forever.",
          "Curtain and grill vendors booked for the same week as paint: every trade waits for every other trade.",
        ] },
        { kind: "h2", text: "Booking early is pricing, not eagerness" },
        { kind: "p", text: "Late-October demand compresses comparison time: customers message two partners instead of six and pick whoever answers first. An early slot means you can compare rate ranges and itemized quotes calmly, and your partner is not juggling four sites in the same fortnight — which is exactly when corners get cut elsewhere and your site inherits the delay." },
        { kind: "p", text: "Put the date in the job post itself: second coat done by 25 October is a filter that sorts partners before anyone messages. The calendar is a specification like any other — and unlike colour, it cannot be corrected after the fact." },
      ],
    },
  },
];

export const POSTS: Post[] = EN_POSTS.map((post) => ({
  ...post,
  body: {
    en: post.body.en,
    hi: JOURNAL_BODIES_HI[post.slug] ?? [],
    gu: JOURNAL_BODIES_GU[post.slug] ?? [],
  },
}));