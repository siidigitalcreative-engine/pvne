 "use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Bell, CalendarDays, ChevronRight, CircleAlert, Clock3, MapPinned, MessageCircle, Search, ShieldCheck, Store, Vote, Wrench, House, Megaphone, ShoppingBasket, BusFront, Droplets, School, Trophy, PartyPopper, PawPrint, BriefcaseBusiness, ShieldAlert, CalendarCheck, ClipboardList } from "lucide-react";
import { categories, seedBusinesses, seedPosts } from "@/lib/data";

const categoryIcons = [MessageCircle, ShoppingBasket, House, Wrench, Droplets, BusFront, School, Trophy, PartyPopper, CircleAlert, PawPrint, BriefcaseBusiness];
const categoryColors = ["lilac", "peach", "mint", "sage", "sky", "yellow", "rose", "lilac", "peach", "red", "mint", "sky"];

export function HomeDashboard() {
  const [search, setSearch] = useState("");
  const [pollChoice, setPollChoice] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return [
      ...seedBusinesses.filter(b => `${b.name} ${b.category} ${b.blockLot}`.toLowerCase().includes(q)).map(b => ({ label: b.name, detail: `${b.category} · ${b.blockLot}`, href: "/businesses" })),
      ...seedPosts.filter(p => `${p.title} ${p.category} ${p.body}`.toLowerCase().includes(q)).map(p => ({ label: p.title, detail: `${p.category} · ${p.author}`, href: p.type === "announcement" ? "/announcements" : "/community" })),
    ].slice(0, 6);
  }, [search]);

  return (
    <>
      <section className="hero">
        <div className="hero-image" />
        <div className="hero-content">
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR COMMUNITY, CONNECTED</span>
          <h1>A stronger<br/>Pagsibol Village,<br/><em>together.</em></h1>
          <p>Your neighborhood hub for village updates, local businesses, community conversations, events, and everyday services.</p>
          <div className="hero-search-wrap">
            <form className="hero-search" onSubmit={(e) => { e.preventDefault(); if (search.trim()) window.location.href = `/directory?q=${encodeURIComponent(search.trim())}`; }}>
              <Search size={20}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search houses, businesses, posts, or topics..." aria-label="Search village"/>
              <button type="submit">Search <ArrowRight size={16}/></button>
            </form>
            {search.trim() && <div className="search-suggestions">{filtered.length ? filtered.map((r, i) => <Link href={r.href} key={r.label + i}><Search size={15}/><span><strong>{r.label}</strong><small>{r.detail}</small></span><ChevronRight size={16}/></Link>) : <p>No sample results found. Try “pizza”, “water”, or “carpool”.</p>}</div>}
          </div>
          <div className="hero-note"><ShieldCheck size={16}/> Built around the people and places of Pagsibol</div>
        <div className="hero-side-card"><div className="weather-icon">☀</div><div><strong>Welcome, neighbor</strong><span>Find what you need in the village.</span></div><span className="hero-card-dot"/></div>
        </div>
      </section>

      <section className="quick-actions container">
        {[
          { label: "House directory", icon: House, href: "/directory", color: "mint" },
          { label: "Business directory", icon: Store, href: "/businesses", color: "peach" },
          { label: "Announcements", icon: Megaphone, href: "/announcements", color: "yellow" },
          { label: "Community chats", icon: MessageCircle, href: "/community", color: "sky" },
          { label: "Report a concern", icon: ClipboardList, href: "/community", color: "rose" },
          { label: "Village events", icon: CalendarCheck, href: "/announcements", color: "lilac" },
          { label: "Services", icon: Wrench, href: "/community", color: "sage" },
          { label: "Emergency info", icon: ShieldAlert, href: "/announcements", color: "red" }
        ].map(({ label, icon: Icon, href, color }) => <Link href={href} className="quick-action" key={label}><span className={`quick-icon ${color}`}><Icon size={23}/></span><strong>{label}</strong></Link>)}
      </section>

      <div className="container home-grid">
        <section className="panel announcements-panel">
          <div className="section-heading"><div><span className="section-kicker">STAY INFORMED</span><h2>Village announcements</h2></div><Link href="/announcements" className="text-link">View all <ArrowRight size={15}/></Link></div>
          {seedPosts.filter(p => p.type === "announcement").map((post, i) => <article className="notice-row" key={post.id}><span className={`notice-icon ${i === 0 ? "red" : "sage"}`}><Bell size={18}/></span><div className="notice-copy"><span className={`tag ${i === 0 ? "tag-red" : "tag-green"}`}>{i === 0 ? "Important notice" : "Community update"}</span><h3>{post.title}</h3><p>{post.body}</p><small>{post.author} · {post.createdAt}</small></div><ChevronRight className="notice-chevron" size={18}/></article>)}
        </section>

        <section className="panel events-panel">
          <div className="section-heading"><div><span className="section-kicker">SAVE THE DATE</span><h2>Upcoming events</h2></div><CalendarDays size={19} className="muted-icon"/></div>
          <div className="event-row"><span className="event-date"><b>18</b><small>OCT</small></span><div><h3>Community clean-up</h3><p>7:00 AM – 11:00 AM</p><small>Village common areas</small></div></div>
          <div className="event-row"><span className="event-date event-blue"><b>25</b><small>OCT</small></span><div><h3>Health & wellness day</h3><p>8:00 AM – 4:00 PM</p><small>Covered court</small></div></div>
          <div className="event-row"><span className="event-date event-yellow"><b>01</b><small>NOV</small></span><div><h3>Basketball league</h3><p>5:00 PM onwards</p><small>Basketball court</small></div></div>
          <p className="sample-note">Sample events · confirm dates with village administration.</p>
        </section>

        <section className="panel poll-panel">
          <div className="section-heading"><div><span className="section-kicker">HAVE YOUR SAY</span><h2>Community poll</h2></div><Vote size={20} className="muted-icon"/></div>
          <p className="poll-question">What would you like to see more of in the village?</p>
          {["More community events", "Improved street lighting", "More local business listings", "More sports activities"].map(option => <label className="poll-option" key={option}><input type="radio" name="poll" value={option} checked={pollChoice === option} onChange={() => setPollChoice(option)}/><span>{option}</span></label>)}
          <button className="primary-button poll-button" onClick={() => alert(pollChoice ? "Your selection is previewed. Connect a persistent poll API before launch to record votes." : "Choose an option first.")}>Submit vote <ArrowRight size={15}/></button>
          <small className="sample-note">Demo poll; votes are not saved.</small>
        </section>
      </div>

      <section className="container categories-section">
        <div className="section-heading"><div><span className="section-kicker">FIND YOUR PEOPLE</span><h2>Explore community topics</h2><p>Join a conversation, ask a question, or share an update.</p></div><Link href="/community" className="text-link">All topics <ArrowRight size={15}/></Link></div>
        <div className="category-grid">{categories.map((category, i) => { const Icon = categoryIcons[i]; return <Link href={`/community?topic=${encodeURIComponent(category)}`} className="category-tile" key={category}><span className={`category-icon ${categoryColors[i]}`}><Icon size={22}/></span><strong>{category}</strong><small>Explore posts <ChevronRight size={12}/></small></Link>; })}</div>
      </section>

      <section className="container discover-grid">
        <div className="business-section">
          <div className="section-heading"><div><span className="section-kicker">SHOP CLOSE TO HOME</span><h2>Discover village businesses</h2><p>Support a neighbor. Find something nearby.</p></div><Link href="/businesses" className="text-link">All businesses <ArrowRight size={15}/></Link></div>
          <div className="business-cards">{seedBusinesses.slice(0, 3).map((business) => <Link href="/businesses" className="business-card" key={business.id}><div className="business-art"><span>{business.emoji}</span><small>{business.category}</small></div><div className="business-card-body"><h3>{business.name}</h3><p><MapPinned size={13}/>{business.blockLot}</p><div className="business-card-foot"><span className={business.status === "Open" ? "status-open" : "status-variable"}>● {business.status}</span><span>{business.hours}</span></div></div></Link>)}</div>
        </div>
        <div className="activity-section">
          <div className="section-heading"><div><span className="section-kicker">AROUND THE VILLAGE</span><h2>Recently active</h2></div><Link href="/community" className="icon-link"><ArrowRight size={16}/></Link></div>
          {seedPosts.filter(p => p.type === "post").slice(0, 4).map(post => <Link href="/community" className="activity-row" key={post.id}><span className="activity-avatar">{post.category.includes("Transportation") ? "🚌" : post.category.includes("School") ? "🎓" : post.category.includes("Food") ? "🍕" : "🏡"}</span><span className="activity-copy"><strong>{post.title}</strong><small>{post.category} · {post.createdAt}</small></span><span className="comment-count"><MessageCircle size={14}/>{post.comments}</span></Link>)}
        </div>
      </section>

      <section className="container map-promo">
        <div className="map-promo-copy"><span className="map-promo-icon"><MapPinned size={26}/></span><div><span className="section-kicker">KNOW YOUR NEIGHBORHOOD</span><h2>Explore the village map</h2><p>Find homes, discover businesses at each address, and locate shared amenities.</p><Link href="/map" className="light-button">Explore interactive map <ArrowRight size={16}/></Link></div></div>
        <div className="map-promo-stats"><div><House size={19}/><strong>Households</strong><span>Directory</span></div><div><Store size={19}/><strong>Local businesses</strong><span>Discover nearby</span></div><div><MapPinned size={19}/><strong>Village amenities</strong><span>Find your way</span></div></div>
      </section>
    </>
  );
}
