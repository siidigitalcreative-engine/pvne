"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { House, Users, MapPinned } from "lucide-react";

const options = [
  ["owner", "Homeowner (HO)"], ["co_owner", "Co-owner"], ["spouse", "Spouse of Homeowner"],
  ["domestic_partner", "Domestic Partner of Homeowner"], ["family_member", "Immediate Family Member of Homeowner"],
  ["authorized_representative", "Authorized Household Representative"], ["tenant", "Tenant / Lessee"], ["other", "Other"],
];
const labels: Record<string, string> = Object.fromEntries(options);
type Resident = { id: string; name: string; ownerRelationship: string; ownerRelationshipOther?: string };
type HouseData = { blockNumber: string; lotNumber: string; ownerRelationship: string; ownerRelationshipOther: string };
export default function MyHousePage() {
  const [house, setHouse] = useState<HouseData>({ blockNumber: "", lotNumber: "", ownerRelationship: "", ownerRelationshipOther: "" });
  const [residents, setResidents] = useState<Resident[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const r = await fetch("/api/account/house", { cache: "no-store" }); const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Could not load your house.");
    setHouse(d.house); setResidents(Array.isArray(d.household) ? d.household : []);
  }
  useEffect(() => { load().catch(e => setError(e.message || "Could not load your house.")); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const r = await fetch("/api/account/house", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(house) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not save details.");
      await load(); setMessage("Your house details have been saved and will be reflected in the House Directory.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save details."); }
    finally { setBusy(false); }
  }

  return <SiteShell><div className="page-container">
    <div className="page-hero compact"><span className="section-kicker">YOUR HOUSEHOLD</span><h1>My House</h1><p>Manage your Block and Lot details and see accounts registered to the same address.</p></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 22, alignItems: "start", marginBottom: 40 }}>
      <section style={{ padding: 24, border: "1px solid #e0e8df", borderRadius: 18, background: "#fff" }}>
        <h2 style={{ marginTop: 0, display: "flex", gap: 10, alignItems: "center" }}><House size={22}/> House details</h2>
        <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>Block number<input required maxLength={20} value={house.blockNumber} onChange={e => setHouse({ ...house, blockNumber: e.target.value })} placeholder="e.g. 12" /></label>
            <label>Lot number<input required maxLength={20} value={house.lotNumber} onChange={e => setHouse({ ...house, lotNumber: e.target.value })} placeholder="e.g. 08" /></label>
          </div>
          <label>Relationship to Homeowner<select required value={house.ownerRelationship} onChange={e => setHouse({ ...house, ownerRelationship: e.target.value })}><option value="">Select relationship</option>{options.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          {house.ownerRelationship === "other" && <label>Please specify<input required maxLength={100} value={house.ownerRelationshipOther} onChange={e => setHouse({ ...house, ownerRelationshipOther: e.target.value })} placeholder="Describe your relationship" /></label>}
          {message && <p role="status" style={{ color: "#23653d", margin: 0 }}>{message}</p>}
          {error && <p role="alert" style={{ color: "#a13d36", margin: 0 }}>{error}</p>}
          <button className="primary-button" disabled={busy} type="submit">{busy ? "Saving…" : "Save house details"}</button>
        </form>
      </section>
      <section style={{ padding: 24, border: "1px solid #e0e8df", borderRadius: 18, background: "#fff" }}>
        <h2 style={{ marginTop: 0, display: "flex", gap: 10, alignItems: "center" }}><Users size={22}/> Household members</h2>
        <p style={{ color: "#68766c", fontSize: 13 }}>Active accounts registered to the same Block and Lot appear here.</p>
        {residents.length ? residents.map(r => <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #edf0ec" }}><span className="brand-mark"><Users size={17}/></span><div><strong>{r.name}</strong><div style={{ fontSize: 12, color: "#68766c" }}>{r.ownerRelationship === "other" ? r.ownerRelationshipOther || "Other" : labels[r.ownerRelationship] || "Resident"}</div></div></div>) : <p className="no-business">No other registered accounts found for this Block and Lot yet.</p>}
        <Link href="/directory" className="house-card-link" style={{ marginTop: 18 }}>Open House Directory <MapPinned size={16}/></Link>
      </section>
    </div>
  </div></SiteShell>;
}
