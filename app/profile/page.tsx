"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { UserRound } from "lucide-react";

type User = { id: string; name: string; email: string; role: string; createdAt: string };
export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account/profile", { cache: "no-store" })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error || "Please log in."); setUser(d.user); setName(d.user.name); })
      .catch((e) => setError(e.message || "Could not load your profile."));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    if ((currentPassword || newPassword || confirmPassword) && newPassword !== confirmPassword) {
      setError("Your new passwords do not match."); setBusy(false); return;
    }
    try {
      const r = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, currentPassword, newPassword }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not save changes.");
      setUser(d.user); setName(d.user.name); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setMessage("Your profile has been updated.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save changes."); }
    finally { setBusy(false); }
  }

  return <SiteShell><div className="page-container">
    <div className="page-hero compact"><span className="section-kicker">YOUR ACCOUNT</span><h1>My Profile</h1><p>Manage your account information and password.</p></div>
    {!user && !error && <p className="no-business">Loading your profile…</p>}
    {error && <div className="info-banner"><div><strong>Profile unavailable</strong><p>{error} <Link href="/login">Log in</Link></p></div></div>}
    {user && <div className="form-card account-form-card" style={{ maxWidth: 680, margin: "0 auto 40px", padding: 24, border: "1px solid #e0e8df", borderRadius: 18, background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}><span className="brand-mark"><UserRound size={24}/></span><div><h2 style={{ margin: 0 }}>{user.name}</h2><p style={{ margin: "4px 0 0", color: "#68766c", fontSize: 13 }}>{user.role === "admin" ? "Administrator" : "Community Member"}</p></div></div>
      <form onSubmit={submit} className="auth-form" style={{ display: "grid", gap: 15 }}>
        <label>Full name<input value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={80} /></label>
        <label>Email address<input className="account-readonly-field" value={user.email} readOnly disabled /><small>Your email address is used to sign in and cannot be changed here.</small></label>
        <div style={{ borderTop: "1px solid #e8eee7", paddingTop: 18 }}><h3 style={{ margin: "0 0 5px" }}>Change password</h3><p style={{ color: "#68766c", fontSize: 13, marginTop: 0 }}>Leave these fields blank if you do not want to change your password.</p></div>
        <label>Current password<input type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></label>
        <label>New password<input type="password" autoComplete="new-password" minLength={10} maxLength={128} value={newPassword} onChange={e => setNewPassword(e.target.value)} /></label>
        <label>Confirm new password<input type="password" autoComplete="new-password" minLength={10} maxLength={128} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></label>
        {message && <p role="status" style={{ color: "#23653d", margin: 0 }}>{message}</p>}
        {error && <p role="alert" style={{ color: "#a13d36", margin: 0 }}>{error}</p>}
        <button className="primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
      </form>
      <style jsx>{`
        .account-form-card { box-shadow: 0 12px 34px rgba(32, 58, 37, .045); }
        .auth-form label { display: grid; gap: 7px; color: #33483a; font-size: 12px; font-weight: 750; }
        .auth-form input { width: 100%; min-height: 45px; padding: 11px 13px; border: 1px solid #dce5dc; border-radius: 10px; background: #fff; color: #203628; font: inherit; font-size: 13px; outline: none; }
        .auth-form input:focus { border-color: #6f9a73; box-shadow: 0 0 0 3px rgba(111,154,115,.13); }
        .auth-form input:disabled { opacity: 1; background: #f7f9f6; color: #68766c; cursor: not-allowed; }
        .auth-form label :global(small) { color: #718074; font-size: 10px; font-weight: 400; line-height: 1.5; }
        @media (max-width: 620px) { .account-form-card { padding: 21px !important; } }
      `}</style>
    </div>}
  </div></SiteShell>;
}
