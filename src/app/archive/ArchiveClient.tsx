'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWishlist, WishlistItem } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';

type Tab = 'personal' | 'acquisitions' | 'requests' | 'registry';

interface AvailRequest {
  id: string;
  product: string;
  title: string;
  size: string;
  color: string;
  notes?: string;
  submittedAt: number;
  status: 'submitted' | 'under_review' | 'sourced' | 'unavailable' | 'fulfilled';
}

interface Collection {
  id: string;
  title: string;
  season: string;
  year: string;
  pieceCount: number;
  coverImage: string;
  description: string;
  lookbook: string[];
}

const LABELS = {
  title: 'THE ARCHIVE ROOM',
  subtitle: 'A private registry for collecting, tracking and sourcing selected pieces from the house of TONET TORRENTINNI.',
  personalArchive: 'Personal Archive',
  pastAcquisitions: 'Past Acquisitions',
  availabilityRequests: 'Sourcing Requests',
  collectionRegistry: 'Collection Registry',
  recentlyArchived: 'Recently Archived',
  requestAPiece: 'Sourcing Concierge',
  registeredCollections: 'Collection Registry',
  archiveDetail: 'Archive Detail',
  noRequestsRegistered: 'No requests currently registered.',
  notifyNotice: 'Our sourcing team will contact you if the piece becomes available.',
};

const COLLECTIONS: Collection[] = [
  {
    id: 'permanence',
    title: 'PERMANENCE',
    season: 'CORE COLLECTION',
    year: 'SEASONLESS',
    pieceCount: 18,
    coverImage: '/hero/ComfyUI-main_reference_00012_.png',
    description: 'A study in weight and form. Silhouette explorations crafted from custom-milled heavyweight fleece, exploring clean seams and natural raw organic tones.',
    lookbook: [
      '/hero/ComfyUI-main_reference_00012_.png',
      '/hero/ComfyUI-main_reference_00018_.png',
      '/hero/ComfyUI-main_reference_00028_.png',
    ]
  },
  {
    id: 'ss26-vol1',
    title: 'SS26 — VOL I',
    season: 'SPRING/SUMMER 2026',
    year: '2026',
    pieceCount: 12,
    coverImage: '/hero/ComfyUI-main_reference_00016_.png',
    description: 'Initial ready-to-wear explorations in restrained tones. Inspired by coastal minerals, dust patterns, and the silent spaces of natural landscapes.',
    lookbook: [
      '/hero/ComfyUI-main_reference_00016_.png',
      '/hero/ComfyUI-main_reference_00019_.png',
      '/hero/ComfyUI-main_reference_00021_.png',
    ]
  },
  {
    id: 'fw25-vol2',
    title: 'FW25 — VOL II',
    season: 'AUTUMN/WINTER 2025',
    year: '2025',
    pieceCount: 24,
    coverImage: '/hero/ComfyUI-main_reference_00020_.png',
    description: 'Heavyweight outerwear layerings and technical fabrications. Exploring utility closures, modular linings and insulated natural cotton blends.',
    lookbook: [
      '/hero/ComfyUI-main_reference_00020_.png',
      '/hero/ComfyUI-main_reference_00022_.png',
      '/hero/ComfyUI-main_reference_00032_.png',
    ]
  }
];

const MOCK_ACQUISITIONS = [
  {
    id: 'TNT-ACQ-9821',
    date: 1779344400000, // mock date in future/present 2026
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
        title: 'ESSENTIAL HEAVYWEIGHT SHORTS',
        price: 320.00,
        size: 'M',
        color: 'HUESO',
        imageUrl: '/hero/ComfyUI-main_reference_00012_.png'
      }
    ]
  }
];

function archiveId(handle: string): string {
  const n = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `TNT-${String((n % 9000) + 1000).padStart(4, '0')}`;
}

