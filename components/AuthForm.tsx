"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = { mode: "login" | "signup" };
export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
      router.replace(result.user?.role === "admin" ? "/admin/members" : "/community");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-back-link">← Back to Pagsibol Village</Link>
        <div className="auth-brand-mark" aria-hidden="true">🏡</div>
        <p className="auth-eyebrow">PAGSIBOL VILLAGE COMMUNITY</p>
        <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-description">{isSignup ? "Join your neighbors and stay connected with the community." : "Sign in to continue to your community account."}</p>
        <form className="auth-form" onSubmit={submit}>
          {isSignup && <label>Full name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required placeholder="Your full name" /></label>}
          <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required placeholder="you@example.com" /></label>
          <label>Password<input type="password" autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={isSignup ? 10 : 1} maxLength={128} required placeholder={isSignup ? "At least 10 characters" : "Enter your password"} /></label>
          {isSignup && <p className="auth-helper">New accounts start as Members. An Admin can update your role later.</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}</button>
        </form>
        <p className="auth-switch">{isSignup ? "Already have an account?" : "New to the community?"} <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Sign up"}</Link></p>
      </div>
    </section>
  );
}
