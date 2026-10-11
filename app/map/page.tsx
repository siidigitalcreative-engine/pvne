"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPinned, Store, House, ZoomIn, ZoomOut, RotateCcw, Info, ArrowUpRight } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

type Household = {
  id: string;
  block: string | number;
  lot: string | number;
  street?: string;
  colorScheme?: string;
  businesses?: string[];
  hasBusiness?: boolean;
};
type Business = {
  id: string;
  name: string;
  emoji?: string;
  blockLot: string;
  category: string;
  locationType?: string;
};

const HOUSE_COLORS: Record<string, string> = {
  Turquoise: "#9bd9df",
  Aubergine: "#9a91b8",
  Santan: "#a9d69e",
};

const normalizeNumber = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const number = Number(raw);
  return Number.isFinite(number) ? String(number) : raw.toLowerCase();
};
const sortNumeric = (a: string, b: string) => {
  const na = Number(a), nb = Number(b);
  return Number.isFinite(na) && Number.isFinite(nb) ? na - nb : a.localeCompare(b, undefined, { numeric: true });
};

export default function VillageMapPage() {
  const [allHouseholds, setAllHouseholds] = useState<Household[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedLot, setSelectedLot] = useState("");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [showBusinesses, setShowBusinesses] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let fetching = false;
    const refresh = async () => {
      if (fetching) return;
      fetching = true;
      try {
        const response = await fetch("/api/village-data", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load registered village houses.");
        if (!cancelled) {
          const households = Array.isArray(data.households) ? data.households.filter((h: Household) => normalizeNumber(h.block) && normalizeNumber(h.lot)) : [];
          const businesses = Array.isArray(data.businesses) ? data.businesses : [];
          setAllHouseholds(households);
          setAllBusinesses(businesses);
          const registeredBlocks = Array.from(
            new Set<string>(households.map((h: Household) => normalizeNumber(h.block)).filter(Boolean))
          ).sort(sortNumeric);
          setSelectedBlock((current: string) =>
            current && registeredBlocks.includes(current) ? current : (registeredBlocks[0] || "")
          );
          setLoadError("");
          setLoaded(true);
        }
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Could not load registered village houses.");
      } finally {
        fetching = false;
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  const blocks = useMemo(
    () => Array.from(new Set(allHouseholds.map(h => normalizeNumber(h.block)).filter(Boolean))).sort(sortNumeric),
    [allHouseholds]
  );
  const householdsInBlock = useMemo(
    () => allHouseholds
      .filter(h => normalizeNumber(h.block) === selectedBlock)
      .sort((a, b) => sortNumeric(normalizeNumber(a.lot), normalizeNumber(b.lot))),
    [allHouseholds, selectedBlock]
  );
  const visibleHouses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return householdsInBlock;
    return householdsInBlock.filter(h =>
      `block ${normalizeNumber(h.block)} lot ${normalizeNumber(h.lot)} ${h.street || ""} ${h.colorScheme || ""}`.toLowerCase().includes(q)
    );
  }, [householdsInBlock, query]);
  const businesses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allBusinesses.filter(b => !q || `${b.name} ${b.blockLot} ${b.category}`.toLowerCase().includes(q));
  }, [allBusinesses, query]);
  const selectedHouse = householdsInBlock.find(h => normalizeNumber(h.lot) === selectedLot);
  const changeBlock = (block: string) => {
    setSelectedBlock(block);
    setSelectedLot("");
  };
  const colorForHouse = (house: Household) => HOUSE_COLORS[house.colorScheme || ""] || "#e8efe6";

  return <SiteShell>
    <div className="page-container map-page">
      <div className="page-hero compact">
        <span className="section-kicker">EXPLORE YOUR NEIGHBORHOOD</span>
        <h1>Village map</h1>
        <p>Only registered houses appear here. Blocks are created automatically when a house is registered.</p>
      </div>

      <div className="map-tools">
        <label className="directory-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search registered block, lot, or business..."/></label>
        <span className="map-status-chip"><Info size={14}/> Registered houses only</span>
      </div>

      {blocks.length > 0 && <div className="map-block-tabs" role="tablist" aria-label="Registered blocks">
        {blocks.map(block => <button key={block} type="button" role="tab" aria-selected={selectedBlock === block} className={selectedBlock === block ? "active" : ""} onClick={() => changeBlock(block)}>Block {block}</button>)}
      </div>}

      {loadError ? <div className="notice-info" role="alert"><Info size={20}/><div><strong>Map data unavailable</strong><p>{loadError}</p></div></div> :
        !loaded ? <div className="no-business">Loading registered houses…</div> :
        allHouseholds.length === 0 ? <div className="notice-info"><House size={22}/><div><strong>No registered houses yet</strong><p>The map will show a block tab only after a resident registers a house with a Block and Lot number. No sample houses or empty lots are displayed.</p><Link href="/my-house">Register your house details <ArrowUpRight size={14}/></Link></div></div> :
        <div className="map-workspace map-workspace-stacked">
          <section className="map-canvas map-interactive" style={{overflow:"hidden",background:"#f2f1e2",borderRadius:18,padding:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:12,color:"#304c38",fontSize:12,fontWeight:700}}>
              <span>PAGSIBOL VILLAGE · BLOCK {selectedBlock}</span>
              <span>{visibleHouses.length} registered {visibleHouses.length === 1 ? "house" : "houses"}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:8,transform:`scale(${zoom})`,transformOrigin:"top center",transition:"transform .15s"}}>
              {visibleHouses.map(house => {
                const lot = normalizeNumber(house.lot);
                const selected = selectedLot === lot;
                return <button key={house.id} type="button" onClick={() => setSelectedLot(lot)} aria-pressed={selected} aria-label={`Block ${selectedBlock}, Lot ${lot}`} style={{minHeight:66,padding:"10px 4px",borderRadius:8,border:selected?"2px solid #203e2b":"1px solid #fff",background:colorForHouse(house),color:"#203e2b",fontWeight:800,cursor:"pointer",boxShadow:selected?"0 0 0 2px #b9ceb7":"0 1px 3px #d8dfd1"}}>
                  <House size={17} style={{display:"block",margin:"0 auto 5px"}}/>
                  <span style={{fontSize:13}}>Lot {lot}</span>
                </button>;
              })}
            </div>
            <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
              <button className="map-action-button" type="button" onClick={()=>setZoom(z=>Math.min(1.4,z+.1))}><ZoomIn size={15}/> Zoom in</button>
              <button className="map-action-button" type="button" onClick={()=>setZoom(z=>Math.max(.8,z-.1))}><ZoomOut size={15}/> Zoom out</button>
              <button className="map-action-button" type="button" onClick={()=>setZoom(1)}><RotateCcw size={15}/> Reset</button>
            </div>
            <div className="map-legend" style={{display:"flex",gap:14,flexWrap:"wrap",padding:"12px 2px 2px",color:"#64766a",fontSize:12}}>
              {Object.entries(HOUSE_COLORS).map(([name,color])=><span key={name} style={{display:"inline-flex",alignItems:"center",gap:6}}><i style={{width:12,height:12,display:"inline-block",background:color,borderRadius:3,border:"1px solid #dce4d9"}}/>{name}</span>)}
              <span>House colors follow each registration.</span>
            </div>
          </section>

          <aside className="map-results map-results-below">
            <div className="map-results-head"><div><h2>Block {selectedBlock}</h2><p>{householdsInBlock.length} registered {householdsInBlock.length === 1 ? "property" : "properties"}, sorted by lot number</p></div><MapPinned size={20}/></div>
            {selectedHouse && <div className="map-point-info"><strong><House size={15}/> Block {selectedBlock}, Lot {normalizeNumber(selectedHouse.lot)}</strong><p>{selectedHouse.street || "Street not specified"} · {selectedHouse.colorScheme || "House color not selected"}</p><Link href="/directory">Open house directory <ArrowUpRight size={14}/></Link><button type="button" onClick={()=>setSelectedLot("")}>Clear selection</button></div>}
            {visibleHouses.length > 0 ? <div className="map-result-list">{visibleHouses.map(house=><button type="button" className="map-result" key={house.id} onClick={()=>setSelectedLot(normalizeNumber(house.lot))} style={{width:"100%",textAlign:"left",background:selectedLot===normalizeNumber(house.lot)?"#edf4e9":undefined,border:selectedLot===normalizeNumber(house.lot)?"1px solid #66876a":undefined}}>
              <div className="mini-house" style={{background:colorForHouse(house)}}><House size={18}/></div>
              <div><strong>Block {selectedBlock}, Lot {normalizeNumber(house.lot)}</strong><small>{house.street || "Registered house"} · {house.colorScheme || "Color not selected"}</small></div><ArrowUpRight size={16}/>
            </button>)}</div> : <p className="no-business">No registered houses match this search in Block {selectedBlock}.</p>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginTop:18}}><h3 className="map-list-heading"><Store size={15}/> Registered businesses</h3><button className="map-action-button" type="button" onClick={()=>setShowBusinesses(v=>!v)}>{showBusinesses?"Hide":"Show"}</button></div>
            {showBusinesses && businesses.slice(0,5).map(b=><Link className="map-business-row" href="/businesses" key={b.id}><span>{b.emoji || "🏪"}</span><div><strong>{b.name}</strong><small>{b.blockLot} · {b.category}{b.locationType ? ` · ${b.locationType}` : ""}</small></div><ArrowUpRight size={15}/></Link>)}
            {showBusinesses && businesses.length===0 && <p className="no-business">No registered businesses yet.</p>}
          </aside>
        </div>
      }

      <div className="notice-info"><Info size={22}/><div><strong>Map behavior</strong><p>Block tabs are generated from registered household records only. Within each block, houses are sorted from the lowest lot number to the highest. This visual layout is a directory view, not an official traced site plan.</p></div></div>
    </div>
  </SiteShell>;
}
