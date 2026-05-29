"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Menu, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/lib/i18n";

export default function Navbar() {
  const { openCart, openMenuWithSearch, openMenu, closeMenu } = useUI();
  const { cartCount } = useCart();
  const { t } = useTranslation();
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isProduct = pathname.startsWith("/product/");
  const isCollection = pathname.startsWith("/collection/");
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

  // Pages with fullbleed gallery (transparent header overlay)
  const isFullbleed = isProduct || isCollection;

  const BANNER_H = 22;

  // Smart header: hide on scroll down, show solid on scroll up
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrolledPast, setScrolledPast] = useState(false);
  const [navTop, setNavTop] = useState(BANNER_H);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Track if scrolled past the first viewport (video hero)
  const [pastVideo, setPastVideo] = useState(false);
  const [overDark, setOverDark] = useState(false);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      setScrolledPast(y > 80);
      setPastVideo(y > window.innerHeight * 0.5);
      setHeaderVisible(true);
      setNavTop(Math.max(0, BANNER_H - y));
      lastScrollY.current = y;
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // IntersectionObserver for dark sections — fires on viewport entry, not scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let anyDark = false;
        entries.forEach(entry => {
          if (entry.isIntersecting) anyDark = true;
        });
        setOverDark(anyDark);
      },
      { threshold: 0.5 }
    );
    const sections = document.querySelectorAll('.dark-section');
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  // Body padding
  useEffect(() => {
    const body = document.body;
    if (isFullbleed || isHome) {
      body.style.paddingTop = "0px";
    } else {
      body.style.paddingTop = "48px";
    }
    return () => { body.style.paddingTop = "48px"; };
  }, [isFullbleed, isHome]);

  // Determine header style class
  // Home: always transparent. Other pages: solid when scrolled up past threshold.
  const solid = !isHome && (!isFullbleed || scrolledPast);

  return (
    <>
      <header className={`acne-header ${solid ? "solid" : "transparent"} ${isHome && !pastVideo ? "home-top" : ""} ${isHome && pastVideo ? "home-dark" : ""} ${isCollection && !scrolledPast ? "fullbleed-top" : ""} ${!headerVisible ? "header-hidden" : ""} ${overDark ? "over-dark" : ""}`} style={{top: `${navTop}px`}}>
        <div className="acne-header-inner">
          {/* LEFT: Hamburger+Search (mobile) + Nav links (desktop) */}
          <div className="acne-nav-left">
            <button className="acne-mob-icon acne-mobile-only" aria-label="Menu" onClick={openMenu}>
              <Menu size={18} strokeWidth={1} />
            </button>
            <nav className="acne-nav-links acne-desktop-only">
              <Link href="/collections" onClick={closeMenu}>The Collection</Link>
              <Link href="/about" onClick={closeMenu}>The House</Link>
            </nav>
          </div>

          <Link href="/" className="acne-logo">
            <span className="acne-logo-text">TONET</span>
          </Link>

          {/* RIGHT: Nav links (desktop) + Search (desktop) + Account, Wishlist, Cart */}
          <div className="acne-nav-right">
            <div className="acne-right-icons">
              <button className="acne-right-icon" aria-label="Search" onClick={openMenuWithSearch}>
                <svg width="18" height="18" viewBox="-1 -1 19 19" fill="none" stroke="currentColor" strokeWidth="0.7">
                  <path d="M16.604 15.868l-5.173-5.173c0.975-1.137 1.569-2.611 1.569-4.223 0-3.584-2.916-6.5-6.5-6.5-1.736 0-3.369 0.676-4.598 1.903-1.227 1.228-1.903 2.861-1.902 4.597 0 3.584 2.916 6.5 6.5 6.5 1.612 0 3.087-0.594 4.224-1.569l5.173 5.173 0.707-0.708zM6.5 11.972c-3.032 0-5.5-2.467-5.5-5.5-0.001-1.47 0.571-2.851 1.61-3.889 1.038-1.039 2.42-1.611 3.89-1.611 3.032 0 5.5 2.467 5.5 5.5 0 3.032-2.468 5.5-5.5 5.5z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
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

        {/* ── SECONDARY STICKY NAV – hidden when transparent header is active ── */}
        {false && isCollection && (
          <div className="acne-subnav">
            <div className="acne-subnav-inner">
              <Link href="/" className="back-link">
                <ArrowLeft size={16} strokeWidth={1.4} />
                <span>{t('nav.gallery')}</span>
              </Link>
              <div className="subnav-right">
                {currentCollection && (
                  <span className="subnav-current">{currentCollection?.title}</span>
                )}
                <button className="subnav-toggle" onClick={() => setSubnavOpen(!subnavOpen)} aria-label="All collections">
                  {subnavOpen ? <ChevronUp size={14} strokeWidth={1.4} /> : <ChevronDown size={14} strokeWidth={1.4} />}
                </button>
              </div>
              {subnavOpen && (
                <div className="subnav-dropdown">
                  {collections.map(c => (
                    <Link
                      key={c.handle}
                      href={`/collection/${c.handle}`}
                      className={`subnav-drop-item${currentCollectionHandle === c.handle ? ' active' : ''}`}
                      onClick={() => setSubnavOpen(false)}
                    >
                      {c.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <style>{`
        /* ══ BASE ══ */
        .acne-header {
          position: fixed;
          top: 0;
          left: 0; right: 0;
          z-index: 500;
          background: transparent;
          border-bottom: 1px solid transparent;
          transition:
            background-color 0.8s cubic-bezier(0.16, 1, 0.3, 1),
            border-color 0.8s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.45s ease;
        }
        .acne-header.header-hidden { transform: translateY(-100%); }

        /* ══ ALL STATES: white text ══ */
        .acne-header .acne-nav-links a,
        .acne-header .acne-mob-icon,
        .acne-header .acne-right-icon,
        .acne-header .acne-logo-text { color: rgba(255,255,255,0.82); }
        .acne-header svg { stroke: rgba(255,255,255,0.82); }

        /* ══ SCROLL STATES ══ */
        .acne-header.home-dark {
          background: rgba(4,4,4,0.5);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom-color: rgba(255,255,255,0.04);
        }
        .acne-header.solid {
          background: rgba(4,4,4,0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom-color: rgba(255,255,255,0.05);
        }

        /* ══ LAYOUT ══ */
        .acne-header-inner {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 56px;
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
          font-family: var(--font-primary);
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.52em;
          padding-right: 0.52em;
          color: rgba(255,255,255,0.82);
          text-transform: uppercase;
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
        .acne-nav-links a {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          text-transform: uppercase;
          text-decoration: none;
          color: rgba(255,255,255,0.82);
          letter-spacing: 0.38em;
          line-height: 1;
          white-space: nowrap;
          transition: opacity 0.6s;
        }
        .acne-nav-links a:hover { opacity: 0.32; }
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
          width: 40px; height: 40px;
          background: none; border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.82);
          text-decoration: none;
          padding: 0;
          transition: opacity 0.6s;
        }
        .acne-right-icon:hover { opacity: 0.32; }
        .acne-right-icon svg { stroke: rgba(255,255,255,0.82); }

        /* ══ CART ══ */
        .cart-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-badge {
          position: absolute;
          top: 6px; right: 6px;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.65);
          pointer-events: none;
        }

        /* ══ MOB ICON ══ */
        .acne-mob-icon {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px;
          background: none; border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.82);
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
          .acne-header-inner { padding: 0 20px; height: 52px; }
          .acne-logo-text { font-size: 11px; letter-spacing: 0.44em; }
          .acne-mob-icon { width: 32px; height: 52px; }
          .acne-right-icon { width: 32px; height: 52px; }
          .acne-right-icon:first-child { display: none; }
        }
      `}</style>
    </>
  );
}
