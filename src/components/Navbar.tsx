"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Menu, User, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { openCart, openMenuWithSearch, openMenu } = useUI();
  const { cartCount } = useCart();
  const { t } = useTranslation();
  const { user } = useAuth();
  const pathname = usePathname();
  const accountHref = user ? '/account' : '/login';
  const accountLabel = user ? user.firstName : t('nav.account');

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
          {/* LEFT: Hamburger + Search */}
          <div className="acne-nav-left">
            <button className="acne-mob-icon" aria-label="Menu" onClick={openMenu}>
              <Menu size={18} strokeWidth={1} />
            </button>
            <button className="acne-mob-icon" aria-label="Search" onClick={openMenuWithSearch}>
              <svg width="18" height="18" viewBox="-1 -1 19 19" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M16.604 15.868l-5.173-5.173c0.975-1.137 1.569-2.611 1.569-4.223 0-3.584-2.916-6.5-6.5-6.5-1.736 0-3.369 0.676-4.598 1.903-1.227 1.228-1.903 2.861-1.902 4.597 0 3.584 2.916 6.5 6.5 6.5 1.612 0 3.087-0.594 4.224-1.569l5.173 5.173 0.707-0.708zM6.5 11.972c-3.032 0-5.5-2.467-5.5-5.5-0.001-1.47 0.571-2.851 1.61-3.889 1.038-1.039 2.42-1.611 3.89-1.611 3.032 0 5.5 2.467 5.5 5.5 0 3.032-2.468 5.5-5.5 5.5z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <Link href="/" className="acne-logo">
            <span className="acne-logo-text">TONET PARIS<sup>®</sup></span>
          </Link>

          {/* RIGHT: Account, Wishlist, Cart */}
          <div className="acne-nav-right">
            <Link href={accountHref} className="acne-right-icon" aria-label="Account">
              <User size={18} strokeWidth={1} fill="none" />
            </Link>

            <Link href="/wishlist" className="acne-right-icon" aria-label="Wishlist">
              <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
                <polygon fill="currentColor" points="1.5,0 1.5,12 6,9.8181763 10.5,12 10.5,0 "/>
              </svg>
            </Link>

            <button className="acne-right-icon" onClick={openCart} aria-label="Open bag">
              <div className="cart-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 512.069 512.069" fill="currentColor">
                  <path d="M511.846,453.047l-37.248-318.976c-2.539-27.797-25.131-48.704-52.693-48.704h-37.909c0-47.061-38.272-85.333-85.333-85.333c-47.061,0-85.333,38.272-85.333,85.333h-23.211c-16.811,0-31.936,8.192-41.643,21.419c-34.88,0.533-63.147,32.149-63.147,71.019v14.229H66.256c-23.552,0-42.837,17.92-44.843,41.557L0.166,464.652c-1.045,12.395,2.88,24.128,11.029,33.003c8.427,9.131,20.736,14.379,33.813,14.379h195.413c3.883,0,7.68-0.683,11.392-1.685c18.688,1.237,49.259,1.323,99.541,1.429l108.48,0.235c14.635,0,28.16-5.931,38.101-16.747C508.112,484.172,513.232,469.026,511.846,453.047z M127.995,177.804c0-15.403,9.771-28.437,21.333-28.437c1.365,0,2.709,0.213,4.011,0.555c0.256,0.085,0.405,0.277,0.661,0.363c4.757,1.515,8.853,5.12,11.819,9.92c0.064,0.107,0.128,0.213,0.192,0.32c1.365,2.283,2.453,4.864,3.243,7.595c0.107,0.341,0.171,0.704,0.256,1.045c0.704,2.773,1.152,5.653,1.152,8.64v14.229h-42.667V177.804z M240.507,468.94c-0.469,0.064-0.853,0.341-1.344,0.427H45.008c-1.515,0-2.283-0.491-2.347-0.981l21.248-231.04c0.128-1.493,1.173-2.645,2.347-2.645h40.405h85.333h32.149c1.173,0,2.219,1.173,2.325,2.347l16.277,229.077C242.896,467.98,241.488,468.834,240.507,468.94z M255.995,85.367c0-23.531,19.136-42.667,42.667-42.667s42.667,19.136,42.667,42.667H255.995z"/>
                </svg>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </div>
            </button>
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
        .acne-header {
          position: fixed;
          top: 0;
          left: 0; right: 0;
          z-index: 500;
          transition: transform 0.3s ease, background-color 0.25s ease, border-bottom-color 0.25s ease;
        }
        .acne-header.header-hidden {
          transform: translateY(-100%);
        }
        .acne-header.transparent {
          background: transparent;
          border-bottom: none;
        }
        /* Fullbleed pages (collection/product): white icons/text on transparent */
        .acne-header.transparent .acne-nav-links a,
        .acne-header.transparent .acne-mob-icon,
        .acne-header.transparent .acne-right-icon,
        .acne-header.transparent .acne-logo-text {
          color: #000;
        }
        .acne-header.transparent .acne-icon-sep {
          background: #ededed;
        }
        .acne-header.transparent svg {
          stroke: #000;
        }

        /* Fullbleed pages (collection/product) at top: white icons over hero image */
        .acne-header.fullbleed-top .acne-nav-links a,
        .acne-header.fullbleed-top .acne-mob-icon,
        .acne-header.fullbleed-top .acne-right-icon,
        .acne-header.fullbleed-top .acne-logo-text {
          color: #fff;
        }
        .acne-header.fullbleed-top .acne-icon-sep {
          background: rgba(255,255,255,0.3);
        }
        .acne-header.fullbleed-top svg {
          stroke: #fff;
        }

        /* Home page at top: transparent with WHITE icons/text (over video) */
        .acne-header.home-top .acne-nav-links a,
        .acne-header.home-top .acne-mob-icon,
        .acne-header.home-top .acne-right-icon,
        .acne-header.home-top .acne-logo-text {
          color: #fff;
        }
        .acne-header.home-top .acne-icon-sep {
          background: rgba(255,255,255,0.3);
        }
        .acne-header.home-top svg {
          stroke: #fff;
        }

        /* Home page past video: transparent with BLACK icons/text */
        .acne-header.home-dark .acne-nav-links a,
        .acne-header.home-dark .acne-mob-icon,
        .acne-header.home-dark .acne-right-icon,
        .acne-header.home-dark .acne-logo-text {
          color: #000;
        }
        .acne-header.home-dark .acne-icon-sep {
          background: #ededed;
        }
        .acne-header.home-dark svg {
          stroke: #000;
        }

        /* Over dark section: force white text/icons */
        .acne-header.over-dark .acne-nav-links a,
        .acne-header.over-dark .acne-mob-icon,
        .acne-header.over-dark .acne-right-icon,
        .acne-header.over-dark .acne-logo-text {
          color: #fff !important;
        }
        .acne-header.over-dark .acne-icon-sep {
          background: rgba(255,255,255,0.3) !important;
        }
        .acne-header.over-dark svg {
          stroke: #fff !important;
        }

        .acne-header.solid {
          background: #ffffff;
          border-bottom: 1px solid #ededed;
        }

        .acne-header-inner {
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          height: 60px;
          padding: 0 20px;
          position: relative;
        }

        .acne-logo {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          text-decoration: none;
          display: flex;
          align-items: baseline;
          gap: 8px;
          color: #000;
          white-space: nowrap;
          line-height: 1;
        }
        .acne-logo-star {
          font-size: 34px;
          line-height: 1;
          color: #000;
        }
        .acne-logo-text {
          font-family: 'Coolvetica', var(--font-brand), sans-serif;
          font-size: 37.5px;
          font-weight: 400;
          letter-spacing: 0.01em;
          color: #000;
          line-height: 60px;
        }
        .acne-logo-text sup {
          font-size: 9px;
          vertical-align: super;
          letter-spacing: 0.04em;
        }

        .acne-nav-left { display: flex; align-items: stretch; flex: 1; }
        .acne-nav-links { display: flex; align-items: center; gap: 28px; }
        .acne-nav-links a {
          font-size: 11px;
          font-family: var(--font-primary);
          font-weight: 500;
          text-transform: uppercase;
          text-decoration: none;
          color: #000;
          letter-spacing: 0.10em;
          line-height: 1.2;
        }

        .acne-nav-right { flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
        .acne-right-icon {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          background: none; border: none; border-radius: 0;
          cursor: pointer; color: #000;
          text-decoration: none;
          padding: 0;
          transition: opacity 0.15s;
        }
        .acne-right-icon:hover { opacity: 0.6; }

        .cart-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-badge {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: transparent;
          color: #1D1D1B;
          font-size: 8px;
          font-weight: 600;
          line-height: 1;
          pointer-events: none;
        }

        .acne-mob-icon {
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 48px;
          background: none; border: none; border-radius: 0;
          cursor: pointer; color: #000; padding: 0;
        }
        .acne-mobile-left { display: flex; align-items: center; gap: 0; }

        /* ── SUBNAV ── */
        .acne-subnav {
          height: 40px;
          background: #ffffff;
          border-top: 1px solid #ededed;
          border-bottom: 1px solid #ededed;
          display: flex;
          align-items: center;
        }
        .acne-subnav-inner {
          max-width: 100%;
          width: 100%;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }
        .back-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #000;
        }
        .subnav-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .subnav-current {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #000;
        }
        .subnav-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          color: #000;
        }
        .subnav-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: #ffffff;
          border: 1px solid #ededed;
          border-top: none;
          display: flex;
          flex-direction: column;
          min-width: 200px;
          z-index: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .subnav-drop-item {
          padding: 12px 20px;
          font-size: 11px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #768194;
          text-decoration: none;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.12s, color 0.12s;
        }
        .subnav-drop-item:last-child { border-bottom: none; }
        .subnav-drop-item:hover { background: #f8f8f8; color: #000; }
        .subnav-drop-item.active { color: #000; font-weight: 500; }

        .desktop-only { display: flex !important; }
        .mobile-only  { display: none !important; }

        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
          .mobile-only  { display: flex !important; }
          .acne-header-inner {
            padding: 0 4px;
            height: 48px;
          }
          .acne-logo {
            gap: 0;
            max-width: calc(100vw - 120px);
            overflow: hidden;
          }
          .acne-logo-text {
            font-size: 24px;
            letter-spacing: 0.01em;
            white-space: nowrap;
            line-height: 48px;
            overflow: hidden;
            text-overflow: clip;
          }
          .acne-mob-icon {
            width: 28px;
          }
          .acne-mob-icon svg {
            width: 18px;
            height: auto;
          }
          .acne-nav-right {
            gap: 0;
          }
          .acne-nav-right .acne-right-icon:first-child {
            display: none;
          }
          .acne-right-icon {
            width: 28px;
            height: 48px;
          }
          .acne-right-icon svg {
            width: 18px;
            height: 18px;
          }
          .acne-subnav-inner { padding: 0 16px; }
        }
      `}</style>
    </>
  );
}
