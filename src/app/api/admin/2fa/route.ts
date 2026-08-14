import { NextResponse } from "next/server";
import { getTotpStatus } from "@/lib/credentials";

export async function GET() {
  const status = await getTotpStatus();
  return NextResponse.json(status);
}
