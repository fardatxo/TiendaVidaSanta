'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/shopify';

interface CollectionLandingClientProps {
  products: Product[];
}

const getArchiveRef = (handle: string) => {
  const hash = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const num = String((hash % 9000) + 1000).padStart(4, '0');
  return `ARC-26-${num}`;
};

const getCollectionInfo = (product: Product) => {
  const matchText = (product.title + ' ' + product.description).toLowerCase();
  if (matchText.includes('grey') || matchText.includes('gray') || matchText.includes('light') || matchText.includes('shadow')) {
    return 'HOUSE_02 — LIGHT & FORM';
  } else if (product.tags.some(t => /essential|core|foundation/i.test(t)) || matchText.includes('black')) {
    return 'HOUSE_01 — PERMANENCE';
  } else {
    return 'HOUSE_03 — ORGANIC CHROMATIC';
  }
};

const getGarmentType = (product: Product): 'tops' | 'bottoms' | 'outerwear' => {
  const title = product.title.toLowerCase();
  const tags = product.tags.map(t => t.toLowerCase());

  const isOuterwear = tags.includes('outerwear') || tags.includes('jacket') || tags.includes('coat') || title.includes('jacket') || title.includes('coat') || title.includes('bomber') || title.includes('trench') || title.includes('hoodie');
  const isBottoms = tags.includes('pants') || tags.includes('shorts') || tags.includes('bottoms') || tags.includes('trousers') || title.includes('shorts') || title.includes('pants') || title.includes('trousers') || title.includes('jogger');

  if (isOuterwear) return 'outerwear';
  if (isBottoms) return 'bottoms';
  return 'tops';
};

const philosophicalQuotes = [
  "We are not interested in trends. Only permanence.",
  "Repetition is the ultimate form of restraint.",
  "A garment is not a transaction. It is an artifact of the House.",
  "Restraint is not the absence of design. It is the absolute presence of intention.",
  "Garments are not products. They are pieces of a cumulative archive."
];

