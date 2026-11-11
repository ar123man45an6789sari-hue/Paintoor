/* Paintoor Marketplace — typed showcase data + pure pricing helpers.
   Numbers are tuned so the catalogue always answers: 24 products, 8 brands,
   5 stores, 7 shade families; search "primer" -> 3, Exterior -> 4, 10 L -> 13,
   Matt -> 12, Cool blues -> 2, Sharma & Sons -> 13, <= Rs 2,500 -> 13. */

export type Brand = { slug: string; name: string; c: string };
export type Store = {
  id: string; n: string; o: string; a: string; km: number; r: number; rv: number;
  f: number; open: boolean; cls: string; y: number; br: string[];
};
export type Product = {
  id: number; b: string; n: string; cat: string; fin: string; size: number;
  price: number; mrp: number; r: number; sold: number; fam: string; sh: string[];
  cov: number; dry: string;
};

export const BRANDS: Brand[] = [
  { slug: "asian-paints", name: "Asian Paints", c: "#e00048" },
  { slug: "berger", name: "Berger", c: "#f2762e" },
  { slug: "dulux", name: "Dulux", c: "#123a6b" },
  { slug: "nerolac", name: "Nerolac", c: "#e8b73f" },
  { slug: "birla-opus", name: "Birla Opus", c: "#6c4bd8" },
  { slug: "indigo", name: "Indigo Paints", c: "#31445c" },
  { slug: "jsw", name: "JSW Paints", c: "#0e9f8a" },
  { slug: "shalimar", name: "Shalimar", c: "#c96b4a" },
];

export const AISLES = [
  { key: "interior", label: "Interior" },
  { key: "exterior", label: "Exterior" },
  { key: "primer", label: "Primer & putty" },
  { key: "enamel", label: "Enamel & wood" },
  { key: "water", label: "Waterproofing" },
  { key: "tools", label: "Tools" },
];

export const FAMS = [
  { key: "whites", label: "Whites & neutrals", c: "#efe9df" },
  { key: "terra", label: "Warm terracotta", c: "#c96b4a" },
  { key: "yellows", label: "Sunlit yellows", c: "#e8b73f" },
  { key: "greens", label: "Fresh greens", c: "#4f9d69" },
  { key: "blues", label: "Cool blues", c: "#5b8fc9" },
  { key: "navy", label: "Deep navy & grey", c: "#31445c" },
  { key: "blush", label: "Blush & mauve", c: "#c98aa6" },
];

export const STORES: Store[] = [
  { id: "rang", n: "Rang Paints & Hardware", o: "Imran Qureshi", a: "12 Linking Road, Bandra West, Mumbai", km: 4.8, r: 4.6, rv: 412, f: 9, open: true, cls: "8:00 pm", y: 2016, br: ["asian-paints", "dulux", "jsw", "indigo"] },
  { id: "gupta", n: "Gupta Paint House", o: "Anil Gupta", a: "3 LBS Marg, Mulund West, Mumbai", km: 1.2, r: 4.5, rv: 388, f: 9, open: true, cls: "8:00 pm", y: 2009, br: ["berger", "nerolac", "birla-opus"] },
  { id: "sharma", n: "Sharma & Sons Paints", o: "Rakesh Sharma", a: "88 Mohammed Ali Road, Byculla, Mumbai", km: 2.9, r: 4.7, rv: 501, f: 10, open: true, cls: "9:00 pm", y: 2001, br: ["asian-paints", "berger", "nerolac"] },
  { id: "mehta", n: "Mehta Colour World", o: "Hetal Mehta", a: "5 M.G. Road, Ghatkopar West, Mumbai", km: 3.4, r: 4.3, rv: 267, f: 11, open: false, cls: "Opens 10 am", y: 2013, br: ["asian-paints", "dulux", "birla-opus", "jsw"] },
  { id: "deshmukh", n: "Deshmukh Colour Point", o: "Sneha Deshmukh", a: "21 Ram Maruti Road, Thane West", km: 5.4, r: 4.7, rv: 198, f: 10, open: true, cls: "7:30 pm", y: 2018, br: ["nerolac", "indigo", "shalimar", "birla-opus"] },
];

