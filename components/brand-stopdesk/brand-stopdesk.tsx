"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Cairo, Plus_Jakarta_Sans } from "next/font/google";
import {
  Banknote,
  CalendarClock,
  Check,
  Clock,
  Copy,
  IdCard,
  MapPin,
  MapPinned,
  MessageCircle,
  Navigation,
  PackageCheck,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import type { EcoStop } from "@/types/ecostop";
import { WILAYA_NAMES } from "@/lib/wilayas";
import { brandVars, type StopdeskBrand } from "./brands";
import {
  AR_DAYS,
  FR_DAYS,
  buildWeek,
  deFr,
  extractIframeSrc,
  fmtMinutes,
  formatDA,
  getOpenStatus,
  initials,
  nowInAlgeria,
  parsePrice,
  telHref,
  whatsappHref,
} from "./utils";
import "./brand-stopdesk.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sd",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-sd-ar",
});

export type StopdeskLang = "fr" | "ar";

const duration = (mins: number, lang: StopdeskLang) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (lang === "ar") return h ? `${h} سا ${m ? `${m} د` : ""}`.trim() : `${m} د`;
  return h ? `${h} h ${m ? `${String(m).padStart(2, "0")} min` : ""}`.trim() : `${m} min`;
};

const buildCopy = (brand: string) => ({
  fr: {
    badgeReady: "Prêt à être retiré",
    badgePoint: "Point de retrait officiel",
    heroTitle: "Votre colis vous attend !",
    heroTitlePoint: "Votre point de retrait",
    heroSub: `Stopdesk ${brand}`,
    tracking: "N° de suivi",
    copied: "Copié !",
    amountToPay: "Montant à payer",
    cod: "Espèces",
    currency: "DA",
    cashOnPickup: "À régler au moment du retrait du colis",
    sender: "Expéditeur",
    senderUnknown: "Vendeur",
    senderHint: "Une question sur votre commande ? Contactez directement le vendeur.",
    call: "Appeler",
    whatsapp: "WhatsApp",
    pickupPoint: "Point de retrait",
    addressUnavailable: "Adresse indisponible",
    country: "Algérie",
    copyAddress: "Copier l'adresse",
    openingHours: "Horaires d'ouverture",
    openNow: "Ouvert",
    closingSoon: "Ferme bientôt",
    closed: "Fermé",
    unknown: "Non communiqué",
    closesAt: (t: string) => `Ouvert jusqu'à ${t}`,
    closesIn: (d: string) => `Ferme dans ${d}`,
    timeLeft: (d: string) => `Encore ${d}`,
    opensToday: (t: string) => `Ouvre aujourd'hui à ${t}`,
    opensTomorrow: (t: string) => `Ouvre demain à ${t}`,
    opensOn: (day: string, t: string) => `Ouvre ${day.toLowerCase()} à ${t}`,
    today: "Aujourd'hui",
    closedDay: "Fermé",
    hoursUnknown: "Horaires non communiqués",
    location: "Localisation",
    openInMaps: "Ouvrir dans Google Maps",
    directions: "Itinéraire",
    noMap: "Carte bientôt disponible",
    instructions: "Comment récupérer votre colis",
    steps: [
      { title: "Présentez une pièce d'identité", desc: "Carte nationale, passeport ou permis de conduire." },
      { title: "Montrez ce SMS ou votre n° de suivi", desc: "L'agent retrouvera votre colis en quelques secondes." },
      { title: "Retirez-le sous 3 jours", desc: "Passé ce délai, le colis sera retourné à l'expéditeur." },
    ],
    dockStopdesk: "Stopdesk",
    dockSender: "Vendeur",
    days: FR_DAYS,
    waMessage: (tracking?: string, place?: string) =>
      `Bonjour, je vous contacte au sujet de ma commande${tracking ? ` (n° ${tracking})` : ""} disponible au stopdesk ${brand}${place ? ` ${deFr(place)}` : ""}.`,
  },
  ar: {
    badgeReady: "جاهز للاستلام",
    badgePoint: "نقطة استلام رسمية",
    heroTitle: "طردك في انتظارك!",
    heroTitlePoint: "نقطة الاستلام الخاصة بك",
    heroSub: `مكتب ${brand}`,
    tracking: "رقم التتبع",
    copied: "تم النسخ!",
    amountToPay: "المبلغ المطلوب دفعه",
    cod: "نقداً",
    currency: "دج",
    cashOnPickup: "يُدفع عند استلام الطرد",
    sender: "المرسل",
    senderUnknown: "البائع",
    senderHint: "لديك سؤال حول طلبك؟ تواصل مباشرة مع البائع.",
    call: "اتصال",
    whatsapp: "واتساب",
    pickupPoint: "نقطة الاستلام",
    addressUnavailable: "العنوان غير متوفر",
    country: "الجزائر",
    copyAddress: "نسخ العنوان",
    openingHours: "ساعات العمل",
    openNow: "مفتوح",
    closingSoon: "يغلق قريباً",
    closed: "مغلق",
    unknown: "غير محدد",
    closesAt: (t: string) => `مفتوح حتى الساعة ${t}`,
    closesIn: (d: string) => `يغلق بعد ${d}`,
    timeLeft: (d: string) => `متبقي ${d}`,
    opensToday: (t: string) => `يفتح اليوم على الساعة ${t}`,
    opensTomorrow: (t: string) => `يفتح غداً على الساعة ${t}`,
    opensOn: (day: string, t: string) => `يفتح يوم ${day} على الساعة ${t}`,
    today: "اليوم",
    closedDay: "مغلق",
    hoursUnknown: "ساعات العمل غير محددة",
    location: "الموقع",
    openInMaps: "فتح في خرائط جوجل",
    directions: "الاتجاهات",
    noMap: "الخريطة ستتوفر قريباً",
    instructions: "كيف تستلم طردك",
    steps: [
      { title: "قدّم بطاقة هوية", desc: "بطاقة التعريف الوطنية، جواز السفر أو رخصة السياقة." },
      { title: "أظهر هذه الرسالة أو رقم التتبع", desc: "سيجد الموظف طردك في ثوانٍ." },
      { title: "استلم طردك خلال 3 أيام", desc: "بعد هذه المدة، سيتم إرجاع الطرد إلى المرسل." },
    ],
    dockStopdesk: "المكتب",
    dockSender: "البائع",
    days: AR_DAYS,
    waMessage: (tracking?: string, place?: string) =>
      `السلام عليكم، أتواصل معكم بخصوص طلبي${tracking ? ` (رقم ${tracking})` : ""} المتوفر في مكتب ${brand}${place ? ` – ${place}` : ""}.`,
  },
});

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const CARD =
  "rounded-3xl bg-white p-5 shadow-[0_12px_40px_-14px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/[0.04] sm:p-6";

