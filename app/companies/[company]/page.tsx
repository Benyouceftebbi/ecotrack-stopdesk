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
  Download,
  FileText,
  FileSpreadsheet,
  Copy,
  Check,
} from "lucide-react";
import { WILAYA_NAMES } from "@/lib/wilayas";
import { getCompany, COLITRACK } from "@/lib/companies";
import { DEMO_STOPS_BY_COMPANY } from "@/lib/demoStops";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
        // Start with hardcoded demo data for companies that have it.
        const seen = new Map<string, Stop>();
        const demo = DEMO_STOPS_BY_COMPANY[company.id.toLowerCase()];
        if (demo) {
          demo.forEach((d) => seen.set(d.id, d as Stop));
        }

        // Merge with Firestore data (different casings for company field).
        const candidates = [company.id, company.name, company.id.toLowerCase()];
        await Promise.all(
          candidates.map(async (val) => {
            try {
              const snap = await getDocs(
                query(collection(db, "EcoStop"), where("company", "==", val))
              );
              snap.docs.forEach((d) => {
                if (!seen.has(d.id)) {
                  seen.set(d.id, { id: d.id, ...(d.data() as EcoStop) });
                }
              });
            } catch (err) {
              console.error("[v0] firestore query failed for", val, err);
            }
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

  const buildRows = (items: Stop[]) =>
    items.map((s) => {
      const code =
        typeof s.code_wilaya === "string"
          ? Number(s.code_wilaya)
          : (s.code_wilaya as number | undefined);
      return {
        Nom: s.name || "",
        Wilaya: code ? `${String(code).padStart(2, "0")} - ${WILAYA_NAMES[code] || ""}` : s.wilaya || "",
        Commune: s.commune || "",
        Adresse: s.adresse || "",
        Telephone: s.phone || "",
        Lien: `${typeof window !== "undefined" ? window.location.origin : ""}/${s.desk_url_code || s.id}`,
      };
    });

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const rows = buildRows(filtered);
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 32 },
      { wch: 22 },
      { wch: 22 },
      { wch: 50 },
      { wch: 18 },
      { wch: 40 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, company.name.slice(0, 30));
    XLSX.writeFile(wb, `stopdesks-${company.id}.xlsx`);
  };

  const handleExportPdf = async () => {
    try {
      // pdfmake has first-class table support and generates a clean blob,
      // which we can deliver in a way that also works inside a sandboxed iframe.
      const pdfMakeModule = await import("pdfmake/build/pdfmake");
      const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

      const pdfMake: any = (pdfMakeModule as any).default ?? pdfMakeModule;
      const vfs =
        (pdfFontsModule as any).default?.pdfMake?.vfs ??
        (pdfFontsModule as any).pdfMake?.vfs ??
        (pdfFontsModule as any).default?.vfs ??
        (pdfFontsModule as any).vfs;
      if (vfs) pdfMake.vfs = vfs;

      const rows = buildRows(filtered);

      const tableBody = [
        // Header row
        ["Nom", "Wilaya", "Commune", "Adresse", "Téléphone"].map((h) => ({
          text: h,
          bold: true,
          color: "#FFFFFF",
          fillColor: company.primary,
          margin: [0, 4, 0, 4],
        })),
        // Data rows
        ...rows.map((r, i) => {
          const fill = i % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
          return [r.Nom, r.Wilaya, r.Commune, r.Adresse, r.Telephone].map(
            (cell) => ({
              text: cell ?? "",
              fillColor: fill,
              margin: [0, 3, 0, 3],
              color: "#28282A",
            })
          );
        }),
      ];

      const docDefinition: any = {
        pageOrientation: "landscape",
        pageSize: "A4",
        pageMargins: [28, 28, 28, 28],
        content: [
          {
            text: `${company.name} — Stopdesks en Algérie`,
            fontSize: 16,
            bold: true,
            color: company.primary,
            margin: [0, 0, 0, 4],
          },
          {
            text: `${rows.length} point(s) · Généré par Colitrack · ${new Date().toLocaleDateString(
              "fr-FR"
            )}`,
            fontSize: 9,
            color: "#64748B",
            margin: [0, 0, 0, 12],
          },
          {
            table: {
              headerRows: 1,
              widths: ["18%", "14%", "14%", "39%", "15%"],
              body: tableBody,
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => "#E2E8F0",
              vLineColor: () => "#E2E8F0",
              paddingLeft: () => 6,
              paddingRight: () => 6,
            },
          },
        ],
        defaultStyle: { fontSize: 9 },
      };

      const fileName = `stopdesks-${company.id}.pdf`;
      const inIframe =
        typeof window !== "undefined" && window.self !== window.top;

      pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        if (inIframe) {
          // Inside a sandboxed iframe, a normal download is blocked, so open
          // the generated PDF in a new top-level tab instead.
          window.open(url, "_blank");
        } else {
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      });
    } catch (err) {
      console.error("[v0] PDF export failed", err);
      alert("Échec de l'export PDF. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
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

        <div className="container mx-auto px-4 pb-10 pt-6 max-w-full">
          <div className="flex items-center gap-4 flex-wrap min-w-0">
            <div className="bg-white rounded-2xl shadow-lg p-3 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
              <Image
                src={company.logo || "/placeholder.svg"}
                alt={`${company.name} logo`}
                width={96}
                height={96}
                className="object-contain max-h-full max-w-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white/80 text-xs sm:text-sm font-medium uppercase tracking-wider">
                Stopdesks
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words">
                {company.name}
              </h1>
              <p className="text-white/85 mt-1 text-xs sm:text-sm">
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
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row gap-3 md:items-center max-w-full">
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
            <SelectTrigger className="md:w-64 w-full">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                disabled={loading || filtered.length === 0}
                className="md:ml-auto text-white hover:opacity-90"
                style={{ backgroundColor: company.primary }}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPdf} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2 text-rose-600" />
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* List */}
      <main className="container mx-auto px-4 py-8 max-w-full">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {filtered.map((s) => (
              <StopdeskCard
                key={s.id}
                stop={s}
                primary={company.primary}
                soft={company.soft}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-8">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <p className="text-sm text-slate-500 text-center">
            Annuaire {company.name} propulsé par{" "}
            <span
              className="font-semibold"
              style={{ color: COLITRACK.primary }}
            >
              Colitrack
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function StopdeskCard({
  stop,
  primary,
  soft,
}: {
  stop: Stop;
  primary: string;
  soft: string;
}) {
  const [copied, setCopied] = useState(false);

  const code =
    typeof stop.code_wilaya === "string"
      ? Number(stop.code_wilaya)
      : (stop.code_wilaya as number | undefined);
  const wilayaName = code ? WILAYA_NAMES[code] : stop.wilaya || "";
  const padded = code ? String(code).padStart(2, "0") : "";
  const url = stop.desk_url_code || stop.id;
  const detailHref = `/${url}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const lines = [
      stop.name ? `Stopdesk : ${stop.name}` : null,
      wilayaName ? `Wilaya : ${padded ? padded + " - " : ""}${wilayaName}` : null,
      stop.commune ? `Commune : ${stop.commune}` : null,
      stop.adresse ? `Adresse : ${stop.adresse}` : null,
      stop.phone ? `Téléphone : ${stop.phone}` : null,
      stop.phone2 ? `Téléphone 2 : ${stop.phone2}` : null,
      stop.map ? `Carte : ${stop.map}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("[v0] copy failed", err);
    }
  };

  const handleMap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target =
      stop.map ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [stop.name, stop.adresse, stop.commune, wilayaName, "Algeria"]
          .filter(Boolean)
          .join(", ")
      )}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stop.phone) window.location.href = `tel:${stop.phone}`;
  };

  return (
    <Link
      href={detailHref}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-2xl"
      style={{ ["--tw-ring-color" as string]: primary, ["--card-hover" as string]: primary }}
    >
      <Card
        className="relative h-full w-full overflow-hidden border-2 border-slate-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 hover:[border-color:var(--card-hover)]"
      >
        <CardContent className="p-4 sm:p-5 relative">
          {/* Header: badge + name */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md"
              style={{ backgroundColor: primary }}
              aria-label={`Wilaya ${padded}`}
            >
              {padded || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-base uppercase tracking-tight truncate">
                {stop.name || wilayaName || "Stopdesk"}
              </h3>
              {(wilayaName || stop.commune) && (
                <p className="text-xs text-slate-500 truncate">
                  {wilayaName}
                  {stop.commune ? ` · ${stop.commune}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          {stop.adresse && (
            <div
              className="rounded-md pl-3 py-1 mb-4 border-l-2"
              style={{ borderColor: primary }}
            >
              <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                {stop.adresse}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {stop.phone && (
              <button
                type="button"
                onClick={handleCall}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold border bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {stop.phone}
              </button>
            )}
            <button
              type="button"
              onClick={handleMap}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold border transition-colors"
              style={{
                backgroundColor: soft,
                borderColor: primary + "33",
                color: primary,
              }}
            >
              <MapPin className="h-3.5 w-3.5" />
              Voir sur la carte
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                copied
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copier les détails
                </>
              )}
            </button>
          </div>

          {/* Détails link */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {wilayaName}
            </span>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all whitespace-nowrap"
              style={{ color: primary }}
            >
              Détails
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