const SH: Record<string, string[]> = {
  whites: ["#f7f3ee", "#efe9df", "#e8e2d9"],
  terra: ["#d98e6f", "#c96b4a", "#b0553a"],
  yellows: ["#f2d38a", "#e8b73f", "#d19a26"],
  greens: ["#7fb98f", "#4f9d69", "#3c7f52"],
  blues: ["#8fb4dc", "#5b8fc9", "#44729f"],
  navy: ["#5a6b80", "#31445c", "#22303f"],
  blush: ["#dcb3c4", "#c98aa6", "#a96d88"],
  greys: ["#c7ccd1", "#9aa0a6", "#6e747a"],
};

const P = (
  id: number, b: string, n: string, cat: string, fin: string, size: number,
  price: number, mrp: number, r: number, sold: number, fam: string,
  cov: number, dry: string,
): Product => ({ id, b, n, cat, fin, size, price, mrp, r, sold, fam, sh: SH[fam] ?? SH.greys, cov, dry });

export const PRODUCTS: Product[] = [
  P(1, "asian-paints", "Royale Luxury Matt", "interior", "Matt", 10, 6200, 6950, 4.7, 1450, "whites", 160, "4 h"),
  P(2, "asian-paints", "Royale Health Shield Sheen", "interior", "Sheen", 4, 2480, 2760, 4.6, 980, "blush", 155, "4 h"),
  P(3, "asian-paints", "Royale Play Metallic Accent", "interior", "Satin", 1, 780, 860, 4.5, 640, "yellows", 140, "6 h"),
  P(4, "berger", "Easy Clean Luxury Emulsion", "interior", "Matt", 10, 5350, 5900, 4.6, 930, "whites", 150, "4 h"),
  P(5, "berger", "Luxol Silk Interior", "interior", "Sheen", 4, 2440, 2690, 4.5, 720, "blush", 145, "4 h"),
  P(6, "dulux", "Velvet Touch Diamond", "interior", "Matt", 10, 5780, 6900, 4.8, 1120, "whites", 150, "4 h"),
  P(7, "dulux", "Promise Interior Emulsion", "interior", "Matt", 10, 4750, 5250, 4.3, 540, "yellows", 140, "4 h"),
  P(8, "nerolac", "Beauty Gold Washable", "interior", "Matt", 10, 4980, 5450, 4.5, 810, "greens", 145, "4 h"),
  P(9, "nerolac", "Impressio Satin Finish", "interior", "Satin", 1, 820, 900, 4.4, 410, "blues", 150, "6 h"),
  P(10, "birla-opus", "Birla Opus Life Interior", "interior", "Matt", 10, 4620, 5100, 4.4, 690, "whites", 148, "4 h"),
  P(11, "indigo", "Indigo Interior Premium", "interior", "Matt", 10, 2280, 2520, 4.2, 380, "greens", 138, "4 h"),
  P(12, "asian-paints", "Apex Ultima Protect", "exterior", "Matt", 10, 6850, 7600, 4.7, 1260, "blues", 150, "8 h"),
  P(13, "berger", "WeatherCoat Long Life", "exterior", "Matt", 10, 5940, 6600, 4.6, 1040, "navy", 150, "8 h"),
  P(14, "dulux", "Weathershield Max", "exterior", "Matt", 10, 6120, 6800, 4.6, 900, "terra", 150, "8 h"),
  P(15, "nerolac", "Weatherguard Pro Exterior", "exterior", "Matt", 4, 3380, 3720, 4.4, 520, "navy", 145, "8 h"),
  P(16, "asian-paints", "Trucare Wall Putty", "primer", "", 40, 1180, 1290, 4.5, 1500, "whites", 12, "24 h"),
  P(17, "dulux", "Dulux Acrylic Primer Sealer", "primer", "", 10, 2380, 2650, 4.4, 760, "whites", 170, "2 h"),
  P(18, "birla-opus", "Birla Opus Acrylic Primer", "primer", "", 10, 2150, 2380, 4.3, 580, "whites", 165, "2 h"),
  P(19, "asian-paints", "Apcolite Premium Enamel", "enamel", "Gloss", 1, 640, 739, 4.6, 860, "navy", 110, "8 h"),
  P(20, "jsw", "JSW Pro Epoxy Gloss Enamel", "enamel", "Gloss", 1, 690, 760, 4.3, 450, "terra", 115, "8 h"),
  P(21, "shalimar", "Shalimar Steel Gloss Enamel", "enamel", "Gloss", 4, 1480, 1650, 4.1, 280, "navy", 105, "10 h"),
  P(22, "birla-opus", "Birla Opus Damp Proof Ultra", "water", "Matt", 10, 3980, 4400, 4.4, 470, "navy", 130, "12 h"),
  P(23, "indigo", "Indigo Roofseal Waterproof", "water", "Satin", 4, 2480, 2750, 4.3, 390, "greens", 125, "12 h"),
  P(24, "berger", "Home Shield 9-in-1 Roller Kit", "tools", "", 1, 640, 790, 4.4, 980, "", 0, "—"),
];