/** Animated count-up for the order amount. */
function useCountUp(target: number | null, ms = 1400, startDelay = 450) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === null) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / ms);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => (raf = requestAnimationFrame(tick)), startDelay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, ms, startDelay]);
  return value;
}

function BouncingPin() {
  return (
    <div className="flex flex-col items-center">
      <div className="sd-pin grid h-12 w-12 place-items-center rounded-full bg-[var(--b-primary)] text-white shadow-xl ring-4 ring-white">
        <MapPin className="h-6 w-6" />
      </div>
      <div className="sd-pin-shadow mt-1.5 h-2 w-8 rounded-full bg-[var(--b-dark)]" />
    </div>
  );
}

export default function BrandStopdesk({
  brand,
  stop,
  initialLang = "fr",
}: {
  brand: StopdeskBrand;
  stop: EcoStop;
  initialLang?: StopdeskLang;
}) {
  const [lang, setLang] = useState<StopdeskLang>(initialLang);
  const [now, setNow] = useState(() => nowInAlgeria());
  const [copied, setCopied] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const copyByLang = useMemo(() => buildCopy(brand.name), [brand.name]);
  const t = copyByLang[lang];
  const isRTL = lang === "ar";

  useEffect(() => {
    const id = setInterval(() => setNow(nowInAlgeria()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Safety net: some browsers never fire onLoad for lazy cross-origin iframes.
  useEffect(() => {
    const id = setTimeout(() => setMapLoaded(true), 4500);
    return () => clearTimeout(id);
  }, []);

  const price = parsePrice(stop.order_price);
  const animatedPrice = useCountUp(price);
  const sender = stop.sender_name?.trim() || "";
  const senderPhone = stop.sender_phone?.trim() || "";
  const senderWa = (stop.sender_whatsapp || stop.sender_phone || "").trim();
  const tracking = stop.tracking?.trim() || "";
  const hasOrder = Boolean(price || sender || tracking);

  const week = useMemo(() => buildWeek(stop.hub_working_days), [stop.hub_working_days]);
  const status = getOpenStatus(week, now);
  const todaySlot = week?.[now.dayIndex];

  const iframeSrc = extractIframeSrc(stop.iframeMap);
  const fullAddress = [stop.adresse, stop.commune, stop.wilaya].filter(Boolean).join(", ");
  const mapsUrl =
    stop.map?.trim() ||
    (fullAddress ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}` : "");

  const wilayaCode = stop.code_wilaya ? Number(stop.code_wilaya) : undefined;
  const wilayaName = wilayaCode ? WILAYA_NAMES[wilayaCode] : stop.wilaya || undefined;
  const wilayaLatin = wilayaName ? `${wilayaCode ? `${wilayaCode}000 ` : ""}${wilayaName}` : "";

  const senderWaHref = senderWa
    ? whatsappHref(senderWa, t.waMessage(tracking, stop.commune || stop.wilaya || undefined))
    : "";
  const stopPhones = [stop.phone, stop.phone2].filter((p): p is string => Boolean(p && p.trim()));

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
  };

  const statusUi = (() => {
    switch (status.kind) {
      case "open":
        return {
          label: t.openNow,
          detail: t.closesAt(fmtMinutes(status.closesAt)),
          chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
          dot: "bg-emerald-500",
        };
      case "closing-soon":
        return {
          label: t.closingSoon,
          detail: t.closesIn(duration(status.minutesLeft, lang)),
          chip: "bg-amber-50 text-amber-700 ring-amber-600/20",
          dot: "bg-amber-500",
        };
      case "closed": {
        const time = fmtMinutes(status.opensAt);
        const detail =
          status.nextDayOffset === 0
            ? t.opensToday(time)
            : status.nextDayOffset === 1
              ? t.opensTomorrow(time)
              : t.opensOn(t.days[status.nextDayIndex], time);
        return { label: t.closed, detail, chip: "bg-rose-50 text-rose-700 ring-rose-600/20", dot: "bg-rose-500" };
      }
      default:
        return { label: t.unknown, detail: "", chip: "bg-slate-100 text-slate-600 ring-slate-500/20", dot: "bg-slate-400" };
    }
  })();

  const stepIcons = [IdCard, Smartphone, CalendarClock];
  const logo = (cls: string, priority = false) => (
    <Image
      src={brand.logo.src}
      alt={brand.name}
      width={brand.logo.width}
      height={brand.logo.height}
      priority={priority}
      className={cls}
    />
  );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      data-brand={brand.id}
      className={`sd-root ${jakarta.variable} ${cairo.variable} min-h-screen overflow-x-hidden text-slate-900 antialiased`}
      style={{
        ...brandVars(brand),
        fontFamily: isRTL
          ? "var(--font-sd-ar), system-ui, sans-serif"
          : "var(--font-sd), var(--font-sd-ar), system-ui, sans-serif",
      }}
    >
      {/* ═════════════ HERO ═════════════ */}
      <header className="sd-hero relative overflow-hidden pb-16 text-white">
        <div className="sd-dots absolute inset-0" aria-hidden />
        <div
          className="sd-glow absolute -end-24 -top-24 h-72 w-72 rounded-full bg-[var(--b-accent)]/30 blur-3xl"
          aria-hidden
        />
        <svg
          className="pointer-events-none absolute -end-16 -top-10 h-72 w-72 opacity-60 lg:h-[26rem] lg:w-[26rem]"
          viewBox="0 0 300 300"
          fill="none"
          aria-hidden
        >
          <path
            className="sd-arc"
            d="M30 130 C 100 10, 270 20, 280 170"
            style={{ stroke: "var(--b-accent)" }}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            className="sd-arc"
            style={{ ...delay(600), stroke: "var(--b-accent-2)" }}
            d="M70 160 C 130 80, 240 90, 245 190"
            strokeWidth="6"
            strokeLinecap="round"
            opacity=".55"
          />
        </svg>

        {/* Top bar */}
        <div className="relative mx-auto flex max-w-md items-center justify-between px-4 pt-4 lg:max-w-5xl lg:pt-6">
          <div className="sd-pop rounded-2xl bg-white px-3 py-2 shadow-lg shadow-black/15">
            {logo("h-8 w-auto sm:h-9", true)}
          </div>
          <div
            className="sd-pop flex rounded-full bg-white/10 p-1 ring-1 ring-white/20 backdrop-blur"
            style={delay(150)}
            role="group"
            aria-label="Langue / اللغة"
          >
            {(["fr", "ar"] as StopdeskLang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
                  lang === l ? "bg-white text-[var(--b-dark)] shadow" : "text-white/75 hover:text-white"
                }`}
              >
                {l === "fr" ? "FR" : "عربي"}
              </button>
            ))}
          </div>
        </div>

        {/* Headline */}
        <div className="relative mx-auto max-w-md px-4 pt-8 lg:max-w-5xl lg:pt-12">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span
                className="sd-rise inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20 backdrop-blur"
                style={delay(120)}
              >
                <span className="relative flex h-2 w-2">
                  <span className="sd-ping absolute inline-flex h-full w-full rounded-full bg-[var(--b-accent)]" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--b-accent)]" />
                </span>
                {hasOrder ? t.badgeReady : t.badgePoint}
              </span>
              <h1
                className="sd-rise mt-3 text-[28px] font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl"
                style={delay(200)}
              >
                {hasOrder ? t.heroTitle : t.heroTitlePoint}
              </h1>
              <p className="sd-rise mt-2 text-sm text-white/75 sm:text-base" style={delay(280)}>
                {t.heroSub}
                {(stop.commune || stop.wilaya) && (
                  <>
                    {" · "}
                    <span className="font-semibold text-white">{stop.commune || stop.wilaya}</span>
                  </>
                )}
              </p>
            </div>
            <div className="sd-pop shrink-0 pt-1" style={delay(380)}>
              <div className="sd-float grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[color:var(--b-accent-2)] to-[color:var(--b-accent)] shadow-xl shadow-black/20 sm:h-20 sm:w-20">
                <PackageCheck className="h-8 w-8 text-[var(--b-on-accent)] sm:h-10 sm:w-10" strokeWidth={2.2} />
              </div>
            </div>
          </div>

          {tracking && (
            <button
              type="button"
              onClick={() => copy("tracking", tracking)}
              className="sd-rise sd-btn mt-5 inline-flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2 ring-1 ring-white/20 backdrop-blur hover:bg-white/15"
              style={delay(360)}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{t.tracking}</span>
              <span className="font-mono text-sm font-bold tracking-wide" dir="ltr">
                {tracking}
              </span>
              {copied === "tracking" ? (
                <Check className="h-4 w-4 text-[var(--b-accent)]" />
              ) : (
                <Copy className="h-4 w-4 text-white/60" />
              )}
            </button>
          )}
        </div>

        {/* Road + truck */}
        <div className="relative mx-auto mt-6 h-10 max-w-md overflow-hidden lg:max-w-5xl" aria-hidden>
          <div className="sd-road absolute inset-x-0 top-[70%] h-[2px]" />
          <div className="sd-truck absolute top-0 flex h-full items-center">
            <div className="sd-truck-body flex items-center gap-1">
              <div className="sd-speed flex w-6 flex-col items-end gap-1">
                <span className="w-6" />
                <span className="w-4" />
                <span className="w-5" />
              </div>
              <Truck className="h-7 w-7 text-[var(--b-accent)]" strokeWidth={2.2} />
            </div>
          </div>
        </div>
      </header>

      {/* ═════════════ CONTENT ═════════════ */}
      <main className="relative -mt-12 px-4">
        <div className="mx-auto flex max-w-md flex-col gap-4 lg:grid lg:max-w-5xl lg:grid-cols-2 lg:items-start lg:gap-6">
          {/* Left column (mobile order via `order-*`) */}
          <div className="contents lg:flex lg:flex-col lg:gap-6">
            {/* ── Price ticket ── */}
            {price !== null && (
              <section className={`${CARD} sd-rise relative order-1 overflow-hidden !p-0`} style={delay(380)}>
                <div className="sd-shine" aria-hidden />
                <div className="p-5 pb-4 sm:p-6 sm:pb-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--b-accent)]/20 text-[var(--b-accent-deep)] [perspective:400px]">
                        <Wallet className="sd-coin h-5 w-5" />
                      </div>
                      <p className="whitespace-nowrap text-sm font-semibold text-slate-500">{t.amountToPay}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-600/15">
                      <Banknote className="h-3.5 w-3.5" />
                      {t.cod}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end gap-2">
                    <span
                      className="text-5xl font-extrabold leading-none tracking-tight text-[var(--b-dark)] tabular-nums sm:text-6xl"
                      dir="ltr"
                    >
                      {formatDA(animatedPrice)}
                    </span>
                    <span className="mb-1 rounded-lg bg-[var(--b-accent)] px-2 py-0.5 text-sm font-extrabold text-[var(--b-on-accent)]">
                      {t.currency}
                    </span>
                  </div>
                </div>
                {/* perforation with ticket notches */}
                <div className="relative mx-5 border-t-2 border-dashed border-slate-200 sm:mx-6">
                  <span className="absolute -start-[31px] -top-[12px] h-[22px] w-[22px] rounded-full bg-[var(--b-page)] sm:-start-[35px]" />
                  <span className="absolute -end-[31px] -top-[12px] h-[22px] w-[22px] rounded-full bg-[var(--b-page)] sm:-end-[35px]" />
                </div>
                <div className="flex items-center gap-2 px-5 py-4 text-sm text-slate-600 sm:px-6">
                  <PackageCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  {t.cashOnPickup}
                </div>
              </section>
            )}

            {/* ── Sender ── */}
            {(sender || senderPhone) && (
              <section className={`${CARD} sd-rise order-2`} style={delay(460)}>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Store className="h-4 w-4" />
                  {t.sender}
                </div>
                <div className="mt-3 flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[color:var(--b-primary)] to-[color:var(--b-primary-2)] text-lg font-extrabold text-white shadow-lg shadow-black/15">
                      {initials(sender || t.senderUnknown)}
                    </div>
                    <span className="absolute -bottom-1 -end-1 grid h-6 w-6 place-items-center rounded-full bg-[var(--b-accent)] ring-2 ring-white">
                      <ShieldCheck className="h-3.5 w-3.5 text-[var(--b-on-accent)]" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-slate-900">{sender || t.senderUnknown}</p>
                    {senderPhone && (
                      <p className="text-sm text-slate-500">
                        <span dir="ltr">{senderPhone}</span>
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{t.senderHint}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {senderPhone && (
                    <a
                      href={telHref(senderPhone)}
                      className="sd-btn sd-wiggle flex items-center justify-center gap-2 rounded-2xl bg-[var(--b-dark)] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/20 only:col-span-2"
                    >
                      <Phone className="h-4 w-4" />
                      {t.call}
                    </a>
                  )}
                  {senderWaHref && (
                    <a
                      href={senderWaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sd-btn sd-wiggle flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 only:col-span-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {t.whatsapp}
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* ── Pickup point ── */}
            <section className={`${CARD} sd-rise order-3`} style={delay(540)}>
              <div className="flex items-start gap-3.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--b-primary)]/10 text-[var(--b-primary)]">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.pickupPoint}</p>
                  <h2 className="mt-1 text-lg font-extrabold leading-snug text-[var(--b-dark)]">{stop.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{stop.adresse || t.addressUnavailable}</p>
                  {wilayaLatin && (
                    <p className="text-sm text-slate-400">
                      <bdi>{wilayaLatin}</bdi>
                      {isRTL ? "، " : ", "}
                      {t.country}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {stopPhones.map((p) => (
                  <a
                    key={p}
                    href={telHref(p)}
                    className="sd-btn sd-wiggle inline-flex items-center gap-2 rounded-xl bg-[var(--b-primary)]/[0.08] px-3.5 py-2.5 text-sm font-bold text-[var(--b-primary)] hover:bg-[var(--b-primary)]/[0.12]"
                  >
                    <Phone className="h-4 w-4" />
                    <span dir="ltr">{p}</span>
                  </a>
                ))}
                {fullAddress && (
                  <button
                    type="button"
                    onClick={() => copy("address", fullAddress)}
                    className="sd-btn inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/70"
                  >
                    {copied === "address" ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied === "address" ? t.copied : t.copyAddress}
                  </button>
                )}
              </div>
            </section>

            {/* ── Instructions ── */}
            <section className={`${CARD} sd-rise order-6`} style={delay(780)}>
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="h-4 w-4 text-[var(--b-accent-deep)]" />
                {t.instructions}
              </h2>
              <ol className="relative mt-5 space-y-5">
                <span
                  className="absolute bottom-5 start-5 top-5 w-px bg-gradient-to-b from-[color:var(--b-primary)]/30 via-[color:var(--b-primary)]/15 to-[color:var(--b-accent)]/50"
                  aria-hidden
                />
                {t.steps.map((s, i) => {
                  const Icon = stepIcons[i];
                  const last = i === t.steps.length - 1;
                  return (
                    <li key={i} className="sd-rise relative flex gap-3.5" style={delay(860 + i * 110)}>
                      <div
                        className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm ring-1 ${
                          last
                            ? "text-[var(--b-accent-deep)] ring-[color:var(--b-accent)]/40"
                            : "text-[var(--b-primary)] ring-slate-200"
                        }`}
                      >
                        {last && <span className="absolute inset-0 rounded-xl bg-[var(--b-accent)]/12" aria-hidden />}
                        <Icon className="relative h-5 w-5" />
                      </div>
                      <div className="pt-0.5">
                        <p className="font-semibold text-slate-900">{s.title}</p>
                        <p className="mt-0.5 text-sm text-slate-500">{s.desc}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>

          {/* Right column */}
          <div className="contents lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-6">
            {/* ── Opening hours ── */}
            <section className={`${CARD} sd-rise order-4`} style={delay(620)}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--b-primary)]/10 text-[var(--b-primary)]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h2 className="font-bold text-slate-900">{t.openingHours}</h2>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusUi.chip}`}
                >
                  <span className="relative flex h-2 w-2">
                    {(status.kind === "open" || status.kind === "closing-soon") && (
                      <span className={`sd-ping absolute inline-flex h-full w-full rounded-full ${statusUi.dot}`} />
                    )}
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${statusUi.dot}`} />
                  </span>
                  {statusUi.label}
                </span>
              </div>

              {status.kind !== "unknown" && (
                <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[color:var(--b-dark)] to-[color:var(--b-primary)] p-4 text-white">
                  <div
                    className="sd-glow absolute -end-10 -top-10 h-28 w-28 rounded-full bg-[var(--b-accent)]/25 blur-2xl"
                    aria-hidden
                  />
                  <p className="relative text-lg font-extrabold">{statusUi.detail}</p>
                  {(status.kind === "open" || status.kind === "closing-soon") && todaySlot && !("closed" in todaySlot) ? (
                    <div className="relative">
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                        <div
                          className="sd-progress h-full rounded-full bg-gradient-to-r from-[color:var(--b-accent-2)] to-[color:var(--b-accent)] rtl:bg-gradient-to-l"
                          style={{ width: `${Math.max(4, Math.min(100, status.progress * 100))}%` }}
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-white/65">
                        <span dir="ltr">{fmtMinutes(todaySlot.open)}</span>
                        <span className="font-semibold text-white/90">{t.timeLeft(duration(status.minutesLeft, lang))}</span>
                        <span dir="ltr">{fmtMinutes(todaySlot.close)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="relative mt-1 text-sm text-white/65">{t.closed}</p>
                  )}
                </div>
              )}

              {week ? (
                <ul className="mt-4 space-y-1">
                  {week.map((slot, i) => {
                    const isToday = i === now.dayIndex;
                    return (
                      <li
                        key={i}
                        className={`sd-rise flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${
                          isToday
                            ? "bg-[var(--b-accent)]/15 font-bold text-[var(--b-dark)] ring-1 ring-[color:var(--b-accent)]/40"
                            : "text-slate-600"
                        }`}
                        style={delay(700 + i * 55)}
                      >
                        <span className="flex items-center gap-2">
                          {t.days[i]}
                          {isToday && (
                            <span className="rounded-full bg-[var(--b-dark)] px-2 py-0.5 text-[10px] font-bold text-white">
                              {t.today}
                            </span>
                          )}
                        </span>
                        {"closed" in slot ? (
                          <span className="font-semibold text-rose-500">{t.closedDay}</span>
                        ) : (
                          <span dir="ltr" className="tabular-nums">
                            {fmtMinutes(slot.open)} – {fmtMinutes(slot.close)}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">{t.hoursUnknown}</p>
              )}
            </section>

            {/* ── Map ── */}
            <section className={`${CARD} sd-rise order-5 overflow-hidden !p-0`} style={delay(700)}>
              <div className="flex items-center gap-2.5 p-5 pb-4 sm:p-6 sm:pb-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--b-primary)]/10 text-[var(--b-primary)]">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-slate-900">{t.location}</h2>
                  {(stop.commune || stop.wilaya) && (
                    <p className="truncate text-xs text-slate-500">
                      {[stop.commune, stop.wilaya].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="relative mx-3 h-64 overflow-hidden rounded-2xl ring-1 ring-slate-900/5 sm:h-72 lg:h-80">
                {iframeSrc ? (
                  <>
                    {!mapLoaded && (
                      <div className="sd-skeleton absolute inset-0 grid place-items-center">
                        <BouncingPin />
                      </div>
                    )}
                    <iframe
                      src={iframeSrc}
                      title={`${t.location} – ${stop.name ?? brand.name}`}
                      className={`h-full w-full border-0 transition-opacity duration-700 ${mapLoaded ? "opacity-100" : "opacity-0"}`}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      onLoad={() => setMapLoaded(true)}
                    />
                  </>
                ) : (
                  <div className="relative grid h-full place-items-center bg-slate-100">
                    <div
                      className="absolute inset-0 opacity-70"
                      style={{
                        backgroundImage:
                          "linear-gradient(#dde3ea 2px, transparent 2px), linear-gradient(90deg, #dde3ea 2px, transparent 2px)",
                        backgroundSize: "42px 42px",
                      }}
                      aria-hidden
                    />
                    <div className="relative flex flex-col items-center gap-3">
                      <BouncingPin />
                      <p className="text-sm font-semibold text-slate-500">{t.noMap}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sd-btn flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--b-accent)] px-4 py-4 text-base font-extrabold text-[var(--b-on-accent)] shadow-lg shadow-[color:var(--b-accent)]/30"
                  >
                    <Navigation className="h-5 w-5" />
                    {t.openInMaps}
                  </a>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ═════════════ FOOTER ═════════════ */}
      <footer className="mt-12 bg-[var(--b-dark)] pb-28 text-white lg:pb-0">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-9 text-center lg:max-w-5xl">
          <div className="rounded-2xl bg-white px-3 py-2">{logo("h-8 w-auto")}</div>
          <p className="text-sm text-white/70">{brand.tagline[lang]}</p>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {brand.name}
          </p>
        </div>
      </footer>

      {/* ═════════════ MOBILE ACTION DOCK ═════════════ */}
      <nav className="sd-dock fixed inset-x-0 bottom-0 z-50 lg:hidden" aria-label="Actions">
        <div className="mx-auto max-w-md px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="flex items-stretch gap-2 rounded-[22px] bg-white/90 p-2 shadow-[0_-10px_40px_-10px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 backdrop-blur-xl">
            {stopPhones[0] && (
              <a
                href={telHref(stopPhones[0])}
                className="sd-btn flex w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl bg-[var(--b-primary)]/10 py-2 text-[var(--b-primary)]"
              >
                <Phone className="h-5 w-5" />
                <span className="text-[10px] font-bold">{t.dockStopdesk}</span>
              </a>
            )}
            {senderWaHref && (
              <a
                href={senderWaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="sd-btn flex w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl bg-[#25D366]/15 py-2 text-[#128C4B]"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-[10px] font-bold">{t.dockSender}</span>
              </a>
            )}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sd-btn flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--b-dark)] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/25"
              >
                <Navigation className="h-4 w-4" />
                {t.directions}
              </a>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