export default function CollectionLandingClient({ products }: CollectionLandingClientProps) {
  // Advanced Archive Indexing State
  const [filterGarmentType, setFilterGarmentType] = useState<'all' | 'tops' | 'bottoms' | 'outerwear'>('all');
  const [filterCollection, setFilterCollection] = useState<'all' | 'HOUSE_01' | 'HOUSE_02' | 'HOUSE_03'>('all');
  const [filterState, setFilterState] = useState<'all' | 'active' | 'archived'>('all');

  const registryStartRef = useRef<HTMLDivElement>(null);

  // Cinematic Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -100px 0px' }
    );

    const elements = document.querySelectorAll('.archive-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filterGarmentType, filterCollection, filterState]);

  const scrollToRegistry = () => {
    if (registryStartRef.current) {
      registryStartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Determine availability of a product
  const isAvailable = (product: Product) => {
    return product.variants.some(v => v.availableForSale);
  };

  // Live museum metadata statistics calculation
  const stats = useMemo(() => {
    const total = products.length;
    const collections = 3;
    const archived = products.filter(p => !isAvailable(p)).length;
    const active = total - archived;

    return { total, collections, archived, active };
  }, [products]);

  // Archive filtered grid
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Garment Type filter
      if (filterGarmentType !== 'all') {
        if (getGarmentType(product) !== filterGarmentType) return false;
      }

      // 2. Collection filter
      if (filterCollection !== 'all') {
        const col = getCollectionInfo(product);
        if (!col.includes(filterCollection)) return false;
      }

      // 3. House State filter
      if (filterState !== 'all') {
        const available = isAvailable(product);
        if (filterState === 'active' && !available) return false;
        if (filterState === 'archived' && available) return false;
      }

      return true;
    });
  }, [products, filterGarmentType, filterCollection, filterState]);

  return (
    <div className="tonet-archive">
      
      {/* ── HERO SECTION (Cinematic Viewport) ── */}
      <section className="tonet-archive-hero">
        <div className="tonet-archive-hero__bg-overlay" />
        <img
          src="/hero/ComfyUI-main_reference_00028_.png"
          alt="TONET Archival Imagery"
          className="tonet-archive-hero__image"
          draggable={false}
        />
        <div className="tonet-archive-hero__content">
          <p className="tonet-archive-hero__eyebrow">HOUSE OF TONET</p>
          <h1 className="tonet-archive-hero__title">THE COLLECTION</h1>
          <p className="tonet-archive-hero__description">
            A registry of garments produced and preserved by the House, exploring permanence, repetition and architectural form.
          </p>
          <button className="tonet-archive-hero__cta" onClick={scrollToRegistry}>
            ENTER REGISTRY
          </button>
        </div>
      </section>

      {/* ── STATS SECTION (Museum Metadata) ── */}
      <section className="tonet-archive-stats">
        <div className="tonet-archive-stats__container">
          <div className="tonet-archive-stats__item">
            <span className="tonet-archive-stats__label">PIECES</span>
            <span className="tonet-archive-stats__value">{stats.total}</span>
          </div>
          <div className="tonet-archive-stats__item">
            <span className="tonet-archive-stats__label">COLLECTIONS</span>
            <span className="tonet-archive-stats__value">{stats.collections}</span>
          </div>
          <div className="tonet-archive-stats__item">
            <span className="tonet-archive-stats__label">ACTIVE</span>
            <span className="tonet-archive-stats__value">{stats.active}</span>
          </div>
          <div className="tonet-archive-stats__item">
            <span className="tonet-archive-stats__label">ARCHIVED</span>
            <span className="tonet-archive-stats__value">{stats.archived}</span>
          </div>
        </div>
      </section>

      {/* ── FILTER INDEX (Almost Invisible Archive Indexing) ── */}
      <section className="tonet-archive-controls" ref={registryStartRef}>
        <div className="tonet-archive-controls__container">
          
          <div className="tonet-archive-filter">
            <span className="tonet-archive-filter__label">GARMENT TYPE</span>
            <div className="tonet-archive-filter__options">
              {(['all', 'tops', 'bottoms', 'outerwear'] as const).map(t => (
                <button
                  key={t}
                  className={`tonet-archive-filter__btn ${filterGarmentType === t ? 'active' : ''}`}
                  onClick={() => setFilterGarmentType(t)}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="tonet-archive-filter">
            <span className="tonet-archive-filter__label">COLLECTION</span>
            <div className="tonet-archive-filter__options">
              {(['all', 'HOUSE_01', 'HOUSE_02', 'HOUSE_03'] as const).map(c => (
                <button
                  key={c}
                  className={`tonet-archive-filter__btn ${filterCollection === c ? 'active' : ''}`}
                  onClick={() => setFilterCollection(c)}
                >
                  {c.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="tonet-archive-filter">
            <span className="tonet-archive-filter__label">HOUSE STATE</span>
            <div className="tonet-archive-filter__options">
              {(['all', 'active', 'archived'] as const).map(s => (
                <button
                  key={s}
                  className={`tonet-archive-filter__btn ${filterState === s ? 'active' : ''}`}
                  onClick={() => setFilterState(s)}
                >
                  {s === 'all' ? 'ALL ARCHIVE' : s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── MAIN PRODUCT GRID (2-Column Architectural Layout) ── */}
      <section className="tonet-archive-grid-section">
        <div className="tonet-archive-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => {
              const archiveRef = getArchiveRef(product.handle);
              const collectionInfo = getCollectionInfo(product);
              const available = isAvailable(product);
              const secondImage = product.images.length > 1 ? product.images[1] : null;

              // Insert an editorial quote block periodically
              const shouldShowQuote = index > 0 && index % 6 === 0;
              const quoteIndex = Math.floor(index / 6) % philosophicalQuotes.length;
              const quoteText = philosophicalQuotes[quoteIndex];

              return (
                <div key={product.handle} className="tonet-archive-grid__wrapper">
                  
                  {shouldShowQuote && (
                    <div className="tonet-archive-quote archive-reveal">
                      <p className="tonet-archive-quote__text">"{quoteText}"</p>
                      <span className="tonet-archive-quote__sub">TONET RESEARCH ARCHIVE</span>
                    </div>
                  )}

                  <Link href={`/product/${product.handle}`} className="tonet-archive-card archive-reveal">
                    {/* Architectural Image Wrapper with museum stone background */}
                    <div className="tonet-archive-card__image-wrap">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="tonet-archive-card__image tonet-archive-card__image--primary"
                        loading="lazy"
                      />
                      {secondImage && (
                        <img
                          src={secondImage}
                          alt={product.title}
                          className="tonet-archive-card__image tonet-archive-card__image--secondary"
                          loading="lazy"
                        />
                      )}
                      
                      {/* Technical Hover Panel (Museum Report) */}
                      <div className="tonet-archive-hover-panel">
                        <div className="tonet-archive-hover-panel__rows">
                          <div className="tonet-archive-hover-panel__row">
                            <span className="lbl">REGISTRY STATUS</span>
                            <span className="val">{available ? 'ACTIVE ARCHIVE' : 'ARCHIVED'}</span>
                          </div>
                          <div className="tonet-archive-hover-panel__row">
                            <span className="lbl">AVAILABILITY</span>
                            <span className="val">{available ? 'AVAILABLE' : 'TEMPORARILY RECALLED'}</span>
                          </div>
                          <div className="tonet-archive-hover-panel__row">
                            <span className="lbl">ARCHIVE REF.</span>
                            <span className="val">{archiveRef}</span>
                          </div>
                          <div className="tonet-archive-hover-panel__row">
                            <span className="lbl">FABRIC DETAILS</span>
                            <span className="val">DOCUMENTED SPECIFICATION</span>
                          </div>
                        </div>
                        <div className="tonet-archive-hover-panel__actions">
                          <span className="action-btn">VIEW RECORD</span>
                          <span className="action-sep">—</span>
                          <span className="action-btn">PRESERVE STATE</span>
                        </div>
                      </div>
                    </div>

                    {/* Museum-like metadata block */}
                    <div className="tonet-archive-card__metadata">
                      <span className="tonet-archive-card__collection">{collectionInfo}</span>
                      <h2 className="tonet-archive-card__title">{product.title}</h2>
                      <div className="tonet-archive-card__bottom-row">
                        <span className="tonet-archive-card__ref">Archive Ref. {archiveRef}</span>
                        {!available && (
                          <span className="tonet-archive-card__status tonet-archive-card__status--archived">
                            PERMANENTLY ARCHIVED
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                </div>
              );
            })
          ) : (
            <div className="tonet-archive-empty">
              <p>NO GARMENTS REGISTERED UNDER THE SELECTED CRITERIA.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── STYLE ── */}
      <style>{`
        .tonet-archive {
          background: #060606;
          color: #ffffff;
          overflow: hidden;
          min-height: 100vh;
          padding-bottom: 200px;
          font-family: var(--font-primary), sans-serif;
        }

        /* Cinematic Intersection Observer Reveals */
        .archive-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .archive-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── HERO SECTION ── */
        .tonet-archive-hero {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
        }
        .tonet-archive-hero__bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(6,6,6,0.95) 100%);
          z-index: 1;
        }
        .tonet-archive-hero__image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.38;
          filter: grayscale(1);
        }
        .tonet-archive-hero__content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 540px;
          padding: 0 24px;
        }
        .tonet-archive-hero__eyebrow {
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.52em;
          color: rgba(255,255,255,0.3);
          margin-bottom: 24px;
        }
        .tonet-archive-hero__title {
          font-size: clamp(38px, 6vw, 72px);
          font-weight: 200;
          letter-spacing: 0.28em;
          line-height: 1.15;
          margin-bottom: 32px;
          color: #fff;
        }
        .tonet-archive-hero__description {
          font-size: 11.5px;
          font-weight: 300;
          line-height: 2.1;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.42);
          margin-bottom: 56px;
        }
        .tonet-archive-hero__cta {
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.42em;
          color: rgba(255,255,255,0.4);
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          padding-bottom: 8px;
          cursor: pointer;
          transition: color 0.4s, border-color 0.4s;
        }
        .tonet-archive-hero__cta:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.6);
        }

        /* ── STATS SECTION (Museum Metadata) ── */
        .tonet-archive-stats {
          background: #060606;
          padding: 120px 80px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .tonet-archive-stats__container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          text-align: center;
        }
        .tonet-archive-stats__item {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .tonet-archive-stats__label {
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.22);
        }
        .tonet-archive-stats__value {
          font-size: 20px;
          font-weight: 200;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.7);
        }

        /* ── FILTER SYSTEM (Archive Indexing) ── */
        .tonet-archive-controls {
          background: #060606;
          padding: 80px 80px 40px;
        }
        .tonet-archive-controls__container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 36px;
        }
        .tonet-archive-filter {
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.02);
          padding-bottom: 18px;
        }
        .tonet-archive-filter__label {
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.25);
          width: 180px;
          flex-shrink: 0;
        }
        .tonet-archive-filter__options {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }
        .tonet-archive-filter__btn {
          font-family: var(--font-primary), sans-serif;
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.28em;
          color: rgba(255,255,255,0.35);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px 0;
          transition: color 0.3s;
          position: relative;
        }
        .tonet-archive-filter__btn:hover,
        .tonet-archive-filter__btn.active {
          color: #ffffff;
        }
        .tonet-archive-filter__btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,0.6);
        }

        /* ── ARCHITECTURAL GRID ── */
        .tonet-archive-grid-section {
          background: #060606;
          padding: 100px 80px 180px;
        }
        .tonet-archive-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 120px 80px;
        }
        .tonet-archive-grid__wrapper {
          display: flex;
          flex-direction: column;
          gap: 80px;
        }

        /* ── PRODUCT CARD ── */
        .tonet-archive-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
        }
        .tonet-archive-card__image-wrap {
          position: relative;
          aspect-ratio: 3 / 4;
          background: #ededec;
          border-radius: 4px;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tonet-archive-card__image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          border-radius: 4px;
          transition: opacity 400ms ease-in-out;
        }
        .tonet-archive-card__image--secondary {
          position: absolute;
          inset: 0;
          opacity: 0;
        }

        /* Hover behaviors on card image */
        .tonet-archive-card:hover .tonet-archive-card__image-wrap {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
        }
        .tonet-archive-card:hover .tonet-archive-card__image--primary {
          opacity: 0;
        }
        .tonet-archive-card:hover .tonet-archive-card__image--secondary {
          opacity: 1;
        }

        /* Technical hover overlay (Museum metadata) */
        .tonet-archive-hover-panel {
          position: absolute;
          inset: 0;
          background: rgba(6, 6, 6, 0.94);
          opacity: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px;
          transition: opacity 350ms cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 4px;
        }
        .tonet-archive-card:hover .tonet-archive-hover-panel {
          opacity: 1;
        }
        .tonet-archive-hover-panel__rows {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .tonet-archive-hover-panel__row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding-bottom: 8px;
        }
        .tonet-archive-hover-panel__row .lbl {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.28em;
          color: rgba(255,255,255,0.3);
        }
        .tonet-archive-hover-panel__row .val {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.15em;
          color: #ffffff;
        }
        .tonet-archive-hover-panel__actions {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-top: auto;
        }
        .tonet-archive-hover-panel__actions .action-btn {
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.45);
          transition: color 0.3s;
        }
        .tonet-archive-hover-panel__actions .action-btn:hover {
          color: #ffffff;
        }
        .tonet-archive-hover-panel__actions .action-sep {
          font-size: 8px;
          color: rgba(255,255,255,0.15);
        }

        /* Card Metadata labels */
        .tonet-archive-card__metadata {
          padding-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tonet-archive-card__collection {
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.42em;
          color: rgba(255,255,255,0.22);
          text-transform: uppercase;
        }
        .tonet-archive-card__title {
          font-family: Georgia, serif;
          font-size: 14px;
          font-weight: 300;
          font-style: italic;
          letter-spacing: 0.04em;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.55;
          margin: 0;
          white-space: normal;
        }
        .tonet-archive-card__bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }
        .tonet-archive-card__ref {
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.45);
        }
        .tonet-archive-card__status--archived {
          font-size: 8px;
          font-weight: 400;
          letter-spacing: 0.2em;
          color: #8f4b4b;
        }

        /* ── EDITORIAL EXCERPT BREAKS ── */
        .tonet-archive-quote {
          width: 100%;
          border-top: 1px solid rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.03);
          padding: 80px 0;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          justify-content: center;
          grid-column: 1 / -1;
        }
        .tonet-archive-quote__text {
          font-family: Georgia, serif;
          font-size: clamp(16px, 2.2vw, 24px);
          font-weight: 300;
          font-style: italic;
          letter-spacing: 0.08em;
          line-height: 1.8;
          color: rgba(255,255,255,0.48);
          max-width: 650px;
          margin: 0;
        }
        .tonet-archive-quote__sub {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.45em;
          color: rgba(255,255,255,0.18);
        }

        .tonet-archive-empty {
          grid-column: 1 / -1;
          padding: 140px 24px;
          text-align: center;
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.3);
        }

        /* ── RESPONSIVE ADAPTATIONS ── */
        @media (max-width: 1024px) {
          .tonet-archive-stats {
            padding: 80px 40px;
          }
          .tonet-archive-controls {
            padding: 60px 40px 20px;
          }
          .tonet-archive-grid-section {
            padding: 60px 40px 120px;
          }
          .tonet-archive-grid {
            gap: 80px 40px;
          }
        }

        @media (max-width: 767px) {
          .tonet-archive-stats {
            padding: 60px 24px;
          }
          .tonet-archive-stats__container {
            grid-template-columns: repeat(2, 1fr);
            gap: 32px 16px;
          }
          .tonet-archive-controls {
            padding: 40px 24px 20px;
          }
          .tonet-archive-filter {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .tonet-archive-filter__label {
            margin-bottom: 4px;
          }
          .tonet-archive-filter__options {
            gap: 16px 20px;
          }
          .tonet-archive-grid-section {
            padding: 40px 24px 100px;
          }
          .tonet-archive-grid {
            grid-template-columns: 1fr;
            gap: 60px;
          }
          .tonet-archive-grid__wrapper {
            gap: 60px;
          }
          .tonet-archive-hover-panel {
            display: none !important; /* Touch-optimized simple grid interaction on mobile */
          }
        }
      `}</style>
    </div>
  );
}
