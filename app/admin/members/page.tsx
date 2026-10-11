"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Member = { id: string; name: string; email: string; role: "admin" | "member"; status: "active" | "disabled"; createdAt: string };
export default function AdminMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadMembers() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await response.json();
      if (response.status === 403) { router.replace("/login"); return; }
      if (!response.ok) throw new Error(data.error || "Could not load members.");
      setMembers(data.users || []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load members."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadMembers(); }, []);

  async function updateMember(member: Member, update: { role?: "admin" | "member"; status?: "active" | "disabled" }) {
    setBusyId(member.id); setError("");
    try {
      const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: member.id, ...update }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update this account.");
      setMembers((current) => current.map((item) => item.id === member.id ? data.user : item));
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update this account."); }
    finally { setBusyId(""); }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login"); router.refresh();
  }

  return <main className="admin-members-page">
    <div className="admin-members-top"><Link href="/" className="auth-back-link">← Pagsibol Village</Link><button type="button" className="admin-logout" onClick={logout}>Log out</button></div>
    <div className="admin-members-heading"><p className="auth-eyebrow">ADMINISTRATION</p><h1>Member management</h1><p>Manage community accounts and choose who can administer PVNE.</p></div>
    <div className="admin-members-note"><strong>Role permissions</strong><span>Admins can manage accounts. Members have standard community access. Only assign Admin to people you trust.</span></div>
    {error && <p className="auth-error" role="alert">{error}</p>}
    {loading ? <p className="admin-loading">Loading accounts…</p> : members.length === 0 ? <p className="admin-loading">No accounts found yet.</p> : <div className="admin-members-list">
      {members.map((member) => <article className="admin-member-row" key={member.id}>
        <div className="admin-member-avatar" aria-hidden="true">{member.name.trim().charAt(0).toUpperCase()}</div>
        <div className="admin-member-info"><strong>{member.name}</strong><span>{member.email}</span><small>Joined {new Date(member.createdAt).toLocaleDateString()}</small></div>
        <div className="admin-member-actions"><span className={`role-pill role-${member.role}`}>{member.role === "admin" ? "Admin" : "Member"}</span><select aria-label={`Role for ${member.name}`} value={member.role} disabled={busyId === member.id} onChange={(event) => void updateMember(member, { role: event.target.value as Member["role"] })}><option value="member">Member</option><option value="admin">Admin</option></select><button type="button" className="admin-status-button" disabled={busyId === member.id} onClick={() => void updateMember(member, { status: member.status === "active" ? "disabled" : "active" })}>{busyId === member.id ? "Saving…" : member.status === "active" ? "Disable" : "Enable"}</button><span className={`member-status ${member.status}`}>{member.status === "active" ? "Active" : "Disabled"}</span></div>
      </article>)}
    </div>}
  </main>;
}
