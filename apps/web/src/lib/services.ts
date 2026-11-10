/* Services catalogue + crew maths for the /services page. Labour rates are
   per sq ft; day estimates scale with area and crew size. Frontend-only:
   crews are showcase mocks, slots/booking land in Part 2. */

export type Service = {
  id: string; rate: number; prod: number; rating: number; jobs: number;
  grad: [string, string]; surface: string; coats: number;
};

export const SERVICES: Service[] = [
  { id: "interior", rate: 26, prod: 320, rating: 4.8, jobs: 412, grad: ["#f7c9d9", "#e00048"], surface: "interior", coats: 2 },
  { id: "exterior", rate: 32, prod: 260, rating: 4.7, jobs: 186, grad: ["#fbdce6", "#a80036"], surface: "exterior", coats: 2 },
  { id: "waterproof", rate: 58, prod: 180, rating: 4.8, jobs: 97, grad: ["#f4cfd9", "#8f002e"], surface: "exterior", coats: 2 },
  { id: "wood", rate: 46, prod: 220, rating: 4.6, jobs: 143, grad: ["#f9d3de", "#c2003f"], surface: "wood", coats: 2 },
  { id: "texture", rate: 85, prod: 120, rating: 4.9, jobs: 64, grad: ["#f2c4d3", "#a80036"], surface: "interior", coats: 1 },
  { id: "refresh", rate: 22, prod: 420, rating: 4.7, jobs: 238, grad: ["#fbdce6", "#e00048"], surface: "interior", coats: 1 },
];

export const serviceOf = (id: string): Service => SERVICES.find((s) => s.id === id) ?? SERVICES[0];

/* sq ft a crew paints per day ≈ service productivity × crew heads. */
export const crewDays = (sv: Service, area: number, crew: number): number =>
  Math.max(1, Math.ceil(area / (sv.prod * crew)));

export const CREWS = [
  { name: "Ramesh Yadav", rating: 4.9, jobs: 212, langs: "HI · GU", since: 2016 },
  { name: "Salim Pathan", rating: 4.8, jobs: 176, langs: "HI · UR · GU", since: 2018 },
  { name: "Dinesh Prajapati", rating: 4.7, jobs: 143, langs: "GU · HI", since: 2020 },
];