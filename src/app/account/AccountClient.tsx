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
      <div className="acc-wrap">
        {/* Tabs */}
        <nav className="acc-tabs">
          <Link href="/account" className="acc-tab acc-tab--active">The Residence</Link>
          <Link href="/account/orders" className="acc-tab">Acquisitions</Link>
          <Link href="/account/information" className="acc-tab">House Record</Link>
          <Link href="/archive" className="acc-tab">Archive</Link>
        </nav>

        {/* Welcome header */}
        <h1 className="acc-title">The Residence</h1>
        <p className="acc-email">{user.firstName} {user.lastName} — {user.email}</p>

        {/* Grid blocks */}
        <div className="acc-grid">
          {/* In your cart */}
          <Link href="#" className="acc-block" onClick={(e) => { e.preventDefault(); }}>
            <h3 className="acc-block-title">Current Selection</h3>
            {firstCartItem ? (
              <div className="acc-cart-preview">
                {firstCartItem.image && (
                  <img src={firstCartItem.image} alt={firstCartItem.name} className="acc-cart-img" />
                )}
                <div className="acc-cart-info">
                  <span className="acc-cart-name">{firstCartItem.name}</span>
                  <span className="acc-cart-price">{formatPrice(firstCartItem.price, firstCartItem.currencyCode)}</span>
                </div>
              </div>
            ) : (
              <p className="acc-block-empty">No pieces currently selected.</p>
            )}
          </Link>

          {/* Orders & Returns */}
          <Link href="/account/orders" className="acc-block">
            <h3 className="acc-block-title">Acquisitions</h3>
            <p className="acc-block-empty">No acquisitions recorded.</p>
          </Link>

          {/* Wishlist */}
          <Link href="/archive" className="acc-block">
            <h3 className="acc-block-title">Archive Collection</h3>
            {wishlistItems.length > 0 ? (
              <div className="acc-wish-preview">
                {wishlistItems.slice(0, 3).map(item => (
                  <img key={item.handle} src={item.imageUrl} alt={item.title} className="acc-wish-img" />
                ))}
                {wishlistItems.length > 3 && (
                  <span className="acc-wish-more">+{wishlistItems.length - 3}</span>
                )}
              </div>
            ) : (
              <p className="acc-block-empty">No garments currently archived.</p>
            )}
          </Link>

          {/* My Information */}
          <Link href="/account/information" className="acc-block">
            <h3 className="acc-block-title">House Record</h3>
            <p className="acc-block-desc">{user.firstName} {user.lastName}</p>
            <p className="acc-block-desc">{user.email}</p>
          </Link>
        </div>

        {/* Logout */}
        <button className="acc-logout" onClick={logout}>
          Depart The House
        </button>
      </div>

      <style>{`
        /* Dark Theme overrides for the residence */
        html, body {
          background: #0c0c0c !important;
        }

        .acc-wrap {
          max-width: 960px;
          margin: 0 auto;
          padding: 120px 24px 80px;
          font-family: var(--font-primary);
          color: rgba(255,255,255,0.85);
        }

        /* Tabs */
        .acc-tabs {
          display: flex;
          gap: 32px;
          margin-bottom: 48px;
          flex-wrap: wrap;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 1px;
        }
        .acc-tab {
          font-size: 8px;
          font-weight: 300;
          text-decoration: none;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.4em;
          text-transform: uppercase;
          padding-bottom: 12px;
          border-bottom: 1px solid transparent;
          margin-bottom: -1px;
          transition: color 0.4s, border-color 0.4s;
        }
        .acc-tab:hover { color: rgba(255,255,255,0.6); }
        .acc-tab--active {
          color: rgba(255,255,255,0.8);
          border-bottom-color: rgba(255,255,255,0.4);
        }

        /* Header */
        .acc-title {
          font-family: var(--font-brand);
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 300;
          margin: 0 0 16px;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.7);
        }
        .acc-email {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
          margin: 0 0 64px;
        }

        /* Grid */
        .acc-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.04);
          margin-bottom: 60px;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .acc-block {
          background: #0c0c0c;
          padding: 40px;
          min-height: 180px;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          transition: background 0.4s;
        }
        .acc-block:hover { background: rgba(255,255,255,0.015); }

        .acc-block-title {
          font-size: 9px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(255,255,255,0.5);
          margin: 0 0 16px;
        }
        .acc-block-empty {
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.25);
          margin: 0;
          line-height: 1.6;
        }
        .acc-block-desc {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.4);
          margin: 0 0 6px;
        }

        /* Cart preview */
        .acc-cart-preview {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-top: 8px;
        }
        .acc-cart-img {
          width: 48px;
          height: 64px;
          object-fit: contain;
          background: rgba(255,255,255,0.02);
          filter: grayscale(0.2);
        }
        .acc-cart-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .acc-cart-name {
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
        }
        .acc-cart-price {
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: rgba(255,255,255,0.3);
        }

        /* Wishlist preview */
        .acc-wish-preview {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 8px;
        }
        .acc-wish-img {
          width: 40px;
          height: 52px;
          object-fit: contain;
          background: rgba(255,255,255,0.02);
          filter: grayscale(0.2);
        }
        .acc-wish-more {
          font-size: 10px;
          font-weight: 300;
          color: rgba(255,255,255,0.3);
          margin-left: 8px;
        }

        /* Logout */
        .acc-logout {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 16px 40px;
          font-size: 9px;
          font-weight: 300;
          font-family: var(--font-primary);
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: border-color 0.4s, color 0.4s;
        }
        .acc-logout:hover {
          border-color: rgba(255,255,255,0.3);
          color: rgba(255,255,255,0.8);
        }

        @media (max-width: 767px) {
          .acc-wrap { padding: 100px 16px 80px; }
          .acc-tabs { gap: 20px; }
          .acc-grid { grid-template-columns: 1fr; gap: 1px; }
          .acc-block { padding: 32px 20px; min-height: 140px; }
        }
      `}</style>
    </>
  );
}
