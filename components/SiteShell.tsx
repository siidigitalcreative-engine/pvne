"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Bell, Building2, House, Map, Menu, MessageCircle, Search, Store, X } from "lucide-react";

const nav = [
  { href: "/", label: "Home", icon: House },
  { href: "/directory", label: "Directory", icon: Building2 },
  { href: "/businesses", label: "Businesses", icon: Store },
  { href: "/community", label: "Community", icon: MessageCircle },
  { href: "/announcements", label: "Notices", icon: Bell },
  { href: "/map", label: "Village Map", icon: Map },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const showBack = pathname !== "/";

  return <>
    <header className="site-header">
      <div className="header-brand-row">
        {showBack && <button className="back-icon-button" type="button" aria-label="Go back" title="Go back" onClick={() => { if (window.history.length > 1) router.back(); else router.push("/"); }}><ArrowLeft size={19}/></button>}
        <Link href="/" className="brand"><span className="brand-mark">🏡</span><span><strong>Pagsibol Village</strong><small>Northeastern Naic</small></span></Link>
      </div>
      <nav className="desktop-nav" aria-label="Main navigation">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          return <Link href={href} key={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}><Icon size={16}/>{label}</Link>;
        })}
      </nav>
      <div className="header-actions">
        <Link href="/directory" className="icon-button" aria-label="Search directory"><Search size={19}/></Link>
        <Link href="/announcements" className="icon-button" aria-label="Notifications"><Bell size={19}/><i/></Link>
        <Link href="/community" className="avatar" aria-label="PVNE community profile">PVNE</Link>
        <button className="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
    </header>
    {menuOpen && <nav className="mobile-dropdown" aria-label="Expanded navigation">{nav.map(({href,label,icon:Icon})=>{const active=isNavActive(pathname,href);return <Link href={href} key={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined} onClick={()=>setMenuOpen(false)}><Icon size={17}/>{label}</Link>;})}</nav>}
    <nav className="mobile-nav" aria-label="Main navigation">
      {nav.map(({href,label,icon:Icon})=>{const active=isNavActive(pathname,href);return <Link href={href} key={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined} title={label}><Icon size={18}/><span>{label === "Village Map" ? <>Village<br/>Map</> : label}</span></Link>;})}
    </nav>
    <main>{children}</main>
    <footer className="site-footer">
      <div className="footer-brand"><span className="brand-mark">🏡</span><div><strong>Pagsibol Village - Northeastern Naic</strong><p>PVNE · Galak na Umaasenso</p></div></div>
      <p>One village. One community. Built for everyone.</p>
      <div className="footer-links"><Link href="/map">Explore the map</Link><Link href="/directory">House directory</Link><Link href="/businesses">Local businesses</Link><Link href="/community">Community guidelines</Link></div>
      <small>Community portal concept. Verify official lot geometry before relying on the map as a site plan.</small>
    </footer>
    <style jsx>{`
      .desktop-nav a.active, .mobile-nav a.active, .mobile-dropdown a.active {
        background: #e7f2e8;
        color: #245c38;
        font-weight: 700;
      }
      .desktop-nav a.active { border-radius: 10px; }
      .mobile-nav a.active { border-radius: 10px; }
    `}</style>
  </>;
}
