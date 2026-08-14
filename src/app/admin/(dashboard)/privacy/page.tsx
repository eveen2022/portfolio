import { getPrivacyPolicyContent } from "@/lib/data";
import { PrivacyEditorClient } from "@/components/admin/privacy/PrivacyEditorClient";

export const dynamic = "force-dynamic";

export default async function AdminPrivacyPage() {
  const content = await getPrivacyPolicyContent();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Privacy policy</h1>
      <p className="mb-8 text-sm text-muted">
        Edit the text shown on the public{" "}
        <a href="/privacy" target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">
          /privacy
        </a>{" "}
        page. Markdown supported.
      </p>

      <PrivacyEditorClient initialContent={content} />
    </div>
  );
}
