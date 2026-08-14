import { NextResponse } from "next/server";
import { getRecoveryStatus } from "@/lib/credentials";

export async function GET() {
  const status = await getRecoveryStatus();
  return NextResponse.json(status);
}
