"use client";

import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { EcoStop } from "@/types/ecostop";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Phone,
  Search,
  Loader2,
  Building2,
} from "lucide-react";
import { WILAYA_NAMES } from "@/lib/wilayas";
import { getCompany, COLITRACK } from "@/lib/companies";

type Stop = EcoStop & { id: string; desk_url_code?: string };

export default function CompanyStopdesksPage({
  params,
}: {
  params: Promise<{ company: string }> | { company: string };
}) {
  // Support both promise (Next 15) and plain object
  const resolved =
    typeof (params as Promise<unknown>).then === "function"
      ? use(params as Promise<{ company: string }>)
      : (params as { company: string });

  const company = getCompany(resolved.company);
  if (!company) notFound();

  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [wilaya, setWilaya] = useState<string>("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        // Firestore stores company in different casings; try a few.
        const candidates = [company.id, company.name, company.id.toLowerCase()];
        const seen = new Map<string, Stop>();

        await Promise.all(
          candidates.map(async (val) => {
            const snap = await getDocs(
              query(collection(db, "EcoStop"), where("company", "==", val))
            );
            snap.docs.forEach((d) => {
              if (!seen.has(d.id)) {
                seen.set(d.id, { id: d.id, ...(d.data() as EcoStop) });
              }
            });
          })
        );

        if (!alive) return;
        setStops(Array.from(seen.values()));
      } catch (e) {
        console.error("[v0] error loading stopdesks", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [company.id, company.name]);

  const wilayasInResults = useMemo(() => {
    const set = new Set<number>();
    stops.forEach((s) => {
      const code =
        typeof s.code_wilaya === "string"
          ? Number(s.code_wilaya)
          : (s.code_wilaya as number | undefined);
      if (code) set.add(code);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [stops]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stops.filter((s) => {
      const code =
        typeof s.code_wilaya === "string"
          ? Number(s.code_wilaya)
          : (s.code_wilaya as number | undefined);

      if (wilaya !== "all" && String(code) !== wilaya) return false;

      if (!q) return true;
      const haystack = [
        s.name,
        s.adresse,
        s.commune,
        s.wilaya,
        code ? WILAYA_NAMES[code] : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [stops, search, wilaya]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with company branding */}
      <header
        className="text-white"
        style={{
          background: `linear-gradient(135deg, ${company.primary} 0%, ${company.secondary} 100%)`,
        }}
      >
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>

          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: COLITRACK.primary }}
            >
              C
            </div>
            <span className="font-semibold text-white text-sm">
              Colitrack
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12 pt-6">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="bg-white rounded-2xl shadow-lg p-3 w-24 h-24 flex items-center justify-center shrink-0">
              <Image
                src={company.logo || "/placeholder.svg"}
                alt={`${company.name} logo`}
                width={96}
                height={96}
                className="object-contain max-h-full max-w-full"
              />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                Stopdesks
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {company.name}
              </h1>
              <p className="text-white/85 mt-1 text-sm">
                {loading
                  ? "Chargement…"
                  : `${stops.length} point${stops.length > 1 ? "s" : ""} de retrait disponible${stops.length > 1 ? "s" : ""} en Algérie`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par nom, commune, adresse…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={wilaya} onValueChange={setWilaya}>
            <SelectTrigger className="md:w-64">
              <SelectValue placeholder="Toutes les wilayas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les wilayas</SelectItem>
              {wilayasInResults.map((code) => (
                <SelectItem key={code} value={String(code)}>
                  {String(code).padStart(2, "0")} — {WILAYA_NAMES[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-slate-500 md:ml-2 md:whitespace-nowrap">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* List */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Chargement des stopdesks…
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-10 text-center">
              <Building2 className="h-10 w-10 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-700">Aucun résultat</p>
              <p className="text-sm text-slate-500 mt-1">
                Essayez de modifier vos filtres ou votre recherche.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => {
              const code =
                typeof s.code_wilaya === "string"
                  ? Number(s.code_wilaya)
                  : (s.code_wilaya as number | undefined);
              const wilayaName = code ? WILAYA_NAMES[code] : s.wilaya || "";
              const url = s.desk_url_code || s.id;

              return (
                <Link
                  key={s.id}
                  href={`/${url}`}
                  className="group block focus:outline-none"
                >
                  <Card className="h-full border-slate-200 hover:shadow-lg transition-all hover:-translate-y-0.5">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="rounded-lg p-2 shrink-0"
                          style={{ backgroundColor: company.soft }}
                        >
                          <MapPin
                            className="h-5 w-5"
                            style={{ color: company.primary }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 line-clamp-2 leading-snug">
                            {s.name || "Stopdesk"}
                          </h3>
                          {wilayaName && (
                            <p className="text-xs text-slate-500 mt-1">
                              {code ? `${code}000` : ""} {wilayaName}
                              {s.commune ? ` · ${s.commune}` : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      {s.adresse && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                          {s.adresse}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          {s.phone ? (
                            <>
                              <Phone className="h-3.5 w-3.5" />
                              <span className="font-medium">{s.phone}</span>
                            </>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all"
                          style={{ color: company.primary }}
                        >
                          Détails
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Annuaire {company.name} propulsé par{" "}
            <span
              className="font-semibold"
              style={{ color: COLITRACK.primary }}
            >
              Colitrack
            </span>
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Voir d&apos;autres sociétés</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
