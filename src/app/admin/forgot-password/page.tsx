"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/admin/form";
import { useToast } from "@/components/admin/toast/ToastProvider";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<"identify" | "reset">("identify");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleIdentifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/recovery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? "Phone number or PIN is incorrect");
      }
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Phone number or PIN is incorrect");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/recovery/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to reset password");
      }
      toast({ type: "success", title: "Password reset — you're signed in" });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Link
        href="/admin/login"
        className="glass glass-sheen fixed top-4 left-4 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-transform hover:scale-105 sm:top-6 sm:left-6"
      >
        <ArrowLeft className="size-4" /> Back to login
      </Link>

      <form
        onSubmit={step === "identify" ? handleIdentifySubmit : handleResetSubmit}
        className="glass glass-sheen relative w-full max-w-sm rounded-3xl p-8"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-white">
            {step === "identify" ? (
              <Phone className="size-5" />
            ) : (
              <KeyRound className="size-5" />
            )}
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            {step === "identify" ? "Recover access" : "Set a new password"}
          </h1>
          <p className="text-sm text-muted">
            {step === "identify"
              ? "Enter the phone number and PIN you set up for recovery."
              : "This also signs you in and turns off two-factor authentication."}
          </p>
        </div>

        {step === "identify" ? (
          <>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-foreground-secondary"
            >
              Phone number
            </label>
            <Input
              id="phone"
              type="tel"
              required
              autoFocus
              placeholder="+94 71 234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mb-4"
            />
            <label
              htmlFor="pin"
              className="mb-1.5 block text-sm font-medium text-foreground-secondary"
            >
              4-digit PIN
            </label>
            <Input
              id="pin"
              required
              inputMode="numeric"
              autoComplete="off"
              pattern="\d{4}"
              maxLength={4}
              placeholder="1234"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="mb-4 text-center font-mono text-lg tracking-[0.4em]"
            />
          </>
        ) : (
          <>
            <label
              htmlFor="newPassword"
              className="mb-1.5 block text-sm font-medium text-foreground-secondary"
            >
              New password
            </label>
            <Input
              id="newPassword"
              type="password"
              required
              autoFocus
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-4"
            />
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-foreground-secondary"
            >
              Confirm new password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mb-4"
            />
          </>
        )}

        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <Button
          type="submit"
          disabled={submitting || (step === "identify" && pin.length !== 4)}
          className="w-full"
        >
          {submitting
            ? "Please wait..."
            : step === "identify"
              ? "Continue"
              : "Reset password"}
        </Button>
      </form>
    </div>
  );
}
