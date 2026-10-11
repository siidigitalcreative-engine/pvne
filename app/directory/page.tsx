 "use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Store, MapPinned, ChevronRight, House, Filter } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { seedHouseholds, seedBusinesses } from "@/lib/data";

export default function DirectoryPage() {
  const [q, setQ] = useState("");
  const [businessOnly, setBusinessOnly] = useState(false);
  const rows = useMemo(() => seedHouseholds.filter(h => {
    const text = `block ${h.block} lot ${h.lot} ${h.street} ${h.colorScheme} ${h.businesses.map(id => seedBusinesses.find(b => b.id === id)?.name || "").join(" ")}`.toLowerCase();
    return text.includes(q.toLowerCase()) && (!businessOnly || h.hasBusiness);
  }), [q, businessOnly]);
  return <SiteShell><div className="page-container"><div className="page-hero compact"><span className="section-kicker">KNOW YOUR NEIGHBORS</span><h1>House & lot directory</h1><p>Find a household by block, lot, street, or discover which homes have registered businesses.</p></div>
    <div className="directory-toolbar"><label className="directory-search"><Search size={19}/><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search block, lot, street, or business..."/></label><label className="filter-check"><input type="checkbox" checked={businessOnly} onChange={e => setBusinessOnly(e.target.checked)}/> <Store size={16}/> Has business</label><Link href="/map" className="secondary-button"><MapPinned size={16}/> View map</Link></div>
    <div className="result-summary">{rows.length} sample household listings <span>· Directory preview</span></div>
    <div className="house-grid">{rows.map(h => <article className="house-card" key={h.id}><div className={`house-illustration ${h.colorScheme.toLowerCase()}`}><House size={38}/><span>{h.colorScheme} scheme</span><small>BLOCK {h.block}</small></div><div className="house-card-content"><div className="house-title"><div><h2>Block {h.block}, Lot {h.lot}</h2><p>{h.street}</p></div>{h.hasBusiness && <span className="has-business">Has business</span>}</div><div className="house-meta"><span><MapPinned size={14}/>{h.colorScheme}</span><span><Store size={14}/>{h.businesses.length} business{h.businesses.length === 1 ? "" : "es"}</span></div>{h.businesses.length > 0 ? <div className="linked-businesses"><strong>Businesses at this address</strong>{h.businesses.map(id => { const b = seedBusinesses.find(item => item.id === id); return b ? <Link href="/businesses" key={id}><span>{b.emoji}</span><span><b>{b.name}</b><small>{b.category}</small></span><ChevronRight size={15}/></Link> : null; })}</div> : <p className="no-business">No public business listings linked yet.</p>}<Link href="/map" className="house-card-link">View on village map <ArrowRightIcon/></Link></div></article>)}</div>
    <div className="info-banner"><Filter size={20}/><div><strong>Resident-managed directory</strong><p>Household details and business links should be verified and maintained by authorized residents or village administrators before public launch.</p></div></div>
  </div></SiteShell>;
}
function ArrowRightIcon() { return <ChevronRight size={16}/>; }
