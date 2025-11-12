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

export default function StopdeskPage({ params }: { params: { urlcode: string } }) {
  const urlcode = decodeURIComponent(params.urlcode || "").trim();
  const [isVisible, setIsVisible] = useState(false);
  const [stop, setStop] = useState<EcoStop | null>(null);
  const [loading, setLoading] = useState(true);
  const [company,setCompany]=useState<string | null>(null)
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
      setCompany(data.company)


      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [urlcode]);
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
  if (loading) return <div className="min-h-screen grid place-items-center">Chargement…</div>;
  if (!stop)   return <div className="min-h-screen grid place-items-center">Stopdesk introuvable: {urlcode}</div>;
  const imgSrc = company
  ? `/images/${company}.png`
  : '/images/ecotrack-logo.png';
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className={`flex justify-center transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"}`}>
            <Image src={imgSrc} alt="EcoTrack Logo" width={200} height={60} className="h-10 w-auto" />
          </div>
        </div>
      </header>

      <main className="py-8 px-4">
        <div className="container mx-auto max-w-md">
         {/*} <div className={`text-center mb-6 transition-all duration-1000 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
              <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h1 className="text-xl font-bold text-green-800 mb-1">Votre Colis est Prêt!</h1>
              <p className="text-green-700 text-sm">Récupérez-le à notre stopdesk</p>
            </div>
          </div>*/}

          <Card className={`mb-6 shadow-xl transition-all duration-1000 delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="bg-red-600 p-3 rounded-full inline-block mb-3">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">Point de Retrait</h2>
                <p className="text-gray-600 text-sm mb-4">
                  {title}
                </p>

                <div className="text-center mb-4">
                  <p className="font-semibold text-blue-900 text-lg">{stop?.adresse || "Adresse indisponible"}</p>
                  {wilayaCode && wilayaName && (
  <p className="text-gray-600">
    {wilayaPostal} {wilayaName}, Algérie
  </p>
)}
                </div>
              </div>

              <div className="grid gap-3 mb-4">
                <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg">
                  <div className="bg-blue-900 p-2 rounded-full"><Phone className="h-4 w-4 text-white" /></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 text-sm mb-1">Contactez le Stopdesk</h3>
                    <div className="space-y-1">
                      {stop?.phone  && <button onClick={() => callStopdesk(stop.phone)}  className="block text-red-600 hover:text-red-700 font-medium text-sm">{stop.phone}</button>}
                      {stop?.phone2 && <button onClick={() => callStopdesk(stop.phone2)} className="block text-red-600 hover:text-red-700 font-medium text-sm">{stop.phone2}</button>}
                      {!stop?.phone && !stop?.phone2 && <span className="text-gray-500 text-sm">Non disponible</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg">
                  <div className="bg-blue-900 p-2 rounded-full"><Clock className="h-4 w-4 text-white" /></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 text-sm mb-1">Horaires d&apos;Ouverture</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                      {Array.isArray(stop?.hub_working_days) && stop!.hub_working_days!.length
                        ? stop!.hub_working_days!.map((h, i) => <p key={i}>{h.day}: {h.openTime} - {h.closeTime}</p>)
                        : <p className="text-gray-500">Non communiqué</p>}
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
                  <Button onClick={openGoogleMaps} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg rounded-lg" size="lg" disabled={!mapUrl1}>
                    <Navigation className="mr-2 h-5 w-5" />
                    Ouvrir dans Google Maps
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions de Retrait</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Présentez une pièce d&apos;identité</li>
                <li>• Montrez ce SMS ou votre numéro de suivi</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-blue-900 text-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-2">
            <Image src={imgSrc} alt="EcoTrack Logo" width={120} height={36} className="h-6 w-auto filter brightness-0 invert" />
          </div>
        </div>
      </footer>
    </div>
  );
}
