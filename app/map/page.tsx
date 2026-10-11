"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPinned, Store, House, ZoomIn, ZoomOut, RotateCcw, Info, ArrowUpRight } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

type Household = { id: string; block: string; lot: string; street: string; colorScheme: string; businesses: string[]; hasBusiness: boolean };
type Business = { id: string; name: string; emoji: string; blockLot: string; category: string; locationType?: string };
const LOTS_PER_BLOCK = 40;
const COLORS: Record<string, string> = {
  Turquoise: "#9bd9df",
  Aubergine: "#9a91b8",
  Santan: "#a9d69e",
};
const normalize = (value: unknown) => String(value ?? "").trim().replace(/^0+(?=\d)/, "");

export default function VillageMapPage() {
  const [block, setBlock] = useState(1);
  const [q, setQ] = useState("");
  const [selectedLot, setSelectedLot] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showLots, setShowLots] = useState(true);
  const [showBusinesses, setShowBusinesses] = useState(true);
  const [allHouseholds, setAllHouseholds] = useState<Household[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
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
        if (!response.ok) throw new Error(data.error || "Could not load village records.");
        if (!cancelled) {
          setAllHouseholds(Array.isArray(data.households) ? data.households : []);
          setAllBusinesses(Array.isArray(data.businesses) ? data.businesses : []);
          setLoadError("");
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setLoadError("Village records could not be refreshed. Please try again shortly.");
      } finally { fetching = false; }
    };
    void refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  const households = useMemo(() => allHouseholds.filter(h => normalize(h.block) === String(block)), [allHouseholds, block]);
  const businesses = useMemo(() => allBusinesses.filter(b => !q || `${b.name} ${b.blockLot} ${b.category}`.toLowerCase().includes(q.toLowerCase())), [allBusinesses, q]);
  const matchingLots = useMemo(() => Array.from({ length: LOTS_PER_BLOCK }, (_, i) => i + 1).filter(lot => !q || `block ${block} lot ${lot}`.includes(q.toLowerCase()) || households.some(h => Number(h.lot) === lot && `${h.street} block ${block} lot ${lot}`.toLowerCase().includes(q.toLowerCase()))), [block, q, households]);
  const selectedHouse = households.find(h => Number(h.lot) === selectedLot);
  const householdForLot = (lot: number) => households.find(h => Number(h.lot) === lot);
  const colorForLot = (lot: number) => {
    const house = householdForLot(lot);
    return house ? COLORS[house.colorScheme] || "#9bd9df" : "#f8faf6";
  };
  const changeBlock = (next: number) => { setBlock(next); setSelectedLot(null); };

  return <SiteShell><div className="page-container map-page">
    <div className="page-hero compact"><span className="section-kicker">EXPLORE YOUR NEIGHBORHOOD</span><h1>Village map</h1><p>Choose a block, then tap a lot to view its registered household.</p></div>
    <div className="map-tools">
      <label className="directory-search"><Search size={18}/><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search block, lot, or business..."/></label>
      <button className="map-action-button" onClick={() => { const m = q.match(/block\s*(\d+)/i); if (m) changeBlock(Number(m[1])); else { const l = q.match(/lot\s*(\d+)/i); if (l) setSelectedLot(Number(l[1])); } }}>Search</button>
      <span className="map-status-chip"><Info size={14}/> Prototype lot grid</span>
    </div>
    <div className="map-block-tabs" role="tablist" aria-label="Choose block">{[1,2,3,4,5,6].map(n => <button key={n} role="tab" aria-selected={block===n} className={block===n ? "active" : ""} onClick={() => changeBlock(n)}>Block {n}</button>)}</div>
    <div className="map-workspace map-workspace-stacked">
      <div className="map-canvas map-interactive" style={{overflow:"hidden",touchAction:"pan-y",background:"#f2f1e2",borderRadius:18,padding:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:10,color:"#304c38",fontSize:12,fontWeight:700}}><span>PAGSIBOL VILLAGE · BLOCK {block}</span><span>{Math.round(zoom*100)}%</span></div>
        <div className="map-svg-viewport" style={{overflow:"auto",maxHeight:"none",width:"100%"}}>
          <svg viewBox="0 0 760 590" role="group" aria-label={`Clickable lot map for Block ${block}`} style={{width:"100%",height:"auto",display:"block",transform:`scale(${zoom})`,transformOrigin:"top center",transition:"transform .15s"}}>
            <rect width="760" height="590" rx="12" fill="#edf0df"/>
            <path d="M20 70 L740 42 L740 118 L20 145 Z M20 190 L740 165 L740 240 L20 265 Z M20 310 L740 285 L740 360 L20 385 Z M20 430 L740 405 L740 480 L20 505 Z" fill="#d0d8b4"/>
            <path d="M10 130 L750 103 M10 250 L750 223 M10 370 L750 343 M10 490 L750 463" stroke="#fff" strokeWidth="23" strokeLinecap="round"/>
            {Array.from({length:LOTS_PER_BLOCK},(_,i)=>{
              const lot=i+1,row=Math.floor(i/10),col=i%10,x=30+col*71+(row%2?10:0),y=78+row*105;
              const points=`${x},${y} ${x+58},${y-3} ${x+63},${y+39} ${x+5},${y+42}`;
              const selected=selectedLot===lot, house=householdForLot(lot), matches=matchingLots.includes(lot);
              return <g key={lot} role="button" tabIndex={0} aria-label={`Block ${block}, Lot ${lot}${house ? ", registered household" : ", not registered"}`} onClick={()=>setSelectedLot(lot)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelectedLot(lot)}}} style={{cursor:"pointer",opacity:matches?1:.22}}>
                <polygon points={points} fill={colorForLot(lot)} stroke={selected?"#203e2b":"#ffffff"} strokeWidth={selected?4:2.5} strokeLinejoin="round"/>
                {showLots && <text className="map-lot-number" x={x+31} y={y+24} fontSize="13" fontWeight={800} textAnchor="middle" fill={house ? "#203e2b" : "#879188"}>{lot}</text>}
                {house && <circle cx={x+49} cy={y+8} r="4" fill="#245c38" stroke="#fff" strokeWidth="1.5"/>}
              </g>;
            })}
            <text x="380" y="555" textAnchor="middle" fontSize="15" fontWeight="700" fill="#405844">BLOCK {block} · LOTS 1–{LOTS_PER_BLOCK}</text>
          </svg>
        </div>
        <div className="map-legend" style={{display:"flex",gap:16,flexWrap:"wrap",padding:"12px 2px 4px",color:"#64766a"}}>{[{c:COLORS.Turquoise,t:"Turquoise"},{c:COLORS.Aubergine,t:"Aubergine"},{c:COLORS.Santan,t:"Santan"},{c:"#f8faf6",t:"Not registered"}].map(x=><span key={x.t} style={{display:"inline-flex",alignItems:"center",gap:7}}><i style={{width:13,height:13,display:"inline-block",background:x.c,border:"1px solid #dce4d9",borderRadius:4}}/>{x.t}</span>)}</div>
        <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}><button className="map-action-button" onClick={()=>setShowLots(v=>!v)}>{showLots?"Hide lot numbers":"Show lot numbers"}</button><button className="map-action-button" onClick={()=>setZoom(z=>Math.min(1.5,z+.1))}><ZoomIn size={15}/> Zoom in</button><button className="map-action-button" onClick={()=>setZoom(z=>Math.max(.7,z-.1))}><ZoomOut size={15}/> Zoom out</button><button className="map-action-button" onClick={()=>setZoom(1)}><RotateCcw size={15}/> Reset</button></div>
      </div>
      <aside className="map-results map-results-below">
        <div className="map-results-head"><div><h2>Block {block}</h2><p>Registered properties and lot references</p></div><MapPinned size={20}/></div>
        {selectedLot!==null && <div className="map-point-info"><strong><House size={15}/> Block {block}, Lot {selectedLot}</strong><p>{selectedHouse ? `Registered household · ${selectedHouse.street || "Street not specified"}` : "No registered household linked to this lot yet."}</p>{selectedHouse && <Link href="/directory">Open household directory <ArrowUpRight size={14}/></Link>}<button onClick={()=>setSelectedLot(null)}>Clear selection</button></div>}
        {showLots && <><h3 className="map-list-heading"><House size={15}/> Lots · 1–{LOTS_PER_BLOCK}</h3><div className="map-result-list">{matchingLots.map(lot=>{const house=householdForLot(lot);return <button type="button" className="map-result" key={lot} onClick={()=>setSelectedLot(lot)} style={{width:"100%",textAlign:"left",background:selectedLot===lot?"#edf4e9":undefined,border:selectedLot===lot?"1px solid #66876a":undefined}}><div className="mini-house" style={{background:colorForLot(lot)}}><House size={18}/></div><div><strong>Block {block}, Lot {lot}</strong><small>{house ? `${house.street || "Registered household"} · ${house.colorScheme}` : "Not registered yet"}</small></div><ArrowUpRight size={16}/></button>;})}</div></>}
        {showBusinesses && <><h3 className="map-list-heading"><Store size={15}/> Registered businesses</h3>{businesses.slice(0,5).map(b=><Link className="map-business-row" href="/businesses" key={b.id}><span>{b.emoji}</span><div><strong>{b.name}</strong><small>{b.blockLot} · {b.category}</small></div><ArrowUpRight size={15}/></Link>)}</>}
        {loadError && <p role="status" className="no-business">{loadError}</p>}
        {!loadError && loaded && showBusinesses && businesses.length===0 && <p className="no-business">No registered businesses yet.</p>}
        {!loadError && loaded && showLots && households.length===0 && <p className="no-business">No registered households in Block {block} yet. Lots without saved household records remain unregistered.</p>}
      </aside>
    </div>
    <div className="notice-info"><Info size={22}/><div><strong>Map accuracy</strong><p>This map uses a prototype numbered grid, not an official site plan. Registered lots are highlighted using each saved household&apos;s color scheme. Verify the actual lot layout before relying on it for navigation.</p></div></div>
  </div></SiteShell>;
}
