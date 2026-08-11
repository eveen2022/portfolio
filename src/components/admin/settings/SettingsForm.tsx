"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { WORK_ARRANGEMENTS, type SiteConfig, type WorkArrangement } from "@/lib/types";
import { Label, Input, Textarea, Checkbox, Card, FormRow } from "@/components/admin/form";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/admin/toast/ToastProvider";

export function SettingsForm({ initial }: { initial: SiteConfig }) {
  const router = useRouter();
  const { toast } = useToast();
  const [config, setConfig] = useState<SiteConfig>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function updateSocial(key: keyof SiteConfig["social"], value: string) {
    setConfig((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
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

      <Card className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">
          Social links
        </h2>
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
      </Card>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
