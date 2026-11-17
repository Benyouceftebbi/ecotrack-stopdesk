/**
 * Helpers for the HHD Express stopdesk page: company detection, phone
 * normalisation (tel: / WhatsApp), opening-hours parsing and live status.
 */

export const HHD_LOGO = "/images/hhd-logo.png";

/** True for every spelling of HHD Express we store in Firestore ("HHDExpress", "HHD Express", "hhd-express"…). */
export const isHhdCompany = (company?: string | null): boolean => {
  const n = (company || "").toLowerCase().replace(/[\s_-]+/g, "");
  return n === "hhdexpress" || n === "hhd";
};

/** Accepts a plain embed URL or a full `<iframe src="…">` snippet copied from Google Maps. */
export const extractIframeSrc = (raw?: string | null): string => {
  const value = (raw || "").trim();
  if (!value) return "";
  const m = value.match(/src\s*=\s*["']([^"']+)["']/i);
  return (m ? m[1] : value).replace(/&amp;/g, "&");
};

export const telHref = (phone?: string | null) =>
  phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "";

/** Algerian local numbers (0XXXXXXXXX) → international digits (213XXXXXXXXX) for wa.me links. */
export const toWhatsAppNumber = (phone?: string | null): string => {
  let d = (phone || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("213")) return d;
  if (d.startsWith("0")) return `213${d.slice(1)}`;
  if (d.length === 9) return `213${d}`;
  return d;
};

export const whatsappHref = (phone?: string | null, text?: string) => {
  const n = toWhatsAppNumber(phone);
  if (!n) return "";
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};

export const parsePrice = (v?: number | string | null): number | null => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(v.replace(/[^\d.,]/g, "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const formatDA = (n: number) =>
  new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(Math.round(n)).replace(/ | /g, " ");

export const initials = (name?: string | null) =>
  (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "?";

// ───────────────────────── Opening hours ─────────────────────────

/** French day names as stored in Firestore, indexed like Date#getDay() (0 = Sunday). */
export const FR_DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
export const AR_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

/** "08:30", "8 AM", "8:30 PM", "17h", "17h30" → minutes since midnight, or null. */
export const parseTime = (raw?: string | null): number | null => {
  const s = (raw || "").trim().toLowerCase();
  if (!s) return null;
  const m = s.match(/^(\d{1,2})(?:\s*[:h.]\s*(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const mer = m[3];
  if (mer === "pm" && h < 12) h += 12;
  if (mer === "am" && h === 12) h = 0;
  if (h > 24 || min > 59) return null;
  return h * 60 + min;
};

export const fmtMinutes = (m: number) =>
  `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export type DaySlot = { dayIndex: number; open: number; close: number } | { dayIndex: number; closed: true };

type RawDay = { day: string; openTime: string; closeTime: string };

const dayIndexOf = (day: string) => {
  const norm = (day || "").trim().toLowerCase();
  return FR_DAYS.findIndex((d) => d.toLowerCase() === norm);
};

/** Builds a 7-day schedule (index = getDay()). Days missing from the data are treated as closed. */
export const buildWeek = (days?: RawDay[] | null): DaySlot[] | null => {
  if (!Array.isArray(days) || days.length === 0) return null;
  const week: DaySlot[] = FR_DAYS.map((_, i) => ({ dayIndex: i, closed: true as const }));
  let any = false;
  for (const d of days) {
    const idx = dayIndexOf(d.day);
    if (idx < 0) continue;
    const open = parseTime(d.openTime);
    const close = parseTime(d.closeTime);
    if (open !== null && close !== null && close > open) {
      week[idx] = { dayIndex: idx, open, close };
      any = true;
    }
  }
  return any ? week : null;
};

/** Current day/minute in Algeria (Africa/Algiers, UTC+1 all year), independent of the visitor's device timezone. */
export const nowInAlgeria = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Algiers",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { dayIndex: wd < 0 ? date.getDay() : wd, minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
};

export type OpenStatus =
  | { kind: "open"; closesAt: number; minutesLeft: number; progress: number }
  | { kind: "closing-soon"; closesAt: number; minutesLeft: number; progress: number }
  | { kind: "closed"; nextDayOffset: number; nextDayIndex: number; opensAt: number }
  | { kind: "unknown" };

export const getOpenStatus = (week: DaySlot[] | null, now = nowInAlgeria()): OpenStatus => {
  if (!week) return { kind: "unknown" };
  const today = week[now.dayIndex];
  if (today && !("closed" in today)) {
    if (now.minutes >= today.open && now.minutes < today.close) {
      const minutesLeft = today.close - now.minutes;
      const progress = (now.minutes - today.open) / (today.close - today.open);
      return { kind: minutesLeft <= 60 ? "closing-soon" : "open", closesAt: today.close, minutesLeft, progress };
    }
    if (now.minutes < today.open) {
      return { kind: "closed", nextDayOffset: 0, nextDayIndex: now.dayIndex, opensAt: today.open };
    }
  }
  for (let off = 1; off <= 7; off++) {
    const idx = (now.dayIndex + off) % 7;
    const slot = week[idx];
    if (slot && !("closed" in slot)) return { kind: "closed", nextDayOffset: off, nextDayIndex: idx, opensAt: slot.open };
  }
  return { kind: "unknown" };
};
