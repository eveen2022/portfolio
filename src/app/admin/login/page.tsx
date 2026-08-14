"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/admin/form";
import { useToast } from "@/components/admin/toast/ToastProvider";
import { PasswordInput } from "@/components/admin/PasswordInput";

// The "from" query param comes back verbatim from whatever URL the visitor
// arrived with — proxy.ts only ever sets it to a same-site pathname, but
// nothing stops someone crafting /admin/login?from=https://evil.example to
// redirect a signed-in admin off-site. Only accept a plain relative path.
function safeRedirect(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/admin";
  return path;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function finishLogin() {
    toast({ type: "success", title: "Welcome back!" });
    const destination = safeRedirect(searchParams.get("from"));
    router.push(destination);
    router.refresh();
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? "Login failed");
      }

      if (data?.requiresTotp) {
        setNeedsTotp(true);
        setSubmitting(false);
        return;
      }

      finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setSubmitting(false);
    }
  }

  async function handleTotpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Invalid code");
      }

      finishLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
      setSubmitting(false);
    }
  }

  function backToPassword() {
    setNeedsTotp(false);
    setCode("");
    setError("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Link
        href="/"
        className="glass glass-sheen fixed top-4 left-4 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-transform hover:scale-105 sm:top-6 sm:left-6"
      >
        <ArrowLeft className="size-4" /> Back to site
      </Link>

      <form
        onSubmit={needsTotp ? handleTotpSubmit : handlePasswordSubmit}
        className="glass glass-sheen relative w-full max-w-sm rounded-3xl p-8"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-white">
            {needsTotp ? <ShieldCheck className="size-5" /> : <Lock className="size-5" />}
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            {needsTotp ? "Two-factor verification" : "Admin Login"}
          </h1>
          <p className="text-sm text-muted">
            {needsTotp
              ? "Enter the 6-digit code from your authenticator app."
              : "Sign in to manage your site."}
          </p>
        </div>

        {needsTotp ? (
          <>
            <label
              htmlFor="code"
              className="mb-1.5 block text-sm font-medium text-foreground-secondary"
            >
              Authentication code
            </label>
            <Input
              id="code"
              required
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mb-4 text-center font-mono text-lg tracking-[0.3em]"
            />
          </>
        ) : (
          <>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-foreground-secondary"
            >
              Password
            </label>
            <PasswordInput
              id="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4"
            />
            <Link
              href="/admin/forgot-password"
              className="mb-4 block text-right text-sm text-muted hover:text-accent"
            >
              Forgot password?
            </Link>
          </>
        )}

        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <Button
          type="submit"
          disabled={submitting || (needsTotp && code.length !== 6)}
          className="w-full"
        >
          {submitting ? "Please wait..." : needsTotp ? "Verify" : "Sign in"}
        </Button>

        {needsTotp && (
          <button
            type="button"
            onClick={backToPassword}
            className="mt-3 w-full text-center text-sm text-muted hover:text-accent"
          >
            Back to password
          </button>
        )}
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
