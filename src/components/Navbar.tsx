"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Menu, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/lib/i18n";

export default function Navbar() {
  const { openCart, openMenuWithSearch, openMenu, closeMenu } = useUI();
  const { cartCount } = useCart();
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === "/";
  const isFashion = pathname === "/fashion";
  const isProduct = pathname.startsWith("/product/");
  const isCollection = pathname.startsWith("/collection");
  const hasSubnav = isProduct || isCollection;

  // Hide navbar completely on the landing page
  if (isHome) {
    return null;
  }

  const [collections, setCollections] = useState<{handle: string; title: string}[]>([]);
  useEffect(() => {
    if (!hasSubnav) return;
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
    if (!domain || !token) return;
    fetch(`https://${domain}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
      body: JSON.stringify({ query: '{ collections(first: 10) { edges { node { handle title } } } }' }),
    })
      .then(r => r.json())
      .then(d => setCollections(d.data?.collections?.edges?.map((e: any) => ({ handle: e.node.handle, title: e.node.title })) ?? []))
      .catch(() => {});
  }, [hasSubnav]);

  const currentCollectionHandle = isCollection ? pathname.split('/collection/')[1]?.split('/')[0] : '';
  const [subnavOpen, setSubnavOpen] = useState(false);
  const currentCollection = collections.find(c => c.handle === currentCollectionHandle);

  const [hasBanner, setHasBanner] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("announcement-dismissed") === "true";
    if (dismissed) {
      setHasBanner(false);
    }
    const handleDismiss = () => {
      setHasBanner(false);
    };
    window.addEventListener("announcement-dismissed", handleDismiss);
    return () => window.removeEventListener("announcement-dismissed", handleDismiss);
  }, []);

  const BANNER_H = hasBanner ? 32 : 0;

  // Smart header: hide on scroll down, show solid on scroll up
  const [headerVisible, setHeaderVisible] = useState(true);
  const [navTop, setNavTop] = useState(BANNER_H);

  useEffect(() => {
    setNavTop(BANNER_H);
  }, [BANNER_H]);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      setHeaderVisible(true);
      setNavTop(Math.max(0, BANNER_H - y));
      lastScrollY.current = y;
      ticking.current = false;
    });
  }, [BANNER_H]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Body padding: always pad body to accommodate the header height (44px) + banner
  useEffect(() => {
    const body = document.body;
    const headerHeight = 44;
    const pad = headerHeight + BANNER_H;
    body.style.paddingTop = `${pad}px`;
    return () => { body.style.paddingTop = "48px"; };
  }, [BANNER_H]);

  return (
    <>
      <header className={`acne-header ${isFashion ? 'transparent-mode' : 'solid'} ${!headerVisible ? "header-hidden" : ""}`} style={{top: `${navTop}px`}}>
        <div className="acne-header-inner">
          {/* LEFT: Back button (on mobile product page) / Menu trigger (on other mobile pages) + Nav links (desktop) */}
          <div className="acne-nav-left">
            {isProduct ? (
              <button className="acne-mob-icon acne-mobile-only" aria-label="Back" onClick={() => window.history.back()}>
                <span style={{ fontSize: '18px', fontWeight: 300, color: 'inherit' }}>&lt;</span>
              </button>
            ) : (
              <button className="acne-mob-icon acne-mobile-only" aria-label="Menu" onClick={openMenu}>
                <Menu size={18} strokeWidth={1} />
              </button>
            )}
            <nav className="acne-nav-links acne-desktop-only">
              <Link href="/collection" onClick={closeMenu}>women</Link>
              <Link href="/collection" onClick={closeMenu}>men</Link>
              <button className="acne-search-text-btn" onClick={openMenuWithSearch}>buscar</button>
            </nav>
          </div>

          <Link href="/" className="acne-logo">
            <span className="acne-logo-text">tonet</span>
          </Link>

          {/* RIGHT: Desktop links (Info, Account) + Mobile/Desktop search/bag icons */}
          <div className="acne-nav-right">
            <div className="acne-right-icons">
              {/* Help icon (desktop only) */}
              <Link href="/about" className="acne-right-icon acne-desktop-only" aria-label="Help">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </Link>
              
              {/* Account icon (desktop only) */}
              <Link href="/account" className="acne-right-icon acne-desktop-only" aria-label="Account">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>

              {/* Search icon (mobile only) */}
              <button className="acne-right-icon acne-mobile-only" aria-label="Search" onClick={openMenuWithSearch}>
                <svg width="18" height="18" viewBox="-1 -1 19 19" fill="none" stroke="currentColor" strokeWidth="0.7">
                  <path d="M16.604 15.868l-5.173-5.173c0.975-1.137 1.569-2.611 1.569-4.223 0-3.584-2.916-6.5-6.5-6.5-1.736 0-3.369 0.676-4.598 1.903-1.227 1.228-1.903 2.861-1.902 4.597 0 3.584 2.916 6.5 6.5 6.5 1.612 0 3.087-0.594 4.224-1.569l5.173 5.173 0.707-0.708zM6.5 11.972c-3.032 0-5.5-2.467-5.5-5.5-0.001-1.47 0.571-2.851 1.61-3.889 1.038-1.039 2.42-1.611 3.89-1.611 3.032 0 5.5 2.467 5.5 5.5 0 3.032-2.468 5.5-5.5 5.5z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Cart icon (both) */}
              <button className="acne-right-icon" onClick={openCart} aria-label="Open bag">
                <div className="cart-icon-wrap">
                  <svg width="18" height="18" viewBox="3 2 18 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
                    <path fillRule="evenodd" clipRule="evenodd" d="M17 6.99998C16.4067 4.69999 14.3267 3 11.84 3C9.35334 3 7.27334 4.69999 6.68 6.99998H3V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V6.99998H17ZM15.6067 6.99998C15.06 5.44666 13.58 4.33333 11.84 4.33333C10.1 4.33333 8.62001 5.44666 8.07334 6.99998H15.6067Z" fill="none"/>
                  </svg>
                  {cartCount > 0 && <span className="cart-badge"></span>}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <style>{`
        /* ══ BASE ══ */
        .acne-header {
          position: fixed;
          top: 0;
          left: 0; right: 0;
          z-index: 500;
          background: #ffffff;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          transition: transform 0.45s ease;
        }
        .acne-header.header-hidden { transform: translateY(-100%); }

        /* ══ ALL STATES: black text ══ */
        .acne-header .acne-nav-links a,
        .acne-header .acne-search-text-btn,
        .acne-header .acne-mob-icon,
        .acne-header .acne-right-icon,
        .acne-header .acne-logo-text { color: rgba(0, 0, 0, 0.85); }
        .acne-header svg { stroke: rgba(0, 0, 0, 0.85); }
        .acne-header .cart-badge { background: rgba(0, 0, 0, 0.65); }

        /* Transparent mode (fashion page) */
        .acne-header.transparent-mode {
          background: transparent;
          border-bottom: none;
        }
        .acne-header.transparent-mode .acne-nav-links a,
        .acne-header.transparent-mode .acne-search-text-btn,
        .acne-header.transparent-mode .acne-mob-icon,
        .acne-header.transparent-mode .acne-right-icon,
        .acne-header.transparent-mode .acne-logo-text { color: rgba(255, 255, 255, 0.9); }
        .acne-header.transparent-mode svg { stroke: rgba(255, 255, 255, 0.9); }
        .acne-header.transparent-mode .cart-badge { background: rgba(255, 255, 255, 0.8); }

        /* ══ LAYOUT ══ */
        .acne-header-inner {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 44px;
          padding: 0 40px;
        }

        /* ══ LOGO ══ */
        .acne-logo {
          grid-column: 2;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .acne-logo-text {
          font-family: var(--font-primary), 'Helvetica Neue', Arial, sans-serif;
          font-size: 25px;
          font-weight: 700;
          letter-spacing: -0.03em;
          padding-right: 0;
          color: rgba(0, 0, 0, 0.85);
          text-transform: lowercase;
          line-height: 1;
          transition: opacity 0.6s;
        }
        .acne-logo:hover .acne-logo-text { opacity: 0.38; }

        /* ══ LEFT NAV ══ */
        .acne-nav-left {
          grid-column: 1;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }
        .acne-nav-links { display: flex; align-items: center; gap: 36px; }
        .acne-nav-links a,
        .acne-search-text-btn {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          text-transform: lowercase;
          text-decoration: none;
          color: rgba(0, 0, 0, 0.85);
          letter-spacing: 0.08em;
          line-height: 1;
          white-space: nowrap;
          transition: opacity 0.6s;
          background: none;
          border: none;
          outline: none;
          cursor: pointer;
          padding: 0;
        }
        .acne-nav-links a:hover,
        .acne-search-text-btn:hover { opacity: 0.32; }
        .acne-mobile-only { display: flex; }
        .acne-desktop-only { display: none; }

        /* ══ RIGHT ICONS ══ */
        .acne-nav-right {
          grid-column: 3;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .acne-right-icons { display: flex; align-items: center; gap: 2px; }
        .acne-right-icon {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 44px;
          background: none; border: none;
          cursor: pointer;
          color: rgba(0, 0, 0, 0.85);
          text-decoration: none;
          padding: 0;
          transition: opacity 0.6s;
        }
        .acne-right-icon:hover { opacity: 0.32; }
        .acne-right-icon svg { stroke: rgba(0, 0, 0, 0.85); }

        /* ══ CART ══ */
        .cart-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ══ MOB ICON ══ */
        .acne-mob-icon {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 44px;
          background: none; border: none;
          cursor: pointer;
          color: rgba(0, 0, 0, 0.85);
          padding: 0;
          transition: opacity 0.6s;
        }
        .acne-mob-icon:hover { opacity: 0.32; }
        .acne-mobile-left { display: flex; align-items: center; }

        /* ══ DESKTOP ══ */
        @media (min-width: 768px) {
          .acne-mobile-only { display: none !important; }
          .acne-desktop-only { display: flex !important; }
          .acne-header-inner { padding: 0 64px; }
        }

        /* ══ MOBILE ══ */
        @media (max-width: 767px) {
          .acne-header-inner { padding: 0 20px; height: 40px; }
          .acne-logo-text { font-size: 22px; letter-spacing: -0.03em; font-weight: 700; padding-right: 0; }
          .acne-mob-icon { width: 32px; height: 40px; }
          .acne-right-icon { width: 32px; height: 40px; }
        }
      `}</style>
    </>
  );
}
