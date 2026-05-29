"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";

interface CollectionNav {
  handle: string;
  title: string;
  tags: string[];
}

export default function MenuDrawer() {
  const { isMenuOpen, closeMenu, menuSearchMode, clearMenuSearchMode } = useUI();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [collections, setCollections] = useState<CollectionNav[]>([]);
  const [trendingTitles, setTrendingTitles] = useState<string[]>([]);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const rightPanelOpen = activeHandle !== null || searchOpen;

  const openSearchPanel = useCallback(() => {
    setActiveHandle(null);
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const closeRightPanel = useCallback(() => {
    setActiveHandle(null);
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    closeMenu();
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSearchTag = (term: string) => {
    closeMenu();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  // Fetch top 3 products for trending searches
  useEffect(() => {
    if (trendingTitles.length > 0) return;
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
    if (!domain || !token) return;
    fetch(`https://${domain}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
      body: JSON.stringify({ query: `{ products(first: 3, sortKey: BEST_SELLING) { edges { node { title } } } }` }),
    })
      .then(r => r.json())
      .then(d => {
        const titles: string[] = (d.data?.products?.edges ?? []).map((e: any) => e.node.title as string);
        if (titles.length > 0) setTrendingTitles(titles);
      })
      .catch(() => {});
  }, [trendingTitles.length]);

  // Fetch collections + their product tags
  useEffect(() => {
    if (!isMenuOpen || collections.length > 0) return;
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
    if (!domain || !token) return;
    fetch(`https://${domain}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
      body: JSON.stringify({
        query: `{
          collections(first: 20) {
            edges {
              node {
                handle
                title
                products(first: 30) {
                  edges { node { tags } }
                }
              }
            }
          }
        }`
      }),
    })
      .then(r => r.json())
      .then(d => {
        const cols: CollectionNav[] = (d.data?.collections?.edges ?? []).map((e: any) => {
          const allTags: string[] = [];
          (e.node.products?.edges ?? []).forEach((pe: any) => {
            (pe.node.tags ?? []).forEach((t: string) => {
              if (!allTags.includes(t)) allTags.push(t);
            });
          });
          return { handle: e.node.handle, title: e.node.title, tags: allTags };
        });
        setCollections(cols);
      })
      .catch(() => {});
  }, [isMenuOpen, collections.length]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) closeMenu();
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClick);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, closeMenu]);

  // Reset panels when closing
  useEffect(() => {
    if (!isMenuOpen) {
      setActiveHandle(null);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }, [isMenuOpen]);

  // Auto-open search panel when triggered from header
  useEffect(() => {
    if (isMenuOpen && menuSearchMode) {
      setActiveHandle(null);
      setSearchOpen(true);
      clearMenuSearchMode();
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [isMenuOpen, menuSearchMode, clearMenuSearchMode]);

  const activeCol = collections.find(c => c.handle === activeHandle);

  return (
    <>
      <div className={`md-backdrop ${isMenuOpen ? "open" : ""}`} aria-hidden="true" />

      <div className={`md-drawer ${isMenuOpen ? "open" : ""} ${rightPanelOpen ? "md-expanded" : ""}`} ref={drawerRef} role="dialog" aria-modal="true">

        {/* ── LEFT COLUMN (main nav) ── */}
        <div className={`md-col-left ${rightPanelOpen ? 'md-col-left-hidden-mobile' : ''}`}>
          {/* Top bar: search + close */}
          <div className="md-topbar">
            <button className="md-topbar-btn" onClick={openSearchPanel} aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
            <button className="md-topbar-btn" onClick={closeMenu} aria-label="Close menu">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Collections */}
          <p className="md-nav-eyebrow">Navigate</p>
          <nav className="md-nav">
            {collections.map(c => (
              <button
                key={c.handle}
                className={`md-nav-item ${activeHandle === c.handle ? 'md-nav-active' : ''}`}
                onClick={() => { setSearchOpen(false); setActiveHandle(activeHandle === c.handle ? null : c.handle); }}
              >
                {c.title}
              </button>
            ))}
          </nav>

          {/* Archive section */}
          <p className="md-nav-eyebrow md-archive-eyebrow">Archive</p>
          <div className="md-archive-links">
            <Link href="/archive" className="md-archive-link" onClick={closeMenu}>Personal Archive</Link>
            <Link href="/archive?tab=acquisitions" className="md-archive-link" onClick={closeMenu}>Past Acquisitions</Link>
            <Link href="/archive?tab=requests" className="md-archive-link" onClick={closeMenu}>Availability Requests</Link>
          </div>

          {/* Bottom links */}
          <div className="md-bottom-links">
            <Link href="/stores" className="md-bottom-link" onClick={closeMenu}>Stores</Link>
            <Link href="/product/e-gift-card" className="md-bottom-link" onClick={closeMenu}>Gift cards</Link>
          </div>

          <div className="md-locale">
            Spain | English
          </div>
        </div>

        {/* ── RIGHT COLUMN (tags or search) ── */}
        <div className={`md-col-right ${rightPanelOpen ? 'md-col-right-open' : ''}`}>
          {/* Search panel */}
          {searchOpen && (
            <>
              <button className="md-back-btn" onClick={closeRightPanel}>
                <ArrowLeft size={18} strokeWidth={1.4} />
              </button>
              <h3 className="md-sub-title">Search</h3>
              <form className="md-search-form" onSubmit={handleSearchSubmit}>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="md-search-input"
                  placeholder="Search the Collection…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </form>
              <p className="md-search-popular-title">House Selection</p>
              <nav className="md-sub-nav">
                {(trendingTitles.length > 0 ? trendingTitles : ['Hoodie', 'T-Shirt', 'Trousers']).map(term => (
                  <button key={term} className="md-sub-item md-search-tag" onClick={() => handleSearchTag(term)}>
                    {term.charAt(0).toUpperCase() + term.slice(1).toLowerCase()}
                  </button>
                ))}
              </nav>
            </>
          )}
          {/* Collection tags panel */}
          {activeCol && !searchOpen && (
            <>
              <button className="md-back-btn" onClick={closeRightPanel}>
                <ArrowLeft size={18} strokeWidth={1.4} />
              </button>
              <h3 className="md-sub-title">{activeCol.title}</h3>
              <nav className="md-sub-nav">
                {activeCol.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/collection/${activeCol.handle}?tag=${encodeURIComponent(tag)}`}
                    className="md-sub-item"
                    onClick={closeMenu}
                  >
                    {tag}
                  </Link>
                ))}
              </nav>
            </>
          )}
        </div>
      </div>

      <style>{`
        /* ══ BACKDROP ══ */
        .md-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1000;
        }
        .md-backdrop.open { opacity: 1; pointer-events: auto; }

        /* ══ DRAWER ══ */
        .md-drawer {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          display: flex;
          flex-direction: row;
          z-index: 1001;
          transform: translateX(-100%);
          transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .md-drawer.open { transform: translateX(0); }

        /* ══ LEFT COLUMN ══ */
        .md-col-left {
          width: 320px;
          background: #0c0c0c;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          border-right: 1px solid rgba(255,255,255,0.04);
          scrollbar-width: none;
        }
        .md-col-left::-webkit-scrollbar { display: none; }

        .md-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
        }
        .md-topbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none !important;
          border: none !important;
          cursor: pointer;
          color: rgba(255,255,255,0.35) !important;
          transform: none !important;
          border-radius: 0 !important;
          padding: 6px !important;
          transition: color 0.5s !important;
        }
        .md-topbar-btn:hover { color: rgba(255,255,255,0.75) !important; opacity: 1 !important; }
        .md-topbar-btn svg { stroke: currentColor; }

        /* Nav eyebrow */
        .md-nav-eyebrow {
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.13);
          padding: 40px 40px 14px;
          margin: 0;
        }

        .md-nav {
          display: flex;
          flex-direction: column;
          padding: 0 0 48px;
          flex: 1;
        }
        .md-nav-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 11px 40px;
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          color: rgba(255,255,255,0.52);
          background: none !important;
          border: none !important;
          cursor: pointer;
          text-decoration: none;
          line-height: 1.5;
          letter-spacing: 0.32em !important;
          text-transform: uppercase;
          border-radius: 0 !important;
          transform: none !important;
          transition: color 0.5s;
        }
        .md-nav-item:hover { color: rgba(255,255,255,0.9) !important; opacity: 1 !important; }
        .md-nav-active { color: rgba(255,255,255,0.88) !important; font-weight: 300; }
        .md-nav-item:not(.md-nav-active) { color: rgba(255,255,255,0.52); }
        .md-expanded .md-nav-item:not(.md-nav-active) { color: rgba(255,255,255,0.18); }

        .md-archive-eyebrow { padding-top: 16px !important; }
        .md-archive-links {
          display: flex;
          flex-direction: column;
          padding: 0 0 24px;
        }
        .md-archive-link {
          display: block;
          padding: 9px 40px;
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.32);
          text-decoration: none;
          transition: color 0.5s;
        }
        .md-archive-link:hover { color: rgba(255,255,255,0.7) !important; }

        .md-bottom-links {
          display: flex;
          flex-direction: column;
          padding: 20px 0;
          border-top: 1px solid rgba(255,255,255,0.04);
          margin-top: auto;
        }
        .md-bottom-link {
          display: block;
          padding: 6px 40px;
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.16);
          text-decoration: none;
          transition: color 0.5s;
        }
        .md-bottom-link:hover { color: rgba(255,255,255,0.5) !important; opacity: 1 !important; }

        .md-locale {
          padding: 10px 40px 28px;
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.08);
        }

        /* ══ RIGHT COLUMN ══ */
        .md-col-right {
          width: 0;
          overflow: hidden;
          background: #0e0e0e;
          transition: width 0.55s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .md-col-right::-webkit-scrollbar { display: none; }
        .md-col-right-open {
          width: 300px;
          border-left: 1px solid rgba(255,255,255,0.04);
        }

        /* ══ SEARCH ══ */
        .md-search-form { padding: 52px 40px 20px; }
        .md-search-input {
          width: 100%;
          padding: 12px 0;
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.82);
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          border-radius: 0;
          outline: none;
          transition: border-color 0.55s;
        }
        .md-search-input:focus { border-bottom-color: rgba(255,255,255,0.45); }
        .md-search-input::placeholder {
          color: rgba(255,255,255,0.18);
          letter-spacing: 0.15em;
        }
        .md-search-popular-title {
          padding: 32px 40px 14px;
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.13);
          margin: 0;
        }
        .md-search-tag {
          display: block;
          width: 100%;
          text-align: left;
          background: none !important;
          border: none !important;
          cursor: pointer;
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.42);
          padding: 10px 40px;
          line-height: 1.5;
          border-radius: 0 !important;
          transform: none !important;
          transition: color 0.5s;
        }
        .md-search-tag:hover { color: rgba(255,255,255,0.88) !important; opacity: 1 !important; }

        /* ══ COLLECTION PANEL ══ */
        .md-sub-title {
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.16);
          padding: 52px 40px 24px;
          margin: 0;
        }
        .md-sub-nav { display: flex; flex-direction: column; }
        .md-sub-item {
          display: block;
          padding: 10px 40px;
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.42);
          text-decoration: none;
          line-height: 1.5;
          transition: color 0.5s;
        }
        .md-sub-item:hover { color: rgba(255,255,255,0.88) !important; opacity: 1 !important; }

        /* ══ BACK BUTTON ══ */
        .md-back-btn {
          display: none;
          align-items: center;
          padding: 28px 40px 8px;
          background: none !important;
          border: none !important;
          cursor: pointer;
          color: rgba(255,255,255,0.22) !important;
          transform: none !important;
          border-radius: 0 !important;
          transition: color 0.5s !important;
        }
        .md-back-btn:hover { color: rgba(255,255,255,0.6) !important; opacity: 1 !important; }
        .md-back-btn svg { stroke: currentColor; }

        /* ══ MOBILE ══ */
        @media (max-width: 767px) {
          .md-backdrop { display: none; }
          .md-drawer { width: 100vw; overflow: hidden; }
          .md-col-left {
            width: 100vw;
            border-right: none;
            position: absolute;
            top: 0; left: 0; bottom: 0;
            transform: translateX(0);
            transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .md-col-left-hidden-mobile { transform: translateX(-100%); pointer-events: none; }
          .md-col-right {
            width: 100vw;
            position: absolute;
            top: 0; left: 0; bottom: 0;
            transform: translateX(100%);
            overflow-y: auto;
            border-left: none;
            transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
          }
          .md-col-right-open { transform: translateX(0); pointer-events: auto; border-left: none; }
          .md-back-btn { display: flex; }
          .md-nav-eyebrow { padding: 32px 28px 12px; }
          .md-nav-item { padding: 11px 28px; }
          .md-topbar { padding: 24px 28px; }
          .md-bottom-link { padding: 6px 28px; }
          .md-locale { padding: 10px 28px 28px; }
          .md-search-form { padding: 48px 28px 20px; }
          .md-search-popular-title { padding: 28px 28px 14px; }
          .md-search-tag { padding: 10px 28px; }
          .md-sub-title { padding: 48px 28px 20px; }
          .md-sub-item { padding: 10px 28px; }
          .md-back-btn { padding: 28px 28px 8px; }
          .md-archive-link { padding: 9px 28px; }
        }
      `}</style>
    </>
  );
}
