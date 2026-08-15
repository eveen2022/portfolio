import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/data";

// Kept as a Route Handler (not called directly from proxy.ts) so mongodb
// stays out of the proxy bundle — proxy.ts runs in an environment that
// can't load Node.js-only DB drivers, so it fetches this endpoint instead.
export async function GET() {
  const siteConfig = await getSiteConfig();
  return NextResponse.json(
    {
      maintenanceMode: siteConfig.maintenanceMode,
      notFoundMode: siteConfig.notFoundMode,
      sections: siteConfig.sections,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
