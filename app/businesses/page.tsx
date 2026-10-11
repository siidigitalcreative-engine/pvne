 "use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Store, MapPinned, ArrowUpRight, Filter } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { seedBusinesses } from "@/lib/data";

export default function BusinessesPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All categories");
  const categories = ["All categories", ...Array.from(new Set(seedBusinesses.map(b => b.category)))];
  const rows = useMemo(() => seedBusinesses.filter(b => (`${b.name} ${b.category} ${b.blockLot} ${b.description}`).toLowerCase().includes(q.toLowerCase()) && (category === "All categories" || b.category === category)), [q, category]);
  return <SiteShell><div className="page-container"><div className="page-hero compact"><span className="section-kicker">SUPPORT YOUR NEIGHBORS</span><h1>Village business directory</h1><p>Discover food, products, and services offered by residents. Every listing can link back to its house and lot.</p></div>
    <div className="directory-toolbar"><label className="directory-search"><Search size={19}/><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search a business, product, or service..."/></label><select className="select-filter" value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category">{categories.map(c => <option key={c}>{c}</option>)}</select></div>
    <div className="result-summary">{rows.length} sample businesses <span>· Listings shown are illustrative</span></div>
    <div className="business-list-grid">{rows.map(b => <article className="business-list-card" key={b.id}><div className="business-list-art"><span>{b.emoji}</span><small>{b.category}</small></div><div className="business-list-body"><div className="business-title-row"><h2>{b.name}</h2><span className={b.status === "Open" ? "status-open" : "status-variable"}>● {b.status}</span></div><p>{b.description}</p><div className="business-meta"><span><MapPinned size={14}/>{b.blockLot}</span><span>{b.hours}</span></div><div className="business-actions"><Link href="/directory" className="secondary-button"><Store size={15}/> View household</Link><button className="primary-button" onClick={() => alert("Inquiry preview only. Add resident verification and a secure messaging feature before launch.")}>Contact business <ArrowUpRight size={15}/></button></div></div></article>)}</div>
    <div className="info-banner"><Filter size={20}/><div><strong>Business owners can manage their listings</strong><p>The production version should let verified household members create a business profile, upload images to Vercel Blob, and link the business to one or more approved household records.</p></div></div>
  </div></SiteShell>;
}
