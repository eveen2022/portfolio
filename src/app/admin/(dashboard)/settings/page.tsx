import { getSiteConfig } from "@/lib/data";
import { SettingsPageClient } from "@/components/admin/settings/SettingsPageClient";
import { StorageCard } from "@/components/admin/StorageCard";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const config = await getSiteConfig();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Settings</h1>
      <p className="mb-8 text-sm text-muted">
        Manage your public profile, branding, and account security.
      </p>

      <SettingsPageClient initial={config} storageCard={<StorageCard />} />
    </div>
  );
}
