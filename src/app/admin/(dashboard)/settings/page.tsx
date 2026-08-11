import { getSiteConfig } from "@/lib/data";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { ResumeUpload } from "@/components/admin/settings/ResumeUpload";
import { FaviconUpload } from "@/components/admin/settings/FaviconUpload";
import { ChangePasswordForm } from "@/components/admin/settings/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const config = await getSiteConfig();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-foreground">
        Settings
      </h1>
      <div className="flex max-w-2xl flex-col gap-8">
        <SettingsForm initial={config} />
        <ResumeUpload />
        <FaviconUpload />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
