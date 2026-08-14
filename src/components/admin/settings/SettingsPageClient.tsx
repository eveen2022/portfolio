"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Share2,
  Power,
  Layout,
  Search,
  Palette,
  Image as ImageIcon,
  Lock,
  Database,
} from "lucide-react";
import { WORK_ARRANGEMENTS, type SiteConfig, type WorkArrangement } from "@/lib/types";
import { Label, Input, Textarea, Checkbox, Card, FormRow } from "@/components/admin/form";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/admin/toast/ToastProvider";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ResumeUpload } from "@/components/admin/settings/ResumeUpload";
import { FaviconUpload } from "@/components/admin/settings/FaviconUpload";
import { PasswordCard } from "@/components/admin/settings/PasswordCard";
import { TwoFactorAuth } from "@/components/admin/settings/TwoFactorAuth";
import { RecoveryPin } from "@/components/admin/settings/RecoveryPin";
import { MediaLibraryTab } from "@/components/admin/settings/MediaLibraryTab";
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";

type TabKey =
  | "profile"
  | "social"
  | "status"
  | "pages"
  | "seo"
  | "branding"
  | "media"
  | "security"
  | "system";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "social", label: "Social links", icon: Share2 },
  { key: "status", label: "Site status", icon: Power },
  { key: "pages", label: "Pages", icon: Layout },
  { key: "seo", label: "SEO", icon: Search },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "media", label: "Media", icon: ImageIcon },
  { key: "security", label: "Security", icon: Lock },
  { key: "system", label: "System", icon: Database },
];

// profile/social/status/pages/seo share one config object and one Save
// button — they're really one form split across tabs, so switching between
// them never loses an unsaved edit. branding/security/system are
// self-contained, self-saving components and don't need the form wrapper.
const FORM_TABS: TabKey[] = ["profile", "social", "status", "pages", "seo"];

const SECTION_TOGGLES: {
  key: keyof SiteConfig["sections"];
  label: string;
  description: string;
}[] = [
  { key: "about", label: "About", description: "The /about page and its nav link." },
  { key: "skills", label: "Skills", description: "Skills section within the About page." },
  {
    key: "projects",
    label: "Projects",
    description: "The /projects pages, nav link, and homepage preview.",
  },
  {
    key: "blog",
    label: "Blog",
    description: "The /blog pages, nav link, and homepage preview.",
  },
  {
    key: "experience",
    label: "Experience",
    description: "The /experience page and its nav link.",
  },
  {
    key: "education",
    label: "Education",
    description: "The /education page and its nav link.",
  },
  {
    key: "contact",
    label: "Contact",
    description: "The /contact page, nav link, and quick-contact links.",
  },
];

