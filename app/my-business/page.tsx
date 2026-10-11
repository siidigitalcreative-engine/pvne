"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Store, MapPinned, ExternalLink, Plus, Pencil, Trash2, X } from "lucide-react";

type Business = {
  id: string; ownerId?: string; locationType?: "Inside Store" | "Inside PVNE"; name: string; category: string; blockLot: string;
  description: string; hours: string; status: "Open" | "Hours vary" | "Closed"; emoji: string;
};
type Profile = { blockNumber?: string; lotNumber?: string };
type FormValues = { id: string; name: string; category: string; description: string; hours: string; status: Business["status"]; emoji: string; locationType: "Inside Store" | "Inside PVNE" | "" };
const emptyForm: FormValues = { id: "", name: "", category: "Food / Marketplace", description: "", hours: "Contact for hours", status: "Open", emoji: "🏪", locationType: "" };
const categories = ["Food / Marketplace", "Retail", "Home Services", "Beauty & Wellness", "Education", "Professional Services", "Creative Services", "Other"];

export default function MyBusinessPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormValues>(emptyForm);

  const load = useCallback(async () => {
    const response = await fetch("/api/account/businesses", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load your business information.");
    setProfile({ blockNumber: data.blockNumber, lotNumber: data.lotNumber });
    setBusinesses(Array.isArray(data.businesses) ? data.businesses : []);
  }, []);

  useEffect(() => {
    let active = true;
    const firstLoad = async () => {
      try { await load(); }
      catch (e) { if (active) setError(e instanceof Error ? e.message : "Could not load your business information."); }
      finally { if (active) setLoading(false); }
    };
    void firstLoad();
    const timer = setInterval(() => { void load().catch(() => {}); }, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [load]);

  function startCreate() { setForm(emptyForm); setEditing(true); setError(""); setMessage(""); }
  function startEdit(b: Business) {
    setForm({ id: b.id, name: b.name, category: b.category, description: b.description, hours: b.hours, status: b.status, emoji: b.emoji || "🏪", locationType: b.locationType || "" });
    setEditing(true); setError(""); setMessage("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/account/businesses", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save this listing.");
      await load(); setEditing(false); setForm(emptyForm); setMessage(form.id ? "Business listing updated." : "Business listing created.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save this listing."); }
    finally { setBusy(false); }
  }

  async function removeBusiness(b: Business) {
    if (!window.confirm(`Remove "${b.name}" from your business listings?`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/account/businesses?id=${encodeURIComponent(b.id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not remove this listing.");
      await load(); setMessage("Business listing removed.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not remove this listing."); }
    finally { setBusy(false); }
  }

  return <SiteShell><div className="page-container my-business-page">
    <div className="page-hero compact"><span className="section-kicker">LOCAL ENTERPRISE</span><h1>My Business</h1><p>Create and manage business listings associated with your registered Block and Lot.</p></div>
    {loading && <p className="no-business">Loading your business listings…</p>}
    {!loading && error && <div className="info-banner" role="alert"><div><strong>Business listings unavailable</strong><p>{error} {error.toLowerCase().includes("log in") && <Link href="/login">Log in</Link>}</p></div></div>}
    {!loading && !error && <>
      {profile?.blockNumber && profile?.lotNumber ? <p className="result-summary">Your address: Block {profile.blockNumber}, Lot {profile.lotNumber}</p> : <div className="info-banner"><div><strong>Add your house details first</strong><p>Save your Block and Lot under <Link href="/my-house">My House</Link> before creating a listing.</p></div></div>}
      {message && <p role="status" className="business-message">{message}</p>}
      {error && <p role="alert" className="business-error">{error}</p>}
      <div className="business-toolbar"><span>{businesses.length} {businesses.length === 1 ? "listing" : "listings"}</span><button className="primary-button" disabled={!profile?.blockNumber || !profile?.lotNumber || busy} onClick={startCreate}><Plus size={16}/> Add business</button></div>
      {editing && <section className="business-editor account-panel">
        <div className="editor-heading"><div><span className="section-kicker">LOCAL ENTERPRISE</span><h2>{form.id ? "Edit business listing" : "Register a business"}</h2><p>Your listing will be linked to your saved Block and Lot.</p></div><button className="icon-button" type="button" onClick={() => setEditing(false)} aria-label="Close editor"><X size={18}/></button></div>
        <form onSubmit={submit} className="business-form">
          <label>Business name<input required maxLength={100} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your business name"/></label>
          <label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
          <label>Short description<textarea required minLength={5} maxLength={1200} rows={4} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe your products or services"/></label>
          <label>Business hours<input required maxLength={120} value={form.hours} onChange={e=>setForm({...form,hours:e.target.value})} placeholder="e.g. Mon–Sat, 9 AM–6 PM"/></label>
          <label>Business location<select required value={form.locationType} onChange={e=>setForm({...form,locationType:e.target.value as FormValues["locationType"]})}><option value="">Select location</option><option value="Inside Store">Inside Store</option><option value="Inside PVNE">Inside PVNE</option></select></label>\n          <label>Listing status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value as FormValues["status"]})}><option>Open</option><option>Hours vary</option><option>Closed</option></select></label>
          <label>Display emoji<input value={form.emoji} onChange={e=>setForm({...form,emoji:e.target.value})} maxLength={8} placeholder="🏪"/></label>
          {error && <p role="alert" className="business-error">{error}</p>}
          <div className="editor-actions"><button type="button" className="secondary-button" disabled={busy} onClick={()=>setEditing(false)}>Cancel</button><button className="primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : form.id ? "Save changes" : "Publish listing"}</button></div>
        </form>
      </section>}
      {businesses.length ? <div className="house-grid">{businesses.map(b=><article className="house-card" key={b.id}><div className="house-card-content">
        <div className="business-card-top"><span className="business-emoji">{b.emoji || "🏪"}</span><span className="has-business">{b.status}</span></div>
        <div className="house-title"><div><h2>{b.name}</h2><p>{b.category}</p><span className="location-tag">{b.locationType || "Location not set"}</span></div></div>
        <div className="house-meta"><span><MapPinned size={14}/>{b.blockLot}</span></div><p>{b.description}</p><p className="business-hours">Hours: {b.hours}</p>
        <div className="business-actions"><button className="secondary-button" onClick={()=>startEdit(b)} disabled={busy}><Pencil size={14}/> Edit</button><button className="danger-button" onClick={()=>void removeBusiness(b)} disabled={busy}><Trash2 size={14}/> Remove</button><Link href="/businesses" className="house-card-link">View directory <ExternalLink size={15}/></Link></div>
      </div></article>)}</div> : !editing && <div className="info-banner"><Store size={20}/><div><strong>No business listings found for this address</strong><p>Create a listing to show your products or services in the village business directory.</p><button className="text-link" onClick={startCreate} disabled={!profile?.blockNumber || !profile?.lotNumber}>Register your business</button></div></div>}
    </>}
    <style jsx>{`
      .my-business-page .info-banner { border-radius: 13px; }
      .business-toolbar { display:flex; justify-content:space-between; align-items:center; gap:12px; margin:18px 0; color:#68766c; font-size:13px; }
      .business-editor { margin:20px 0 28px; padding:24px; border:1px solid #e0e8df; border-radius:18px; background:#fff; box-shadow:0 12px 34px rgba(32,58,37,.045); }
      .editor-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:20px; }
      .editor-heading h2 { margin:5px 0; color:#203128; font-size:22px; }
      .editor-heading p { margin:0; color:#68766c; font-size:13px; }
      .icon-button { border:1px solid #e0e8df; background:#fff; border-radius:9px; padding:8px; cursor:pointer; }
      .business-form { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:15px; }
      .business-form label { display:grid; gap:7px; color:#33483a; font-size:12px; font-weight:750; }
      .business-form input,.business-form select,.business-form textarea { width:100%; min-height:44px; padding:11px 12px; border:1px solid #dce5dc; border-radius:10px; background:#fff; color:#203628; font:inherit; font-size:13px; box-sizing:border-box; }
      .business-form label:nth-child(3) { grid-column:1/-1; }
      .editor-actions { grid-column:1/-1; display:flex; justify-content:flex-end; gap:10px; }
      .business-message { color:#23653d; font-size:13px; }
      .business-error { color:#a13d36; font-size:13px; }
      .business-card-top { display:flex; justify-content:space-between; align-items:center; }
      .business-emoji { font-size:32px; }\n      .location-tag { display:inline-flex; margin-top:6px; padding:4px 8px; border-radius:999px; background:#edf5ed; color:#28623c; font-size:11px; font-weight:700; }
      .business-hours { color:#68766c; font-size:13px; }
      .business-actions { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-top:16px; }
      .business-actions button { display:inline-flex; align-items:center; gap:6px; }
      .danger-button { padding:9px 12px; border:1px solid #e5c8c5; border-radius:9px; background:#fff7f6; color:#9b3b35; cursor:pointer; font:inherit; font-size:12px; }
      .text-link { margin-top:8px; padding:0; border:0; background:none; color:#28623c; text-decoration:underline; cursor:pointer; font:inherit; font-size:13px; }
      @media(max-width:620px) { .business-form { grid-template-columns:minmax(0,1fr); } .business-form label:nth-child(3),.editor-actions { grid-column:auto; } .business-editor { padding:18px; } .business-toolbar { align-items:flex-start; } }
    `}</style>
  </div></SiteShell>;
}
