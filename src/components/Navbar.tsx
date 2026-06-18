"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Menu, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/lib/i18n";
import { useWishlist } from "@/context/WishlistContext";

const logoFonts = [
  { family: "'Coolvetica Condensed', sans-serif", weight: "normal" },
  { family: "'Saint Carell', sans-serif", weight: "normal" },
  { family: "'Creato Display', sans-serif", weight: "bold" },
  { family: "var(--font-cormorant), serif", weight: "300" }
];

export default function Navbar() {
  const { openCart, openSearch, openMenu, closeMenu, isSearchOpen, openAccount } = useUI();
  const { cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const [currentFont, setCurrentFont] = useState(logoFonts[0]);

  useEffect(() => {
    const randomFont = logoFonts[Math.floor(Math.random() * logoFonts.length)];
    setCurrentFont(randomFont);
  }, [pathname]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const randomFont = logoFonts[Math.floor(Math.random() * logoFonts.length)];
        setCurrentFont(randomFont);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const isHome = pathname === "/";
  const isProduct = pathname.startsWith("/product/");
  const isCollection = pathname.startsWith("/collection");
  const hasSubnav = isProduct || isCollection;

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
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    setNavTop(BANNER_H);
    setIsAtTop(window.scrollY < 10);
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
      setIsAtTop(y < 10);
      lastScrollY.current = y;
      ticking.current = false;
    });
  }, [BANNER_H]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const [headerHeight, setHeaderHeight] = useState(64);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHeaderHeight(window.innerWidth < 768 ? 54 : 64);
    }
  }, []);

  // Body padding: always pad body to accommodate the header height + banner (0 on homepage/product page for transparent overlay)
  useEffect(() => {
    const body = document.body;
    const pad = (isHome || isProduct) ? 0 : (headerHeight + BANNER_H);
    body.style.paddingTop = `${pad}px`;
    return () => { body.style.paddingTop = "48px"; };
  }, [BANNER_H, isHome, isProduct, headerHeight]);

  return (
    <>
      <header 
        className={`acne-header ${isHome ? "transparent-home" : isProduct ? (isAtTop ? "transparent-pdp" : "solid") : "solid"} ${!headerVisible ? "header-hidden" : ""} ${isSearchOpen ? "search-active" : ""}`} 
        style={{top: `${navTop}px`}}
      >
        <div className="acne-header-inner">
          {/* LEFT: Menu trigger + Search trigger */}
          <div className="acne-nav-left">
            <button className="acne-right-icon" aria-label="Menu" onClick={openMenu}>
              <Menu size={18} strokeWidth={1} />
            </button>
            <button className="acne-right-icon" aria-label="Search" onClick={openSearch}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>

          {/* CENTER: Logo */}
          <Link href="/" className="acne-logo">
            <span 
              className="acne-logo-text acne-logo-desktop"
              style={{ fontFamily: currentFont.family, fontWeight: currentFont.weight }}
            >
              TONET TORRENTINNI
            </span>
            <span 
              className="acne-logo-text acne-logo-mobile"
              style={{ fontFamily: currentFont.family, fontWeight: currentFont.weight }}
            >
              TONET
            </span>
          </Link>

          {/* RIGHT: Account, Bookmark, Bag */}
          <div className="acne-nav-right">
            <div className="acne-right-icons">
              {/* Account icon */}
              <button onClick={openAccount} className="acne-right-icon" aria-label="Account">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>

              {/* Wishlist icon (Bookmark ribbon style) */}
              <Link href="/wishlist" className="acne-right-icon acne-wishlist-icon" aria-label="Wishlist">
                <div className="wishlist-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  {wishlistItems.length > 0 && <span className="wishlist-badge"></span>}
                </div>
              </Link>

              {/* Cart icon */}
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
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          transition: transform 0.45s ease, background-color 0.35s ease, border-color 0.35s ease;
        }
        .acne-header.transparent-home {
          background: transparent;
          border-bottom: 1px solid transparent;
        }
        .acne-header.transparent-pdp {
          background: transparent;
          border-bottom: 1px solid transparent;
        }
        .acne-header.header-hidden { transform: translateY(-100%); }

        @media (min-width: 768px) {
          .acne-header.search-active {
            background-color: transparent !important;
            border-bottom-color: transparent !important;
            pointer-events: none;
          }
          .acne-header.search-active .acne-nav-left,
          .acne-header.search-active .acne-logo,
          .acne-header.search-active .acne-nav-right {
            opacity: 0;
            pointer-events: none;
          }
          .acne-nav-left,
          .acne-logo,
          .acne-nav-right {
            transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }

        /* ══ ALL STATES: black text ══ */
        .acne-header .acne-nav-links a,
        .acne-header .acne-mob-icon,
        .acne-header .acne-right-icon,
        .acne-header .acne-logo-text {
          color: rgba(0, 0, 0, 0.9);
          transition: color 0.35s ease, opacity 0.3s ease;
        }
        .acne-header svg {
          stroke: rgba(0, 0, 0, 0.9);
          transition: stroke 0.35s ease;
        }
        .acne-header .cart-badge,
        .acne-header .wishlist-badge {
          background: #000000;
          transition: background-color 0.35s ease;
        }

        /* ══ TRANSPARENT STATE (HOME): white text ══ */
        .acne-header.transparent-home .acne-nav-links a,
        .acne-header.transparent-home .acne-mob-icon,
        .acne-header.transparent-home .acne-right-icon,
        .acne-header.transparent-home .acne-logo-text {
          color: #ffffff;
        }
        .acne-header.transparent-home svg {
          stroke: #ffffff;
        }
        .acne-header.transparent-home .cart-badge,
        .acne-header.transparent-home .wishlist-badge {
          background: #ffffff;
        }

        /* ══ TRANSPARENT STATE (PDP): black text ══ */
        .acne-header.transparent-pdp .acne-nav-links a,
        .acne-header.transparent-pdp .acne-mob-icon,
        .acne-header.transparent-pdp .acne-right-icon,
        .acne-header.transparent-pdp .acne-logo-text {
          color: #000000;
        }
        .acne-header.transparent-pdp svg {
          stroke: #000000;
        }
        .acne-header.transparent-pdp .cart-badge,
        .acne-header.transparent-pdp .wishlist-badge {
          background: #000000;
        }

        /* ══ LAYOUT ══ */
        .acne-header-inner {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 64px;
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
          font-family: 'Coolvetica Condensed', var(--font-brand), sans-serif;
          font-size: 26px;
          font-weight: normal;
          letter-spacing: 0.03em;
          padding-right: 0;
          color: rgba(0, 0, 0, 0.95);
          text-transform: uppercase;
          line-height: 1;
          transition: opacity 0.3s ease;
        }
        .acne-logo:hover .acne-logo-text { opacity: 0.6; }
        .acne-logo-desktop {
          display: inline-block;
        }
        .acne-logo-mobile {
          display: none;
        }

        /* ══ LEFT NAV ══ */
        .acne-nav-left {
          grid-column: 1;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 6px;
        }
        .acne-nav-links a {
          font-family: var(--font-primary);
          font-size: 9.5px;
          font-weight: 300;
          text-transform: uppercase;
          text-decoration: none;
          color: rgba(0, 0, 0, 0.9);
          letter-spacing: 0.15em;
          line-height: 1;
          white-space: nowrap;
          transition: opacity 0.3s ease;
          background: none;
          border: none;
          outline: none;
          cursor: pointer;
          padding: 0;
        }
        .acne-nav-links a:hover { opacity: 0.6; }
        .acne-mobile-only { display: flex; }
        .acne-desktop-only { display: none; }

        /* ══ RIGHT ICONS ══ */
        .acne-nav-right {
          grid-column: 3;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .acne-right-icons { display: flex; align-items: center; gap: 8px; }
        .acne-right-icon {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 64px;
          background: none; border: none;
          cursor: pointer;
          color: rgba(0, 0, 0, 0.9);
          text-decoration: none;
          padding: 0;
          transition: opacity 0.3s ease;
        }
        .acne-right-icon:hover { opacity: 0.6; }
        .acne-right-icon svg { stroke: rgba(0, 0, 0, 0.9); }

        /* ══ BADGES ══ */
        .cart-icon-wrap,
        .wishlist-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-badge,
        .wishlist-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 5px;
          height: 5px;
          background-color: #000000;
          border-radius: 50%;
        }

        /* ══ MOB ICON ══ */
        .acne-mob-icon {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 64px;
          background: none; border: none;
          cursor: pointer;
          color: rgba(0, 0, 0, 0.9);
          padding: 0;
          transition: opacity 0.3s ease;
        }
        .acne-mob-icon:hover { opacity: 0.6; }
        .acne-mobile-left { display: flex; align-items: center; }

        /* ══ DESKTOP ══ */
        @media (min-width: 768px) {
          .acne-mobile-only { display: none !important; }
          .acne-desktop-only { display: flex !important; }
          .acne-header-inner { padding: 0 64px; }
        }

        /* ══ MOBILE ══ */
        @media (max-width: 767px) {
          .acne-header-inner { padding: 0 16px; height: 54px; }
          .acne-logo-text { font-size: 18px; letter-spacing: 0.03em; font-weight: normal; padding-right: 0; }
          .acne-mob-icon { width: 44px; height: 54px; }
          .acne-right-icon { width: 44px; height: 54px; }
          .acne-wishlist-icon { display: none !important; }
          .acne-logo-desktop {
            display: none;
          }
          .acne-logo-mobile {
            display: inline-block;
          }
          
          /* Active states */
          .acne-mob-icon:active,
          .acne-right-icon:active {
            opacity: 0.45;
          }
        }
      `}</style>
    </>
  );
}
