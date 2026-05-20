"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  MapPin,
  Search,
  Truck,
  Building2,
  Sparkles,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { COMPANIES, COLITRACK } from "@/lib/companies";

export default function HomePage() {
  const [selected, setSelected] = useState<string>(COMPANIES[0].id);
  const selectedCompany = COMPANIES.find((c) => c.id === selected) ?? COMPANIES[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: COLITRACK.primary }}
            >
              C
            </div>
            <span className="font-bold text-lg tracking-tight">Colitrack</span>
            <span className="hidden sm:inline text-xs font-medium text-slate-500 ml-1">
              Stopdesk DZ
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#companies" className="hover:text-slate-900 transition">
              Sociétés
            </a>
            <a href="#features" className="hover:text-slate-900 transition">
              Fonctionnalités
            </a>
            <a href="#how" className="hover:text-slate-900 transition">
              Comment ça marche
            </a>
          </nav>

          <Button
            asChild
            className="text-white shadow-sm"
            style={{ backgroundColor: COLITRACK.primary }}
          >
            <a href="#companies">
              Commencer
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(ellipse at top, ${COLITRACK.soft} 0%, #ffffff 60%)`,
          }}
        />
        <div className="container mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
              style={{
                backgroundColor: COLITRACK.soft,
                color: COLITRACK.primaryDark,
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Annuaire complet des Stopdesks en Algérie
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance leading-tight">
              Trouvez tous les{" "}
              <span style={{ color: COLITRACK.primary }}>Stopdesks</span> de
              livraison en{" "}
              <span className="relative inline-block">
                Algérie
                <span
                  className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
                  style={{ backgroundColor: COLITRACK.accent }}
                />
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 text-pretty max-w-2xl mx-auto leading-relaxed">
              Sélectionnez votre société de livraison, parcourez les points de
              retrait par wilaya et accédez instantanément à l&apos;adresse, au
              numéro et à la carte.
            </p>

            {/* Company selector */}
            <Card
              id="companies"
              className="mt-10 text-left shadow-xl border-slate-100"
            >
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5" style={{ color: COLITRACK.primary }} />
                  <h2 className="font-semibold text-slate-900">
                    Choisissez votre société de livraison
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {COMPANIES.map((c) => {
                    const active = c.id === selected;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelected(c.id)}
                        className={`group relative rounded-xl border-2 p-4 transition-all bg-white hover:-translate-y-0.5 ${
                          active
                            ? "shadow-md"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        style={
                          active
                            ? {
                                borderColor: COLITRACK.primary,
                                boxShadow: `0 4px 16px -4px ${COLITRACK.primary}40`,
                              }
                            : undefined
                        }
                        aria-pressed={active}
                      >
                        <div className="aspect-[3/2] relative flex items-center justify-center mb-2">
                          <Image
                            src={c.logo || "/placeholder.svg"}
                            alt={`${c.name} logo`}
                            fill
                            className="object-contain p-1"
                            sizes="(max-width: 768px) 40vw, 160px"
                          />
                        </div>
                        <p className="text-xs font-semibold text-center text-slate-700">
                          {c.name}
                        </p>
                        {active && (
                          <span
                            className="absolute -top-2 -right-2 rounded-full p-1"
                            style={{ backgroundColor: COLITRACK.primary }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Société sélectionnée :{" "}
                    <span
                      className="font-semibold"
                      style={{ color: selectedCompany.primary }}
                    >
                      {selectedCompany.name}
                    </span>
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="text-white"
                    style={{ backgroundColor: COLITRACK.primary }}
                  >
                    <Link href={`/companies/${selectedCompany.id}`}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Voir les Stopdesks
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { v: "58", l: "Wilayas couvertes" },
                { v: "2000+", l: "Points de retrait" },
                { v: `${COMPANIES.length}`, l: "Sociétés partenaires" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-xl bg-white border border-slate-100 p-4 shadow-sm"
                >
                  <p
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: COLITRACK.primary }}
                  >
                    {s.v}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50/60 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: COLITRACK.primary }}
            >
              Pourquoi Colitrack
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              La référence des Stopdesks en Algérie
            </h2>
            <p className="mt-4 text-slate-600 text-pretty">
              Une plateforme unique pour localiser, contacter et gérer tous vos
              points de retrait, peu importe la société de livraison.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: "Recherche intelligente",
                desc: "Trouvez n'importe quel stopdesk par wilaya, commune ou nom en quelques secondes.",
              },
              {
                icon: Building2,
                title: "Toutes les sociétés",
                desc: "DHD, HHD Express, MM Express, Noest, MD07 et bien plus dans une seule interface.",
              },
              {
                icon: Globe,
                title: "Couverture nationale",
                desc: "Les 58 wilayas d'Algérie couvertes avec adresses, horaires et cartes Google Maps.",
              },
            ].map((f) => (
              <Card
                key={f.title}
                className="border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: COLITRACK.soft,
                      color: COLITRACK.primary,
                    }}
                  >
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Trouvez votre point de retrait en 3 étapes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Choisissez la société",
                desc: "Sélectionnez la société de livraison de votre colis.",
              },
              {
                step: "02",
                title: "Filtrez par wilaya",
                desc: "Affinez la recherche selon votre wilaya ou commune.",
              },
              {
                step: "03",
                title: "Récupérez votre colis",
                desc: "Accédez à l'adresse, aux horaires et au numéro du stopdesk.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative rounded-2xl border border-slate-100 p-6 bg-white"
              >
                <div
                  className="absolute -top-4 left-6 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-md"
                  style={{ backgroundColor: COLITRACK.primary }}
                >
                  {s.step}
                </div>
                <h3 className="font-semibold text-lg mt-4 mb-2">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div
            className="rounded-3xl px-8 py-14 md:px-14 md:py-20 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${COLITRACK.primaryDark} 0%, ${COLITRACK.primary} 100%)`,
            }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div
                className="absolute -top-20 -right-20 w-72 h-72 rounded-full"
                style={{ backgroundColor: COLITRACK.accent }}
              />
              <div
                className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full"
                style={{ backgroundColor: "#ffffff" }}
              />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight text-balance">
                Prêt à trouver votre stopdesk ?
              </h2>
              <p className="mt-4 text-white/80 text-lg max-w-xl mx-auto text-pretty">
                Rejoignez des milliers d&apos;Algériens qui utilisent Colitrack
                chaque jour pour récupérer leurs colis.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 bg-white hover:bg-white/90 shadow-lg"
                style={{ color: COLITRACK.primaryDark }}
              >
                <a href="#companies">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: COLITRACK.primary }}
            >
              C
            </div>
            <span className="font-semibold text-slate-900">Colitrack</span>
            <span className="text-xs text-slate-500">© 2026</span>
          </div>
          <p className="text-sm text-slate-500">
            Annuaire des Stopdesks en Algérie — Powered by Colitrack
          </p>
        </div>
      </footer>
    </div>
  );
}
