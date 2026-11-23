import type { CSSProperties } from "react";

/**
 * Companies that get the redesigned, animated stopdesk page.
 * Add a company here (colours + logo + aliases) and every one of its
 * stopdesks switches to the new page automatically.
 */
export type StopdeskBrand = {
  id: string;
  /** Display name used in copy ("Stopdesk HHD Express", WhatsApp message, footer). */
  name: string;
  /** Normalised spellings of the Firestore `company` field (lowercase, no spaces/dashes). */
  aliases: string[];
  logo: { src: string; width: number; height: number };
  colors: {
    /** Deep brand colour: hero start, dark buttons, footer, big numbers. */
    dark: string;
    /** Main brand colour: icons, links, avatar. */
    primary: string;
    primary2: string;
    /** Highlight colour: price pill, maps button, truck, progress bar. */
    accent: string;
    accent2: string;
    /** Accent dark enough to be readable as text on white. */
    accentDeep: string;
    /** Text colour on top of `accent`. */
    onAccent: string;
    page: string;
  };
  hero: { from: string; via: string; to: string; glowA: string; glowB: string };
  tagline: { fr: string; ar: string };
};

export const HHD_BRAND: StopdeskBrand = {
  id: "hhdexpress",
  name: "HHD Express",
  aliases: ["hhdexpress", "hhd"],
  logo: { src: "/images/hhd-logo.png", width: 754, height: 360 },
  colors: {
    dark: "#0A2F66",
    primary: "#0F4C9C",
    primary2: "#1D63C4",
    accent: "#FFC20E",
    accent2: "#FFD84D",
    accentDeep: "#A87700",
    onAccent: "#0A2F66",
    page: "#F2F5FB",
  },
  hero: {
    from: "#0A2F66",
    via: "#0F4C9C",
    to: "#1D63C4",
    glowA: "rgba(255, 194, 14, 0.22)",
    glowB: "rgba(29, 99, 196, 0.55)",
  },
  tagline: { fr: "Livraison rapide dans les 58 wilayas", ar: "توصيل سريع إلى 58 ولاية" },
};

export const DHD_BRAND: StopdeskBrand = {
  id: "dhd",
  name: "DHD Livraison",
  aliases: ["dhd", "dhdlivraison", "dhdexpress"],
  logo: { src: "/images/DHD.png", width: 800, height: 300 },
  colors: {
    dark: "#1C1917",
    primary: "#EA580C",
    primary2: "#F97316",
    accent: "#F97316",
    accent2: "#FDBA74",
    accentDeep: "#C2410C",
    onAccent: "#FFFFFF",
    page: "#F7F5F2",
  },
  hero: {
    from: "#1C1917",
    via: "#431407",
    to: "#9A3412",
    glowA: "rgba(249, 115, 22, 0.35)",
    glowB: "rgba(234, 88, 12, 0.30)",
  },
  tagline: { fr: "Vos colis livrés partout en Algérie", ar: "طرودكم تصل إلى كل أنحاء الجزائر" },
};

export const STOPDESK_BRANDS: StopdeskBrand[] = [HHD_BRAND, DHD_BRAND];

const normalise = (company?: string | null) => (company || "").toLowerCase().replace(/[\s_-]+/g, "");

/** Brand with a redesigned page for this Firestore `company` value, or null. */
export const getStopdeskBrand = (company?: string | null): StopdeskBrand | null => {
  const n = normalise(company);
  if (!n) return null;
  return STOPDESK_BRANDS.find((b) => b.aliases.includes(n)) ?? null;
};

/** CSS custom properties consumed by brand-stopdesk.tsx / .css. */
export const brandVars = (b: StopdeskBrand) =>
  ({
    "--b-dark": b.colors.dark,
    "--b-primary": b.colors.primary,
    "--b-primary-2": b.colors.primary2,
    "--b-accent": b.colors.accent,
    "--b-accent-2": b.colors.accent2,
    "--b-accent-deep": b.colors.accentDeep,
    "--b-on-accent": b.colors.onAccent,
    "--b-page": b.colors.page,
    "--b-hero-from": b.hero.from,
    "--b-hero-via": b.hero.via,
    "--b-hero-to": b.hero.to,
    "--b-glow-a": b.hero.glowA,
    "--b-glow-b": b.hero.glowB,
  }) as CSSProperties;
