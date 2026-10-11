"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Bell, CalendarDays, FileText, ImagePlus, Megaphone, ShieldCheck, X, Plus, Send, Paperclip, Trash2, Download } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import type { VillagePost } from "@/lib/data";

type Attachment = { name: string; url: string; type: string; size: number };
type Announcement = VillagePost & { attachments?: Attachment[] };
type CurrentUser = { id: string; name: string; role: string; status?: string } | null;
const sizeLabel = (n:number) => n < 1048576 ? `${Math.max(1,Math.round(n/1024))} KB` : `${(n/1048576).toFixed(1)} MB`;

export default function AnnouncementsPage() {
  const [notices,setNotices] = useState<Announcement[]>([]);
  const [currentUser,setCurrentUser] = useState<CurrentUser>(null);
  const [selected,setSelected] = useState<Announcement|null>(null);
  const [formOpen,setFormOpen] = useState(false);
  const [title,setTitle] = useState("");
  const [body,setBody] = useState("");
  const [location,setLocation] = useState("Pagsibol Village");
  const [files,setFiles] = useState<File[]>([]);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");
  const isAdmin = currentUser?.role === "admin" && currentUser?.status !== "disabled";

  const loadAnnouncements = useCallback(async () => {
    const r = await fetch("/api/announcements",{cache:"no-store"});
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Could not load announcements.");
    setNotices(Array.isArray(d.announcements) ? d.announcements : []);
  },[]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [me] = await Promise.all([fetch("/api/auth/me",{cache:"no-store"}),loadAnnouncements()]);
        const data = me.ok ? await me.json() : null;
        if (alive) setCurrentUser(data?.user ?? null);
        if (alive) setError("");
      } catch(e) { if(alive) setError(e instanceof Error ? e.message : "Could not load announcements."); }
      finally { if(alive) setLoading(false); }
    };
    void load();
    const timer = window.setInterval(()=>{ void loadAnnouncements().catch(()=>{}); },5000);
    return ()=>{alive=false;window.clearInterval(timer);};
  },[loadAnnouncements]);

  function addFiles(list: FileList|null) {
    if (!list) return;
    const combined=[...files,...Array.from(list)];
    if(combined.length>10){setError("You can attach up to 10 files per announcement.");return;}
    const tooLarge=combined.find(f=>f.size>15*1024*1024);
    if(tooLarge){setError(`"${tooLarge.name}" is larger than 15 MB.`);return;}
    setError("");setFiles(combined);
  }

  async function publish(e:FormEvent) {
    e.preventDefault();setSaving(true);setError("");setMessage("");
    try {
      const attachments:Attachment[]=[];
      for(const file of files){
        const form=new FormData();form.append("file",file);
        const r=await fetch("/api/upload",{method:"POST",body:form});
        const d=await r.json();
        if(!r.ok) throw new Error(d.error || `Could not upload ${file.name}.`);
        attachments.push({name:d.name||file.name,url:d.url,type:d.type||file.type,size:d.size||file.size});
      }
      const r=await fetch("/api/announcements",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,body,location,attachments})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"Could not publish announcement.");
      setNotices(v=>[d.announcement,...v]);setTitle("");setBody("");setLocation("Pagsibol Village");setFiles([]);setFormOpen(false);setMessage("Announcement published successfully.");
    } catch(e) {setError(e instanceof Error?e.message:"Could not publish announcement.");}
    finally {setSaving(false);}
  }

  const attachmentLinks=(items:Attachment[]=[])=>(items.length>0?<div className="announcement-attachments">{items.map((f,i)=><a className="announcement-attachment" href={f.url} target="_blank" rel="noreferrer" key={`${f.url}-${i}`}><span className="attachment-icon">{f.type.startsWith("image/")?<ImagePlus size={18}/>:<FileText size={18}/>}</span><span className="attachment-label"><strong>{f.name}</strong><small>{sizeLabel(f.size)} · {f.type.startsWith("image/")?"Image":f.type==="application/pdf"?"PDF document":"File attachment"}</small></span><Download size={16}/></a>)}</div>:null);

  return <SiteShell><div className="page-container announcements-page">
    <div className="page-hero compact"><span className="section-kicker">OFFICIAL INFORMATION & COMMUNITY UPDATES</span><h1>Announcements</h1><p>A dedicated place for village-wide notices, maintenance schedules, and important updates.</p></div>
    <div className="notice-info"><ShieldCheck size={22}/><div><strong>Official notices should be clearly identified</strong><p>Only administrators can publish official announcements and attach supporting files.</p></div></div>
    {isAdmin && <div className="announcement-admin-tools"><button type="button" className="announcement-compose-button" onClick={()=>{setFormOpen(v=>!v);setError("");setMessage("");}}><Plus size={17}/>{formOpen?"Close form":"Post an announcement"}</button></div>}
    {formOpen&&isAdmin&&<form className="announcement-compose" onSubmit={publish}>
      <h2>New announcement</h2>
      <label>Announcement title<input required minLength={3} maxLength={140} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Enter a clear title"/></label>
      <label>Announcement details<textarea required minLength={5} maxLength={8000} rows={5} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write the official notice or update"/></label>
      <label>Location or audience<input maxLength={120} value={location} onChange={e=>setLocation(e.target.value)} placeholder="Pagsibol Village"/></label>
      <div className="announcement-file-picker"><div className="file-picker-copy"><Paperclip size={18}/><div><strong>Announcement image and documents</strong><p>Up to 10 files, 15 MB each. Supports images, PDF, Word, Excel, PowerPoint, TXT and CSV.</p></div></div><label className="announcement-file-button">Choose files<input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" onChange={e=>addFiles(e.target.files)}/></label></div>
      {files.length>0&&<ul className="announcement-pending-files">{files.map((f,i)=><li key={`${f.name}-${i}`}><FileText size={16}/><span>{f.name}<small>{sizeLabel(f.size)}</small></span><button type="button" aria-label={`Remove ${f.name}`} onClick={()=>setFiles(v=>v.filter((_,j)=>i!==j))}><Trash2 size={15}/></button></li>)}</ul>}
      <div className="announcement-compose-actions"><button type="button" className="announcement-cancel-button" disabled={saving} onClick={()=>setFormOpen(false)}>Cancel</button><button type="submit" className="announcement-compose-button" disabled={saving}><Send size={15}/>{saving?"Uploading and publishing…":"Publish announcement"}</button></div>
    </form>}
    {message&&<p role="status" className="announcement-success">{message}</p>}{error&&<p role="alert" className="announcement-error">{error}</p>}
    {loading?<p className="announcement-empty">Loading announcements…</p>:notices.length?<div className="announcements-list">{notices.map((p,i)=><button type="button" className="announcement-card announcement-card-clickable" key={p.id} onClick={()=>setSelected(p)} aria-label={`Open announcement: ${p.title}`}><div className={`announcement-symbol ${i===0?"red":"green"}`}><Megaphone size={22}/></div><div className="announcement-main"><div className="announcement-meta"><span className={i===0?"tag tag-red":"tag tag-green"}>{i===0?"Official notice":"Announcement"}</span><span><CalendarDays size={13}/>{new Date(p.createdAt).toLocaleDateString()}</span></div><h2>{p.title}</h2><p>{p.body}</p><small>Posted by {p.author} · {p.location||"Pagsibol Village"}</small>{p.attachments?.length?<span className="poster-attached-label"><Paperclip size={13}/>{p.attachments.length} attachment{p.attachments.length===1?"":"s"}</span>:null}</div><span className="announcement-open-icon" aria-hidden="true">↗</span></button>)}</div>:<div className="announcement-empty"><Megaphone size={22}/><div><strong>No announcements yet</strong><p>New official notices published by an administrator will appear here.</p></div></div>}
    <div className="info-banner"><Bell size={20}/><div><strong>Community updates</strong><p>Published announcements are stored centrally and refreshed automatically for visitors.</p></div></div>
  </div>
  {selected&&<div className="announcement-modal-backdrop" role="presentation" onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}><section className="announcement-modal" role="dialog" aria-modal="true" aria-labelledby="announcement-modal-title"><header className="announcement-modal-head"><span className="announcement-modal-kicker"><Megaphone size={15}/> VILLAGE ANNOUNCEMENT</span><button type="button" className="announcement-modal-close" aria-label="Close announcement" onClick={()=>setSelected(null)}><X size={20}/></button></header><div className="announcement-modal-content"><h2 id="announcement-modal-title">{selected.title}</h2><p className="announcement-modal-meta"><CalendarDays size={14}/>{new Date(selected.createdAt).toLocaleString()} <span>·</span> {selected.author} <span>·</span> {selected.location||"Pagsibol Village"}</p><p className="announcement-full-body">{selected.body}</p>{attachmentLinks(selected.attachments)}</div></section></div>}
  <style jsx>{`
    .announcement-admin-tools{display:flex;justify-content:flex-end;margin:18px 0}
    .announcement-compose{display:grid;gap:14px;padding:22px;margin:18px 0 24px;background:#fff;border:1px solid #dfe8dd;border-radius:16px}
    .announcement-compose h2{margin:0;color:#203628;font-size:21px}
    .announcement-compose label{display:grid;gap:7px;color:#33483a;font-size:13px;font-weight:700}
    .announcement-compose input:not([type=file]),.announcement-compose textarea{width:100%;box-sizing:border-box;padding:12px 13px;border:1px solid #dce5dc;border-radius:10px;font:inherit;font-size:14px;color:#203628;background:#fff}
    .announcement-compose-button,.announcement-cancel-button,.announcement-file-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 15px;border-radius:10px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}
    .announcement-compose-button{border:1px solid #285b3a;background:#285b3a;color:#fff}.announcement-compose-button:disabled{opacity:.6;cursor:wait}
    .announcement-cancel-button{border:1px solid #dce5dc;background:#fff;color:#33483a}.announcement-compose-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap}
    .announcement-file-picker{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:15px;border:1px dashed #cbdacb;border-radius:12px;background:#f8fbf7}
    .file-picker-copy{display:flex;align-items:flex-start;gap:10px;color:#31583d}.file-picker-copy p{margin:5px 0 0;color:#748176;font-size:12px;line-height:1.5}
    .announcement-file-button{border:1px solid #d5e0d5;background:#fff;color:#31583d;white-space:nowrap}.announcement-file-button input{display:none}
    .announcement-pending-files{list-style:none;display:grid;gap:7px;padding:0;margin:0}.announcement-pending-files li{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #e0e8df;border-radius:10px;color:#31583d}
    .announcement-pending-files li span{flex:1;min-width:0;overflow-wrap:anywhere;font-size:13px}.announcement-pending-files small{display:block;margin-top:3px;color:#778579}.announcement-pending-files button{border:0;background:transparent;color:#a34b43;padding:5px;cursor:pointer}
    .announcement-attachments{display:grid;gap:8px;margin-top:18px}.announcement-attachment{display:flex;align-items:center;gap:12px;padding:12px;border:1px solid #e0e8df;border-radius:10px;text-decoration:none;color:#294632;background:#fbfdfb}
    .attachment-label{flex:1;min-width:0}.announcement-attachment strong{display:block;overflow-wrap:anywhere;font-size:13px}.announcement-attachment small{display:block;margin-top:4px;color:#778579;font-size:11px}
    .announcement-success{color:#23653d;font-size:13px}.announcement-error{color:#a13d36;font-size:13px}
    .announcement-empty{display:flex;align-items:flex-start;gap:12px;padding:22px;border:1px solid #dfe8dd;border-radius:14px;color:#68766c;background:#fff}.announcement-empty strong{color:#203628}.announcement-empty p{margin:5px 0 0;font-size:13px}
    @media(max-width:620px){.announcement-compose{padding:16px}}
  `}</style>
  </SiteShell>;
}
