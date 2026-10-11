"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = { mode: "login" | "signup" };

const relationshipOptions = [
  { value: "owner", label: "Homeowner" },
  { value: "co_owner", label: "Co-owner" },
  { value: "spouse", label: "Spouse of Homeowner" },
  { value: "domestic_partner", label: "Domestic Partner of Homeowner" },
  { value: "family_member", label: "Immediate Family Member of Homeowner" },
  { value: "authorized_representative", label: "Authorized Household Representative" },
  { value: "tenant", label: "Tenant / Lessee" },
  { value: "other", label: "Other" },
];

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [blockNumber, setBlockNumber] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [ownerRelationship, setOwnerRelationship] = useState("");
  const [ownerRelationshipOther, setOwnerRelationshipOther] = useState("");
  const [colorScheme, setColorScheme] = useState<"Turquoise" | "Aubergine" | "Santan">("Turquoise");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match. Please check both password fields.");
      setBusy(false);
      return;
    }
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          ...(isSignup ? { blockNumber, lotNumber, ownerRelationship, ownerRelationshipOther, colorScheme } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
      router.replace(result.user?.role === "admin" ? "/admin/members" : "/community");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-back-link">← Back to Pagsibol Village</Link>
        <div className="auth-brand-mark" aria-hidden="true">🏡</div>
        <p className="auth-eyebrow">PAGSIBOL VILLAGE COMMUNITY</p>
        <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-description">
          {isSignup ? "Join your neighbors and stay connected with the community." : "Sign in to continue to your community account."}
        </p>

        <form className="auth-form" onSubmit={submit}>
          {isSignup && (
            <>
              <label>
                Full name
                <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required placeholder="Your full name" />
              </label>

              <div className="auth-field-row">
                <label>
                  Block number
                  <input value={blockNumber} onChange={(event) => setBlockNumber(event.target.value)} maxLength={20} required placeholder="e.g. 12" autoComplete="off" />
                </label>
                <label>
                  Lot number
                  <input value={lotNumber} onChange={(event) => setLotNumber(event.target.value)} maxLength={20} required placeholder="e.g. 08" autoComplete="off" />
                </label>
              </div>

              <label>
                House color
                <select
                  value={colorScheme}
                  onChange={(event) => setColorScheme(event.target.value as "Turquoise" | "Aubergine" | "Santan")}
                  required
                  style={{ display: "block", width: "100%", minHeight: 48, height: 48, boxSizing: "border-box", padding: "12px 14px", fontSize: 14, fontWeight: 400, lineHeight: 1.4 }}
                >
                  <option value="Turquoise">Turquoise</option>
                  <option value="Aubergine">Aubergine</option>
                  <option value="Santan">Santan</option>
                </select>
                <small style={{ display: "flex", alignItems: "center", gap: 8, color: "#64766a", fontWeight: 400 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: colorScheme === "Turquoise" ? "#9bd9df" : colorScheme === "Aubergine" ? "#9a91b8" : "#a9d69e", border: "1px solid #dce5dc" }} />
                  This color will be used for your house in the village directory and map.
                </small>
              </label>

              <label>
                Relationship to homeowner
                <select
                  value={ownerRelationship}
                  onChange={(event) => setOwnerRelationship(event.target.value)}
                  required
                  style={{
                    display: "block",
                    width: "100%",
                    minHeight: 48,
                    height: 48,
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: 1.4,
                  }}
                >
                  <option value="">Select relationship</option>
                  {relationshipOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              {ownerRelationship === "other" && (
                <label>
                  Please specify
                  <input value={ownerRelationshipOther} onChange={(event) => setOwnerRelationshipOther(event.target.value)} maxLength={100} required placeholder="Describe your relationship" />
                </label>
              )}
            </>
          )}

          <label>
            Email address
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required placeholder="you@example.com" />
          </label>
          <label>
            Password
            <span className="auth-password-control" style={{ display: "flex", alignItems: "center", position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={isSignup ? 10 : 1}
                maxLength={128}
                required
                placeholder={isSignup ? "At least 10 characters" : "Enter your password"}
                style={{ width: "100%", paddingRight: 64, boxSizing: "border-box" }}
              />
              <button
                className="auth-password-toggle"
                style={{ position: "absolute", right: 12, border: 0, background: "transparent", padding: "6px 4px", color: "#28553b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>

          {isSignup && (
            <label>
              Confirm password
              <span className="auth-password-control" style={{ display: "flex", alignItems: "center", position: "relative", width: "100%" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={10}
                  maxLength={128}
                  required
                  placeholder="Re-enter your password"
                  aria-invalid={confirmPassword.length > 0 && password !== confirmPassword}
                  style={{ width: "100%", paddingRight: 64, boxSizing: "border-box" }}
                />
                <button
                  className="auth-password-toggle"
                  style={{ position: "absolute", right: 12, border: 0, background: "transparent", padding: "6px 4px", color: "#28553b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </span>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <small className="auth-password-mismatch">Passwords do not match.</small>
              )}
            </label>
          )}

          {isSignup && <p className="auth-helper">New accounts start as Members. An Admin can update your role later.</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}</button>
        </form>

        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to the community?"}{" "}
          <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Log in" : "Sign up"}</Link>
        </p>
      </div>
    </section>
  );
}
