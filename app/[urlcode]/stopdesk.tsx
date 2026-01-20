"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { EcoStop } from "@/types/ecostop";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock, Package, Navigation } from "lucide-react";
import Image from "next/image";
import { WILAYA_NAMES } from "@/lib/wilayas";

type Language = "fr" | "ar";

const dayTranslations: Record<string, { fr: string; ar: string }> = {
  Lundi: { fr: "Lundi", ar: "الإثنين" },
  Mardi: { fr: "Mardi", ar: "الثلاثاء" },
  Mercredi: { fr: "Mercredi", ar: "الأربعاء" },
  Jeudi: { fr: "Jeudi", ar: "الخميس" },
  Vendredi: { fr: "Vendredi", ar: "الجمعة" },
  Samedi: { fr: "Samedi", ar: "السبت" },
  Dimanche: { fr: "Dimanche", ar: "الأحد" },
};

const translateDay = (day: string, lang: Language): string => {
  const normalized = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  return dayTranslations[normalized]?.[lang] || day;
};

const translations = {
  fr: {
    loading: "Chargement…",
    notFound: "Stopdesk introuvable:",
    pickupPoint: "Point de Retrait",
    addressUnavailable: "Adresse indisponible",
    country: "Algérie",
    contactStopdesk: "Contactez le Stopdesk",
    notAvailable: "Non disponible",
    openingHours: "Horaires d'Ouverture",
    notProvided: "Non communiqué",
    openInGoogleMaps: "Ouvrir dans Google Maps",
    pickupInstructions: "Instructions de Retrait",
    instruction1: "Présentez une pièce d'identité",
    instruction2: "Montrez ce SMS ou votre numéro de suivi",
  },
  ar: {
    loading: "جاري التحميل…",
    notFound: "نقطة التوقف غير موجودة:",
    pickupPoint: "نقطة الاستلام",
    addressUnavailable: "العنوان غير متوفر",
    country: "الجزائر",
    contactStopdesk:"اتصل بمكتب التوصيل",
    notAvailable: "غير متوفر",
    openingHours: "ساعات العمل",
    notProvided: "غير محدد",
    openInGoogleMaps: "فتح في خرائط جوجل",
    pickupInstructions: "تعليمات الاستلام",
    instruction1: "قدّم بطاقة هوية",
    instruction2: "أظهر هذه الرسالة أو رقم التتبع الخاص بك",
  },
};

type StopdeskTheme = {
  bgGradient: string;
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  cardAccentBg: string;
  iconCircleBg: string;
  phoneText: string;
  buttonBg: string;
  buttonHoverBg: string;
  footerBg: string;
};

