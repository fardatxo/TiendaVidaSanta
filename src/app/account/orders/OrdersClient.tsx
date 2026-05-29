'use client';

import Link from 'next/link';
import { useRequireAuth } from '@/context/AuthContext';
import { useTranslation } from '@/lib/i18n';

export default function OrdersClient() {
  const { user, isLoading } = useRequireAuth();
  const { t } = useTranslation();

  if (isLoading || !user) return null;

  return (
    <>
      <div className="ord-wrap">
        <nav className="ord-tabs">
          <Link href="/account" className="ord-tab">The Residence</Link>
          <Link href="/account/orders" className="ord-tab ord-tab--active">Acquisitions</Link>
          <Link href="/account/information" className="ord-tab">House Record</Link>
          <Link href="/archive" className="ord-tab">Archive</Link>
        </nav>

        <h1 className="ord-title">Acquisitions</h1>
        <p className="ord-desc">A permanent record of pieces that have entered your collection.</p>
        <div className="ord-empty-state">
          <p className="ord-empty">No acquisitions recorded.</p>
          <Link href="/archive" className="ord-empty-link">The archive remains open.</Link>
        </div>
      </div>

      <style>{`
        html, body { background: #0c0c0c !important; }

        .ord-wrap {
          max-width: 960px;
          margin: 0 auto;
          padding: 120px 24px 80px;
          font-family: var(--font-primary);
          color: rgba(255,255,255,0.85);
        }

        .ord-tabs {
          display: flex;
          gap: 32px;
          margin-bottom: 60px;
          flex-wrap: wrap;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 1px;
        }
        .ord-tab {
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
        .ord-tab:hover { color: rgba(255,255,255,0.6); }
        .ord-tab--active {
          color: rgba(255,255,255,0.8);
          border-bottom-color: rgba(255,255,255,0.4);
        }

        .ord-title {
          font-family: var(--font-brand);
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 300;
          margin: 0 0 16px;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.7);
        }
        .ord-desc {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
          margin: 0 0 48px;
        }

        .ord-empty-state {
          padding: 60px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .ord-empty {
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.25);
          margin: 0 0 12px;
        }
        .ord-empty-link {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.4s;
        }
        .ord-empty-link:hover { color: rgba(255,255,255,0.8); }

        @media (max-width: 767px) {
          .ord-wrap { padding: 100px 16px 80px; }
          .ord-tabs { gap: 20px; margin-bottom: 40px; }
        }
      `}</style>
    </>
  );
}
