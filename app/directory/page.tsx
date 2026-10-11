"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Store, MapPinned, ChevronRight, House, Filter, Users } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { seedHouseholds, seedBusinesses } from "@/lib/data";

type Resident = {
  id: string;
  name: string;
  blockNumber: string;
  lotNumber: string;
  ownerRelationship: string;
  ownerRelationshipOther?: string;
};

const relationshipLabels: Record<string, string> = {
  owner: "Homeowner",
  co_owner: "Co-owner",
  spouse: "Spouse of homeowner",
  domestic_partner: "Domestic partner of homeowner",
  family_member: "Immediate family member of homeowner",
  authorized_representative: "Authorized household representative",
  tenant: "Tenant",
  other: "Other relationship",
};

function relationshipLabel(resident: Resident) {
  if (resident.ownerRelationship === "other" && resident.ownerRelationshipOther?.trim()) {
    return resident.ownerRelationshipOther.trim();
  }
  return relationshipLabels[resident.ownerRelationship] || "Resident";
}

function normalizePart(value: string) {
  return value.trim().replace(/^0+(?=\d)/, "").toLowerCase();
}

export default function DirectoryPage() {
  const [q, setQ] = useState("");
  const [businessOnly, setBusinessOnly] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentsLoaded, setResidentsLoaded] = useState(false);
  const [residentsMessage, setResidentsMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/directory/residents", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) {
          setResidentsMessage(response.status === 401
            ? "Log in to view registered residents for each house."
            : "Registered residents could not be loaded right now.");
          return;
        }
        setResidents(Array.isArray(data.residents) ? data.residents : []);
      })
      .catch(() => {
        if (!cancelled) setResidentsMessage("Registered residents could not be loaded right now.");
      })
      .finally(() => {
        if (!cancelled) setResidentsLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => seedHouseholds.filter((h) => {
    const linkedResidents = residents.filter((r) =>
      normalizePart(r.blockNumber) === normalizePart(h.block) &&
      normalizePart(r.lotNumber) === normalizePart(h.lot)
    );
    const businessNames = h.businesses
      .map((id) => seedBusinesses.find((b) => b.id === id)?.name || "")
      .join(" ");
    const residentNames = linkedResidents.map((r) => `${r.name} ${relationshipLabel(r)}`).join(" ");
    const text = `block ${h.block} lot ${h.lot} ${h.street} ${h.colorScheme} ${businessNames} ${residentNames}`.toLowerCase();
    return text.includes(q.toLowerCase()) && (!businessOnly || h.hasBusiness);
  }), [q, businessOnly, residents]);

  return (
    <SiteShell>
      <div className="page-container">
        <div className="page-hero compact">
          <span className="section-kicker">KNOW YOUR NEIGHBORS</span>
          <h1>House & lot directory</h1>
          <p>Find a house by block, lot, street, registered resident, or discover homes with registered businesses.</p>
        </div>
        <div className="directory-toolbar">
          <label className="directory-search">
            <Search size={19} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search block, lot, street, resident, or business..." />
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={businessOnly} onChange={(e) => setBusinessOnly(e.target.checked)} />
            <Store size={16} /> Has business
          </label>
          <Link href="/map" className="secondary-button"><MapPinned size={16} /> View map</Link>
        </div>
        <div className="result-summary">{rows.length} house listings <span>· Resident details shown to signed-in users</span></div>

        {!residentsLoaded && <p className="no-business">Loading registered residents…</p>}
        {residentsLoaded && residentsMessage && (
          <div className="info-banner"><Users size={20} /><div><strong>Registered residents</strong><p>{residentsMessage} <Link href="/login">Log in</Link></p></div></div>
        )}

        <div className="house-grid">
          {rows.map((h) => {
            const linkedResidents = residents.filter((r) =>
              normalizePart(r.blockNumber) === normalizePart(h.block) &&
              normalizePart(r.lotNumber) === normalizePart(h.lot)
            );
            return (
              <article className="house-card" key={h.id}>
                <div className={`house-illustration ${h.colorScheme.toLowerCase()}`}>
                  <House size={38} /><span>{h.colorScheme} scheme</span><small>BLOCK {h.block}</small>
                </div>
                <div className="house-card-content">
                  <div className="house-title">
                    <div><h2>Block {h.block}, Lot {h.lot}</h2><p>{h.street}</p></div>
                    {h.hasBusiness && <span className="has-business">Has business</span>}
                  </div>
                  <div className="house-meta">
                    <span><MapPinned size={14} />{h.colorScheme}</span>
                    <span><Store size={14} />{h.businesses.length} business{h.businesses.length === 1 ? "" : "es"}</span>
                  </div>

                  {residentsLoaded && !residentsMessage && (
                    <div className="linked-businesses">
                      <strong>Registered residents ({linkedResidents.length})</strong>
                      {linkedResidents.length > 0 ? linkedResidents.map((resident) => (
                        <div className="resident-directory-row" key={resident.id}>
                          <span className="resident-directory-avatar"><Users size={16} /></span>
                          <span><b>{resident.name}</b><small>{relationshipLabel(resident)}</small></span>
                        </div>
                      )) : <p className="no-business">No registered accounts linked to this house yet.</p>}
                    </div>
                  )}

                  {h.businesses.length > 0 ? (
                    <div className="linked-businesses">
                      <strong>Businesses at this address</strong>
                      {h.businesses.map((id) => {
                        const b = seedBusinesses.find((item) => item.id === id);
                        return b ? <Link href="/businesses" key={id}><span>{b.emoji}</span><span><b>{b.name}</b><small>{b.category}</small></span><ChevronRight size={15} /></Link> : null;
                      })}
                    </div>
                  ) : <p className="no-business">No public business listings linked yet.</p>}
                  <Link href="/map" className="house-card-link">View on village map <ChevronRight size={16} /></Link>
                </div>
              </article>
            );
          })}
        </div>
        <div className="info-banner"><Filter size={20} /><div><strong>Resident-managed directory</strong><p>Resident names and property relationships are shown only to signed-in users. Household details and business links should be verified by authorized residents or village administrators.</p></div></div>
      </div>
    </SiteShell>
  );
}
