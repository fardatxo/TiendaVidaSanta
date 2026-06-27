'use client';

import Link from 'next/link';
import { useRequireAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';

const MOCK_ACQUISITIONS = [
  {
    id: 'TNT-ACQ-9821',
    date: 1779344400000,
    total: 790.00,
    currency: 'EUR',
    status: 'delivered' as 'delivered' | 'shipped' | 'preparing',
    payment: 'MASTERCARD **** 4892',
    collection: 'SS26 — VOL I',
    items: [
      {
        handle: 'heavyweight-raglan-zip-hoodie',
        title: 'HEAVYWEIGHT RAGLAN ZIP HOODIE',
        price: 790.00,
        size: 'L',
        color: 'CARBON BLACK',
        imageUrl: '/hero/ComfyUI-main_reference_00028_.png'
      }
    ]
  },
  {
    id: 'TNT-ACQ-9421',
    date: 1776944400000,
    total: 320.00,
    currency: 'EUR',
    status: 'delivered' as 'delivered' | 'shipped' | 'preparing',
    payment: 'MASTERCARD **** 4892',
    collection: 'PERMANENCE',
    items: [
      {
        handle: 'essential-heavyweight-shorts',
        title: 'ESSENTIAL HEWEIGHT SHORTS',
        price: 320.00,
        size: 'M',
        color: 'HUESO',
        imageUrl: '/hero/ComfyUI-main_reference_00012_.png'
      }
    ]
  }
];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase();
}

