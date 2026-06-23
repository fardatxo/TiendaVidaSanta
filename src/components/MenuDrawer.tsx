"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { useLocale } from "@/context/LocaleContext";
import { getRegionLabel, getLanguageLabel, REGIONS } from "@/lib/i18n/regions";

interface CollectionNav {
  handle: string;
  title: string;
  tags: string[];
}

export default function MenuDrawer() {
  const { isMenuOpen, closeMenu, menuSearchMode, clearMenuSearchMode } = useUI();
  const { region, language, openSelector } = useLocale();
  const regionLabel = getRegionLabel(region, language);
  const languageLabel = getLanguageLabel(language, language);
  const currency = REGIONS[region]?.currency || 'EUR';
  const router = useRouter();

  const drawerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [collections, setCollections] = useState<CollectionNav[]>([]);
  const [trendingTitles, setTrendingTitles] = useState<string[]>([]);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const toggleAccordion = (name: string) => {
    setExpandedAccordion(expandedAccordion === name ? null : name);
  };

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
      setExpandedAccordion(null);
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

          {/* Categories */}
          {/* Categories */}
          <nav className="md-nav">
            {/* PRIVATE SALE */}
            <div className="md-nav-accordion-item">
              <button 
                type="button"
                className={`md-nav-item md-accordion-trigger ${expandedAccordion === 'private-sale' ? 'active' : ''}`}
                onClick={() => toggleAccordion('private-sale')}
              >
                <span>PRIVATE SALE</span>
                <span className="md-accordion-toggle-icon" />
              </button>
              <div className={`md-accordion-wrapper ${expandedAccordion === 'private-sale' ? 'open' : ''}`}>
                <div className="md-accordion-content">
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">WOMEN</p>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>READY TO WEAR</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>ACCESSORIES</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">MEN</p>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>READY TO WEAR</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>ACCESSORIES</Link>
                  </div>
                  <div className="md-accordion-group">
                    <Link href="/collection" className="md-accordion-link bold" onClick={closeMenu}>CHILDREN</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* WOMEN */}
            <div className="md-nav-accordion-item">
              <button 
                type="button"
                className={`md-nav-item md-accordion-trigger ${expandedAccordion === 'women' ? 'active' : ''}`}
                onClick={() => toggleAccordion('women')}
              >
                <span>WOMEN</span>
                <span className="md-accordion-toggle-icon" />
              </button>
              <div className={`md-accordion-wrapper ${expandedAccordion === 'women' ? 'open' : ''}`}>
                <div className="md-accordion-content">
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">COLLECTIONS</p>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>NEW ARRIVALS</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>SPRING 2026 COLLECTION</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>SUMMER 2026 COLLECTION</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>CHARMEUSE DRESSES</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>WEDDING DRESSES</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>GIFTS</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">READY TO WEAR</p>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>VIEW ALL</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>COATS & JACKETS</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>DRESSES</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>KNITWEAR</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>PANTS & SHORTS</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>SKIRTS</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>TOPS</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>T-SHIRTS & SWEATSHIRTS</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">BAGS</p>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>VIEW ALL</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>CAT BAGS</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>CATCH</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>CONFIDENT</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>COMPAGNON</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>CROSSBODY BAGS</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>TOTES & TOP HANDLE BAGS</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>MINI BAGS & CLUTCHES</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">SHOES</p>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>VIEW ALL</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>CURB</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>MIDNIGHT STEP</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>BALLERINAS</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>SANDALS & MULES</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>SNEAKERS</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>PUMPS</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">ACCESSORIES</p>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>VIEW ALL</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>JEWELRY</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>BELTS</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>SILKS & SCARVES</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>SUNGLASSES</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>HATS</Link>
                    <Link href="/collection/women" className="md-accordion-link" onClick={closeMenu}>SMALL LEATHER GOODS</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* MEN */}
            <div className="md-nav-accordion-item">
              <button 
                type="button"
                className={`md-nav-item md-accordion-trigger ${expandedAccordion === 'men' ? 'active' : ''}`}
                onClick={() => toggleAccordion('men')}
              >
                <span>MEN</span>
                <span className="md-accordion-toggle-icon" />
              </button>
              <div className={`md-accordion-wrapper ${expandedAccordion === 'men' ? 'open' : ''}`}>
                <div className="md-accordion-content">
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">COLLECTIONS</p>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>NEW ARRIVALS</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>SPRING 2026 COLLECTION</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>SUMMER 2026 COLLECTION</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>THE SNEAKERS EDIT</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>GIFTS</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">READY TO WEAR</p>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>VIEW ALL</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>COATS & JACKETS</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>KNITWEAR & POLO</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>T-SHIRTS & SWEAT-SHIRTS</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>SHIRTS & TOPS</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>PANTS & SHORTS</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">SHOES</p>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>VIEW ALL</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>CURB</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>DBB1</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>SNEAKERS</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>LOAFERS & DERBIES</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">BAGS</p>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>VIEW ALL</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">ACCESSORIES</p>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>VIEW ALL</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>SMALL LEATHER GOODS</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>BELTS</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>HATS</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>SCARVES & TIES</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>SOCKS</Link>
                    <Link href="/collection/men" className="md-accordion-link" onClick={closeMenu}>SUNGLASSES</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* CHILDREN */}
            <Link href="/collection" className="md-nav-item" onClick={closeMenu}>CHILDREN</Link>

            {/* CURB */}
            <Link href="/collection" className="md-nav-item" onClick={closeMenu}>CURB</Link>

            {/* MAISON TONET */}
            <div className="md-nav-accordion-item">
              <button 
                type="button"
                className={`md-nav-item md-accordion-trigger ${expandedAccordion === 'maison' ? 'active' : ''}`}
                onClick={() => toggleAccordion('maison')}
              >
                <span>MAISON TONET</span>
                <span className="md-accordion-toggle-icon" />
              </button>
              <div className={`md-accordion-wrapper ${expandedAccordion === 'maison' ? 'open' : ''}`}>
                <div className="md-accordion-content">
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">LA MAISON</p>
                    <Link href="/about" className="md-accordion-link" onClick={closeMenu}>TONET TORRENTINNI</Link>
                    <Link href="/about" className="md-accordion-link" onClick={closeMenu}>HISTORY OF THE HOUSE</Link>
                    <Link href="/about" className="md-accordion-link" onClick={closeMenu}>22 RUE DU FAUBOURG SAINT-HONORÉ</Link>
                    <Link href="/about" className="md-accordion-link" onClick={closeMenu}>855 MADISON AVENUE</Link>
                    <Link href="/about" className="md-accordion-link" onClick={closeMenu}>65 BOULEVARD DE LA CROISETTE</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">SHOWS</p>
                    <Link href="/collection" className="md-accordion-link" onClick={closeMenu}>WINTER 2026</Link>
                    <Link href="/collection" className="md-accordion-link" onClick={closeMenu}>SUMMER 2026</Link>
                    <Link href="/collection" className="md-accordion-link" onClick={closeMenu}>AUTUMN WINTER 2025</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">TONET LAB</p>
                    <Link href="/collection" className="md-accordion-link" onClick={closeMenu}>TONET LAB BY FUTURE</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">PROJECTS</p>
                    <Link href="/collection" className="md-accordion-link" onClick={closeMenu}>CRÉATIONS SPÉCIALES</Link>
                    <Link href="/collection" className="md-accordion-link" onClick={closeMenu}>TONET X BENJAMIN MILLEPIED</Link>
                    <Link href="/collection" className="md-accordion-link" onClick={closeMenu}>TONET ON THE RENAISSANCE WORLD TOUR</Link>
                  </div>
                  <div className="md-accordion-group">
                    <p className="md-accordion-group-title">CAMPAIGNS</p>
                    <Link href="/collection" className="md-accordion-link" onClick={closeMenu}>CHARACTER STUDIES: THE FINAL CHAPTER</Link>
                    <Link href="/collection" className="md-accordion-link" onClick={closeMenu}>CHARACTER STUDIES: MODERN HEROES</Link>
                    <Link href="/collection" className="md-accordion-link" onClick={closeMenu}>CHARACTER STUDIES: LE CHIC ULTIME</Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Corporate section */}
          <div className="md-archive-links">
            <Link href="/about" className="md-archive-link" onClick={closeMenu}>ABOUT TONET TORRENTINNI</Link>
            <Link href="/contact" className="md-archive-link" onClick={closeMenu}>CUSTOMER SERVICE</Link>
            <Link href="/stores" className="md-archive-link" onClick={closeMenu}>STORES</Link>
          </div>

          <div className="md-locale" onClick={() => { closeMenu(); openSelector(); }}>
            {`${regionLabel} / ${languageLabel} / ${currency}`}
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
          background: rgba(0, 0, 0, 0.15); /* Sober, precise tint */
          backdrop-filter: blur(2px); /* Minimal, structured blur */
          -webkit-backdrop-filter: blur(2px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.45s cubic-bezier(0.2, 1, 0.2, 1);
          z-index: 1000;
        }
        .md-backdrop.open { opacity: 1; pointer-events: auto; }

        /* ══ DRAWER CONTAINER ══ */
        .md-drawer {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          display: flex;
          flex-direction: row;
          z-index: 1001;
          transform: translateX(-100%);
          transition: transform 0.45s cubic-bezier(0.2, 1, 0.2, 1);
          border-radius: 0 !important;
        }
        .md-drawer.open { transform: translateX(0); }
        .md-drawer *,
        .md-drawer {
          border-radius: 0 !important;
        }

        /* ══ LEFT COLUMN (Main Category List) ══ */
        .md-col-left {
          width: 440px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          border-right: 1px solid rgba(0, 0, 0, 0.08); /* Fine divider */
          scrollbar-width: none;
          transition: width 0.45s cubic-bezier(0.2, 1, 0.2, 1);
        }
        .md-col-left::-webkit-scrollbar { display: none; }

        /* ══ HEADER / TOPBAR ══ */
        .md-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
          padding: 0 48px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
        }
        .md-topbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none !important;
          border: none !important;
          cursor: pointer;
          color: rgba(0, 0, 0, 0.7) !important;
          padding: 6px !important;
          transition: color 0.3s !important;
        }
        .md-topbar-btn:hover { color: #000000 !important; }
        .md-topbar-btn svg { stroke: currentColor; }

        /* ══ NAVIGATION SYSTEM ══ */
        .md-nav {
          display: flex;
          flex-direction: column;
          padding: 0;
          flex: 1;
        }
        
        /* Grid divisor lines for modular category cells */
        .md-nav-accordion-item,
        .md-nav > .md-nav-item {
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .md-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 64px;
          text-align: left;
          padding: 0 48px;
          font-family: var(--font-primary), -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.95);
          background: none !important;
          border: none !important;
          cursor: pointer;
          text-decoration: none;
          line-height: 1.2;
          letter-spacing: 0.25em !important;
          text-transform: uppercase;
          transition: color 0.3s;
        }
        .md-nav-item:hover { 
          color: #000000 !important; 
        }
        .md-nav-active { color: #000000 !important; }
        .md-nav-item:not(.md-nav-active) { color: rgba(0, 0, 0, 0.75); }
        .md-expanded .md-nav-item:not(.md-nav-active) { color: rgba(0, 0, 0, 0.45); }

        /* ══ ACCORDIONS ══ */
        .md-accordion-trigger {
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        
        /* Rotating Minimal Plus-to-Minus Icon */
        .md-accordion-toggle-icon {
          position: relative;
          width: 10px;
          height: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
          opacity: 0.55;
          transition: opacity 0.3s ease;
        }
        .md-accordion-trigger:hover .md-accordion-toggle-icon {
          opacity: 0.9;
        }
        .md-accordion-toggle-icon::before,
        .md-accordion-toggle-icon::after {
          content: '';
          position: absolute;
          background-color: currentColor;
          transition: transform 0.45s cubic-bezier(0.2, 1, 0.2, 1), opacity 0.45s ease;
        }
        .md-accordion-toggle-icon::before {
          width: 10px;
          height: 1px;
        }
        .md-accordion-toggle-icon::after {
          width: 1px;
          height: 10px;
        }
        .md-accordion-trigger.active .md-accordion-toggle-icon::after {
          transform: rotate(90deg);
          opacity: 0;
        }
        .md-accordion-trigger.active .md-accordion-toggle-icon::before {
          transform: rotate(180deg);
          background-color: #000000;
        }

        /* Smooth CSS Grid Height Wrapper */
        .md-accordion-wrapper {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.45s cubic-bezier(0.2, 1, 0.2, 1);
          overflow: hidden;
          background: #ffffff;
        }
        .md-accordion-wrapper.open {
          grid-template-rows: 1fr;
        }
        
        .md-accordion-content {
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 24px; /* Exact modular gap */
          padding: 24px 48px 24px 72px; /* 48px base + 24px exact indent */
          transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.2, 1, 0.2, 1);
          opacity: 0;
          transform: translateY(-8px);
        }
        .md-accordion-wrapper.open .md-accordion-content {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.05s;
        }

        .md-accordion-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .md-accordion-group-title {
          font-family: var(--font-primary), -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(0, 0, 0, 0.45);
          margin: 0;
        }
        .md-accordion-link {
          display: inline-block;
          font-family: var(--font-primary), -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11px;
          font-weight: 300;
          text-transform: uppercase;
          text-decoration: none;
          color: rgba(0, 0, 0, 0.5);
          letter-spacing: 0.18em;
          align-self: flex-start;
          transition: color 0.25s ease;
        }
        .md-accordion-link:hover {
          color: #000000;
        }
        .md-accordion-link.bold {
          font-weight: 500;
          color: rgba(0, 0, 0, 0.95);
        }

        /* ══ INSTITUTIONAL FOOTER ══ */
        .md-archive-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 32px 48px 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          margin-top: 32px;
        }
        .md-archive-link {
          display: block;
          font-family: var(--font-primary), -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.45);
          text-decoration: none;
          transition: color 0.3s;
          padding: 2px 0;
        }
        .md-archive-link:hover { color: #000000 !important; }

        /* Closed modular box for locale module */
        .md-locale {
          margin: 16px 48px 48px;
          height: 48px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-primary), -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.45);
          cursor: pointer;
          transition: color 0.3s, background-color 0.3s;
        }
        .md-locale:hover {
          color: #000000;
          background-color: rgba(0, 0, 0, 0.02);
        }

        /* ══ RIGHT COLUMN (Search & Tags Panel) ══ */
        .md-col-right {
          width: 0;
          overflow: hidden;
          background: #ffffff;
          transition: width 0.45s cubic-bezier(0.2, 1, 0.2, 1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .md-col-right::-webkit-scrollbar { display: none; }
        .md-col-right-open {
          width: 440px;
          border-left: 1px solid rgba(0, 0, 0, 0.08);
        }

        /* ══ SEARCH PANEL ══ */
        .md-search-form { padding: 32px 48px 20px; }
        .md-search-input {
          width: 100%;
          padding: 12px 0;
          font-family: var(--font-primary), -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: #000000;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.8);
          outline: none;
        }
        .md-search-input::placeholder {
          color: rgba(0, 0, 0, 0.35);
          letter-spacing: 0.08em;
        }
        .md-search-popular-title {
          padding: 24px 48px 12px;
          font-family: var(--font-primary), -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.35);
          margin: 0;
        }
        .md-search-tag {
          display: block;
          width: 100%;
          text-align: left;
          background: none !important;
          border: none !important;
          cursor: pointer;
          font-family: var(--font-primary), -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.5);
          padding: 10px 48px;
          line-height: 1.5;
          transition: color 0.3s;
        }
        .md-search-tag:hover { color: #000000 !important; }

        /* ══ SUB-COLLECTION PANEL ══ */
        .md-sub-title {
          font-family: var(--font-primary), -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.95);
          padding: 32px 48px 20px;
          margin: 0;
        }
        .md-sub-nav { display: flex; flex-direction: column; }
        .md-sub-item {
          display: block;
          padding: 10px 48px;
          font-family: var(--font-primary), -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.5);
          text-decoration: none;
          line-height: 1.5;
          transition: color 0.3s;
        }
        .md-sub-item:hover { color: #000000 !important; }

        /* ══ BACK BUTTON ══ */
        .md-back-btn {
          display: none;
          align-items: center;
          padding: 24px 48px 8px;
          background: none !important;
          border: none !important;
          cursor: pointer;
          color: rgba(0, 0, 0, 0.5) !important;
          transition: color 0.3s !important;
        }
        .md-back-btn:hover { color: #000000 !important; }
        .md-back-btn svg { stroke: currentColor; }

        /* ══ MOBILE ADAPTABILITY ══ */
        @media (max-width: 767px) {
          .md-backdrop { display: none; }
          .md-drawer { width: 100vw; overflow: hidden; }
          .md-col-left {
            width: 100vw;
            border-right: none;
            position: absolute;
            top: 0; left: 0; bottom: 0;
            transform: translateX(0);
            transition: transform 0.45s cubic-bezier(0.2, 1, 0.2, 1);
          }
          .md-col-left-hidden-mobile { transform: translateX(-100%); pointer-events: none; }
          .md-col-right {
            width: 100vw;
            position: absolute;
            top: 0; left: 0; bottom: 0;
            transform: translateX(100%);
            overflow-y: auto;
            border-left: none;
            transition: transform 0.45s cubic-bezier(0.2, 1, 0.2, 1);
            pointer-events: none;
          }
          .md-col-right-open { transform: translateX(0); pointer-events: auto; border-left: none; }
          
          .md-back-btn { display: flex; padding: 20px 24px 8px; }
          .md-topbar { padding: 0 24px; height: 56px; }
          .md-nav-item { padding: 0 24px; height: 56px; }
          .md-accordion-content { padding: 20px 24px 20px 48px; gap: 20px; }
          .md-archive-links { padding: 24px 24px 12px; margin-top: 24px; }
          .md-locale { margin: 16px 24px 24px; height: 48px; }
          
          .md-search-form { padding: 24px 24px 16px; }
          .md-search-popular-title { padding: 20px 24px 10px; }
          .md-search-tag { padding: 8px 24px; }
          .md-sub-title { padding: 24px 24px 16px; }
          .md-sub-item { padding: 8px 24px; }
          
          /* Touch states */
          .md-nav-item:active,
          .md-archive-link:active,
          .md-sub-item:active,
          .md-search-tag:active {
            background-color: rgba(0, 0, 0, 0.02) !important;
            color: #000000 !important;
          }
        }
      `}</style>
    </>
  );
}
