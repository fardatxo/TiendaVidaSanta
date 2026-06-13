'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

type Tab = 'personal' | 'acquisitions' | 'requests' | 'registry';

interface AvailRequest {
  id: string;
  product: string;
  title: string;
  imageUrl?: string;
  sizes: string[];
  email: string;
  submittedAt: number;
}

function archiveId(handle: string): string {
  const n = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `TNT-${String((n % 9000) + 1000).padStart(4, '0')}`;
}

function timeRemaining(addedAt: number | undefined): { text: string; expired: boolean } {
  if (!addedAt) return { text: 'Active', expired: false };
  const elapsed = Date.now() - addedAt;
  const h48 = 48 * 3600 * 1000;
  if (elapsed >= h48) return { text: 'Expired', expired: true };
  const rem = h48 - elapsed;
  const h = Math.floor(rem / 3600000);
  const m = Math.floor((rem % 3600000) / 60000);
  if (h > 0) return { text: `${h}h remaining`, expired: false };
  return { text: `${m}m remaining`, expired: false };
}

function formatDate(ts: number | undefined): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase();
}

export default function ArchiveClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, remove } = useWishlist();
  const { user } = useAuth();

  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam ?? 'personal');
  const [availRequests, setAvailRequests] = useState<AvailRequest[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    try {
      setAvailRequests(JSON.parse(localStorage.getItem('tonet-avail-requests') ?? '[]'));
    } catch {}
    const iv = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    router.replace(`/archive?tab=${tab}`, { scroll: false });
  }

  function removeRequest(id: string) {
    const updated = availRequests.filter(r => r.id !== id);
    setAvailRequests(updated);
    localStorage.setItem('tonet-avail-requests', JSON.stringify(updated));
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'personal', label: 'Personal Archive' },
    { key: 'acquisitions', label: 'Past Acquisitions' },
    { key: 'requests', label: 'Availability Requests' },
    { key: 'registry', label: 'Collection Registry' },
  ];

  return (
    <>
      <div className="ar-wrap">

        {/* Header */}
        <div className="ar-header">
          <h1 className="ar-title">ARCHIVE ROOM</h1>
          <p className="ar-hero-desc">
            A private space for collecting, revisiting and tracking selected TONER TORRENTINNI pieces, reflecting the quiet beauty of nature.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="ar-tabs">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              className={`ar-tab${activeTab === key ? ' ar-tab--active' : ''}`}
              onClick={() => switchTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="ar-content">

          {/* ── Personal Archive ── */}
          {activeTab === 'personal' && (
            <>
              <h2 className="ar-section-title">PERSONAL ARCHIVE</h2>
              <p className="ar-section-desc">
                A temporary collection of pieces retained for future consideration.
              </p>
              {items.length === 0 ? (
                <div className="ar-empty">
                  <h3 className="ar-empty-title">PERSONAL ARCHIVE</h3>
                  <p className="ar-empty-sub">
                    No pieces currently archived.<br/>
                    Selected pieces will appear here for future consideration.
                  </p>
                  <Link href="/collection" className="ar-cta-link">Explore Collections →</Link>
                </div>
              ) : (
                <div className="ar-entries">
                  {items.map(item => {
                    const id = archiveId(item.handle);
                    const { text: remaining, expired } = timeRemaining(item.addedAt);
                    return (
                      <div key={item.handle} className={`ar-entry${expired ? ' ar-entry--expired' : ''}`}>
                        <Link href={`/product/${item.handle}`} className="ar-img-link">
                          <div className="ar-img-wrap">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.title} className="ar-img" />
                            )}
                          </div>
                        </Link>
                        <div className="ar-data">
                          <div>
                            <span className="ar-id">{id}</span>
                            {item.collectionTitle && (
                              <span className="ar-col">{item.collectionTitle.toUpperCase()}</span>
                            )}
                          </div>
                          <Link href={`/product/${item.handle}`} className="ar-title-link">
                            <h2 className="ar-piece-title">{item.title.toUpperCase()}</h2>
                          </Link>
                          <div className="ar-fields">
                            <div className="ar-field">
                              <span className="ar-field-label">Added</span>
                              <span className="ar-field-value">{formatDate(item.addedAt)}</span>
                            </div>
                            <div className="ar-field">
                              <span className="ar-field-label">Duration</span>
                              <span className={`ar-field-value${expired ? ' ar-field-expired' : ''}`}>
                                {remaining}
                              </span>
                            </div>
                            <div className="ar-field">
                              <span className="ar-field-label">Status</span>
                              <span className={`ar-status${expired ? ' ar-status--exp' : ''}`}>
                                {expired ? 'Expired' : 'Available'}
                              </span>
                            </div>
                          </div>
                          <button className="ar-remove" onClick={() => remove(item.handle)}>
                            Remove from Archive
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── Past Acquisitions ── */}
          {activeTab === 'acquisitions' && (
            <div className="ar-acquisitions">
              <h2 className="ar-section-title">PAST ACQUISITIONS</h2>
              <p className="ar-section-desc">
                A permanent record of pieces that have entered your collection.
              </p>
              <div className="ar-acq-body">
                {user ? (
                  <>
                    <p className="ar-acq-text">
                      Your acquisition history is maintained within your account.
                    </p>
                    <Link href="/account/orders" className="ar-cta-link">
                      View Acquisition History
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="ar-acq-text">
                      Connect your account to access your full acquisition history.
                    </p>
                    <Link href="/login" className="ar-cta-link">
                      Access your Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Availability Requests ── */}
          {activeTab === 'requests' && (
            <>
              <h2 className="ar-section-title">AVAILABILITY REQUESTS</h2>
              <p className="ar-section-desc">
                Size availability requests submitted on pieces from the collection.
                You will be contacted at your registered email if availability changes.
              </p>
              {availRequests.length === 0 ? (
                <div className="ar-empty">
                  <span className="ar-empty-title">No requests registered.</span>
                  <p className="ar-empty-sub">
                    When a piece becomes available in your size, you will be notified.
                  </p>
                </div>
              ) : (
                <div className="ar-entries">
                  {[...availRequests].reverse().map(req => (
                    <div key={req.id} className="ar-entry">
                      {req.imageUrl && (
                        <Link href={`/product/${req.product}`} className="ar-img-link">
                          <div className="ar-img-wrap">
                            <img src={req.imageUrl} alt={req.title} className="ar-img" />
                          </div>
                        </Link>
                      )}
                      <div className="ar-data">
                        <span className="ar-id">{archiveId(req.product)}</span>
                        <Link href={`/product/${req.product}`} className="ar-title-link">
                          <h2 className="ar-piece-title">{req.title.toUpperCase()}</h2>
                        </Link>
                        <div className="ar-fields">
                          <div className="ar-field">
                            <span className="ar-field-label">Sizes Requested</span>
                            <span className="ar-field-value">{req.sizes.join(', ')}</span>
                          </div>
                          <div className="ar-field">
                            <span className="ar-field-label">Submitted</span>
                            <span className="ar-field-value">{formatDate(req.submittedAt)}</span>
                          </div>
                          <div className="ar-field">
                            <span className="ar-field-label">Status</span>
                            <span className="ar-status">Registered</span>
                          </div>
                        </div>
                        <button className="ar-remove" onClick={() => removeRequest(req.id)}>
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Collection Registry ── */}
          {activeTab === 'registry' && (
            <div className="ar-registry">
              <h2 className="ar-section-title">COLLECTION REGISTRY</h2>
              <p className="ar-section-desc">
                An editorial overview of current and past collections, seasonal notes and release chronology.
              </p>
              <div className="ar-registry-body">
                <div className="ar-reg-item">
                  <h3 className="ar-reg-title">PERMANENCE</h3>
                  <p className="ar-reg-desc">The core collection. Pieces designed to transcend seasonality.</p>
                  <Link href="/collection/hoodie-1" className="ar-cta-link">Explore Collection</Link>
                </div>
                <div className="ar-reg-item">
                  <h3 className="ar-reg-title">SS26 — VOL I</h3>
                  <p className="ar-reg-desc">Initial ready-to-wear explorations in restrained tones.</p>
                  <Link href="/collection/summer-ttes-2" className="ar-cta-link">View Notes</Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        html, body { background: #0c0c0c !important; }

        .ar-wrap {
          min-height: 100vh;
          background: #0c0c0c;
          padding: 130px 48px 120px;
          box-sizing: border-box;
          font-family: var(--font-primary);
        }

        /* ── Header */
        .ar-header {
          max-width: 860px;
          margin: 0 auto 56px;
        }
        .ar-title {
          font-family: var(--font-brand);
          font-size: clamp(28px, 4.5vw, 48px);
          font-weight: 300;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.65);
          margin: 0 0 24px;
          padding-right: 0.2em;
        }
        .ar-hero-desc {
          font-family: var(--font-primary);
          font-size: 11px;
          font-weight: 300;
          line-height: 2.1;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
          margin: 0;
          max-width: 480px;
        }

        /* ── Tabs */
        .ar-tabs {
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 60px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .ar-tabs::-webkit-scrollbar { display: none; }
        .ar-tab {
          flex-shrink: 0;
          background: none;
          border: none;
          padding: 14px 0;
          margin-right: 40px;
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.4em;
          padding-right: 0.4em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          cursor: pointer;
          border-bottom: 1px solid transparent;
          margin-bottom: -1px;
          transition: color 0.4s, border-color 0.4s;
        }
        .ar-tab:hover { color: rgba(255,255,255,0.48); }
        .ar-tab--active {
          color: rgba(255,255,255,0.62);
          border-bottom-color: rgba(255,255,255,0.3);
        }

        /* ── Content */
        .ar-content { max-width: 860px; margin: 0 auto; min-height: 400px; }

        .ar-section-title {
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.55em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin: 0 0 16px;
          padding-right: 0.55em;
        }

        .ar-section-desc {
          font-size: 10px;
          font-weight: 300;
          line-height: 2.1;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.18);
          margin: 0 0 52px;
          max-width: 520px;
        }

        /* Empty */
        .ar-empty { padding: 20px 0 60px; }
        .ar-empty-title {
          display: block;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.32);
          margin-bottom: 14px;
        }
        .ar-empty-sub {
          font-size: 10px;
          font-weight: 300;
          line-height: 2;
          color: rgba(255,255,255,0.14);
          margin: 0 0 36px;
          max-width: 380px;
        }
        .ar-cta-link {
          display: inline-block;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.44em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.26);
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 6px;
          transition: color 0.35s, border-color 0.35s;
        }
        .ar-cta-link:hover { color: rgba(255,255,255,0.52); border-bottom-color: rgba(255,255,255,0.28); }

        /* Entries */
        .ar-entries { display: flex; flex-direction: column; }
        .ar-entry {
          display: grid;
          grid-template-columns: 108px 1fr;
          gap: 44px;
          padding: 44px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: opacity 0.4s;
        }
        .ar-entry:first-child { border-top: 1px solid rgba(255,255,255,0.05); }
        .ar-entry--expired { opacity: 0.32; }

        .ar-img-link { display: block; text-decoration: none; }
        .ar-img-wrap {
          width: 108px;
          aspect-ratio: 3 / 4;
          background: rgba(255,255,255,0.025);
          overflow: hidden;
        }
        .ar-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          filter: grayscale(0.12);
          transition: filter 0.4s;
        }
        .ar-img-wrap:hover .ar-img { filter: grayscale(0); }

        .ar-data {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 2px 0;
        }
        .ar-id {
          display: block;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.48em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.16);
          padding-right: 0.48em;
        }
        .ar-col {
          display: block;
          font-size: 7px;
          font-weight: 300;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.1);
          margin-top: 4px;
        }
        .ar-title-link { text-decoration: none; }
        .ar-piece-title {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.62);
          margin: 0;
          line-height: 1.6;
          transition: color 0.3s;
        }
        .ar-title-link:hover .ar-piece-title { color: rgba(255,255,255,0.9); }

        .ar-fields { display: flex; gap: 44px; flex-wrap: wrap; }
        .ar-field { display: flex; flex-direction: column; gap: 6px; }
        .ar-field-label {
          font-size: 7px;
          font-weight: 300;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.13);
          padding-right: 0.42em;
        }
        .ar-field-value {
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.36);
        }
        .ar-field-expired { color: rgba(255,255,255,0.15) !important; }
        .ar-status {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          padding-right: 0.35em;
        }
        .ar-status--exp { color: rgba(255,255,255,0.13); }

        .ar-remove {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: var(--font-primary);
          font-size: 7px;
          font-weight: 300;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.1);
          text-decoration: underline;
          text-underline-offset: 3px;
          align-self: flex-start;
          transition: color 0.3s;
        }
        .ar-remove:hover { color: rgba(255,255,255,0.32); }

        /* Acquisitions */
        .ar-acquisitions { padding: 0; }
        .ar-acq-body { display: flex; flex-direction: column; gap: 28px; padding-top: 8px; }
        .ar-acq-text {
          font-size: 11px;
          font-weight: 300;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.04em;
          line-height: 1.8;
          margin: 0;
          max-width: 420px;
        }

        /* Registry */
        .ar-registry { padding: 0; }
        .ar-registry-body {
          display: flex;
          flex-direction: column;
          gap: 60px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .ar-reg-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .ar-reg-title {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          margin: 0;
        }
        .ar-reg-desc {
          font-size: 11px;
          font-weight: 300;
          color: rgba(255,255,255,0.28);
          letter-spacing: 0.04em;
          line-height: 1.8;
          margin: 0 0 12px;
          max-width: 420px;
        }

        @media (max-width: 767px) {
          .ar-wrap { padding: 100px 24px 80px; }
          .ar-tab { margin-right: 24px; font-size: 7px; }
          .ar-entry { grid-template-columns: 84px 1fr; gap: 22px; padding: 32px 0; }
          .ar-img-wrap { width: 84px; }
          .ar-fields { gap: 22px; }
          .ar-piece-title { font-size: 10px; letter-spacing: 0.14em; }
        }
      `}</style>
    </>
  );
}
