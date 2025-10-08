import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto } from "next/font/google"
import "./globals.css"

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

export const metadata: Metadata = {
  title: "EcoTrack - Courrier et Colis Express",
  description: "Service de livraison express rapide et fiable. Courrier et colis express dans toute la région.",
  keywords: "livraison, express, courrier, colis, transport, EcoTrack",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${roboto.variable} antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
