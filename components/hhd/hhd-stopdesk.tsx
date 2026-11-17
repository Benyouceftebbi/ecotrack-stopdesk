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
import {
  AR_DAYS,
  FR_DAYS,
  HHD_LOGO,
  buildWeek,
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
import "./hhd-stopdesk.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-hhd",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-hhd-ar",
});

export type HhdLang = "fr" | "ar";

const duration = (mins: number, lang: HhdLang) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (lang === "ar") return h ? `${h} سا ${m ? `${m} د` : ""}`.trim() : `${m} د`;
  return h ? `${h} h ${m ? `${String(m).padStart(2, "0")} min` : ""}`.trim() : `${m} min`;
};

const T = {
  fr: {
    badgeReady: "Prêt à être retiré",
    badgePoint: "Point de retrait officiel",
    heroTitle: "Votre colis vous attend !",
    heroTitlePoint: "Votre point de retrait",
    heroSub: "Stopdesk HHD Express",
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
    footer: "Livraison rapide dans les 58 wilayas",
    days: FR_DAYS,
    waMessage: (tracking?: string, place?: string) =>
      `Bonjour, je vous contacte au sujet de ma commande${tracking ? ` (n° ${tracking})` : ""} disponible au stopdesk HHD Express${place ? ` de ${place}` : ""}.`,
  },
  ar: {
    badgeReady: "جاهز للاستلام",
    badgePoint: "نقطة استلام رسمية",
    heroTitle: "طردك في انتظارك!",
    heroTitlePoint: "نقطة الاستلام الخاصة بك",
    heroSub: "مكتب HHD Express",
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
    footer: "توصيل سريع إلى 58 ولاية",
    days: AR_DAYS,
    waMessage: (tracking?: string, place?: string) =>
      `السلام عليكم، أتواصل معكم بخصوص طلبي${tracking ? ` (رقم ${tracking})` : ""} المتوفر في مكتب HHD Express${place ? ` – ${place}` : ""}.`,
  },
};

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const CARD =
  "rounded-3xl bg-white p-5 shadow-[0_12px_40px_-14px_rgba(10,47,102,0.22)] ring-1 ring-slate-900/[0.04] sm:p-6";

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
      <div className="hhd-pin grid h-12 w-12 place-items-center rounded-full bg-[#0F4C9C] text-white shadow-xl ring-4 ring-white">
        <MapPin className="h-6 w-6" />
      </div>
      <div className="hhd-pin-shadow mt-1.5 h-2 w-8 rounded-full bg-[#0A2F66]" />
    </div>
  );
}

