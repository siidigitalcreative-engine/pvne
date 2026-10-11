"use client";

import { useRef, useState } from "react";
import { Bell, CalendarDays, ImagePlus, Megaphone, ShieldCheck, X, Upload } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { seedPosts, type VillagePost } from "@/lib/data";

type Poster = { name: string; url: string };

export default function AnnouncementsPage() {
  const notices = seedPosts.filter(p => p.type === "announcement");
  const [selected, setSelected] = useState<VillagePost | null>(null);
  const [posters, setPosters] = useState<Record<string, Poster>>({});
  const uploadRef = useRef<HTMLInputElement>(null);

  function handlePoster(file?: File) {
    if (!file || !selected || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPosters(prev => {
      const old = prev[selected.id];
      if (old) URL.revokeObjectURL(old.url);
      return { ...prev, [selected.id]: { name: file.name, url } };
    });
  }

  return <SiteShell><div className="page-container announcements-page">
    <div className="page-hero compact"><span className="section-kicker">OFFICIAL INFORMATION & COMMUNITY UPDATES</span><h1>Announcements</h1><p>A dedicated place for village-wide notices, maintenance schedules, and important updates.</p></div>
    <div className="notice-info"><ShieldCheck size={22}/><div><strong>Official notices should be clearly identified</strong><p>Only authorized village administrators and committee members should publish official announcements.</p></div></div>
    <div className="announcements-list">{notices.map((p, i) => <button type="button" className="announcement-card announcement-card-clickable" key={p.id} onClick={() => setSelected(p)} aria-label={`Open announcement: ${p.title}`}>
      <div className={`announcement-symbol ${i === 0 ? "red" : "green"}`}><Megaphone size={22}/></div>
      <div className="announcement-main"><div className="announcement-meta"><span className={i === 0 ? "tag tag-red" : "tag tag-green"}>{i === 0 ? "Important notice" : "Community update"}</span><span><CalendarDays size={13}/>{p.createdAt}</span></div><h2>{p.title}</h2><p>{p.body}</p><small>Posted by {p.author} · {p.location}</small>{posters[p.id] && <span className="poster-attached-label"><ImagePlus size={13}/> Poster attached in this session</span>}</div>
      <span className="announcement-open-icon" aria-hidden="true">↗</span>
    </button>)}</div>
    <div className="info-banner"><Bell size={20}/><div><strong>Notifications can be added next</strong><p>Residents could subscribe to important categories, with urgent announcements visually separated from general community posts.</p></div></div>
  </div>
  {selected && <div className="announcement-modal-backdrop" role="presentation" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
    <section className="announcement-modal" role="dialog" aria-modal="true" aria-labelledby="announcement-modal-title">
      <header className="announcement-modal-head"><span className="announcement-modal-kicker"><Megaphone size={15}/> VILLAGE ANNOUNCEMENT</span><button type="button" className="announcement-modal-close" aria-label="Close announcement" onClick={() => setSelected(null)}><X size={20}/></button></header>
      <div className="announcement-modal-content"><h2 id="announcement-modal-title">{selected.title}</h2><p className="announcement-modal-meta"><CalendarDays size={14}/>{selected.createdAt} <span>·</span> {selected.author} <span>·</span> {selected.location}</p><p className="announcement-full-body">{selected.body}</p>
        {posters[selected.id] && <div className="announcement-poster-preview"><img src={posters[selected.id].url} alt={`Poster for ${selected.title}`} /><small>{posters[selected.id].name}</small></div>}
        <div className="announcement-upload-area"><div className="announcement-upload-copy"><span className="announcement-upload-icon"><ImagePlus size={19}/></span><div><strong>Event poster</strong><p>Attach the original poster image. Its aspect ratio is preserved without cropping.</p></div></div><input ref={uploadRef} className="announcement-file-input" type="file" accept="image/*" onChange={e => handlePoster(e.target.files?.[0])}/><button className="announcement-upload-button" type="button" onClick={() => uploadRef.current?.click()}><Upload size={16}/>{posters[selected.id] ? "Replace poster" : "Upload poster"}</button></div>
        <p className="announcement-upload-note">Poster preview is temporary in this browser session; permanent storage requires connecting this form to the site's upload service.</p>
      </div>
    </section>
  </div>}
  </SiteShell>;
}
