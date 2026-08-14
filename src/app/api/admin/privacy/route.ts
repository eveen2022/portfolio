import { NextResponse, type NextRequest } from "next/server";
import { getDefaultPrivacyPolicyContent, getPrivacyPolicyContent } from "@/lib/data";
import { writeContentFile } from "@/lib/fsWrite";
import { privacyContentSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

export async function GET(request: NextRequest) {
  const useDefault = request.nextUrl.searchParams.get("default") === "true";
  const content = useDefault
    ? await getDefaultPrivacyPolicyContent()
    : await getPrivacyPolicyContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = privacyContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await writeContentFile("privacy-policy.md", parsed.data.content);
  await logActivity("update", "privacy", "Updated privacy policy page");
  return NextResponse.json({ success: true });
}
