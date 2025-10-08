import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { shortUrl } = await req.json();

    if (!shortUrl) {
      return NextResponse.json({ error: "Missing shortUrl" }, { status: 400 });
    }

    // 1️⃣ Follow the redirect from the short URL
    const response = await fetch(shortUrl, { redirect: "follow" });
    const finalUrl = response.url;

    // 2️⃣ Try to extract coordinates from the final URL
    const match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

    if (!match) {
      return NextResponse.json({ error: "No coordinates found" }, { status: 404 });
    }

    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);

    return NextResponse.json({ lat, lng, finalUrl });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to resolve URL" }, { status: 500 });
  }
}