export default function HhdStopdesk({ stop, initialLang = "fr" }: { stop: EcoStop; initialLang?: HhdLang }) {
  const [lang, setLang] = useState<HhdLang>(initialLang);
  const [now, setNow] = useState(() => nowInAlgeria());
  const [copied, setCopied] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const t = T[lang];
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

  const senderWaHref = senderWa ? whatsappHref(senderWa, t.waMessage(tracking, stop.commune || stop.wilaya || undefined)) : "";
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

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className={`hhd-root ${jakarta.variable} ${cairo.variable} min-h-screen overflow-x-hidden text-slate-900 antialiased`}
      style={{
        fontFamily: isRTL
          ? "var(--font-hhd-ar), system-ui, sans-serif"
          : "var(--font-hhd), var(--font-hhd-ar), system-ui, sans-serif",
      }}
    >
      {/* ═════════════ HERO ═════════════ */}
      <header className="hhd-hero relative overflow-hidden pb-16 text-white">
        <div className="hhd-dots absolute inset-0" aria-hidden />
        <div className="hhd-glow absolute -end-24 -top-24 h-72 w-72 rounded-full bg-[#FFC20E]/30 blur-3xl" aria-hidden />
        <svg
          className="pointer-events-none absolute -end-16 -top-10 h-72 w-72 opacity-60 lg:h-[26rem] lg:w-[26rem]"
          viewBox="0 0 300 300"
          fill="none"
          aria-hidden
        >
          <path className="hhd-arc" d="M30 130 C 100 10, 270 20, 280 170" stroke="#FFC20E" strokeWidth="12" strokeLinecap="round" />
          <path
            className="hhd-arc"
            style={delay(600)}
            d="M70 160 C 130 80, 240 90, 245 190"
            stroke="#FFD84D"
            strokeWidth="6"
            strokeLinecap="round"
            opacity=".55"
          />
        </svg>

        {/* Top bar */}
        <div className="relative mx-auto flex max-w-md items-center justify-between px-4 pt-4 lg:max-w-5xl lg:pt-6">
          <div className="hhd-pop rounded-2xl bg-white px-3 py-2 shadow-lg shadow-black/15">
            <Image src={HHD_LOGO} alt="HHD Express" width={754} height={360} priority className="h-8 w-auto sm:h-9" />
          </div>
          <div
            className="hhd-pop flex rounded-full bg-white/10 p-1 ring-1 ring-white/20 backdrop-blur"
            style={delay(150)}
            role="group"
            aria-label="Langue / اللغة"
          >
            {(["fr", "ar"] as HhdLang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
                  lang === l ? "bg-white text-[#0A2F66] shadow" : "text-white/75 hover:text-white"
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
                className="hhd-rise inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20 backdrop-blur"
                style={delay(120)}
              >
                <span className="relative flex h-2 w-2">
                  <span className="hhd-ping absolute inline-flex h-full w-full rounded-full bg-[#FFC20E]" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FFC20E]" />
                </span>
                {hasOrder ? t.badgeReady : t.badgePoint}
              </span>
              <h1
                className="hhd-rise mt-3 text-[28px] font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl"
                style={delay(200)}
              >
                {hasOrder ? t.heroTitle : t.heroTitlePoint}
              </h1>
              <p className="hhd-rise mt-2 text-sm text-white/75 sm:text-base" style={delay(280)}>
                {t.heroSub}
                {(stop.commune || stop.wilaya) && (
                  <>
                    {" · "}
                    <span className="font-semibold text-white">{stop.commune || stop.wilaya}</span>
                  </>
                )}
              </p>
            </div>
            <div className="hhd-pop shrink-0 pt-1" style={delay(380)}>
              <div className="hhd-float grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#FFD84D] to-[#FFB800] shadow-xl shadow-[#FFC20E]/30 sm:h-20 sm:w-20">
                <PackageCheck className="h-8 w-8 text-[#0A2F66] sm:h-10 sm:w-10" strokeWidth={2.2} />
              </div>
            </div>
          </div>

          {tracking && (
            <button
              type="button"
              onClick={() => copy("tracking", tracking)}
              className="hhd-rise hhd-btn mt-5 inline-flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2 ring-1 ring-white/20 backdrop-blur hover:bg-white/15"
              style={delay(360)}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{t.tracking}</span>
              <span className="font-mono text-sm font-bold tracking-wide" dir="ltr">
                {tracking}
              </span>
              {copied === "tracking" ? (
                <Check className="h-4 w-4 text-[#FFC20E]" />
              ) : (
                <Copy className="h-4 w-4 text-white/60" />
              )}
            </button>
          )}
        </div>

        {/* Road + truck */}
        <div className="relative mx-auto mt-6 h-10 max-w-md overflow-hidden lg:max-w-5xl" aria-hidden>
          <div className="hhd-road absolute inset-x-0 top-[70%] h-[2px]" />
          <div className="hhd-truck absolute top-0 flex h-full items-center">
            <div className="hhd-truck-body flex items-center gap-1">
              <div className="hhd-speed flex w-6 flex-col items-end gap-1">
                <span className="w-6" />
                <span className="w-4" />
                <span className="w-5" />
              </div>
              <Truck className="h-7 w-7 text-[#FFC20E]" strokeWidth={2.2} />
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
              <section className={`${CARD} hhd-rise relative order-1 overflow-hidden !p-0`} style={delay(380)}>
                <div className="hhd-shine" aria-hidden />
                <div className="p-5 pb-4 sm:p-6 sm:pb-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFC20E]/20 text-[#A87700] [perspective:400px]">
                        <Wallet className="hhd-coin h-5 w-5" />
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
                      className="text-5xl font-extrabold leading-none tracking-tight text-[#0A2F66] tabular-nums sm:text-6xl"
                      dir="ltr"
                    >
                      {formatDA(animatedPrice)}
                    </span>
                    <span className="mb-1 rounded-lg bg-[#FFC20E] px-2 py-0.5 text-sm font-extrabold text-[#0A2F66]">
                      {t.currency}
                    </span>
                  </div>
                </div>
                {/* perforation with ticket notches */}
                <div className="relative mx-5 border-t-2 border-dashed border-slate-200 sm:mx-6">
                  <span className="absolute -start-[31px] -top-[12px] h-[22px] w-[22px] rounded-full bg-[#F2F5FB] sm:-start-[35px]" />
                  <span className="absolute -end-[31px] -top-[12px] h-[22px] w-[22px] rounded-full bg-[#F2F5FB] sm:-end-[35px]" />
                </div>
                <div className="flex items-center gap-2 px-5 py-4 text-sm text-slate-600 sm:px-6">
                  <PackageCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  {t.cashOnPickup}
                </div>
              </section>
            )}

            {/* ── Sender ── */}
            {(sender || senderPhone) && (
              <section className={`${CARD} hhd-rise order-2`} style={delay(460)}>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Store className="h-4 w-4" />
                  {t.sender}
                </div>
                <div className="mt-3 flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#0F4C9C] to-[#1D63C4] text-lg font-extrabold text-white shadow-lg shadow-[#0F4C9C]/25">
                      {initials(sender || t.senderUnknown)}
                    </div>
                    <span className="absolute -bottom-1 -end-1 grid h-6 w-6 place-items-center rounded-full bg-[#FFC20E] ring-2 ring-white">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#0A2F66]" />
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
                      className="hhd-btn hhd-wiggle flex items-center justify-center gap-2 rounded-2xl bg-[#0A2F66] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0A2F66]/25 only:col-span-2"
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
                      className="hhd-btn hhd-wiggle flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#25D366]/30 only:col-span-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {t.whatsapp}
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* ── Pickup point ── */}
            <section className={`${CARD} hhd-rise order-3`} style={delay(540)}>
              <div className="flex items-start gap-3.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0F4C9C]/10 text-[#0F4C9C]">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.pickupPoint}</p>
                  <h2 className="mt-1 text-lg font-extrabold leading-snug text-[#0A2F66]">{stop.name}</h2>
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
                    className="hhd-btn hhd-wiggle inline-flex items-center gap-2 rounded-xl bg-[#0F4C9C]/[0.08] px-3.5 py-2.5 text-sm font-bold text-[#0F4C9C] hover:bg-[#0F4C9C]/[0.12]"
                  >
                    <Phone className="h-4 w-4" />
                    <span dir="ltr">{p}</span>
                  </a>
                ))}
                {fullAddress && (
                  <button
                    type="button"
                    onClick={() => copy("address", fullAddress)}
                    className="hhd-btn inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/70"
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
            <section className={`${CARD} hhd-rise order-6`} style={delay(780)}>
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="h-4 w-4 text-[#E0A800]" />
                {t.instructions}
              </h2>
              <ol className="relative mt-5 space-y-5">
                <span
                  className="absolute bottom-5 start-5 top-5 w-px bg-gradient-to-b from-[#0F4C9C]/30 via-[#0F4C9C]/15 to-[#FFC20E]/50"
                  aria-hidden
                />
                {t.steps.map((s, i) => {
                  const Icon = stepIcons[i];
                  const last = i === t.steps.length - 1;
                  return (
                    <li key={i} className="hhd-rise relative flex gap-3.5" style={delay(860 + i * 110)}>
                      <div
                        className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-sm ring-1 ${
                          last ? "bg-[#FFF6DA] text-[#A87700] ring-[#FFC20E]/40" : "bg-white text-[#0F4C9C] ring-slate-200"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
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
            <section className={`${CARD} hhd-rise order-4`} style={delay(620)}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0F4C9C]/10 text-[#0F4C9C]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h2 className="font-bold text-slate-900">{t.openingHours}</h2>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusUi.chip}`}
                >
                  <span className="relative flex h-2 w-2">
                    {(status.kind === "open" || status.kind === "closing-soon") && (
                      <span className={`hhd-ping absolute inline-flex h-full w-full rounded-full ${statusUi.dot}`} />
                    )}
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${statusUi.dot}`} />
                  </span>
                  {statusUi.label}
                </span>
              </div>

              {status.kind !== "unknown" && (
                <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A2F66] to-[#0F4C9C] p-4 text-white">
                  <div className="hhd-glow absolute -end-10 -top-10 h-28 w-28 rounded-full bg-[#FFC20E]/25 blur-2xl" aria-hidden />
                  <p className="relative text-lg font-extrabold">{statusUi.detail}</p>
                  {(status.kind === "open" || status.kind === "closing-soon") && todaySlot && !("closed" in todaySlot) ? (
                    <div className="relative">
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                        <div
                          className="hhd-progress h-full rounded-full bg-gradient-to-r from-[#FFD84D] to-[#FFC20E] rtl:bg-gradient-to-l"
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
                        className={`hhd-rise flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${
                          isToday ? "bg-[#FFC20E]/15 font-bold text-[#0A2F66] ring-1 ring-[#FFC20E]/40" : "text-slate-600"
                        }`}
                        style={delay(700 + i * 55)}
                      >
                        <span className="flex items-center gap-2">
                          {t.days[i]}
                          {isToday && (
                            <span className="rounded-full bg-[#0A2F66] px-2 py-0.5 text-[10px] font-bold text-white">
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
            <section className={`${CARD} hhd-rise order-5 overflow-hidden !p-0`} style={delay(700)}>
              <div className="flex items-center gap-2.5 p-5 pb-4 sm:p-6 sm:pb-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0F4C9C]/10 text-[#0F4C9C]">
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
                      <div className="hhd-skeleton absolute inset-0 grid place-items-center">
                        <BouncingPin />
                      </div>
                    )}
                    <iframe
                      src={iframeSrc}
                      title={`${t.location} – ${stop.name ?? "HHD Express"}`}
                      className={`h-full w-full border-0 transition-opacity duration-700 ${mapLoaded ? "opacity-100" : "opacity-0"}`}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      onLoad={() => setMapLoaded(true)}
                    />
                  </>
                ) : (
                  <div className="relative grid h-full place-items-center bg-[#EAF0FA]">
                    <div
                      className="absolute inset-0 opacity-70"
                      style={{
                        backgroundImage:
                          "linear-gradient(#d6e0f0 2px, transparent 2px), linear-gradient(90deg, #d6e0f0 2px, transparent 2px)",
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
                    className="hhd-btn flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFC20E] px-4 py-4 text-base font-extrabold text-[#0A2F66] shadow-lg shadow-[#FFC20E]/30 hover:bg-[#FFCB2E]"
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
      <footer className="mt-12 bg-[#0A2F66] pb-28 text-white lg:pb-0">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-9 text-center lg:max-w-5xl">
          <div className="rounded-2xl bg-white px-3 py-2">
            <Image src={HHD_LOGO} alt="HHD Express" width={754} height={360} className="h-8 w-auto" />
          </div>
          <p className="text-sm text-white/70">{t.footer}</p>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} HHD Express</p>
        </div>
      </footer>

      {/* ═════════════ MOBILE ACTION DOCK ═════════════ */}
      <nav className="hhd-dock fixed inset-x-0 bottom-0 z-50 lg:hidden" aria-label="Actions">
        <div className="mx-auto max-w-md px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="flex items-stretch gap-2 rounded-[22px] bg-white/90 p-2 shadow-[0_-10px_40px_-10px_rgba(10,47,102,0.35)] ring-1 ring-slate-900/5 backdrop-blur-xl">
            {stopPhones[0] && (
              <a
                href={telHref(stopPhones[0])}
                className="hhd-btn flex w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl bg-[#0F4C9C]/10 py-2 text-[#0F4C9C]"
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
                className="hhd-btn flex w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl bg-[#25D366]/15 py-2 text-[#128C4B]"
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
                className="hhd-btn flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0A2F66] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0A2F66]/30"
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
