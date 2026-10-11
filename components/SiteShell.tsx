"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Building2,
  ChevronDown,
  House,
  LogOut,
  Map,
  Menu,
  MessageCircle,
  Search,
  Store,
  UserRound,
  X,
} from "lucide-react";

type CurrentUser = {
  id: string;
  name: string;
  email?: string;
  role?: string;
} | null;

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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const showBack = pathname !== "/";

  const loadCurrentUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setCurrentUser(null);
        return;
      }
      const data = await response.json();
      setCurrentUser(data.user ?? null);
    } catch {
      setCurrentUser(null);
    } finally {
      setAuthLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser, pathname]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountMenuOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setCurrentUser(null);
      setAccountMenuOpen(false);
      setMenuOpen(false);
      setLoggingOut(false);
      router.replace("/");
      router.refresh();
    }
  }

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
            <Link href={href} key={href} className={isNavActive(pathname, href) ? "active" : undefined} aria-current={isNavActive(pathname, href) ? "page" : undefined}>
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

          {authLoaded && currentUser ? (
            <div className="account-menu-wrap" ref={accountMenuRef} style={{ position: "relative" }}>
              <button
                type="button"
                className="header-login account-menu-trigger"
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                onClick={() => setAccountMenuOpen((open) => !open)}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, maxWidth: 190 }}
              >
                <span className="account-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentUser.name}
                </span>
                <ChevronDown size={15} />
              </button>
              {accountMenuOpen && (
                <div
                  className="account-dropdown"
                  role="menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    zIndex: 1000,
                    width: 210,
                    padding: 6,
                    background: "#ffffff",
                    border: "1px solid #e1e8e0",
                    borderRadius: 12,
                    boxShadow: "0 12px 32px rgba(15, 35, 23, 0.14)",
                  }}
                >
                  <div style={{ padding: "10px 11px 12px", borderBottom: "1px solid #edf0ec", marginBottom: 5 }}>
                    <strong style={{ display: "block", fontSize: 13, color: "#1d3325" }}>{currentUser.name}</strong>
                    {currentUser.email && <small style={{ display: "block", marginTop: 3, fontSize: 11, color: "#68766c", overflowWrap: "anywhere" }}>{currentUser.email}</small>}
                  </div>
                  <Link role="menuitem" href="/profile" className="account-dropdown-link" onClick={() => setAccountMenuOpen(false)} style={accountLinkStyle}>
                    <UserRound size={16} /> My Profile
                  </Link>
                  <Link role="menuitem" href="/my-house" className="account-dropdown-link" onClick={() => setAccountMenuOpen(false)} style={accountLinkStyle}>
                    <House size={16} /> My House
                  </Link>
                  <Link role="menuitem" href="/my-business" className="account-dropdown-link" onClick={() => setAccountMenuOpen(false)} style={accountLinkStyle}>
                    <Store size={16} /> My Business
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void logout()}
                    disabled={loggingOut}
                    className="account-dropdown-link"
                    style={{ ...accountLinkStyle, width: "100%", border: 0, borderTop: "1px solid #edf0ec", marginTop: 5, paddingTop: 11, color: "#a13d36", background: "transparent", cursor: loggingOut ? "wait" : "pointer" }}
                  >
                    <LogOut size={16} /> {loggingOut ? "Logging out…" : "Log Out"}
                  </button>
                </div>
              )}
            </div>
          ) : authLoaded ? (
            <div className="header-auth-links">
              <Link href="/login" className="header-login"><UserRound size={15} />Log in</Link>
              <Link href="/signup" className="header-signup">Sign up</Link>
            </div>
          ) : (
            <div className="header-auth-links" aria-label="Checking sign-in status" style={{ minWidth: 100, minHeight: 36 }} />
          )}

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
            <Link href={href} key={href} className={isNavActive(pathname || "/", href) ? "active" : undefined} aria-current={isNavActive(pathname || "/", href) ? "page" : undefined} onClick={() => setMenuOpen(false)}>
              <Icon size={17} />
              {label}
            </Link>
          ))}
          <Link href="/community/chat" onClick={() => setMenuOpen(false)}><MessageCircle size={17} />General chat</Link>
          {currentUser ? (
            <>
              <div style={{ padding: "12px 10px 6px", fontWeight: 700 }}>{currentUser.name}</div>
              <Link href="/profile" onClick={() => setMenuOpen(false)}><UserRound size={17} />My Profile</Link>
              <Link href="/my-house" onClick={() => setMenuOpen(false)}><House size={17} />My House</Link>
              <Link href="/my-business" onClick={() => setMenuOpen(false)}><Store size={17} />My Business</Link>
              <button type="button" onClick={() => void logout()} disabled={loggingOut} style={{ ...accountLinkStyle, width: "100%", border: 0, background: "transparent", color: "#a13d36" }}><LogOut size={17} />{loggingOut ? "Logging out…" : "Log Out"}</button>
            </>
          ) : authLoaded ? (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}><UserRound size={17} />Log in</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}><UserRound size={17} />Sign up</Link>
            </>
          ) : null}
        </nav>
      )}

      <nav className="mobile-nav" aria-label="Main navigation">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link href={href} key={href} className={isNavActive(pathname || "/", href) ? "active" : undefined} aria-current={isNavActive(pathname || "/", href) ? "page" : undefined}>
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <style jsx>{`
        .desktop-nav a.active, .mobile-nav a.active, .mobile-dropdown a.active {
          background: #e7f2e8;
          color: #245c38;
          font-weight: 700;
        }
        .desktop-nav a.active, .mobile-nav a.active { border-radius: 10px; }
      `}</style>
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

const accountLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  padding: "10px 11px",
  borderRadius: 8,
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 500,
  color: "#2b4634",
  textAlign: "left",
};
