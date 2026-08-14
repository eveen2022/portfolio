import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { siteMeta } from "@/lib/site";

// Public, unauthenticated by design — it only ever encodes the site's own
// public URL, so there's nothing here worth gating behind /api/admin.
export async function GET() {
  const svg = await QRCode.toString(siteMeta.siteUrl, {
    type: "svg",
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      // The encoded URL is fixed per deployment (siteMeta.siteUrl comes from
      // an env var, not user input), so the output never changes at runtime.
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