export function SettingsPageClient({
  initial,
  storageCard,
}: {
  initial: SiteConfig;
  // StorageCard is an async Server Component (queries Mongo directly) — it
  // has to be instantiated in a Server Component and passed down as an
  // already-rendered element, not imported and called from here. Importing
  // it into this "use client" module would pull the Mongo driver (and its
  // Node built-in deps like fs/dns) into the browser bundle.
  storageCard: ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [config, setConfig] = useState<SiteConfig>(initial);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function updateSocial(key: keyof SiteConfig["social"], value: string) {
    setConfig((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
  }

  function updateSection(key: keyof SiteConfig["sections"], value: boolean) {
    setConfig((prev) => ({ ...prev, sections: { ...prev.sections, [key]: value } }));
  }

  function updateSeo<K extends keyof SiteConfig["seo"]>(key: K, value: SiteConfig["seo"][K]) {
    setConfig((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
  }

  function toggleWorkArrangement(option: WorkArrangement, checked: boolean) {
    setConfig((prev) => ({
      ...prev,
      workArrangement: checked
        ? [...prev.workArrangement, option]
        : prev.workArrangement.filter((item) => item !== option),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (config.workArrangement.length === 0) {
      setError("Select at least one work arrangement.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to save");
      }
      toast({ type: "success", title: "Settings saved" });
      router.refresh();
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save settings",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <SettingsTabs tabs={TABS} active={activeTab} onChange={(key) => setActiveTab(key as TabKey)} />

      {FORM_TABS.includes(activeTab) && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {activeTab === "profile" && (
            <Card className="flex flex-col gap-4">
              <ImageUpload
                label="Profile photo"
                category="site"
                nameHint={config.name || "profile"}
                value={config.photo}
                onChange={(path) => update("photo", path)}
                aspect={1}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    value={config.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </FormRow>
                <FormRow>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    required
                    value={config.role}
                    onChange={(e) => update("role", e.target.value)}
                  />
                </FormRow>
              </div>

              <FormRow>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  required
                  value={config.tagline}
                  onChange={(e) => update("tagline", e.target.value)}
                />
              </FormRow>

              <FormRow>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  required
                  rows={4}
                  value={config.bio}
                  onChange={(e) => update("bio", e.target.value)}
                />
              </FormRow>

              <FormRow>
                <Label htmlFor="description">SEO description</Label>
                <Textarea
                  id="description"
                  required
                  rows={2}
                  value={config.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </FormRow>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={config.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </FormRow>
                <FormRow>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+94 71 234 5678"
                    value={config.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </FormRow>
              </div>

              <FormRow>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Colombo, Sri Lanka"
                  value={config.location}
                  onChange={(e) => update("location", e.target.value)}
                />
              </FormRow>

              <FormRow>
                <Label>Work arrangement</Label>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {WORK_ARRANGEMENTS.map((option) => (
                    <Checkbox
                      key={option}
                      label={option}
                      checked={config.workArrangement.includes(option)}
                      onChange={(e) => toggleWorkArrangement(option, e.target.checked)}
                    />
                  ))}
                </div>
                {config.workArrangement.length === 0 && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Select at least one.
                  </p>
                )}
              </FormRow>
            </Card>
          )}

          {activeTab === "social" && (
            <Card className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-foreground">Social links</h2>
              <FormRow>
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  value={config.social.github}
                  onChange={(e) => updateSocial("github", e.target.value)}
                />
              </FormRow>
              <FormRow>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={config.social.linkedin}
                  onChange={(e) => updateSocial("linkedin", e.target.value)}
                />
              </FormRow>
              <FormRow>
                <Label htmlFor="twitter">Twitter/X URL</Label>
                <Input
                  id="twitter"
                  value={config.social.twitter}
                  onChange={(e) => updateSocial("twitter", e.target.value)}
                />
              </FormRow>
              <FormRow>
                <Label htmlFor="whatsapp">WhatsApp link</Label>
                <Input
                  id="whatsapp"
                  placeholder="https://wa.me/94712345678"
                  value={config.social.whatsapp}
                  onChange={(e) => updateSocial("whatsapp", e.target.value)}
                />
              </FormRow>
            </Card>
          )}

          {activeTab === "status" && (
            <>
              <Card className="flex flex-col gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Maintenance mode</h2>
                  <p className="mt-1 text-xs text-muted">
                    Shows visitors a maintenance page instead of the site. You stay
                    signed in as admin, so you can still browse the real site to make
                    changes while it&apos;s on.
                  </p>
                </div>
                <Checkbox
                  label="Site is in maintenance mode"
                  checked={config.maintenanceMode}
                  onChange={(e) => update("maintenanceMode", e.target.checked)}
                />
                {config.maintenanceMode && (
                  <FormRow>
                    <Label htmlFor="maintenanceMessage">
                      Message shown to visitors (optional)
                    </Label>
                    <Textarea
                      id="maintenanceMessage"
                      rows={2}
                      placeholder="We're making some updates. Please check back soon."
                      value={config.maintenanceMessage}
                      onChange={(e) => update("maintenanceMessage", e.target.value)}
                    />
                  </FormRow>
                )}
              </Card>

              <Card className="flex flex-col gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">404 mode</h2>
                  <p className="mt-1 text-xs text-muted">
                    Shows visitors the site&apos;s 404 page on every URL — handy for
                    checking how it looks and behaves for real. You stay signed in as
                    admin, so you keep seeing the real site. If maintenance mode is
                    also on, maintenance takes priority.
                  </p>
                </div>
                <Checkbox
                  label="Show the 404 page to visitors"
                  checked={config.notFoundMode}
                  onChange={(e) => update("notFoundMode", e.target.checked)}
                />
              </Card>
            </>
          )}

          {activeTab === "pages" && (
            <Card className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Page visibility</h2>
                <p className="mt-1 text-xs text-muted">
                  Turn a section off to remove it everywhere on the site — nav link,
                  homepage preview, and its own page all disappear for visitors. You
                  stay signed in as admin, so you keep seeing everything to manage it.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {SECTION_TOGGLES.map((toggle) => (
                  <label
                    key={toggle.key}
                    className="flex items-start gap-2.5 rounded-xl border border-border p-3"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 shrink-0 rounded border-border"
                      checked={config.sections[toggle.key]}
                      onChange={(e) => updateSection(toggle.key, e.target.checked)}
                    />
                    <span>
                      <span className="block text-sm font-medium text-foreground">
                        {toggle.label}
                      </span>
                      <span className="block text-xs text-muted">{toggle.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Card>
          )}

          {activeTab === "pages" && (
            <Card className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Portfolio sharing</h2>
                <p className="mt-1 text-xs text-muted">
                  A &quot;Share&quot; button in the footer that lets visitors share the
                  site (native share sheet or copy link) or scan a QR code straight to it.
                </p>
              </div>
              <Checkbox
                label="Show the share button"
                checked={config.shareEnabled}
                onChange={(e) => update("shareEnabled", e.target.checked)}
              />
            </Card>
          )}

          {activeTab === "seo" && (
            <Card className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Search &amp; social sharing</h2>
                <p className="mt-1 text-xs text-muted">
                  Controls how the site looks when shared or found in search. Individual
                  projects and posts can override the title/description on their own edit
                  screen — these are just the site-wide defaults.
                </p>
              </div>

              <ImageUpload
                label="Default share image"
                category="site"
                nameHint={config.name || "og-image"}
                value={config.seo.ogImage}
                onChange={(path) => updateSeo("ogImage", path)}
                aspect={1.91}
              />

              <FormRow>
                <Label htmlFor="twitterHandle">Twitter/X handle</Label>
                <Input
                  id="twitterHandle"
                  placeholder="@yourhandle"
                  value={config.seo.twitterHandle}
                  onChange={(e) => updateSeo("twitterHandle", e.target.value)}
                />
              </FormRow>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow>
                  <Label htmlFor="googleSiteVerification">Google Search Console code</Label>
                  <Input
                    id="googleSiteVerification"
                    placeholder="Verification meta tag content"
                    value={config.seo.googleSiteVerification}
                    onChange={(e) => updateSeo("googleSiteVerification", e.target.value)}
                  />
                </FormRow>
                <FormRow>
                  <Label htmlFor="bingSiteVerification">Bing Webmaster code</Label>
                  <Input
                    id="bingSiteVerification"
                    placeholder="Verification meta tag content"
                    value={config.seo.bingSiteVerification}
                    onChange={(e) => updateSeo("bingSiteVerification", e.target.value)}
                  />
                </FormRow>
              </div>

              <div className="rounded-xl border border-border p-4">
                <Checkbox
                  label="Hide the entire site from search engines"
                  checked={config.seo.noIndex}
                  onChange={(e) => updateSeo("noIndex", e.target.checked)}
                />
                <p className="mt-1.5 text-xs text-muted">
                  Adds a site-wide noindex directive and empties the sitemap. Useful
                  before launch or on a staging deployment — turn it off when you&apos;re
                  ready to be found.
                </p>
              </div>
            </Card>
          )}

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </form>
      )}

      {activeTab === "branding" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <ResumeUpload />
          <FaviconUpload />
        </div>
      )}

      {activeTab === "media" && <MediaLibraryTab />}

      {activeTab === "security" && (
        <div className="flex flex-col gap-4">
          <PasswordCard />
          <TwoFactorAuth />
          <RecoveryPin />
        </div>
      )}

      {activeTab === "system" && storageCard}
    </div>
  );
}