function timeRemaining(addedAt: number | undefined): { text: string; percent: number; expired: boolean } {
  if (!addedAt) return { text: 'ACTIVE', percent: 100, expired: false };
  const elapsed = Date.now() - addedAt;
  const h48 = 48 * 3600 * 1000;
  if (elapsed >= h48) return { text: 'EXPIRED', percent: 0, expired: true };
  const rem = h48 - elapsed;
  const h = Math.floor(rem / 3600000);
  const m = Math.floor((rem % 3600000) / 60000);
  const percent = Math.max(0, Math.min(100, (rem / h48) * 100));
  if (h > 0) return { text: `${h}H REMAINING`, percent, expired: false };
  return { text: `${m}M REMAINING`, percent, expired: false };
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
  const { formatPrice } = useLocale();

  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam ?? 'personal');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [seasonFilter, setSeasonFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Sourcing form
  const [sourcePiece, setSourcePiece] = useState('');
  const [sourceSize, setSourceSize] = useState('M');
  const [sourceColor, setSourceColor] = useState('CARBON BLACK');
  const [sourceNotes, setSourceNotes] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Collections state
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const [availRequests, setAvailRequests] = useState<AvailRequest[]>([]);
  const [, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setAvailRequests(JSON.parse(localStorage.getItem('tonet-avail-requests') ?? '[]'));
    } catch {}
    const iv = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  if (!mounted) return null;

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setSelectedCollection(null);
    router.replace(`/archive?tab=${tab}`, { scroll: false });
  }

  function removeRequest(id: string) {
    const updated = availRequests.filter(r => r.id !== id);
    setAvailRequests(updated);
    localStorage.setItem('tonet-avail-requests', JSON.stringify(updated));
  }

  function handleSourcingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourcePiece.trim()) return;

    const newRequest: AvailRequest = {
      id: `REQ-${Date.now()}`,
      product: sourcePiece.toLowerCase().replace(/\s+/g, '-'),
      title: sourcePiece.trim().toUpperCase(),
      size: sourceSize,
      color: sourceColor.toUpperCase(),
      notes: sourceNotes.trim() || undefined,
      submittedAt: Date.now(),
      status: 'submitted',
    };

    const updated = [newRequest, ...availRequests];
    setAvailRequests(updated);
    localStorage.setItem('tonet-avail-requests', JSON.stringify(updated));

    // Clear form
    setSourcePiece('');
    setSourceNotes('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  }

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSeason = seasonFilter === 'ALL' || (item.collectionTitle && item.collectionTitle.toUpperCase() === seasonFilter.toUpperCase());
    const matchesCategory = categoryFilter === 'ALL' || (item.title && item.title.toUpperCase().includes(categoryFilter.toUpperCase()));
    return matchesSeason && matchesCategory;
  });

  const recentlyArchived = items.slice(-3).reverse();

  return (
    <>
      <div className="ar-space-wrap">
        {/* Collector Metadata Header */}
        <div className="ar-client-summary">
          <div className="ar-summary-item">
            <span className="ar-summary-label">CLIENT REGISTRY</span>
            <span className="ar-summary-val">
              {user ? `TNT-${String(user.email.split('').reduce((a,c)=>a+c.charCodeAt(0),0) % 9000 + 1000)}` : 'GUEST COLLECTOR'}
            </span>
          </div>
          <div className="ar-summary-item ar-summary-center">
            <span className="ar-summary-label">MAISON ACCESS</span>
            <span className="ar-summary-val">{user ? `${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}` : 'PRIVATE MODE'}</span>
          </div>
          <div className="ar-summary-item">
            <span className="ar-summary-label">MEMBER STATUS</span>
            <span className="ar-summary-val">{user ? 'VERIFIED RECORD' : 'ANONYMOUS'}</span>
          </div>
        </div>

        {/* Editorial Title */}
        <div className="ar-editor-header">
          <h1 className="ar-main-title">{LABELS.title}</h1>
          <p className="ar-main-subtitle">{LABELS.subtitle}</p>
        </div>

        {/* Main Workspace Layout */}
        <div className="ar-workspace">
          
          {/* Desktop Left Sidebar / Navigation */}
          <aside className="ar-sidebar">
            <nav className="ar-nav-links">
              <button className={`ar-nav-item ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => switchTab('personal')}>
                <span className="ar-nav-num">01</span> {LABELS.personalArchive}
              </button>
              <button className={`ar-nav-item ${activeTab === 'acquisitions' ? 'active' : ''}`} onClick={() => switchTab('acquisitions')}>
                <span className="ar-nav-num">02</span> {LABELS.pastAcquisitions}
              </button>
              <button className={`ar-nav-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => switchTab('requests')}>
                <span className="ar-nav-num">03</span> {LABELS.availabilityRequests}
              </button>
              <button className={`ar-nav-item ${activeTab === 'registry' ? 'active' : ''}`} onClick={() => switchTab('registry')}>
                <span className="ar-nav-num">04</span> {LABELS.collectionRegistry}
              </button>
            </nav>

            <div className="ar-sidebar-footer">
              {user && (
                <Link href="/account/information" className="ar-sidebar-link">
                  House Record (Profile)
                </Link>
              )}
              <Link href="/account" className="ar-sidebar-link">
                Return to Residence
              </Link>
            </div>
          </aside>

          {/* Mobile Swiper Tabs */}
          <div className="ar-mobile-tabs">
            <button className={`ar-m-tab ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => switchTab('personal')}>Archive</button>
            <button className={`ar-m-tab ${activeTab === 'acquisitions' ? 'active' : ''}`} onClick={() => switchTab('acquisitions')}>Acquisitions</button>
            <button className={`ar-m-tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => switchTab('requests')}>Sourcing</button>
            <button className={`ar-m-tab ${activeTab === 'registry' ? 'active' : ''}`} onClick={() => switchTab('registry')}>Collections</button>
          </div>

          {/* Right Content Panel */}
          <main className="ar-panel-content">
            
            {/* 1. PERSONAL ARCHIVE TAB */}
            {activeTab === 'personal' && (
              <div className="ar-fade-in">
                {/* Recently Archived Section (Editorial spotlight) */}
                {recentlyArchived.length > 0 && (
                  <div className="ar-spotlight">
                    <h3 className="ar-section-eyebrow">{LABELS.recentlyArchived}</h3>
                    <div className="ar-spotlight-row">
                      {recentlyArchived.map(item => (
                        <div key={`spot-${item.handle}`} className="ar-spot-card">
                          <img src={item.imageUrl} alt={item.title} className="ar-spot-img" />
                          <div className="ar-spot-info">
                            <span className="ar-spot-col">{item.collectionTitle?.toUpperCase()}</span>
                            <span className="ar-spot-title">{item.title.toUpperCase()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter & View Switcher Bar */}
                <div className="ar-filter-bar">
                  <div className="ar-filters-group">
                    <div className="ar-filter-select-wrap">
                      <span className="ar-filter-lbl">Season:</span>
                      <select className="ar-filter-select" value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}>
                        <option value="ALL">ALL SEASONS</option>
                        <option value="PERMANENCE">PERMANENCE</option>
                        <option value="SS26 — VOL I">SS26 — VOL I</option>
                        <option value="FW25 — VOL II">FW25 — VOL II</option>
                      </select>
                    </div>

                    <div className="ar-filter-select-wrap">
                      <span className="ar-filter-lbl">Type:</span>
                      <select className="ar-filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="ALL">ALL PIECES</option>
                        <option value="HOODIE">HOODIES</option>
                        <option value="SHORTS">SHORTS</option>
                        <option value="TEE">TEES</option>
                        <option value="PANTS">PANTS</option>
                      </select>
                    </div>
                  </div>

                  <div className="ar-view-toggle">
                    <button className={`ar-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>GRID</button>
                    <button className={`ar-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>LIST</button>
                  </div>
                </div>

                {/* Entries Layout */}
                {filteredItems.length === 0 ? (
                  <div className="ar-editorial-empty">
                    <h3 className="ar-empty-hed">THE ARCHIVE IS CURRENTLY EMPTY</h3>
                    <p className="ar-empty-sub-text">
                      Selected garments will be preserved here temporarily for future acquisition.
                    </p>
                    <Link href="/collection" className="ar-editorial-cta">Explore Collections</Link>
                  </div>
                ) : viewMode === 'grid' ? (
                  /* GRID VIEW */
                  <div className="ar-grid-layout">
                    {filteredItems.map(item => {
                      const id = archiveId(item.handle);
                      const { text: remText, percent, expired } = timeRemaining(item.addedAt);
                      return (
                        <div key={item.handle} className={`ar-grid-card ${expired ? 'expired' : ''}`}>
                          <Link href={`/product/${item.handle}`} className="ar-card-img-container">
                            <img src={item.imageUrl} alt={item.title} className="ar-card-img" />
                            {expired && <div className="ar-card-expired-overlay">EXPIRED</div>}
                          </Link>
                          <div className="ar-card-body">
                            <div className="ar-card-meta">
                              <span className="ar-card-id">{id}</span>
                              <span className="ar-card-season">{item.collectionTitle?.toUpperCase()}</span>
                            </div>
                            <h4 className="ar-card-title">
                              <Link href={`/product/${item.handle}`}>{item.title.toUpperCase()}</Link>
                            </h4>
                            <div className="ar-card-price">{formatPrice(item.price, item.currencyCode)}</div>
                            
                            {/* Visual Timeline duration bar */}
                            <div className="ar-duration-bar-wrap">
                              <div className="ar-duration-bar" style={{ width: `${percent}%` }} />
                              <div className="ar-duration-labels">
                                <span>RETENTION</span>
                                <span className={expired ? 'expired-text' : ''}>{remText}</span>
                              </div>
                            </div>

                            <button className="ar-card-remove-btn" onClick={() => remove(item.handle)}>
                              DISMISS PIECE
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* LIST VIEW */
                  <div className="ar-list-layout">
                    {filteredItems.map(item => {
                      const id = archiveId(item.handle);
                      const { text: remText, expired } = timeRemaining(item.addedAt);
                      return (
                        <div key={`list-${item.handle}`} className={`ar-list-row ${expired ? 'expired' : ''}`}>
                          <img src={item.imageUrl} alt={item.title} className="ar-list-img" />
                          <div className="ar-list-details">
                            <span className="ar-list-id">{id}</span>
                            <h4 className="ar-list-title">
                              <Link href={`/product/${item.handle}`}>{item.title.toUpperCase()}</Link>
                            </h4>
                            <span className="ar-list-season">{item.collectionTitle?.toUpperCase()}</span>
                          </div>
                          <div className="ar-list-duration">
                            <span className="ar-list-label">RETENTION</span>
                            <span className={`ar-list-val ${expired ? 'expired-text' : ''}`}>{remText}</span>
                          </div>
                          <div className="ar-list-price">{formatPrice(item.price, item.currencyCode)}</div>
                          <button className="ar-list-remove-btn" onClick={() => remove(item.handle)}>
                            DISMISS
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. PAST ACQUISITIONS TAB */}
            {activeTab === 'acquisitions' && (
              <div className="ar-fade-in">
                {user ? (
                  <div className="ar-acquisitions-panel">
                    {/* Notable acquisitions spotlight */}
                    <div className="ar-notable-acq">
                      <h3 className="ar-section-eyebrow">NOTABLE ACQUISITION</h3>
                      <div className="ar-notable-card">
                        <img src="/hero/ComfyUI-main_reference_00028_.png" alt="Notable Piece" className="ar-notable-img" />
                        <div className="ar-notable-details">
                          <span className="ar-notable-label">SEASON HIGHLIGHT</span>
                          <h2 className="ar-notable-title">HEAVYWEIGHT RAGLAN ZIP HOODIE</h2>
                          <p className="ar-notable-desc">
                            Selected from SS26 Ready-to-wear. A certified piece registered on your collection registry.
                          </p>
                          <span className="ar-notable-meta">REGISTERED IN WARDROBE ON 15 JUNE 2026</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline List (no tables) */}
                    <h3 className="ar-section-eyebrow">ACQUISITIONS REGISTRY</h3>
                    <div className="ar-timeline">
                      {MOCK_ACQUISITIONS.map(acq => (
                        <div key={acq.id} className="ar-timeline-node">
                          <div className="ar-node-header">
                            <div className="ar-node-left">
                              <span className="ar-node-date">{formatDate(acq.date)}</span>
                              <span className="ar-node-id">{acq.id}</span>
                            </div>
                            <div className="ar-node-right">
                              <span className="ar-node-total">Total: {formatPrice(acq.total, acq.currency)}</span>
                              <span className={`ar-node-status ${acq.status}`}>● {acq.status.toUpperCase()}</span>
                            </div>
                          </div>

                          <div className="ar-node-body">
                            {acq.items.map(item => (
                              <div key={item.handle} className="ar-node-item">
                                <img src={item.imageUrl} alt={item.title} className="ar-node-item-img" />
                                <div className="ar-node-item-details">
                                  <h4 className="ar-node-item-title">{item.title}</h4>
                                  <span className="ar-node-item-meta">SIZE: {item.size} / COLOR: {item.color}</span>
                                  <span className="ar-node-item-price">{formatPrice(item.price, acq.currency)}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="ar-node-footer">
                            <span className="ar-node-payment">{acq.payment}</span>
                            <div className="ar-node-actions">
                              <a href="#" onClick={(e) => { e.preventDefault(); alert("Invoice downloaded successfully (Mock PDF)."); }} className="ar-node-link">
                                Download Invoice (PDF)
                              </a>
                              <Link href={`/product/${acq.items[0].handle}`} className="ar-node-link">
                                Reorder Piece
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ar-editorial-empty">
                    <h3 className="ar-empty-hed">AUTHENTICATION REQUIRED</h3>
                    <p className="ar-empty-sub-text">
                      Please access your client record to view your acquisitions history.
                    </p>
                    <Link href="/login" className="ar-editorial-cta">Access Account</Link>
                  </div>
                )}
              </div>
            )}

            {/* 3. AVAILABILITY REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div className="ar-fade-in">
                {/* Request Sourcing Form */}
                <div className="ar-sourcing-section">
                  <div className="ar-sourcing-intro">
                    <h3 className="ar-section-eyebrow">{LABELS.requestAPiece}</h3>
                    <p className="ar-sourcing-intro-text">
                      If a piece or specific size is currently unavailable, submit a request below. 
                      Our sourcing concierge team will review the request and contact you directly via email.
                    </p>
                  </div>

                  <form className="ar-sourcing-form" onSubmit={handleSourcingSubmit}>
                    <div className="ar-form-row">
                      <div className="ar-form-group">
                        <label className="ar-form-label">Garment / Piece Name</label>
                        <input
                          type="text"
                          required
                          className="ar-form-input"
                          placeholder="e.g. HEAVYWEIGHT RAGLAN ZIP HOODIE"
                          value={sourcePiece}
                          onChange={(e) => setSourcePiece(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="ar-form-grid">
                      <div className="ar-form-group">
                        <label className="ar-form-label">Requested Size</label>
                        <select className="ar-form-select" value={sourceSize} onChange={(e) => setSourceSize(e.target.value)}>
                          <option value="S">S / SMALL</option>
                          <option value="M">M / MEDIUM</option>
                          <option value="L">L / LARGE</option>
                          <option value="XL">XL / EXTRA LARGE</option>
                          <option value="OS">OS / ONE SIZE</option>
                        </select>
                      </div>

                      <div className="ar-form-group">
                        <label className="ar-form-label">Desired Color / Wash</label>
                        <select className="ar-form-select" value={sourceColor} onChange={(e) => setSourceColor(e.target.value)}>
                          <option value="CARBON BLACK">CARBON BLACK</option>
                          <option value="ASH GRAY">ASH GRAY</option>
                          <option value="HUESO / OFF-WHITE">HUESO / OFF-WHITE</option>
                          <option value="DUST WARM GRAY">DUST WARM GRAY</option>
                        </select>
                      </div>
                    </div>

                    <div className="ar-form-row">
                      <div className="ar-form-group">
                        <label className="ar-form-label">Collector Notes (Optional specifications)</label>
                        <textarea
                          className="ar-form-textarea"
                          placeholder="Specify custom lengths, collection versions or vintage requests..."
                          value={sourceNotes}
                          onChange={(e) => setSourceNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    {formSuccess && (
                      <p className="ar-form-success">Sourcing request recorded. A concierge agent is reviewing it.</p>
                    )}

                    <button type="submit" className="ar-form-submit-btn">
                      SUBMIT SOURCING REQUEST
                    </button>
                  </form>
                </div>

                {/* Sourcing History */}
                <h3 className="ar-section-eyebrow">SUBMITTED REQUESTS</h3>
                {availRequests.length === 0 ? (
                  <div className="ar-sourcing-empty-state">
                    <span className="ar-sourcing-empty-text">{LABELS.noRequestsRegistered}</span>
                    <p className="ar-sourcing-empty-sub">{LABELS.notifyNotice}</p>
                  </div>
                ) : (
                  <div className="ar-sourcing-list">
                    {availRequests.map(req => (
                      <div key={req.id} className="ar-sourcing-card">
                        <div className="ar-sourcing-card-header">
                          <span className="ar-sourcing-card-id">{req.id}</span>
                          <span className={`ar-sourcing-badge ${req.status}`}>
                            {req.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <h4 className="ar-sourcing-card-title">{req.title}</h4>
                        <div className="ar-sourcing-card-details">
                          <span>SIZE: {req.size}</span>
                          <span>COLOR: {req.color}</span>
                          <span>REQUESTED: {formatDate(req.submittedAt)}</span>
                        </div>
                        {req.notes && (
                          <div className="ar-sourcing-card-notes">
                            <strong>Notes:</strong> "{req.notes}"
                          </div>
                        )}
                        <button className="ar-sourcing-card-dismiss-btn" onClick={() => removeRequest(req.id)}>
                          DISMISS
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. COLLECTION REGISTRY TAB */}
            {activeTab === 'registry' && (
              <div className="ar-fade-in">
                {!selectedCollection ? (
                  /* COLLECTIONS GRID */
                  <div className="ar-collections-grid-wrap">
                    <h3 className="ar-section-eyebrow">{LABELS.registeredCollections}</h3>
                    <div className="ar-collections-grid">
                      {COLLECTIONS.map(col => (
                        <div key={col.id} className="ar-collection-card" onClick={() => setSelectedCollection(col)}>
                          <div className="ar-col-card-img-wrap">
                            <img src={col.coverImage} alt={col.title} className="ar-col-card-img" />
                          </div>
                          <div className="ar-col-card-body">
                            <span className="ar-col-card-season">{col.season}</span>
                            <h3 className="ar-col-card-title">{col.title}</h3>
                            <div className="ar-col-card-meta">
                              <span>YEAR: {col.year}</span>
                              <span>{col.pieceCount} PIECES REGISTERED</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* COLLECTION DETAIL VIEW */
                  <div className="ar-collection-detail-view">
                    <button className="ar-detail-back-btn" onClick={() => setSelectedCollection(null)}>
                      ← RETURN TO REGISTRY
                    </button>
                    
                    <div className="ar-detail-hero">
                      <div className="ar-detail-hero-left">
                        <span className="ar-detail-eyebrow">{selectedCollection.season}</span>
                        <h1 className="ar-detail-title">{selectedCollection.title}</h1>
                        <p className="ar-detail-desc">{selectedCollection.description}</p>
                      </div>
                      <img src={selectedCollection.coverImage} alt={selectedCollection.title} className="ar-detail-hero-img" />
                    </div>

                    {/* Lookbook Row */}
                    <div className="ar-detail-lookbook">
                      <h3 className="ar-section-eyebrow">EDITORIAL LOOKBOOK</h3>
                      <div className="ar-lookbook-row">
                        {selectedCollection.lookbook.map((img, idx) => (
                          <div key={`${selectedCollection.id}-look-${idx}`} className="ar-lookbook-img-wrap">
                            <img src={img} alt={`Look ${idx + 1}`} className="ar-lookbook-img" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Wardrobe registry checklist */}
                    <div className="ar-detail-checklist">
                      <h3 className="ar-section-eyebrow">PIECES CHECKLIST & REGISTER</h3>
                      <div className="ar-checklist-list">
                        
                        <div className="ar-checklist-item">
                          <div className="ar-checklist-left">
                            <span className="ar-checklist-name">HEAVYWEIGHT RAGLAN ZIP HOODIE</span>
                            <span className="ar-checklist-status active">IN WARDROBE</span>
                          </div>
                          <Link href="/product/heavyweight-raglan-zip-hoodie" className="ar-checklist-action">VIEW PIECE</Link>
                        </div>

                        <div className="ar-checklist-item">
                          <div className="ar-checklist-left">
                            <span className="ar-checklist-name">ESSENTIAL HEAVYWEIGHT SHORTS</span>
                            <span className="ar-checklist-status active">IN WARDROBE</span>
                          </div>
                          <Link href="/product/essential-heavyweight-shorts" className="ar-checklist-action">VIEW PIECE</Link>
                        </div>

                        <div className="ar-checklist-item">
                          <div className="ar-checklist-left">
                            <span className="ar-checklist-name">UNISEX SUNFADE WAFFLE BOXY TEE</span>
                            <span className="ar-checklist-status inactive">UNREGISTERED</span>
                          </div>
                          <Link href="/product/unisex-sunfade-waffle-boxy-tee" className="ar-checklist-action">EXPLORE PIECE</Link>
                        </div>

                        <div className="ar-checklist-item">
                          <div className="ar-checklist-left">
                            <span className="ar-checklist-name">CORE CARGO PANTS</span>
                            <span className="ar-checklist-status inactive">UNREGISTERED</span>
                          </div>
                          <Link href="/product/core-cargo-pants" className="ar-checklist-action">EXPLORE PIECE</Link>
                        </div>

                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      <style>{`
        /* Dark luxury space overrides */
        html, body {
          background: #080808 !important;
        }

        .ar-space-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 140px 24px 100px;
          font-family: var(--font-primary), sans-serif;
          color: rgba(255, 255, 255, 0.85);
          box-sizing: border-box;
        }

        /* ══ COLLECTOR SUMMARY HEADER ══ */
        .ar-client-summary {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 18px 0;
          margin-bottom: 72px;
          font-size: 8px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.35);
        }
        .ar-summary-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ar-summary-item:last-child {
          align-items: flex-end;
        }
        .ar-summary-center {
          align-items: center;
          color: rgba(255, 255, 255, 0.7);
        }
        .ar-summary-label {
          font-weight: 300;
          color: rgba(255, 255, 255, 0.2);
        }
        .ar-summary-val {
          font-weight: 400;
        }

        /* ══ EDITOR HEADER ══ */
        .ar-editor-header {
          text-align: center;
          margin-bottom: 80px;
        }
        .ar-main-title {
          font-family: var(--font-brand), serif;
          font-size: clamp(28px, 5vw, 48px);
          font-weight: 300;
          letter-spacing: 0.18em;
          color: rgba(255, 255, 255, 0.8);
          margin: 0 0 20px;
        }
        .ar-main-subtitle {
          font-size: 11px;
          font-weight: 300;
          line-height: 2.1;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.35);
          max-width: 520px;
          margin: 0 auto;
        }

        /* ══ WORKSPACE LAYOUT ══ */
        .ar-workspace {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 64px;
          align-items: start;
        }

        /* Sidebar navigation */
        .ar-sidebar {
          position: sticky;
          top: 120px;
          display: flex;
          flex-direction: column;
          gap: 80px;
        }
        .ar-nav-links {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 24px;
        }
        .ar-nav-item {
          background: none;
          border: none;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.25);
          cursor: pointer;
          padding: 8px 0;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: color 0.4s, padding-left 0.4s;
          border-left: 2px solid transparent;
        }
        .ar-nav-item:hover {
          color: rgba(255, 255, 255, 0.7);
          padding-left: 6px;
        }
        .ar-nav-item.active {
          color: #ffffff;
          font-weight: 400;
          border-left-color: rgba(255, 255, 255, 0.5);
          padding-left: 12px;
        }
        .ar-nav-num {
          font-size: 8px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.15);
          letter-spacing: 0.05em;
        }
        .ar-sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 24px;
        }
        .ar-sidebar-link {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
          text-decoration: none;
          transition: color 0.3s;
        }
        .ar-sidebar-link:hover {
          color: #ffffff;
        }

        /* Mobile swiper tabs - hidden on desktop */
        .ar-mobile-tabs {
          display: none;
        }

        /* Panel content wrapper */
        .ar-panel-content {
          min-height: 500px;
        }

        /* Fade-in transitions */
        .ar-fade-in {
          animation: arFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes arFadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ar-section-eyebrow {
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.44em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.25);
          margin: 0 0 28px;
        }

        /* ══ PORTFOLIO SPOTLIGHT ══ */
        .ar-spotlight {
          margin-bottom: 64px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 40px;
        }
        .ar-spotlight-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .ar-spot-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          padding: 16px;
        }
        .ar-spot-img {
          width: 48px;
          height: 64px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.02);
          filter: grayscale(0.2);
        }
        .ar-spot-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ar-spot-col {
          font-size: 7px;
          font-weight: 300;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.2);
        }
        .ar-spot-title {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.7);
        }

        /* ══ FILTER & VIEW SWITCH BAR ══ */
        .ar-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 18px;
          margin-bottom: 44px;
        }
        .ar-filters-group {
          display: flex;
          gap: 32px;
        }
        .ar-filter-select-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ar-filter-lbl {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.25);
          text-transform: uppercase;
        }
        .ar-filter-select {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.65);
          font-family: inherit;
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          outline: none;
          cursor: pointer;
        }
        .ar-filter-select option {
          background: #111111;
          color: rgba(255, 255, 255, 0.85);
        }
        .ar-view-toggle {
          display: flex;
          gap: 16px;
        }
        .ar-view-btn {
          background: none;
          border: none;
          font-family: inherit;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.25);
          cursor: pointer;
          transition: color 0.3s;
          padding: 4px;
        }
        .ar-view-btn:hover,
        .ar-view-btn.active {
          color: #ffffff;
        }

        /* ══ GRID CARDS LAYOUT ══ */
        .ar-grid-layout {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
        }
        .ar-grid-card {
          display: flex;
          flex-direction: column;
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.03);
          transition: border-color 0.4s;
        }
        .ar-grid-card:hover {
          border-color: rgba(255, 255, 255, 0.08);
        }
        .ar-card-img-container {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          background: rgba(255, 255, 255, 0.015);
          overflow: hidden;
          display: block;
        }
        .ar-card-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: grayscale(1) contrast(1.02);
          transition: filter 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 24px;
          box-sizing: border-box;
        }
        .ar-grid-card:hover .ar-card-img {
          filter: grayscale(0) contrast(1);
          transform: scale(1.018);
        }
        .ar-card-expired-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          letter-spacing: 0.4em;
          color: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(2px);
        }
        .ar-card-body {
          padding: 32px;
          display: flex;
          flex-direction: column;
        }
        .ar-card-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .ar-card-id {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.2);
        }
        .ar-card-season {
          font-size: 7px;
          font-weight: 300;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.3);
        }
        .ar-card-title {
          font-family: var(--font-brand), serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.15em;
          margin: 0 0 10px;
        }
        .ar-card-title a {
          color: rgba(255, 255, 255, 0.85);
          transition: color 0.3s;
        }
        .ar-card-title a:hover {
          color: #ffffff;
        }
        .ar-card-price {
          font-size: 10px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 28px;
          letter-spacing: 0.05em;
        }
        
        /* Duration timeline bar */
        .ar-duration-bar-wrap {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 32px;
        }
        .ar-duration-bar-wrap::before {
          content: "";
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          width: 100%;
        }
        .ar-duration-bar {
          height: 2px;
          background: rgba(255, 255, 255, 0.65);
          transition: width 0.4s;
        }
        .ar-grid-card.expired .ar-duration-bar {
          background: rgba(255, 255, 255, 0.1);
        }
        .ar-duration-labels {
          display: flex;
          justify-content: space-between;
          font-size: 7px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.2);
          font-weight: 300;
        }
        .ar-duration-labels .expired-text {
          color: rgba(255, 255, 255, 0.12);
        }

        .ar-card-remove-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.4);
          font-family: inherit;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.3em;
          padding: 12px;
          cursor: pointer;
          transition: border-color 0.4s, color 0.4s;
          border-radius: 0;
        }
        .ar-card-remove-btn:hover {
          border-color: rgba(255, 255, 255, 0.4);
          color: #ffffff;
        }

        /* ══ LIST VIEW LAYOUT ══ */
        .ar-list-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ar-list-row {
          display: grid;
          grid-template-columns: 64px 2fr 1.5fr 1fr auto;
          align-items: center;
          gap: 40px;
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.03);
          padding: 16px 24px;
        }
        .ar-list-img {
          width: 64px;
          height: 80px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.02);
          padding: 8px;
          box-sizing: border-box;
          filter: grayscale(0.8);
        }
        .ar-list-row:hover .ar-list-img {
          filter: grayscale(0);
        }
        .ar-list-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ar-list-id {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: 0.2em;
        }
        .ar-list-title {
          font-family: var(--font-brand), serif;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.1em;
          margin: 0;
        }
        .ar-list-title a { color: inherit; }
        .ar-list-season {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 0.15em;
        }
        .ar-list-duration {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ar-list-label {
          font-size: 7px;
          color: rgba(255, 255, 255, 0.15);
          letter-spacing: 0.25em;
        }
        .ar-list-val {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.05em;
        }
        .ar-list-val.expired-text {
          color: rgba(255, 255, 255, 0.15);
        }
        .ar-list-price {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.05em;
        }
        .ar-list-remove-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.25);
          font-family: inherit;
          font-size: 8px;
          letter-spacing: 0.25em;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.3s;
        }
        .ar-list-remove-btn:hover {
          color: #ffffff;
        }

        /* ══ EDITORIAL EMPTY STATE ══ */
        .ar-editorial-empty {
          text-align: center;
          padding: 100px 0;
          border: 1px dashed rgba(255, 255, 255, 0.04);
        }
        .ar-empty-hed {
          font-family: var(--font-brand), serif;
          font-size: 16px;
          font-weight: 300;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.4);
          margin: 0 0 16px;
        }
        .ar-empty-sub-text {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: 0.05em;
          margin: 0 0 36px;
        }
        .ar-editorial-cta {
          display: inline-block;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #ffffff;
          border: 1px solid #ffffff;
          padding: 14px 28px;
          text-decoration: none;
          transition: background 0.4s, color 0.4s;
        }
        .ar-editorial-cta:hover {
          background: #ffffff;
          color: #000000;
        }

        /* ══ PAST ACQUISITIONS TIMELINE ══ */
        .ar-acquisitions-panel {
          display: flex;
          flex-direction: column;
          gap: 60px;
        }
        .ar-notable-acq {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 48px;
        }
        .ar-notable-card {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 40px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 32px;
          align-items: center;
        }
        .ar-notable-img {
          width: 140px;
          aspect-ratio: 3 / 4;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.02);
          padding: 12px;
          box-sizing: border-box;
          filter: grayscale(0.2);
        }
        .ar-notable-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ar-notable-label {
          font-size: 7px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255, 255, 255, 0.3);
        }
        .ar-notable-title {
          font-family: var(--font-brand), serif;
          font-size: 16px;
          font-weight: 300;
          letter-spacing: 0.2em;
          margin: 0;
        }
        .ar-notable-desc {
          font-size: 11px;
          line-height: 1.9;
          letter-spacing: 0.04em;
          color: rgba(255, 255, 255, 0.35);
          margin: 0;
          max-width: 480px;
        }
        .ar-notable-meta {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.25);
          letter-spacing: 0.15em;
          font-weight: 300;
        }

        .ar-timeline {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .ar-timeline-node {
          border: 1px solid rgba(255, 255, 255, 0.04);
          background: #090909;
          padding: 32px;
        }
        .ar-node-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 18px;
          margin-bottom: 24px;
        }
        .ar-node-left {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .ar-node-date {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.18em;
          color: rgba(255, 255, 255, 0.85);
        }
        .ar-node-id {
          font-size: 8px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.25);
        }
        .ar-node-right {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .ar-node-total {
          font-size: 10px;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.55);
        }
        .ar-node-status {
          font-size: 8px;
          letter-spacing: 0.22em;
          font-weight: 400;
        }
        .ar-node-status.delivered { color: #a3a3a3; }

        .ar-node-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }
        .ar-node-item {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .ar-node-item-img {
          width: 52px;
          height: 68px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.02);
          padding: 6px;
          box-sizing: border-box;
          filter: grayscale(0.2);
        }
        .ar-node-item-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ar-node-item-title {
          font-family: var(--font-brand), serif;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.15em;
          margin: 0;
        }
        .ar-node-item-meta {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.25);
          letter-spacing: 0.15em;
        }
        .ar-node-item-price {
          font-size: 9px;
          color: rgba(255, 255, 255, 0.45);
          letter-spacing: 0.05em;
        }

        .ar-node-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 18px;
        }
        .ar-node-payment {
          font-size: 8px;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.18);
        }
        .ar-node-actions {
          display: flex;
          gap: 24px;
        }
        .ar-node-link {
          font-size: 8px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.35);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.3s;
        }
        .ar-node-link:hover {
          color: #ffffff;
        }

        /* ══ SOURCING REQUESTS TAB ══ */
        .ar-sourcing-section {
          background: #090909;
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 40px;
          margin-bottom: 60px;
        }
        .ar-sourcing-intro {
          margin-bottom: 36px;
        }
        .ar-sourcing-intro-text {
          font-size: 11px;
          line-height: 2.1;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.35);
          max-width: 580px;
          margin: 0;
        }

        .ar-sourcing-form {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .ar-form-row {
          width: 100%;
        }
        .ar-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
        }
        .ar-form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ar-form-label {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.25);
        }
        .ar-form-input,
        .ar-form-select,
        .ar-form-textarea {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.85);
          font-family: inherit;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.15em;
          padding: 12px 0;
          outline: none;
          border-radius: 0;
          transition: border-color 0.4s;
        }
        .ar-form-input:focus,
        .ar-form-select:focus,
        .ar-form-textarea:focus {
          border-color: #ffffff;
        }
        .ar-form-select option {
          background: #111111;
          color: #ffffff;
        }
        .ar-form-textarea {
          min-height: 90px;
          resize: vertical;
        }
        .ar-form-success {
          font-size: 10px;
          letter-spacing: 0.1em;
          color: #a3a3a3;
          margin: 0;
        }
        .ar-form-submit-btn {
          background: #ffffff;
          color: #000000;
          font-family: inherit;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.35em;
          border: none;
          padding: 18px;
          cursor: pointer;
          transition: opacity 0.3s;
          border-radius: 0;
          margin-top: 12px;
        }
        .ar-form-submit-btn:hover {
          opacity: 0.85;
        }

        .ar-sourcing-empty-state {
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 44px;
          text-align: center;
        }
        .ar-sourcing-empty-text {
          font-size: 10px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }
        .ar-sourcing-empty-sub {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: 0.05em;
          margin: 0;
        }

        .ar-sourcing-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ar-sourcing-card {
          border: 1px solid rgba(255, 255, 255, 0.04);
          background: #090909;
          padding: 28px;
          display: flex;
          flex-direction: column;
        }
        .ar-sourcing-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .ar-sourcing-card-id {
          font-size: 8px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.2);
        }
        .ar-sourcing-badge {
          font-size: 7px;
          font-weight: 400;
          letter-spacing: 0.22em;
          padding: 4px 8px;
          border: 1px solid transparent;
        }
        .ar-sourcing-badge.submitted {
          border-color: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.4);
        }
        .ar-sourcing-badge.under_review {
          border-color: rgba(255, 255, 255, 0.35);
          color: rgba(255, 255, 255, 0.75);
        }
        .ar-sourcing-card-title {
          font-family: var(--font-brand), serif;
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.18em;
          margin: 0 0 12px;
        }
        .ar-sourcing-card-details {
          display: flex;
          gap: 24px;
          font-size: 8px;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 16px;
        }
        .ar-sourcing-card-notes {
          font-size: 9.5px;
          font-style: italic;
          color: rgba(255, 255, 255, 0.3);
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          padding-left: 12px;
          margin-bottom: 20px;
        }
        .ar-sourcing-card-dismiss-btn {
          align-self: flex-start;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.15);
          font-family: inherit;
          font-size: 8px;
          letter-spacing: 0.25em;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          padding: 0;
          transition: color 0.3s;
        }
        .ar-sourcing-card-dismiss-btn:hover {
          color: rgba(255, 255, 255, 0.4);
        }

        /* ══ COLLECTION REGISTRY TAB ══ */
        .ar-collections-grid-wrap {
          display: flex;
          flex-direction: column;
        }
        .ar-collections-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
        }
        .ar-collection-card {
          background: #090909;
          border: 1px solid rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: border-color 0.4s;
        }
        .ar-collection-card:hover {
          border-color: rgba(255, 255, 255, 0.08);
        }
        .ar-col-card-img-wrap {
          width: 100%;
          aspect-ratio: 4 / 3;
          background: rgba(255, 255, 255, 0.015);
          overflow: hidden;
        }
        .ar-col-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.5);
          transition: filter 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ar-collection-card:hover .ar-col-card-img {
          filter: grayscale(0);
          transform: scale(1.01);
        }
        .ar-col-card-body {
          padding: 28px;
        }
        .ar-col-card-season {
          font-size: 7px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }
        .ar-col-card-title {
          font-family: var(--font-brand), serif;
          font-size: 15px;
          font-weight: 300;
          letter-spacing: 0.18em;
          margin: 0 0 14px;
        }
        .ar-col-card-meta {
          display: flex;
          justify-content: space-between;
          font-size: 8px;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.2);
        }

        /* ══ COLLECTION DETAIL VIEW ══ */
        .ar-collection-detail-view {
          display: flex;
          flex-direction: column;
          gap: 60px;
        }
        .ar-detail-back-btn {
          align-self: flex-start;
          background: none;
          border: none;
          font-family: inherit;
          font-size: 8px;
          letter-spacing: 0.35em;
          color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: color 0.3s;
          padding: 8px 0;
        }
        .ar-detail-back-btn:hover {
          color: #ffffff;
        }
        .ar-detail-hero {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 48px;
        }
        .ar-detail-hero-left {
          display: flex;
          flex-direction: column;
        }
        .ar-detail-eyebrow {
          font-size: 8px;
          letter-spacing: 0.35em;
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 12px;
        }
        .ar-detail-title {
          font-family: var(--font-brand), serif;
          font-size: 26px;
          font-weight: 300;
          letter-spacing: 0.22em;
          margin: 0 0 20px;
        }
        .ar-detail-desc {
          font-size: 11.5px;
          line-height: 2.1;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.4);
          margin: 0;
          max-width: 440px;
        }
        .ar-detail-hero-img {
          width: 100%;
          aspect-ratio: 4/3;
          object-fit: cover;
          background: rgba(255, 255, 255, 0.015);
          filter: grayscale(0.2);
        }

        .ar-detail-lookbook {
          display: flex;
          flex-direction: column;
        }
        .ar-lookbook-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .ar-lookbook-img-wrap {
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
        }
        .ar-lookbook-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(0.5);
          transition: filter 0.4s;
        }
        .ar-lookbook-img-wrap:hover .ar-lookbook-img {
          filter: grayscale(0);
        }

        /* Checklist */
        .ar-detail-checklist {
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 48px;
        }
        .ar-checklist-list {
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }
        .ar-checklist-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          background: #090909;
        }
        .ar-checklist-item:not(:last-child) {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .ar-checklist-left {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .ar-checklist-name {
          font-family: var(--font-brand), serif;
          font-size: 11.5px;
          font-weight: 300;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.8);
        }
        .ar-checklist-status {
          font-size: 7px;
          letter-spacing: 0.22em;
          font-weight: 400;
        }
        .ar-checklist-status.active {
          color: #a3a3a3;
        }
        .ar-checklist-status.inactive {
          color: rgba(255, 255, 255, 0.15);
        }
        .ar-checklist-action {
          font-size: 8px;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.4);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.3s;
        }
        .ar-checklist-action:hover {
          color: #ffffff;
        }

        /* ══ RESPONSIVE OVERRIDES ══ */
        @media (max-width: 991px) {
          .ar-workspace {
            grid-template-columns: 200px 1fr;
            gap: 40px;
          }
          .ar-grid-layout {
            grid-template-columns: 1fr;
          }
          .ar-notable-card {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .ar-detail-hero {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 767px) {
          .ar-space-wrap {
            padding: 100px 16px 80px;
          }
          .ar-client-summary {
            grid-template-columns: 1fr;
            gap: 12px;
            text-align: center;
            margin-bottom: 48px;
          }
          .ar-summary-item:last-child {
            align-items: center;
          }
          .ar-editor-header {
            margin-bottom: 48px;
          }
          .ar-workspace {
            grid-template-columns: 1fr;
          }
          .ar-sidebar {
            display: none;
          }

          /* Show mobile tab bar */
          .ar-mobile-tabs {
            display: flex;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            margin-bottom: 40px;
            overflow-x: auto;
            scrollbar-width: none;
          }
          .ar-mobile-tabs::-webkit-scrollbar {
            display: none;
          }
          .ar-m-tab {
            flex-shrink: 0;
            background: none;
            border: none;
            padding: 14px 0;
            margin-right: 28px;
            font-family: var(--font-primary), sans-serif;
            font-size: 8px;
            font-weight: 300;
            letter-spacing: 0.35em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.25);
            cursor: pointer;
            border-bottom: 1px solid transparent;
            margin-bottom: -1px;
            transition: color 0.3s;
          }
          .ar-m-tab.active {
            color: #ffffff;
            border-bottom-color: rgba(255, 255, 255, 0.4);
          }

          .ar-spotlight-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .ar-filter-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 18px;
          }
          .ar-view-toggle {
            display: none; /* Hide grid/list toggle on mobile */
          }
          .ar-list-row {
            grid-template-columns: 48px 1fr;
            gap: 16px;
            padding: 16px;
          }
          .ar-list-img {
            width: 48px;
            height: 60px;
          }
          .ar-list-duration,
          .ar-list-price {
            display: none; /* Hide secondary list fields on mobile */
          }
          
          .ar-node-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
          .ar-node-right {
            justify-content: space-between;
            width: 100%;
          }
          .ar-node-footer {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          .ar-node-actions {
            width: 100%;
            justify-content: space-between;
          }

          .ar-form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .ar-collections-grid {
            grid-template-columns: 1fr;
          }
          .ar-lookbook-row {
            grid-template-columns: 1fr;
          }
          .ar-checklist-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 20px;
          }
        }
      `}</style>
    </>
  );
}
