"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { Card, Label, Input, FormRow } from "@/components/admin/form";
import { PasswordInput } from "@/components/admin/PasswordInput";
import { Modal } from "@/components/admin/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/admin/toast/ToastProvider";
import { cn } from "@/lib/cn";

type Step = "closed" | "setup" | "remove";

function PinInput({
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
      inputMode="numeric"
      autoComplete="off"
      pattern="\d{4}"
      maxLength={4}
      placeholder="1234"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
      className="text-center font-mono text-lg tracking-[0.4em]"
    />
  );
}

export function RecoveryPin() {
  const { toast } = useToast();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [phoneOnFile, setPhoneOnFile] = useState("");
  const [step, setStep] = useState<Step>("closed");
  const [currentPassword, setCurrentPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/recovery")
      .then((res) => res.json())
      .then((data: { configured: boolean; phone?: string }) => {
        setConfigured(Boolean(data.configured));
        setPhoneOnFile(data.phone ?? "");
      })
      .catch(() => setConfigured(false));
  }, []);

  function resetWizard() {
    setStep("closed");
    setCurrentPassword("");
    setPhone("");
    setPin("");
    setConfirmPin("");
    setError("");
  }

  async function handleSetup(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (pin !== confirmPin) {
      setError("PIN and confirmation do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/recovery/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, phone, pin }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to set up recovery");
      toast({ type: "success", title: "Password recovery set up" });
      setConfigured(true);
      setPhoneOnFile(phone);
      resetWizard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set up recovery");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/recovery/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Failed to remove recovery");
      toast({ type: "delete", title: "Password recovery removed" });
      setConfigured(false);
      setPhoneOnFile("");
      resetWizard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove recovery");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              configured
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-secondary text-muted",
            )}
          >
            {configured ? <Phone className="size-5" /> : <PhoneOff className="size-5" />}
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Password recovery</p>
            <p className="text-xs text-muted">
              {configured === null
                ? "Checking status..."
                : configured
                  ? `Set up with ${phoneOnFile} — used on "Forgot password" to reset it.`
                  : "Set a phone number and 4-digit PIN so you can reset your password without the old one."}
            </p>
          </div>
        </div>
        {configured !== null && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep("setup")}
            >
              {configured ? "Update" : "Set up"}
            </Button>
            {configured && (
              <Button type="button" variant="ghost" onClick={() => setStep("remove")}>
                Remove
              </Button>
            )}
          </div>
        )}
      </Card>

      {step === "setup" && (
        <Modal
          title={configured ? "Update password recovery" : "Set up password recovery"}
          onClose={resetWizard}
        >
          <form onSubmit={handleSetup} className="flex flex-col gap-4">
            <p className="text-sm text-foreground-secondary">
              Confirm your current password, then choose a phone number and 4-digit PIN. If
              you forget your password, entering this same phone number and PIN lets you set
              a new one — no code is texted anywhere, this is just what you re-enter later.
            </p>
            <FormRow>
              <Label htmlFor="recovery-current-password">Current password</Label>
              <PasswordInput
                id="recovery-current-password"
                required
                autoFocus
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </FormRow>
            <FormRow>
              <Label htmlFor="recovery-phone">Phone number</Label>
              <Input
                id="recovery-phone"
                type="tel"
                required
                placeholder="+94 71 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </FormRow>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow>
                <Label htmlFor="recovery-pin">4-digit PIN</Label>
                <PinInput id="recovery-pin" value={pin} onChange={setPin} />
              </FormRow>
              <FormRow>
                <Label htmlFor="recovery-pin-confirm">Confirm PIN</Label>
                <PinInput id="recovery-pin-confirm" value={confirmPin} onChange={setConfirmPin} />
              </FormRow>
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={busy || pin.length !== 4 || confirmPin.length !== 4}
              >
                {busy ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="ghost" onClick={resetWizard} disabled={busy}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {step === "remove" && (
        <Modal title="Remove password recovery" onClose={resetWizard}>
          <form onSubmit={handleRemove} className="flex flex-col gap-4">
            <p className="text-sm text-foreground-secondary">
              Confirm your current password to remove the phone + PIN recovery fallback.
            </p>
            <FormRow>
              <Label htmlFor="recovery-remove-password">Current password</Label>
              <PasswordInput
                id="recovery-remove-password"
                required
                autoFocus
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </FormRow>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={busy}
                className="bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/20 hover:shadow-[0_12px_40px_-8px_rgba(220,38,38,0.45)]"
              >
                {busy ? "Removing..." : "Remove"}
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