export default function OrdersClient() {
  const { user, isLoading } = useRequireAuth();
  const { formatPrice } = useLocale();

  if (isLoading || !user) return null;

  return (
    <>
      <div className="ord-space-wrap">
        {/* Collector Metadata Header */}
        <div className="ord-client-summary">
          <div className="ord-summary-item">
            <span className="ord-summary-label">CLIENT REGISTRY</span>
            <span className="ord-summary-val">
              {`TNT-${String(user.email.split('').reduce((a,c)=>a+c.charCodeAt(0),0) % 9000 + 1000)}`}
            </span>
          </div>
          <div className="ord-summary-item ord-summary-center">
            <span className="ord-summary-label">MAISON ACCESS</span>
            <span className="ord-summary-val">{`${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`}</span>
          </div>
          <div className="ord-summary-item">
            <span className="ord-summary-label">MEMBER STATUS</span>
            <span className="ord-summary-val">VERIFIED RECORD</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="ord-nav-tabs">
          <Link href="/account" className="ord-nav-tab">The Residence</Link>
          <Link href="/account/orders" className="ord-nav-tab active">Acquisitions</Link>
          <Link href="/account/information" className="ord-nav-tab">House Record</Link>
          <Link href="/archive" className="ord-nav-tab">Archive Room</Link>
        </nav>

        {/* Header */}
        <div className="ord-editorial-header">
          <h1 className="ord-main-title">PAST ACQUISITIONS</h1>
          <p className="ord-main-subtitle">
            A permanent chronological record of garments that have entered your wardrobe from the house collections.
          </p>
        </div>

        {/* Acquisitions Content */}
        <div className="ord-acquisitions-panel">
          {/* Notable acquisitions spotlight */}
          <div className="ord-notable-acq">
            <h3 className="ord-section-eyebrow">NOTABLE ACQUISITION</h3>
            <div className="ord-notable-card">
              <img src="/hero/ComfyUI-main_reference_00028_.png" alt="Notable Piece" className="ord-notable-img" />
              <div className="ord-notable-details">
                <span className="ord-notable-label">SEASON HIGHLIGHT</span>
                <h2 className="ord-notable-title">HEAVYWEIGHT RAGLAN ZIP HOODIE</h2>
                <p className="ord-notable-desc">
                  Selected from SS26 Ready-to-wear. A certified piece registered on your collection registry.
                </p>
                <span className="ord-notable-meta">REGISTERED IN WARDROBE ON 15 JUNE 2026</span>
              </div>
            </div>
          </div>

          {/* Timeline List */}
          <h3 className="ord-section-eyebrow">ACQUISITIONS REGISTRY</h3>
          <div className="ord-timeline">
            {MOCK_ACQUISITIONS.map(acq => (
              <div key={acq.id} className="ord-timeline-node">
                <div className="ord-node-header">
                  <div className="ord-node-left">
                    <span className="ord-node-date">{formatDate(acq.date)}</span>
                    <span className="ord-node-id">{acq.id}</span>
                  </div>
                  <div className="ord-node-right">
                    <span className="ord-node-total">Total: {formatPrice(acq.total, acq.currency)}</span>
                    <span className={`ord-node-status ${acq.status}`}>● {acq.status.toUpperCase()}</span>
                  </div>
                </div>

                <div className="ord-node-body">
                  {acq.items.map(item => (
                    <div key={item.handle} className="ord-node-item">
                      <img src={item.imageUrl} alt={item.title} className="ord-node-item-img" />
                      <div className="ord-node-item-details">
                        <h4 className="ord-node-item-title">{item.title}</h4>
                        <span className="ord-node-item-meta">SIZE: {item.size} / COLOR: {item.color}</span>
                        <span className="ord-node-item-price">{formatPrice(item.price, acq.currency)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ord-node-footer">
                  <span className="ord-node-payment">{acq.payment}</span>
                  <div className="ord-node-actions">
                    <a href="#" onClick={(e) => { e.preventDefault(); alert("Invoice downloaded successfully (Mock PDF)."); }} className="ord-node-link">
                      Download Invoice (PDF)
                    </a>
                    <Link href={`/product/${acq.items[0].handle}`} className="ord-node-link">
                      Reorder Piece
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* Light Theme overrides */
        html, body {
          background: #ffffff !important;
        }

        .ord-space-wrap {
          max-width: 1000px;
          margin: 0 auto;
          padding: 140px 24px 100px;
          font-family: var(--font-primary), sans-serif;
          color: rgba(0, 0, 0, 0.85);
          box-sizing: border-box;
        }

        /* ══ COLLECTOR SUMMARY HEADER ══ */
        .ord-client-summary {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding: 18px 0;
          margin-bottom: 56px;
          font-size: 8px;
          letter-spacing: 0.25em;
          color: rgba(0, 0, 0, 0.45);
        }
        .ord-summary-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ord-summary-item:last-child {
          align-items: flex-end;
        }
        .ord-summary-center {
          align-items: center;
          color: rgba(0, 0, 0, 0.75);
        }
        .ord-summary-label {
          font-weight: 300;
          color: rgba(0, 0, 0, 0.3);
        }
        .ord-summary-val {
          font-weight: 400;
        }

        /* ══ NAVIGATION TABS ══ */
        .ord-nav-tabs {
          display: flex;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          margin-bottom: 72px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .ord-nav-tabs::-webkit-scrollbar {
          display: none;
        }
        .ord-nav-tab {
          flex-shrink: 0;
          padding: 14px 0;
          margin-right: 44px;
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.35);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          margin-bottom: -1px;
          transition: color 0.4s, border-color 0.4s;
        }
        .ord-nav-tab:hover {
          color: rgba(0, 0, 0, 0.7);
        }
        .ord-nav-tab.active {
          color: #000000;
          border-bottom-color: rgba(0, 0, 0, 0.4);
        }

        /* ══ EDITORIAL WELCOME HEADER ══ */
        .ord-editorial-header {
          margin-bottom: 64px;
          max-width: 720px;
        }
        .ord-main-title {
          font-family: var(--font-brand), serif;
          font-size: clamp(24px, 4.5vw, 38px);
          font-weight: 300;
          letter-spacing: 0.15em;
          color: rgba(0, 0, 0, 0.85);
          margin: 0 0 20px;
        }
        .ord-main-subtitle {
          font-size: 11px;
          font-weight: 300;
          line-height: 2.1;
          letter-spacing: 0.06em;
          color: rgba(0, 0, 0, 0.45);
          margin: 0;
        }

        .ord-section-eyebrow {
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.44em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.35);
          margin: 0 0 28px;
        }

        /* ══ TIMELINE LAYOUT ══ */
        .ord-acquisitions-panel {
          display: flex;
          flex-direction: column;
          gap: 60px;
        }
        .ord-notable-acq {
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding-bottom: 48px;
        }
        .ord-notable-card {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 40px;
          background: #fafafa;
          border: 1px solid rgba(0, 0, 0, 0.04);
          padding: 32px;
          align-items: center;
        }
        .ord-notable-img {
          width: 140px;
          aspect-ratio: 3 / 4;
          object-fit: contain;
          background: rgba(0, 0, 0, 0.015);
          padding: 12px;
          box-sizing: border-box;
          filter: grayscale(0.2);
        }
        .ord-notable-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ord-notable-label {
          font-size: 7px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(0, 0, 0, 0.35);
        }
        .ord-notable-title {
          font-family: var(--font-brand), serif;
          font-size: 16px;
          font-weight: 300;
          letter-spacing: 0.2em;
          margin: 0;
        }
        .ord-notable-desc {
          font-size: 11px;
          line-height: 1.9;
          letter-spacing: 0.04em;
          color: rgba(0, 0, 0, 0.45);
          margin: 0;
          max-width: 480px;
        }
        .ord-notable-meta {
          font-size: 8px;
          color: rgba(0, 0, 0, 0.3);
          letter-spacing: 0.15em;
          font-weight: 300;
        }

        .ord-timeline {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .ord-timeline-node {
          border: 1px solid rgba(0, 0, 0, 0.04);
          background: #ffffff;
          padding: 32px;
        }
        .ord-node-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          padding-bottom: 18px;
          margin-bottom: 24px;
        }
        .ord-node-left {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .ord-node-date {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.18em;
          color: rgba(0, 0, 0, 0.85);
        }
        .ord-node-id {
          font-size: 8px;
          letter-spacing: 0.25em;
          color: rgba(0, 0, 0, 0.3);
        }
        .ord-node-right {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .ord-node-total {
          font-size: 10px;
          letter-spacing: 0.1em;
          color: rgba(0, 0, 0, 0.6);
        }
        .ord-node-status {
          font-size: 8px;
          letter-spacing: 0.22em;
          font-weight: 400;
        }
        .ord-node-status.delivered { color: #555555; }

        .ord-node-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }
        .ord-node-item {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .ord-node-item-img {
          width: 52px;
          height: 68px;
          object-fit: contain;
          background: rgba(0, 0, 0, 0.015);
          padding: 6px;
          box-sizing: border-box;
          filter: grayscale(0.2);
        }
        .ord-node-item-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ord-node-item-title {
          font-family: var(--font-brand), serif;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.15em;
          margin: 0;
        }
        .ord-node-item-meta {
          font-size: 8px;
          color: rgba(0, 0, 0, 0.3);
          letter-spacing: 0.15em;
        }
        .ord-node-item-price {
          font-size: 9px;
          color: rgba(0, 0, 0, 0.5);
          letter-spacing: 0.05em;
        }

        .ord-node-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
          padding-top: 18px;
        }
        .ord-node-payment {
          font-size: 8px;
          letter-spacing: 0.2em;
          color: rgba(0, 0, 0, 0.25);
        }
        .ord-node-actions {
          display: flex;
          gap: 24px;
        }
        .ord-node-link {
          font-size: 8px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.45);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.3s;
        }
        .ord-node-link:hover {
          color: #000000;
        }

        @media (max-width: 767px) {
          .ord-space-wrap {
            padding: 100px 16px 80px;
          }
          .ord-client-summary {
            grid-template-columns: 1fr;
            gap: 12px;
            text-align: center;
            margin-bottom: 48px;
          }
          .ord-summary-item:last-child {
            align-items: center;
          }
          .ord-nav-tabs {
            margin-bottom: 48px;
          }
          .ord-nav-tab {
            margin-right: 28px;
          }
          .ord-editorial-header {
            margin-bottom: 40px;
          }
          .ord-notable-card {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .ord-node-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
          .ord-node-right {
            justify-content: space-between;
            width: 100%;
          }
          .ord-node-footer {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          .ord-node-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </>
  );
}