const getTheme = (companyName?: string): StopdeskTheme => {
  const name = companyName?.toLowerCase().trim() || "";

  // 🧡 DHD: orange theme
  if (name === "dhd") {
    return {
      bgGradient: "from-orange-50 to-white",
      primaryText: "text-orange-900",
      secondaryText: "text-orange-800",
      mutedText: "text-gray-600",
      cardAccentBg: "bg-orange-50",
      iconCircleBg: "bg-orange-900",
      phoneText: "text-orange-600 hover:text-orange-700",
      buttonBg: "bg-orange-600",
      buttonHoverBg: "hover:bg-orange-700",
      footerBg: "bg-orange-900",
    };
  }

  // 🔵🟡 HHDExpress: main blue, secondary yellow
  if (name === "hhdexpress" || name === "hhd express") {
    return {
      bgGradient: "from-blue-50 to-white",
      primaryText: "text-blue-900",
      secondaryText: "text-yellow-700",
      mutedText: "text-gray-600",
      cardAccentBg: "bg-blue-50",
      iconCircleBg: "bg-yellow-400",
      // ⬇⬇ here is what was red before – now yellow
      phoneText: "text-yellow-600 hover:text-yellow-700",
      buttonBg: "bg-blue-600",
      buttonHoverBg: "hover:bg-blue-700",
      footerBg: "bg-blue-900",
    };
  }

  // ✅ Default theme (your original)
  return {
    bgGradient: "from-blue-50 to-white",
    primaryText: "text-blue-900",
    secondaryText: "text-blue-800",
    mutedText: "text-gray-600",
    cardAccentBg: "bg-blue-50",
    iconCircleBg: "bg-blue-900",
    phoneText: "text-red-600 hover:text-red-700",
    buttonBg: "bg-red-600",
    buttonHoverBg: "hover:bg-red-700",
    footerBg: "bg-blue-900",
  };
};
export default function StopdeskPage({ params }: { params: { urlcode: string } }) {

  const urlcode = decodeURIComponent(params.urlcode || "").trim();
  const [isVisible, setIsVisible] = useState(false);
  const [stop, setStop] = useState<EcoStop | null>(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>("fr");

  const t = translations[lang];
  const isRTL = lang === "ar";
  useEffect(() => setIsVisible(true), []);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      // 🔹 Step 1. Try to find stop in Firestore
      const dref = doc(db, "EcoStop", urlcode);
      const dsnap = await getDoc(dref);

      let data: EcoStop | null = null;

      if (dsnap.exists()) {
        data = (dsnap.data() as EcoStop) ?? null;
      } else {
        // fallback query by desk_url_code
        const q1 = query(collection(db, "EcoStop"), where("desk_url_code", "==", urlcode), limit(1));
        const q2 = query(collection(db, "EcoStop"), where("desk_url_code", "==", urlcode.toUpperCase()), limit(1));
        const [r1, r2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const m = r1.docs[0] || r2.docs[0];
        if (m) data = (m.data() as EcoStop) ?? null;
      }

      if (!alive) return;
      setStop(data);
      setCompany(data?.company ?? null);
      
      // Set language based on doc.data.lng
      if (data?.lng === "ar") {
        setLang("ar");
      } else {
        setLang("fr");
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [urlcode]);
  const theme = getTheme(company); // or props.companyName

  const title = stop?.name || "EcoTrack Stopdesk";
  const fullAddress = useMemo(() => {
    const parts = [stop?.adresse, stop?.commune, stop?.wilaya].filter(Boolean);
    return parts.join(", ");
  }, [stop]);

  const mapUrl1 =
    (stop?.map?.trim() || "") ||
    (fullAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}` : "");

  const openGoogleMaps = () => mapUrl1 && window.open(mapUrl1, "_blank");
  const callStopdesk = (p?: string | null) => p && (window.location.href = `tel:${p.replace(/\s+/g, "")}`);
  const wilayaCode = typeof stop?.code_wilaya === "string"
  ? Number(stop!.code_wilaya)
  : (stop?.code_wilaya as number | undefined);

const wilayaName = wilayaCode ? WILAYA_NAMES[wilayaCode] : undefined;
// Per your spec: id + "000" (e.g., 16 -> 16000). No left-padding.
const wilayaPostal = wilayaCode ? `${wilayaCode}000` : undefined;
  if (loading)
    return <div className="min-h-screen grid place-items-center">{t.loading}</div>;
  if (!stop)
    return (
      <div className="min-h-screen grid place-items-center">
        {t.notFound} {urlcode}
      </div>
    );
  const imgSrc = company
  ? `/images/${company}.png`
  : '/images/ecotrack-logo.png';
  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.bgGradient}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className={`flex justify-center transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"}`}>
            <Image src={imgSrc || "/placeholder.svg"} alt="EcoTrack Logo" width={200} height={60} className="h-10 w-auto" />
          </div>
        </div>
      </header>

      <main className="py-8 px-4">
        <div className="container mx-auto max-w-md">
          <Card className={`mb-6 shadow-xl transition-all duration-1000 delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className={`${theme.buttonBg} p-3 rounded-full inline-block mb-3`}>
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h2 className={`text-xl font-bold mb-2 ${theme.primaryText}`}>
                  {t.pickupPoint}
                </h2>
                <p className={`${theme.mutedText} text-sm mb-4`}>{title}</p>

                <div className="text-center mb-4">
                  <p className={`font-semibold text-lg ${theme.primaryText}`}>
                    {stop?.adresse || t.addressUnavailable}
                  </p>
                  {wilayaCode && wilayaName && (
                    <p className={theme.mutedText}>
                      {wilayaPostal} {wilayaName}, {t.country}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-3 mb-4">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme.cardAccentBg}`}>
                  <div className={`${theme.iconCircleBg} p-2 rounded-full shrink-0`}>
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm mb-1 ${theme.primaryText}`}>
                        {t.contactStopdesk}
                      </h3>
                    <div className="space-y-1">
                      {stop?.phone && (
                        <button
                          onClick={() => callStopdesk(stop.phone)}
                          className={`block font-medium text-sm ${theme.phoneText}`}
                        >
                          {stop.phone}
                        </button>
                      )}
                      {stop?.phone2 && (
                        <button
                          onClick={() => callStopdesk(stop.phone2)}
                          className={`block font-medium text-sm ${theme.phoneText}`}
                        >
                          {stop.phone2}
                        </button>
                      )}
                      {!stop?.phone && !stop?.phone2 && (
                        <span className="text-gray-500 text-sm">{t.notAvailable}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${theme.cardAccentBg}`}>
                  <div className={`${theme.iconCircleBg} p-2 rounded-full shrink-0`}>
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-sm mb-1 ${theme.primaryText}`}>
                        {t.openingHours}
                      </h3>
                    <div className="text-xs text-gray-600 space-y-1">
                      {Array.isArray(stop?.hub_working_days) && stop!.hub_working_days!.length ? (
                        stop!.hub_working_days!.map((h: any, i: number) => (
                          <p key={i}>
                            {translateDay(h.day, lang)}: {h.openTime} - {h.closeTime}
                          </p>
                        ))
                      ) : (
                        <p className="text-gray-500">{t.notProvided}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`mb-6 shadow-xl transition-all duration-1000 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <CardContent className="p-0">
              <div className="relative">
                <div className="w-full h-64 bg-gray-200 rounded-t-lg overflow-hidden">
                  {stop.iframeMap ? (
                    <iframe
                      src={stop.iframeMap}
                      width="100%"
                      height="256"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg"
                    />
                  ) : (
                    <p className="text-gray-500">No map available.</p>
                  )}
                </div>
                <div className="p-4">
                  <Button
                    onClick={openGoogleMaps}
                    className={`w-full ${theme.buttonBg} ${theme.buttonHoverBg} text-white py-3 text-lg rounded-lg`}
                    size="lg"
                    disabled={!mapUrl1}
                  >
                    <Navigation className={`h-5 w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t.openInGoogleMaps}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.cardAccentBg}`}>
            <CardContent className="p-4">
              <h3 className={`font-semibold mb-2 ${theme.primaryText}`}>
                {t.pickupInstructions}
              </h3>
              <ul className={`text-sm ${theme.secondaryText} space-y-1`}>
                <li>• {t.instruction1}</li>
                <li>• {t.instruction2}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className={`${theme.footerBg} text-white py-6 mt-8`}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-2">
            <Image
              src={imgSrc || "/placeholder.svg"}
              alt="EcoTrack Logo"
              width={120}
              height={36}
              className="h-6 w-auto filter brightness-0 invert"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
