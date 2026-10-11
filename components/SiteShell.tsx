"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  Building2,
  House,
  Map,
  Menu,
  MessageCircle,
  Search,
  Store,
  UserRound,
  X,
} from "lucide-react";

const nav = [
  { href: "/", label: "Home", icon: House },
  { href: "/directory", label: "Directory", icon: Building2 },
  { href: "/businesses", label: "Businesses", icon: Store },
  { href: "/community", label: "Community", icon: MessageCircle },
  { href: "/announcements", label: "Notices", icon: Bell },
  { href: "/map", label: "Village Map", icon: Map },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const showBack = pathname !== "/";

  return (
    <>
      <header className="site-header">
        <div className="header-brand-row">
          {showBack && (
            <button
              className="back-icon-button"
              type="button"
              aria-label="Go back"
              title="Go back"
              onClick={() => {
                if (window.history.length > 1) router.back();
                else router.push("/");
              }}
            >
              <ArrowLeft size={19} />
            </button>
          )}
          <Link href="/" className="brand">
            <span className="brand-mark">🏡</span>
            <span>
              <strong>Pagsibol Village</strong>
              <small>Northeastern Naic</small>
            </span>
          </Link>
        </div>

        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link href={href} key={href} aria-current={pathname === href ? "page" : undefined}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/directory" className="icon-button" aria-label="Search directory" title="Search directory">
            <Search size={19} />
          </Link>
          <Link href="/community/chat" className="icon-button" aria-label="General chat" title="General chat">
            <MessageCircle size={19} />
          </Link>
          <Link href="/announcements" className="icon-button" aria-label="Notifications" title="Notifications">
            <Bell size={19} />
            <i />
          </Link>
          <div className="header-auth-links">
            <Link href="/login" className="header-login">
              <UserRound size={15} />
              Log in
            </Link>
            <Link href="/signup" className="header-signup">Sign up</Link>
          </div>
          <button
            className="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="mobile-dropdown" aria-label="Expanded navigation">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link href={href} key={href} onClick={() => setMenuOpen(false)}>
              <Icon size={17} />
              {label}
            </Link>
          ))}
          <Link href="/community/chat" onClick={() => setMenuOpen(false)}>
            <MessageCircle size={17} />
            General chat
          </Link>
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            <UserRound size={17} />
            Log in
          </Link>
          <Link href="/signup" onClick={() => setMenuOpen(false)}>
            <UserRound size={17} />
            Sign up
          </Link>
        </nav>
      )}

      <nav className="mobile-nav" aria-label="Main navigation">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link href={href} key={href} aria-current={pathname === href ? "page" : undefined}>
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark">🏡</span>
          <div>
            <strong>Pagsibol Village - Northeastern Naic</strong>
            <p>PVNE · Galak na Umaasenso</p>
          </div>
        </div>
        <p>One village. One community. Built for everyone.</p>
        <div className="footer-links">
          <Link href="/map">Explore the map</Link>
          <Link href="/directory">House directory</Link>
          <Link href="/businesses">Local businesses</Link>
          <Link href="/community">Community guidelines</Link>
          <Link href="/login">Log in</Link>
          <Link href="/signup">Sign up</Link>
        </div>
        <small>Community portal concept. Sample listings and posts are illustrative and should be verified before launch.</small>
      </footer>
    </>
  );
}
