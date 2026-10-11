import Link from "next/link";
import { Bell, CalendarDays, ChevronRight, Megaphone, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { seedPosts } from "@/lib/data";

export default function AnnouncementsPage() {
  const notices = seedPosts.filter(p => p.type === "announcement");
  return <SiteShell><div className="page-container"><div className="page-hero compact"><span className="section-kicker">OFFICIAL INFORMATION & COMMUNITY UPDATES</span><h1>Announcements</h1><p>A dedicated place for village-wide notices, maintenance schedules, and important updates.</p></div>
    <div className="notice-info"><ShieldCheck size={22}/><div><strong>Official notices should be clearly identified</strong><p>In the live system, only authorized village administrators and committee members should be able to publish official announcements.</p></div></div>
    <div className="announcements-list">{notices.map((p, i) => <article className="announcement-card" key={p.id}><div className={`announcement-symbol ${i === 0 ? "red" : "green"}`}><Megaphone size={22}/></div><div className="announcement-main"><div className="announcement-meta"><span className={i === 0 ? "tag tag-red" : "tag tag-green"}>{i === 0 ? "Important notice" : "Community update"}</span><span><CalendarDays size={13}/>{p.createdAt}</span></div><h2>{p.title}</h2><p>{p.body}</p><small>Posted by {p.author} · {p.location}</small></div><ChevronRight size={20}/></article>)}</div>
    <div className="info-banner"><Bell size={20}/><div><strong>Notifications can be added next</strong><p>Residents could subscribe to important categories, with urgent announcements visually separated from general community posts.</p></div></div>
  </div></SiteShell>;
}
