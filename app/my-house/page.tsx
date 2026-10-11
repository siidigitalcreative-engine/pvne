"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Store, MapPinned, ExternalLink } from "lucide-react";
import { seedBusinesses } from "@/lib/data";

type Business = { id: string; name: string; category: string; blockLot: string; description: string; hours: string; status: string; emoji: string };
type Profile = { blockNumber?: string; lotNumber?: string };
function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, ""); }
export default function MyBusinessPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/account/house", { cache: "no-store" }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || "Please log in."); return d.house as Profile; }),
      Promise.resolve(seedBusinesses as Business[]),
    ]).then(([house, list]) => {
      setProfile(house);
      const key = normalize(`Blk ${house.blockNumber} Lot ${house.lotNumber}`);
      setBusinesses(key && house.blockNumber && house.lotNumber ? list.filter(b => normalize(b.blockLot) === key) : []);
    }).catch(e => setError(e.message || "Could not load your business information."))
      .finally(() => setLoading(false));
  }, []);

  return <SiteShell><div className="page-container my-business-page">
    <div className="page-hero compact"><span className="section-kicker">LOCAL ENTERPRISE</span><h1>My Business</h1><p>View business listings associated with your registered Block and Lot.</p></div>
    {loading && <p className="no-business">Loading your business listings…</p>}
    {error && <div className="info-banner"><div><strong>Business listings unavailable</strong><p>{error} <Link href="/login">Log in</Link></p></div></div>}
    {!loading && !error && <>
      {profile?.blockNumber && profile?.lotNumber ? <p className="result-summary">Your address: Block {profile.blockNumber}, Lot {profile.lotNumber}</p> : <div className="info-banner"><div><strong>Add your house details first</strong><p>Save your Block and Lot under <Link href="/my-house">My House</Link> to find business listings associated with your address.</p></div></div>}
      {businesses.length ? <div className="house-grid">{businesses.map(b => <article className="house-card" key={b.id}><div className="house-card-content"><div style={{ fontSize: 30 }}>{b.emoji}</div><div className="house-title"><div><h2>{b.name}</h2><p>{b.category}</p></div><span className="has-business">{b.status}</span></div><div className="house-meta"><span><MapPinned size={14}/>{b.blockLot}</span></div><p>{b.description}</p><p style={{ color: "#68766c", fontSize: 13 }}>Hours: {b.hours}</p><Link href="/businesses" className="house-card-link">View business directory <ExternalLink size={15}/></Link></div></article>)}</div> : !error && <div className="info-banner"><Store size={20}/><div><strong>No business listings found for this address</strong><p>Business listings are currently read from the village directory. New business registration and editing are not available on this page yet.</p><Link href="/businesses">Browse all businesses</Link></div></div>}
    </>}
    <style jsx>{`
      .my-business-page .info-banner { border-radius: 13px; }
      .my-business-page .house-card { border-radius: 18px; border-color: #e0e8df; box-shadow: 0 12px 34px rgba(32, 58, 37, .045); }
      .my-business-page .house-card-content { padding: 20px; }
      .my-business-page .house-card-content > p { font-size: 13px; line-height: 1.6; color: #68766c; }
      .my-business-page .house-card-link { font-size: 12px; }
      @media (max-width: 620px) {
        .my-business-page .house-grid { grid-template-columns: minmax(0, 1fr); }
        .my-business-page .house-card-content { padding: 16px; }
      }
    `}</style>
  </div></SiteShell>;
}
