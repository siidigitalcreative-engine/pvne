"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, ImagePlus, Megaphone, ShieldCheck, X, Upload, Plus, Send } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import type { VillagePost } from "@/lib/data";

type CurrentUser = { id: string; name: string; role: string; status?: string } | null;
type Poster = { name: string; url: string };

export default function AnnouncementsPage() {
  const [notices, setNotices] = useState<VillagePost[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [selected, setSelected] = useState<VillagePost | null>(null);
  const [posters, setPosters] = useState<Record<string, Poster>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("Pagsibol Village");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.role === "admin" && currentUser?.status !== "disabled";

  const loadAnnouncements = useCallback(async () => {
    const response = await fetch("/api/announcements", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load announcements.");
    setNotices(Array.isArray(data.announcements) ? data.announcements : []);
  }, []);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [meResponse] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          loadAnnouncements(),
        ]);
        const meData = meResponse.ok ? await meResponse.json() : null;
        if (alive) setCurrentUser(meData?.user ?? null);
        if (alive) setError("");
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Could not load announcements.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    const timer = window.setInterval(() => { void loadAnnouncements().catch(() => {}); }, 5000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [loadAnnouncements]);

  function handlePoster(file?: File) {
    if (!file || !selected || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPosters(prev => {
      const old = prev[selected.id];
      if (old) URL.revokeObjectURL(old.url);
      return { ...prev, [selected.id]: { name: file.name, url } };
    });
  }

  async function publish(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, location }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not publish announcement.");
      setNotices(current => [data.announcement, ...current]);
      setTitle("");
      setBody("");
      setLocation("Pagsibol Village");
      setFormOpen(false);
      setMessage("Announcement published successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not publish announcement.");
    } finally {
      setSaving(false);
    }
  }

  return <SiteShell><div className="page-container announcements-page">
    <div className="page-hero compact"><span className="section-kicker">OFFICIAL INFORMATION & COMMUNITY UPDATES</span><h1>Announcements</h1><p>A dedicated place for village-wide notices, maintenance schedules, and important updates.</p></div>
    <div className="notice-info"><ShieldCheck size={22}/><div><strong>Official notices should be clearly identified</strong><p>Only administrators can publish official announcements. Published notices are shared with the community.</p></div></div>

    {isAdmin && <div className="announcement-admin-tools">
      <button type="button" className="announcement-compose-button" onClick={() => { setFormOpen(v => !v); setError(""); setMessage(""); }}><Plus size={17}/>{formOpen ? "Close form" : "Post an announcement"}</button>
    </div>}
    {formOpen && isAdmin && <form className="announcement-compose" onSubmit={publish}>
      <h2>New announcement</h2>
      <label>Announcement title<input required minLength={3} maxLength={140} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Enter a clear title"/></label>
      <label>Announcement details<textarea required minLength={5} maxLength={8000} rows={5} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write the official notice or update"/></label>
      <label>Location or audience<input maxLength={120} value={location} onChange={e=>setLocation(e.target.value)} placeholder="Pagsibol Village"/></label>
      <div className="announcement-compose-actions"><button type="button" className="announcement-cancel-button" disabled={saving} onClick={()=>setFormOpen(false)}>Cancel</button><button type="submit" className="announcement-compose-button" disabled={saving}><Send size={15}/>{saving ? "Publishing…" : "Publish announcement"}</button></div>
    </form>}

    {message && <p role="status" className="announcement-success">{message}</p>}
    {error && <p role="alert" className="announcement-error">{error}</p>}
    {loading ? <p className="announcement-empty">Loading announcements…</p> :
      notices.length ? <div className="announcements-list">{notices.map((p, i) => <button type="button" className="announcement-card announcement-card-clickable" key={p.id} onClick={() => setSelected(p)} aria-label={`Open announcement: ${p.title}`}>
        <div className={`announcement-symbol ${i === 0 ? "red" : "green"}`}><Megaphone size={22}/></div>
        <div className="announcement-main"><div className="announcement-meta"><span className={i === 0 ? "tag tag-red" : "tag tag-green"}>{i === 0 ? "Official notice" : "Announcement"}</span><span><CalendarDays size={13}/>{new Date(p.createdAt).toLocaleDateString()}</span></div><h2>{p.title}</h2><p>{p.body}</p><small>Posted by {p.author} · {p.location || "Pagsibol Village"}</small>{posters[p.id] && <span className="poster-attached-label"><ImagePlus size={13}/> Poster attached in this session</span>}</div>
        <span className="announcement-open-icon" aria-hidden="true">↗</span>
      </button>)}</div> : <div className="announcement-empty"><Megaphone size={22}/><div><strong>No announcements yet</strong><p>New official notices published by an administrator will appear here.</p></div></div>}

    <div className="info-banner"><Bell size={20}/><div><strong>Community updates</strong><p>Published announcements are stored centrally and refreshed automatically for visitors.</p></div></div>
  </div>
  {selected && <div className="announcement-modal-backdrop" role="presentation" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
    <section className="announcement-modal" role="dialog" aria-modal="true" aria-labelledby="announcement-modal-title">
      <header className="announcement-modal-head"><span className="announcement-modal-kicker"><Megaphone size={15}/> VILLAGE ANNOUNCEMENT</span><button type="button" className="announcement-modal-close" aria-label="Close announcement" onClick={() => setSelected(null)}><X size={20}/></button></header>
      <div className="announcement-modal-content"><h2 id="announcement-modal-title">{selected.title}</h2><p className="announcement-modal-meta"><CalendarDays size={14}/>{new Date(selected.createdAt).toLocaleString()} <span>·</span> {selected.author} <span>·</span> {selected.location || "Pagsibol Village"}</p><p className="announcement-full-body">{selected.body}</p>
        {posters[selected.id] && <div className="announcement-poster-preview"><img src={posters[selected.id].url} alt={`Poster for ${selected.title}`} /><small>{posters[selected.id].name}</small></div>}
        <div className="announcement-upload-area"><div className="announcement-upload-copy"><span className="announcement-upload-icon"><ImagePlus size={19}/></span><div><strong>Event poster</strong><p>Attach an image for reference. Poster upload is a temporary preview only in this version.</p></div></div><input ref={uploadRef} className="announcement-file-input" type="file" accept="image/*" onChange={e => handlePoster(e.target.files?.[0])}/><button className="announcement-upload-button" type="button" onClick={() => uploadRef.current?.click()}><Upload size={16}/>{posters[selected.id] ? "Replace poster" : "Preview poster"}</button></div>
      </div>
    </section>
  </div>}
  <style jsx>{`
    .announcement-admin-tools { display:flex; justify-content:flex-end; margin:18px 0; }
    .announcement-compose { display:grid; gap:14px; padding:22px; margin:18px 0 24px; background:#fff; border:1px solid #dfe8dd; border-radius:16px; }
    .announcement-compose h2 { margin:0; color:#203628; font-size:21px; }
    .announcement-compose label { display:grid; gap:7px; color:#33483a; font-size:13px; font-weight:700; }
    .announcement-compose input,.announcement-compose textarea { width:100%; box-sizing:border-box; padding:12px 13px; border:1px solid #dce5dc; border-radius:10px; font:inherit; font-size:14px; color:#203628; background:#fff; }
    .announcement-compose-button,.announcement-cancel-button { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 15px; border-radius:10px; font:inherit; font-size:13px; font-weight:700; cursor:pointer; }
    .announcement-compose-button { border:1px solid #285b3a; background:#285b3a; color:#fff; }
    .announcement-compose-button:disabled { opacity:.6; cursor:wait; }
    .announcement-cancel-button { border:1px solid #dce5dc; background:#fff; color:#33483a; }
    .announcement-compose-actions { display:flex; justify-content:flex-end; gap:10px; flex-wrap:wrap; }
    .announcement-success { color:#23653d; font-size:13px; }
    .announcement-error { color:#a13d36; font-size:13px; }
    .announcement-empty { display:flex; align-items:flex-start; gap:12px; padding:22px; border:1px solid #dfe8dd; border-radius:14px; color:#68766c; background:#fff; }
    .announcement-empty strong { color:#203628; }
    .announcement-empty p { margin:5px 0 0; font-size:13px; }
    @media(max-width:620px) { .announcement-compose { padding:16px; } }
  `}</style>
  </SiteShell>;
}
