"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { ShieldCheck, ShieldOff, Copy, Check } from "lucide-react";
import { Card, Label, Input, FormRow } from "@/components/admin/form";
import { PasswordInput } from "@/components/admin/PasswordInput";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/admin/toast/ToastProvider";
import { cn } from "@/lib/cn";

type Step = "closed" | "password" | "scan" | "disable";

function CodeInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      id={id}
      required
      autoFocus
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="\d{6}"
      maxLength={6}
      placeholder="123456"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      className="text-center font-mono text-lg tracking-[0.3em]"
    />
  );
}

export function TwoFactorAuth() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>("closed");
  const [password, setPassword] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/2fa")
      .then((res) => res.json())
      .then((data: { enabled: boolean }) => setEnabled(Boolean(data.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  function resetWizard() {
    setStep("closed");
    setPassword("");
    setQrDataUrl("");
    setSecret("");
    setCode("");
    setError("");
    setCopied(false);
  }

  async function handleStartSetup(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to start setup");
      setQrDataUrl(data.qrDataUrl);
      setSecret(data.secret);
      setCode("");
      setStep("scan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start setup");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmSetup(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Invalid code");
      toast({ type: "success", title: "Two-factor authentication enabled" });
      setEnabled(true);
      resetWizard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Invalid code");
      toast({ type: "delete", title: "Two-factor authentication disabled" });
      setEnabled(false);
      resetWizard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  }

  function copySecret() {
    navigator.clipboard
      .writeText(secret)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  }

  return (
    <>
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              enabled
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-secondary text-muted",
            )}
          >
            {enabled ? <ShieldCheck className="size-5" /> : <ShieldOff className="size-5" />}
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Two-factor authentication
            </p>
            <p className="text-xs text-muted">
              {enabled === null
                ? "Checking status..."
                : enabled
                  ? "Enabled — an authenticator app code is required at login."
                  : "Adds a 6-digit code from an app like Google Authenticator to your login."}
            </p>
          </div>
        </div>
        {enabled !== null && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStep(enabled ? "disable" : "password")}
          >
            {enabled ? "Disable" : "Enable"}
          </Button>
        )}
      </Card>

      {(step === "password" || step === "scan") && (
        <Modal title="Enable two-factor authentication" onClose={resetWizard}>
          {step === "password" ? (
            <form onSubmit={handleStartSetup} className="flex flex-col gap-4">
              <p className="text-sm text-foreground-secondary">
                Confirm your current password to continue.
              </p>
              <FormRow>
                <Label htmlFor="totp-password">Current password</Label>
                <PasswordInput
                  id="totp-password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormRow>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={busy}>
                  {busy ? "Checking..." : "Continue"}
                </Button>
                <Button type="button" variant="ghost" onClick={resetWizard} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConfirmSetup} className="flex flex-col gap-4">
              <p className="text-sm text-foreground-secondary">
                Scan this QR code with Google Authenticator (or any TOTP app),
                then enter the 6-digit code it shows.
              </p>
              <div className="flex justify-center rounded-2xl bg-white p-4">
                {qrDataUrl && (
                  <Image
                    src={qrDataUrl}
                    alt="Two-factor authentication setup QR code"
                    width={200}
                    height={200}
                    unoptimized
                  />
                )}
              </div>
              <div>
                <Label>Can&apos;t scan? Enter this key manually</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg border border-border bg-secondary px-3 py-2 text-xs">
                    {secret}
                  </code>
                  <button
                    type="button"
                    onClick={copySecret}
                    aria-label="Copy secret key"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground-secondary hover:bg-foreground/5"
                  >
                    {copied ? (
                      <Check className="size-4 text-emerald-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
              </div>
              <FormRow>
                <Label htmlFor="totp-confirm-code">6-digit code</Label>
                <CodeInput id="totp-confirm-code" value={code} onChange={setCode} />
              </FormRow>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={busy || code.length !== 6}>
                  {busy ? "Verifying..." : "Enable"}
                </Button>
                <Button type="button" variant="ghost" onClick={resetWizard} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {step === "disable" && (
        <Modal title="Disable two-factor authentication" onClose={resetWizard}>
          <form onSubmit={handleDisable} className="flex flex-col gap-4">
            <p className="text-sm text-foreground-secondary">
              Enter your current 6-digit code to confirm.
            </p>
            <FormRow>
              <Label htmlFor="totp-disable-code">6-digit code</Label>
              <CodeInput id="totp-disable-code" value={code} onChange={setCode} />
            </FormRow>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={busy || code.length !== 6}
                className="bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/20 hover:shadow-[0_12px_40px_-8px_rgba(220,38,38,0.45)]"
              >
                {busy ? "Disabling..." : "Disable"}
              </Button>
              <Button type="button" variant="ghost" onClick={resetWizard} disabled={busy}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
