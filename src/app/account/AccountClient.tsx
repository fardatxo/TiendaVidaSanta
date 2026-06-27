'use client';

import Link from 'next/link';
import { useRequireAuth, useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/context/LocaleContext';

export default function AccountClient() {
  const { user, isLoading } = useRequireAuth();
  const { logout } = useAuth();
  const { cart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { t } = useTranslation();
  const { formatPrice } = useLocale();

  if (isLoading || !user) return null;

  const firstCartItem = cart.lines[0];

  return (
    <>
      <div className="acc-space-wrap">
        {/* Collector Metadata Header */}
        <div className="acc-client-summary">
          <div className="acc-summary-item">
            <span className="acc-summary-label">CLIENT REGISTRY</span>
            <span className="acc-summary-val">
              {`TNT-${String(user.email.split('').reduce((a,c)=>a+c.charCodeAt(0),0) % 9000 + 1000)}`}
            </span>
          </div>
          <div className="acc-summary-item acc-summary-center">
            <span className="acc-summary-label">MAISON ACCESS</span>
            <span className="acc-summary-val">{`${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`}</span>
          </div>
          <div className="acc-summary-item">
            <span className="acc-summary-label">MEMBER STATUS</span>
            <span className="acc-summary-val">VERIFIED RECORD</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="acc-nav-tabs">
          <Link href="/account" className="acc-nav-tab active">The Residence</Link>
          <Link href="/account/orders" className="acc-nav-tab">Acquisitions</Link>
          <Link href="/account/information" className="acc-nav-tab">House Record</Link>
          <Link href="/archive" className="acc-nav-tab">Archive Room</Link>
        </nav>

        {/* Welcome Header */}
        <div className="acc-editorial-header">
          <h1 className="acc-main-title">THE RESIDENCE</h1>
          <p className="acc-main-subtitle">
            Welcome back to the house of TONET TORRENTINNI, {user.firstName}. 
            Your private access point for reviewing acquisitions, personal archives and exclusive sourcing requests.
          </p>
        </div>

        {/* Grid Blocks */}
        <div className="acc-grid">
          {/* Current Selection (Cart) */}
          <Link href="#" className="acc-card" onClick={(e) => { e.preventDefault(); }}>
            <span className="acc-card-num">01</span>
            <h3 className="acc-card-title">CURRENT SELECTION</h3>
            {firstCartItem ? (
              <div className="acc-preview-row">
                {firstCartItem.image && (
                  <img src={firstCartItem.image} alt={firstCartItem.name} className="acc-preview-img" />
                )}
                <div className="acc-preview-info">
                  <span className="acc-preview-name">{firstCartItem.name.toUpperCase()}</span>
                  <span className="acc-preview-meta">
                    {formatPrice(firstCartItem.price, firstCartItem.currencyCode)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="acc-card-desc">No pieces currently selected for acquisition.</p>
            )}
          </Link>

          {/* Acquisitions */}
          <Link href="/account/orders" className="acc-card">
            <span className="acc-card-num">02</span>
            <h3 className="acc-card-title">PAST ACQUISITIONS</h3>
            <p className="acc-card-desc">View your verified purchase history, order statuses and download invoice records.</p>
          </Link>

          {/* Archive Collection */}
          <Link href="/archive" className="acc-card">
            <span className="acc-card-num">03</span>
            <h3 className="acc-card-title">ARCHIVE COLLECTION</h3>
            {wishlistItems.length > 0 ? (
              <div className="acc-preview-gallery">
                {wishlistItems.slice(0, 3).map(item => (
                  <img key={item.handle} src={item.imageUrl} alt={item.title} className="acc-preview-thumb" />
                ))}
                {wishlistItems.length > 3 && (
                  <span className="acc-preview-more">+{wishlistItems.length - 3}</span>
                )}
              </div>
            ) : (
              <p className="acc-card-desc">No garments currently retained in your personal archive.</p>
            )}
          </Link>

          {/* House Record (Profile) */}
          <Link href="/account/information" className="acc-card">
            <span className="acc-card-num">04</span>
            <h3 className="acc-card-title">HOUSE RECORD</h3>
            <div className="acc-record-info">
              <span className="acc-record-line">{user.firstName} {user.lastName}</span>
              <span className="acc-record-email">{user.email}</span>
            </div>
          </Link>
        </div>

        {/* Depart Button */}
        <div className="acc-footer">
          <button className="acc-logout-btn" onClick={logout}>
            DEPART THE HOUSE
          </button>
        </div>
      </div>

      <style>{`
        /* Dark Theme overrides for the residence */
        html, body {
          background: #080808 !important;
        }

        .acc-space-wrap {
          max-width: 1000px;
          margin: 0 auto;
          padding: 140px 24px 100px;
          font-family: var(--font-primary), sans-serif;
          color: rgba(255, 255, 255, 0.85);
          box-sizing: border-box;
        }

        /* ══ COLLECTOR SUMMARY HEADER ══ */
        .acc-client-summary {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 18px 0;
          margin-bottom: 56px;
          font-size: 8px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.35);
        }
        .acc-summary-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .acc-summary-item:last-child {
          align-items: flex-end;
        }
        .acc-summary-center {
          align-items: center;
          color: rgba(255, 255, 255, 0.7);
        }
        .acc-summary-label {
          font-weight: 300;
          color: rgba(255, 255, 255, 0.2);
        }
        .acc-summary-val {
          font-weight: 400;
        }

        /* ══ NAVIGATION TABS ══ */
        .acc-nav-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 72px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .acc-nav-tabs::-webkit-scrollbar {
          display: none;
        }
        .acc-nav-tab {
          flex-shrink: 0;
          padding: 14px 0;
          margin-right: 44px;
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.25);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          margin-bottom: -1px;
          transition: color 0.4s, border-color 0.4s;
        }
        .acc-nav-tab:hover {
          color: rgba(255, 255, 255, 0.7);
        }
        .acc-nav-tab.active {
          color: #ffffff;
          border-bottom-color: rgba(255, 255, 255, 0.4);
        }

        /* ══ EDITORIAL WELCOME HEADER ══ */
        .acc-editorial-header {
          margin-bottom: 64px;
          max-width: 720px;
        }
        .acc-main-title {
          font-family: var(--font-brand), serif;
          font-size: clamp(24px, 4.5vw, 38px);
          font-weight: 300;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.85);
          margin: 0 0 20px;
        }
        .acc-main-subtitle {
          font-size: 11px;
          font-weight: 300;
          line-height: 2.1;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.35);
          margin: 0;
        }

        /* ══ GRID CARDS ══ */
        .acc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.04);
          margin-bottom: 64px;
        }
        .acc-card {
          background: #080808;
          padding: 44px;
          min-height: 180px;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          transition: background 0.4s;
          position: relative;
        }
        .acc-card:hover {
          background: rgba(255, 255, 255, 0.015);
        }
        .acc-card-num {
          font-size: 8px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.15);
          letter-spacing: 0.05em;
          margin-bottom: 24px;
        }
        .acc-card-title {
          font-size: 10px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.65);
          margin: 0 0 16px;
        }
        .acc-card-desc {
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: rgba(255, 255, 255, 0.25);
          line-height: 1.8;
          margin: 0;
        }

        /* Previews inside cards */
        .acc-preview-row {
          display: flex;
          gap: 18px;
          align-items: center;
          margin-top: auto;
        }
        .acc-preview-img {
          width: 48px;
          height: 64px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.02);
          filter: grayscale(0.2);
        }
        .acc-preview-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .acc-preview-name {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.7);
        }
        .acc-preview-meta {
          font-size: 9px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 0.05em;
        }

        .acc-preview-gallery {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-top: auto;
        }
        .acc-preview-thumb {
          width: 40px;
          height: 52px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.02);
          filter: grayscale(0.2);
        }
        .acc-preview-more {
          font-size: 10px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.3);
          margin-left: 8px;
        }

        .acc-record-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: auto;
        }
        .acc-record-line {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.45);
        }
        .acc-record-email {
          font-size: 9.5px;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.25);
        }

        /* Logout button */
        .acc-footer {
          display: flex;
          justify-content: flex-start;
        }
        .acc-logout-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 18px 48px;
          font-size: 8.5px;
          font-weight: 300;
          font-family: inherit;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.35);
          cursor: pointer;
          transition: border-color 0.4s, color 0.4s;
          border-radius: 0;
        }
        .acc-logout-btn:hover {
          border-color: rgba(255, 255, 255, 0.4);
          color: #ffffff;
        }

        @media (max-width: 767px) {
          .acc-space-wrap {
            padding: 100px 16px 80px;
          }
          .acc-client-summary {
            grid-template-columns: 1fr;
            gap: 12px;
            text-align: center;
            margin-bottom: 48px;
          }
          .acc-summary-item:last-child {
            align-items: center;
          }
          .acc-nav-tabs {
            margin-bottom: 48px;
          }
          .acc-nav-tab {
            margin-right: 28px;
          }
          .acc-editorial-header {
            margin-bottom: 40px;
          }
          .acc-grid {
            grid-template-columns: 1fr;
          }
          .acc-card {
            padding: 32px;
            min-height: 140px;
          }
        }
      `}</style>
    </>
  );
}
