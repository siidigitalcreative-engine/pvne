import Link from "next/link";
import { Bell, Building2, CalendarDays, House, Map, Menu, MessageCircle, Search, Store, Wrench } from "lucide-react";

const nav = [
  { href: "/", label: "Home", icon: House },
  { href: "/directory", label: "Directory", icon: Building2 },
  { href: "/businesses", label: "Businesses", icon: Store },
  { href: "/community", label: "Community", icon: MessageCircle },
  { href: "/announcements", label: "Notices", icon: Bell },
  { href: "/map", label: "Village Map", icon: Map }
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand">
          <span className="brand-mark">🏡</span>
          <span><strong>Pagsibol Village</strong><small>Northeastern Naic</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(({ href, label, icon: Icon }) => <Link href={href} key={href}><Icon size={16} />{label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link href="/directory" className="icon-button" aria-label="Search directory"><Search size={19} /></Link>
          <Link href="/announcements" className="icon-button" aria-label="Notifications"><Bell size={19} /><i /></Link>
          <Link href="/community" className="avatar" aria-label="PVNE community profile">PVNE</Link>
          <button className="mobile-menu" aria-label="Menu" onClick={() => document.body.classList.toggle("menu-open")}><Menu size={22}/></button>
        </div>
      </header>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav.map(({ href, label, icon: Icon }) => <Link href={href} key={href}><Icon size={18}/><span>{label}</span></Link>)}
      </nav>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="footer-brand"><span className="brand-mark">🏡</span><div><strong>Pagsibol Village - Northeastern Naic</strong><p>PVNE · Galak na Umaasenso</p></div></div>
        <p>One village. One community. Built for everyone.</p>
        <div className="footer-links"><Link href="/map">Explore the map</Link><Link href="/directory">House directory</Link><Link href="/businesses">Local businesses</Link><Link href="/community">Community guidelines</Link></div>
        <small>Community portal concept. Sample listings and posts are illustrative and should be verified before launch.</small>
      </footer>
    </>
  );
}
