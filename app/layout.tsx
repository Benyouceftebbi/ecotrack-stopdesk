import type React from "react"
import type { Metadata } from "next"

import { Inter, Roboto } from "next/font/google"
import "./globals.css"

export const metadata: Metadata = {
  title: "Colitrack — Tous les Stopdesks de livraison en Algérie",
  description:
    "Annuaire complet des points de retrait (stopdesks) de toutes les sociétés de livraison en Algérie. Trouvez l'adresse, le numéro et la carte de votre stopdesk.",
  generator: "v0.app",
}

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
})



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${roboto.variable} antialiased bg-white`}
      suppressHydrationWarning
    >
      <body className="font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
