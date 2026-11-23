import type { Metadata } from "next";
import StopdeskPage from "./stopdesk";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase"; // modular firestore (server)
import { findDemoStop } from "@/lib/demoStops";
import { getStopdeskBrand } from "@/components/brand-stopdesk/brands";

type SearchParams = Record<string, string | string[] | undefined>;

async function getStopdesk(urlcode: string) {
  const demo = findDemoStop(urlcode);
  if (demo && getStopdeskBrand(demo.company)) return demo;

  try {
    const dref = doc(db, "EcoStop", urlcode);
    const dsnap = await getDoc(dref);
    if (dsnap.exists()) return dsnap.data();

    const q1 = query(collection(db, "EcoStop"), where("desk_url_code", "==", urlcode), limit(1));
    const q2 = query(collection(db, "EcoStop"), where("desk_url_code", "==", urlcode.toUpperCase()), limit(1));

    const [r1, r2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const m = r1.docs[0] || r2.docs[0];

    return m ? m.data() : demo ?? null;
  } catch {
    return demo ?? null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { urlcode: string };
}): Promise<Metadata> {
  const urlcode = decodeURIComponent(params.urlcode || "").trim();
  const stop = await getStopdesk(urlcode);

  const company = getStopdeskBrand(stop?.company)?.name ?? (stop?.company || "StopDesk");
  const name = stop?.name || "Point de retrait";

  return {
    title: `${company} - StopDesk`,
    description: `${name} (Code: ${urlcode})`,
  };
}

export default function Page({
  params,
  searchParams,
}: {
  params: { urlcode: string };
  searchParams?: SearchParams;
}) {
  return <StopdeskPage params={params} searchParams={searchParams} />;
}
