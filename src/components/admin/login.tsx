"use client";

import { useState } from "react";
import { Eye, EyeSlash, LockKey, SignIn } from "@phosphor-icons/react";
import { api } from "@convex/_generated/api";
import { Logo } from "@/components/brand/logo";
import { convex } from "@/lib/convex";
import { useAdminSession } from "@/lib/admin/session";

/** One password field: the site manager's shared password opens the dashboard. */
export function Login() {
  const setToken = useAdminSession((s) => s.setToken);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || busy) return;
    if (!convex) {
      setError("The site isn't connected to its backend. Check NEXT_PUBLIC_CONVEX_URL.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await convex.mutation(api.auth.login, { password });
      if (res.ok) {
        setToken(res.token);
        return;
      }
      if (res.reason === "wrong") setError("That password isn't right. Try again.");
      else if (res.reason === "locked") {
        const minutes = Math.max(1, Math.ceil((res.retryAfter ?? 60_000) / 60_000));
        setError(`Too many wrong tries. Wait ${minutes} minute${minutes === 1 ? "" : "s"}, then try again.`);
      } else setError("No password is set for the site manager yet. Set ADMIN_PASSWORD in Convex.");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-svh place-items-center bg-deep px-5 py-10 text-gypsum">
      <form onSubmit={submit} className="w-full max-w-sm" noValidate>
        <Logo tone="light" className="h-10 w-auto" />
        <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-mist">Site manager</p>
        <h1 className="mt-8 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-mist">Enter the site manager password to edit projects, texts and messages.</p>

        <label htmlFor="admin-password" className="mt-8 block text-xs font-medium uppercase tracking-[0.08em] text-mist">
          Password
        </label>
        <div className="mt-2 flex items-center border border-white/15 bg-deep-2 focus-within:border-ochre focus-within:ring-1 focus-within:ring-ochre">
          <LockKey size={18} className="ms-3 shrink-0 text-mist" aria-hidden="true" />
          <input
            id="admin-password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
            className="h-12 min-w-0 flex-1 bg-transparent px-3 text-base !outline-none"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="grid h-12 w-12 shrink-0 place-items-center text-mist hover:text-gypsum"
          >
            {show ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && (
          <p id="login-error" role="alert" className="mt-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !password.trim()}
          className="chamfer gold-fill mt-6 inline-flex h-12 w-full items-center justify-center gap-2 text-sm font-semibold text-ink [--chamfer:10px] disabled:opacity-50"
        >
          <SignIn size={18} /> {busy ? "Signing in…" : "Sign in"}
        </button>
        <a href="/en" className="mt-6 inline-block py-2 text-sm text-mist hover:text-gypsum">
          ← Back to the website
        </a>
      </form>
    </div>
  );
}
