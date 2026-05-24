export type CompanyTheme = {
  /** Brand id used in URLs and Firestore `company` field */
  id: string;
  /** Display label */
  name: string;
  /** Logo path under /public */
  logo: string;
  /** Primary brand color (hex) */
  primary: string;
  /** Secondary / accent color */
  secondary: string;
  /** Soft tinted background */
  soft: string;
  /** Text color on primary background */
  onPrimary: string;
};

export const COMPANIES: CompanyTheme[] = [
  {
    id: "DHD",
    name: "DHD",
    logo: "/images/DHD.png",
    primary: "#EA580C",
    secondary: "#9A3412",
    soft: "#FFF7ED",
    onPrimary: "#FFFFFF",
  },
  {
    id: "HHDExpress",
    name: "HHD Express",
    logo: "/images/HHDExpress.png",
    primary: "#1D4ED8",
    secondary: "#FACC15",
    soft: "#EFF6FF",
    onPrimary: "#FFFFFF",
  },
  {
    id: "mm-express",
    name: "MM Express",
    logo: "/images/mm-express-logo.png",
    primary: "#DC2626",
    secondary: "#1F2937",
    soft: "#FEF2F2",
    onPrimary: "#FFFFFF",
  },
  {
    id: "noest",
    name: "Noest",
    logo: "/images/noest-logo.png",
    primary: "#0F172A",
    secondary: "#F59E0B",
    soft: "#F8FAFC",
    onPrimary: "#FFFFFF",
  },
  {
    id: "md07",
    name: "MD07",
    logo: "/images/md07.png",
    primary: "#0EA5E9",
    secondary: "#0369A1",
    soft: "#F0F9FF",
    onPrimary: "#FFFFFF",
  },
  {
    id: "anderson",
    name: "Anderson Logistique E-commerce",
    logo: "/images/anderson.png",
    primary: "#DC2626", // red from the logo
    secondary: "#0A0A0A", // black background
    soft: "#FEF9C3", // soft yellow tint inspired by the "A" highlight
    onPrimary: "#FFFFFF",
  },
];

export const getCompany = (id: string): CompanyTheme | undefined => {
  const norm = decodeURIComponent(id || "").toLowerCase();
  return COMPANIES.find(
    (c) => c.id.toLowerCase() === norm || c.name.toLowerCase() === norm
  );
};

/** Colitrack brand */
export const COLITRACK = {
  primary: "#6366F1", // indigo-500 / violet
  primaryDark: "#4F46E5",
  accent: "#A78BFA",
  soft: "#EEF2FF",
  text: "#0F172A",
  muted: "#64748B",
};
