"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Clock, Package, PhoneCall } from "lucide-react"
import Image from "next/image"
import { doc, increment, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function PickupLocationPage() {
  const [isVisible, setIsVisible] = useState(false)
  let hasTrackedThisLoad = false;
  useEffect(() => {
    setIsVisible(true);
  
    const trackVisit = async () => {
      try {
        // ✅ ضمان التنفيذ مرة واحدة فقط لكل تحميل صفحة
        if (hasTrackedThisLoad) return;
        hasTrackedThisLoad = true;
  
        const ref = doc(db, "stopdeskStats", "DHD");
        await setDoc(ref, { totalViews: increment(1) }, { merge: true });
      } catch (err) {
        console.error("Error tracking visit:", err);
      }
    };
  
    trackVisit();
  }, []);
  const callStopdesk = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div
            className={`flex items-center justify-center transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"}`}
          >
            <Image
              src="/images/DHD.png"
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
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-4">
              <Package className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h1 className="text-xl font-bold text-orange-800 mb-1">طردك جاهز للاستلام!</h1>
              <p className="text-orange-700 text-sm">تفضل إلى مكتب الاستلام</p>
            </div>
          </div>

          {/* بطاقة المكتب */}
          <Card
            className={`mb-6 shadow-xl transition-all duration-1000 delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-orange-900 mb-2">نقطة الاستلام</h2>
                <p className="text-gray-700 text-sm mb-2">مكتب التوصيل DHD</p>
              </div>

              {/* زر اتصال واضح لكبار السن */}
              <div className="mb-4">
                <Button
                  onClick={() => callStopdesk("0699744117")}
                  size="lg"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 text-lg rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  aria-label="اتصل الآن بمكتب DHD للحصول على العنوان والخريطة"
                >
                  <span className="inline-flex items-center gap-3">
                    <PhoneCall className="h-6 w-6" aria-hidden="true" />
                    <span className="font-extrabold">اتصل الآن للحصول على العنوان</span>
                  </span>
                </Button>
                <p className="mt-2 text-center text-sm text-gray-700">
                  بالاتصال ستحصل على العنوان والوصف للوصول بسهولة.
                </p>
              </div>

              {/* معلومات الاتصال */}
              <div className="grid gap-3 mb-4">
                <div className="flex items-center gap-3 bg-orange-50 p-3 rounded-lg">
                  <div className="bg-orange-900 p-2 rounded-full shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 text-sm mb-1">أرقام مكتب DHD</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => callStopdesk("0699744117")}
                        className=" justify-center gap-2 text-orange-800 hover:text-orange-900 font-semibold text-base underline underline-offset-4"
                        aria-label="اتصال بالرقم 0699744117"
                      >
                  
                        <span dir="rtl">0699744117</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-orange-50 p-3 rounded-lg">
                  <div className="bg-orange-900 p-2 rounded-full shrink-0">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900 text-sm mb-1">ساعات العمل</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>كل الأيام: 09:00 – 17:30</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* تعليمات الاستلام */}
          <Card
            className={`bg-orange-50 border border-orange-200 transition-all duration-1000 delay-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <CardContent className="p-4">
              <h3 className="font-semibold text-orange-900 mb-2">تعليمات الاستلام</h3>
              <ul className="text-sm text-orange-800 space-y-2 list-disc pr-5">
                <li className="leading-7">إظهار بطاقة هوية سارية</li>
                <li className="leading-7">أرِ الموظف هذا الـSMS أو رقم الهاتف</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-orange-900 text-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-2">
            <Image
              src="/images/DHD.png"
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
