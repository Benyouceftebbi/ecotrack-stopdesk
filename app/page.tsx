"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Clock, Package, Navigation } from "lucide-react"
import Image from "next/image"

export default function PickupLocationPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const openGoogleMaps = () => {
    window.open("https://maps.google.com/?q=123+Rue+de+la+Livraison,+75001+Paris,+France", "_blank")
  }

  const callStopdesk = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div
            className={`flex items-center justify-center transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"}`}
          >
            <Image
              src="/images/ecotrack-logo.png"
              alt="EcoTrack Logo"
              width={200}
              height={60}
              className="h-10 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="container mx-auto max-w-md">
          <div
            className={`text-center mb-6 transition-all duration-1000 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
              <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h1 className="text-xl font-bold text-green-800 mb-1">Votre Colis est Prêt!</h1>
              <p className="text-green-700 text-sm">Récupérez-le à notre stopdesk</p>
            </div>
          </div>

          <Card
            className={`mb-6 shadow-xl transition-all duration-1000 delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="bg-red-600 p-3 rounded-full inline-block mb-3">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">Point de Retrait</h2>
                <p className="text-gray-600 text-sm mb-4">EcoTrack Stopdesk</p>

                <div className="text-center mb-4">
                  <p className="font-semibold text-blue-900 text-lg">123 Rue de la Livraison</p>
                  <p className="text-gray-600">75001 Paris, France</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid gap-3 mb-4">
                <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg">
                  <div className="bg-blue-900 p-2 rounded-full">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 text-sm mb-1">Contactez le Stopdesk</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => callStopdesk("+33123456789")}
                        className="block text-red-600 hover:text-red-700 font-medium transition-colors text-sm"
                      >
                        +33 1 23 45 67 89
                      </button>
                      <button
                        onClick={() => callStopdesk("+33987654321")}
                        className="block text-red-600 hover:text-red-700 font-medium transition-colors text-sm"
                      >
                        +33 9 87 65 43 21
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg">
                  <div className="bg-blue-900 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm mb-1">Horaires d'Ouverture</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Lun - Ven: 8h00 - 18h00</p>
                      <p>Samedi: 9h00 - 16h00</p>
                      <p className="text-red-600 font-medium">Dimanche: Fermé</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`mb-6 shadow-xl transition-all duration-1000 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <CardContent className="p-0">
              <div className="relative">
                <div className="w-full h-64 bg-gray-200 rounded-t-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.3292133156743896!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sLouvre%20Museum!5e0!3m2!1sen!2sfr!4v1642678901234!5m2!1sen!2sfr"
                    width="100%"
                    height="256"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-t-lg"
                  ></iframe>
                </div>
                <div className="p-4">
                  <Button
                    onClick={openGoogleMaps}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg"
                    size="lg"
                  >
                    <Navigation className="mr-2 h-5 w-5" />
                    Ouvrir dans Google Maps
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-blue-50 border-blue-200 transition-all duration-1000 delay-900 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions de Retrait</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Présentez une pièce d'identité</li>
                <li>• Montrez ce SMS ou votre numéro de suivi</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-blue-900 text-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-2">
            <Image
              src="/images/ecotrack-logo.png"
              alt="EcoTrack Logo"
              width={120}
              height={36}
              className="h-6 w-auto filter brightness-0 invert"
            />
          </div>
        </div>
      </footer>
    </div>
  )
}