/* Per-10-litre tin rates used by the paint calculator: p = primer, t = topcoat. */
export const RATE: Record<string, { p: number; t: number }> = {
  "asian-paints": { p: 1900, t: 5970 },
  berger: { p: 1750, t: 5480 },
  dulux: { p: 1820, t: 5650 },
  nerolac: { p: 1700, t: 5320 },
  "birla-opus": { p: 1650, t: 5150 },
  indigo: { p: 1580, t: 4980 },
  jsw: { p: 1610, t: 5050 },
  shalimar: { p: 1490, t: 4680 },
};

export const brandOf = (slug: string): Brand => BRANDS.find((b) => b.slug === slug) ?? BRANDS[0];
export const storesFor = (p: Product): Store[] => STORES.filter((s) => s.br.includes(p.b));
export const priceAt = (p: Product, s: Store): number => Math.round((p.price * s.f) / 100) * 10;
export const cheapest = (p: Product): { p: number; s: Store } => {
  const list = storesFor(p);
  let best = { p: priceAt(p, list[0]), s: list[0] };
  for (const s of list) {
    const v = priceAt(p, s);
    if (v < best.p) best = { p: v, s };
  }
  return best;
};
export const offPct = (p: Product): number => Math.round((1 - p.price / p.mrp) * 100);

/* Smallest exact set of [20,10,4,1] L packs summing to L (fewest packs). */
export const packsFor = (L: number): number[] => {
  const out: number[] = [];
  let left = L;
  for (const d of [20, 10, 4, 1]) {
    while (left >= d) {
      out.push(d);
      left -= d;
    }
  }
  return out;
};

export const packLabel = (packs: number[]): string =>
  packs.map((d) => `${d} L`).join(" + ");

/* Calculator maths — kept transparent so the UI can show the working. */
export type Kit = {
  puttyKg: number; puttyPrice: number; primerL: number; primerPacks: number[];
  primerPrice: number; topL: number; topPacks: number[]; topPrice: number;
  tools: number; total: number; wood: boolean;
};
export const buildKit = (area: number, coats: number, surface: string, brand: string): Kit => {
  const wood = surface === "wood";
  const puttyKg = wood ? 0 : Math.ceil(area / 12);
  const puttyPrice = Math.round(puttyKg * 15.5);
  const primerL = wood ? 0 : Math.ceil(area / 130);
  const topL = wood ? Math.ceil((area * coats) / 110) : Math.ceil((area * coats) / 150);
  const r = RATE[brand] ?? RATE["asian-paints"];
  const packPrice = (rate: number, size: number) => Math.round((rate * size) / 100) * 10;
  const primerPacks = packsFor(primerL);
  const topPacks = packsFor(topL);
  const primerPrice = primerPacks.reduce((a, d) => a + packPrice(r.p, d), 0);
  const topPrice = topPacks.reduce((a, d) => a + packPrice(r.t, d), 0);
  const tools = wood ? 380 : 640;
  return {
    puttyKg, puttyPrice, primerL, primerPacks, primerPrice, topL, topPacks, topPrice,
    tools, total: puttyPrice + primerPrice + topPrice + tools, wood,
  };
};