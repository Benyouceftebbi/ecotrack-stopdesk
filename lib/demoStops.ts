import type { EcoStop } from "@/types/ecostop";

type DemoStop = EcoStop & { id: string; desk_url_code?: string };

const DEFAULT_HOURS = [
  { day: "Samedi", openTime: "09:00", closeTime: "18:00" },
  { day: "Dimanche", openTime: "09:00", closeTime: "18:00" },
  { day: "Lundi", openTime: "09:00", closeTime: "18:00" },
  { day: "Mardi", openTime: "09:00", closeTime: "18:00" },
  { day: "Mercredi", openTime: "09:00", closeTime: "18:00" },
  { day: "Jeudi", openTime: "09:00", closeTime: "18:00" },
  { day: "Vendredi", openTime: "Fermé", closeTime: "" },
];

const buildIframe = (q: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;

/**
 * Hardcoded demonstration stopdesks for Anderson Logistique E-commerce.
 * Used until the company has its real data wired into Firestore.
 */
export const ANDERSON_DEMO_STOPS: DemoStop[] = [
  {
    id: "anderson-alger-centre",
    desk_url_code: "ANDR-ALG-01",
    name: "Anderson Alger Centre",
    phone: "0550 12 34 56",
    phone2: "0770 12 34 56",
    code_wilaya: 16,
    wilaya: "Alger",
    commune: "Alger Centre",
    adresse: "12 Rue Didouche Mourad, en face de la Grande Poste, Alger Centre",
    map: "https://www.google.com/maps/search/?api=1&query=Rue+Didouche+Mourad+Alger",
    iframeMap: buildIframe("Rue Didouche Mourad, Alger Centre"),
    company: "anderson",
    hub_working_days: DEFAULT_HOURS,
  },
  {
    id: "anderson-bab-ezzouar",
    desk_url_code: "ANDR-ALG-02",
    name: "Anderson Bab Ezzouar",
    phone: "0550 23 45 67",
    phone2: null,
    code_wilaya: 16,
    wilaya: "Alger",
    commune: "Bab Ezzouar",
    adresse: "Cité 1100 Logements, Bât B12, Local 3, Bab Ezzouar",
    map: "https://www.google.com/maps/search/?api=1&query=Bab+Ezzouar+Alger",
    iframeMap: buildIframe("Bab Ezzouar, Alger"),
    company: "anderson",
    hub_working_days: DEFAULT_HOURS,
  },
  {
    id: "anderson-oran-es-senia",
    desk_url_code: "ANDR-ORN-01",
    name: "Anderson Oran Es-Sénia",
    phone: "0540 11 22 33",
    phone2: "0660 11 22 33",
    code_wilaya: 31,
    wilaya: "Oran",
    commune: "Es-Sénia",
    adresse: "Route de l'aéroport, à coté de la station Naftal, Es-Sénia, Oran",
    map: "https://www.google.com/maps/search/?api=1&query=Es-Senia+Oran",
    iframeMap: buildIframe("Es-Sénia, Oran"),
    company: "anderson",
    hub_working_days: DEFAULT_HOURS,
  },
  {
    id: "anderson-oran-bir-el-djir",
    desk_url_code: "ANDR-ORN-02",
    name: "Anderson Oran Bir El Djir",
    phone: "0540 22 33 44",
    phone2: null,
    code_wilaya: 31,
    wilaya: "Oran",
    commune: "Bir El Djir",
    adresse: "Avenue de l'ALN, en face de l'USTO, Bir El Djir",
    map: "https://www.google.com/maps/search/?api=1&query=Bir+El+Djir+Oran",
    iframeMap: buildIframe("Bir El Djir, Oran"),
    company: "anderson",
    hub_working_days: DEFAULT_HOURS,
  },
  {
    id: "anderson-constantine-zouaghi",
    desk_url_code: "ANDR-CST-01",
    name: "Anderson Constantine Zouaghi",
    phone: "0560 33 44 55",
    phone2: null,
    code_wilaya: 25,
    wilaya: "Constantine",
    commune: "Zouaghi Slimane",
    adresse: "Cité Boussouf, Rue des Frères Abbas, Zouaghi Slimane",
    map: "https://www.google.com/maps/search/?api=1&query=Zouaghi+Constantine",
    iframeMap: buildIframe("Zouaghi Slimane, Constantine"),
    company: "anderson",
    hub_working_days: DEFAULT_HOURS,
  },
  {
    id: "anderson-annaba-centre",
    desk_url_code: "ANDR-ANB-01",
    name: "Anderson Annaba Centre",
    phone: "0560 44 55 66",
    phone2: "0770 44 55 66",
    code_wilaya: 23,
    wilaya: "Annaba",
    commune: "Annaba",
    adresse: "Cours de la Révolution, à coté du théâtre régional, Annaba",
    map: "https://www.google.com/maps/search/?api=1&query=Cours+Revolution+Annaba",
    iframeMap: buildIframe("Cours de la Révolution, Annaba"),
    company: "anderson",
    hub_working_days: DEFAULT_HOURS,
  },
  {
    id: "anderson-setif-centre",
    desk_url_code: "ANDR-SET-01",
    name: "Anderson Sétif Centre",
    phone: "0550 55 66 77",
    phone2: null,
    code_wilaya: 19,
    wilaya: "Sétif",
    commune: "Sétif",
    adresse: "Avenue du 1er Novembre, en face du parc Aïn El Fouara, Sétif",
    map: "https://www.google.com/maps/search/?api=1&query=Ain+El+Fouara+Setif",
    iframeMap: buildIframe("Aïn El Fouara, Sétif"),
    company: "anderson",
    hub_working_days: DEFAULT_HOURS,
  },
  {
    id: "anderson-blida-centre",
    desk_url_code: "ANDR-BLD-01",
    name: "Anderson Blida Centre",
    phone: "0550 66 77 88",
    phone2: null,
    code_wilaya: 9,
    wilaya: "Blida",
    commune: "Blida",
    adresse: "Boulevard Larbi Tebessi, à coté de la place du 1er Novembre, Blida",
    map: "https://www.google.com/maps/search/?api=1&query=Larbi+Tebessi+Blida",
    iframeMap: buildIframe("Boulevard Larbi Tebessi, Blida"),
    company: "anderson",
    hub_working_days: DEFAULT_HOURS,
  },
  {
    id: "anderson-tlemcen-centre",
    desk_url_code: "ANDR-TLM-01",
    name: "Anderson Tlemcen",
    phone: "0540 77 88 99",
    phone2: null,
    code_wilaya: 13,
    wilaya: "Tlemcen",
    commune: "Tlemcen",
    adresse: "Rue de l'Indépendance, en face de la médersa, Tlemcen",
    map: "https://www.google.com/maps/search/?api=1&query=Tlemcen+centre",
    iframeMap: buildIframe("Tlemcen centre"),
    company: "anderson",
    hub_working_days: DEFAULT_HOURS,
  },
  {
    id: "anderson-bejaia-centre",
    desk_url_code: "ANDR-BJA-01",
    name: "Anderson Béjaïa",
    phone: "0560 88 99 00",
    phone2: "0770 88 99 00",
    code_wilaya: 6,
    wilaya: "Béjaïa",
    commune: "Béjaïa",
    adresse: "Boulevard de la Liberté, en face du port, Béjaïa",
    map: "https://www.google.com/maps/search/?api=1&query=Bejaia+port",
    iframeMap: buildIframe("Boulevard de la Liberté, Béjaïa"),
    company: "anderson",
    hub_working_days: DEFAULT_HOURS,
  },
  {
    id: "anderson-tizi-ouzou",
    desk_url_code: "ANDR-TZO-01",
    name: "Anderson Tizi Ouzou",
    phone: "0550 99 00 11",
    phone2: null,
    code_wilaya: 15,
    wilaya: "Tizi Ouzou",
    commune: "Tizi Ouzou",
    adresse: "Boulevard Stiti Ali, Nouvelle Ville, Tizi Ouzou",
    map: "https://www.google.com/maps/search/?api=1&query=Nouvelle+Ville+Tizi+Ouzou",
    iframeMap: buildIframe("Nouvelle Ville, Tizi Ouzou"),
    company: "anderson",
    hub_working_days: DEFAULT_HOURS,
  },
  {
    id: "anderson-batna-centre",
    desk_url_code: "ANDR-BTN-01",
    name: "Anderson Batna",
    phone: "0560 10 20 30",
    phone2: null,
    code_wilaya: 5,
    wilaya: "Batna",
    commune: "Batna",
    adresse: "Avenue de la République, près du marché central, Batna",
    map: "https://www.google.com/maps/search/?api=1&query=Batna+centre",
    iframeMap: buildIframe("Batna centre"),
    company: "anderson",
    hub_working_days: DEFAULT_HOURS,
  },
];

export const DEMO_STOPS_BY_COMPANY: Record<string, DemoStop[]> = {
  anderson: ANDERSON_DEMO_STOPS,
};

/**
 * Look up a demo stop by either its document id or its desk_url_code.
 * Used as a fallback when Firestore has no matching record.
 */
export function findDemoStop(urlcode: string): DemoStop | null {
  const needle = urlcode.toLowerCase();
  for (const list of Object.values(DEMO_STOPS_BY_COMPANY)) {
    for (const s of list) {
      if (
        s.id.toLowerCase() === needle ||
        (s.desk_url_code && s.desk_url_code.toLowerCase() === needle)
      ) {
        return s;
      }
    }
  }
  return null;
}
