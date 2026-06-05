'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/shopify';

interface CollectionLandingClientProps {
  products: Product[];
}

function colorToCss(color: string): string {
  const map: Record<string, string> = {
    black: '#0a0a0a', white: '#f5f5f5', grey: '#666', gray: '#666',
    navy: '#1a1a2e', beige: '#d4c4a8', cream: '#f0efe9',
    brown: '#5c4033', camel: '#c19a6b', olive: '#556b2f',
  };
  const lc = color.toLowerCase().trim();
  return map[lc] || lc;
}

export default function CollectionLandingClient({ products }: CollectionLandingClientProps) {
  const [activeFilter, setActiveTab] = useState<'all' | 'him' | 'her' | 'foundations' | 'archives'>('all');
  const [sortKey, setSortKey] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const allGarmentsRef = useRef<HTMLDivElement>(null);

  // SECTION 3 & 4 CTA actions: scroll to all garments and apply gender filter
  const filterAndScroll = (filter: 'him' | 'her') => {
    setActiveTab(filter);
    if (allGarmentsRef.current) {
      allGarmentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToAll = () => {
    if (allGarmentsRef.current) {
      allGarmentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Section 5 Foundations filter: get products with 'black', 'essential', 'foundation' or dark tags
  const foundations = useMemo(() => {
    let list = products.filter(p => {
      const matchText = (p.title + ' ' + p.description).toLowerCase();
      const hasBlack = matchText.includes('black') || matchText.includes('negro') || matchText.includes('charcoal');
      const hasCore = p.tags.some(t => /essential|core|foundation|básico/i.test(t));
      return hasBlack || hasCore;
    });
    if (list.length === 0) {
      list = [...products];
    }
    return list.slice(0, 4);
  }, [products]);

  // Section 7 filtered list of products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply main editorial filters
    if (activeFilter === 'him') {
      filtered = products.filter(p => p.tags.some(t => /men|him|male|hombre/i.test(t)));
    } else if (activeFilter === 'her') {
      filtered = products.filter(p => p.tags.some(t => /women|her|female|mujer/i.test(t)));
    } else if (activeFilter === 'foundations') {
      filtered = products.filter(p => {
        const matchText = (p.title + ' ' + p.description).toLowerCase();
        return matchText.includes('black') || p.tags.some(t => /essential|core|foundation/i.test(t));
      });
    } else if (activeFilter === 'archives') {
      filtered = products.filter(p => p.tags.some(t => /archive|archival|old/i.test(t)) || p.title.toLowerCase().includes('archive'));
    }

    // Fallback to all products if no products matched the filter (since tags might not be created in Shopify yet)
    let result = filtered.length > 0 ? filtered : [...products];

    // Apply sorting
    if (sortKey === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortKey === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, activeFilter, sortKey]);

  return (
    <div className="tc">
      
      {/* ── SECTION 1: FULL VIEWPORT HERO ── */}
      <section className="tc-hero">
        <img
          src="/hero/ComfyUI-main_reference_00028_.png"
          alt="The Collection Campaign"
          className="tc-hero-img"
          draggable={false}
        />
        <div className="tc-hero-overlay" />
        <div className="tc-hero-content">
          <p className="tc-hero-eyebrow">HOUSE OF TONET</p>
          <h1 className="tc-hero-headline">THE COLLECTION</h1>
          <p className="tc-hero-sub">A selection preserved within the House.</p>
          <button className="tc-hero-cta" onClick={scrollToAll}>
            Enter the Collection
          </button>
        </div>
      </section>

      {/* ── SECTION 2: EDITORIAL STATEMENT ── */}
      <section className="tc-statement">
        <div className="tc-statement-inner">
          <p className="tc-statement-line">
            TONET garments are not designed for seasons alone.
          </p>
          <p className="tc-statement-line tc-statement-gold">
            They are designed to remain.
          </p>
        </div>
      </section>

      {/* ── SECTION 3: FOR HIM ── */}
      <section className="tc-gender tc-gender-him">
        <div className="tc-gender-img-wrap">
          <img
            src="/hero/ComfyUI-main_reference_00021_.png"
            alt="Tonet For Him"
            className="tc-gender-img"
            loading="lazy"
            decoding="async"
          />
          <div className="tc-gender-veil" />
        </div>
        <div className="tc-gender-content">
          <p className="tc-gender-over">LINEAGE</p>
          <h2 className="tc-gender-title">FOR HIM</h2>
          <button className="tc-gender-cta" onClick={() => filterAndScroll('him')}>
            View Selection &rarr;
          </button>
        </div>
      </section>

      {/* ── SECTION 4: FOR HER ── */}
      <section className="tc-gender tc-gender-her">
        <div className="tc-gender-img-wrap">
          <img
            src="/hero/ComfyUI-main_reference_00017_.png"
            alt="Tonet For Her"
            className="tc-gender-img"
            loading="lazy"
            decoding="async"
          />
          <div className="tc-gender-veil" />
        </div>
        <div className="tc-gender-content">
          <p className="tc-gender-over">LINEAGE</p>
          <h2 className="tc-gender-title">FOR HER</h2>
          <button className="tc-gender-cta" onClick={() => filterAndScroll('her')}>
            View Selection &rarr;
          </button>
        </div>
      </section>

      {/* ── SECTION 5: THE FOUNDATIONS ── */}
      <section className="tc-foundations">
        <div className="tc-foundations-header">
          <p className="tc-sec-eyebrow">ESSENTIALS</p>
          <h2 className="tc-sec-title">THE FOUNDATIONS</h2>
          <p className="tc-sec-sub">Core archival black garments composed for permanent rotation.</p>
        </div>

        <div className="tc-foundations-grid">
          {foundations.map(product => (
            <Link key={product.handle} href={`/product/${product.handle}`} className="tc-f-card">
              <div className="tc-f-img-wrap">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="tc-f-img"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
              <div className="tc-f-info">
                <span className="tc-f-name">{product.title}</span>
                <span className="tc-f-price">
                  {product.currencyCode === 'USD' ? '$' : '€'}
                  {Number(product.price).toFixed(0)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SECTION 6: THE COLOUR STUDIES ── */}
      <section className="tc-colour">
        <div className="tc-colour-header">
          <p className="tc-sec-eyebrow">CHROMATIC STUDY</p>
          <h2 className="tc-sec-title">THE COLOUR STUDIES</h2>
          <p className="tc-sec-sub">An exploration of organic pigments, dense tones and raw shade density.</p>
        </div>

        <div className="tc-moodboard">
          <div className="tc-mood-item tc-mood-large">
            <div className="tc-mood-color" style={{ background: '#090909' }} />
            <div className="tc-mood-desc">
              <p className="tc-mood-tag">STUDY 01</p>
              <h3 className="tc-mood-title">COAL BLACK</h3>
              <p className="tc-mood-detail">Absolute density. Absorbing light to emphasize structural lines and architecture.</p>
            </div>
          </div>
          
          <div className="tc-mood-item tc-mood-mid">
            <div className="tc-mood-color" style={{ background: '#eae9e4' }} />
            <div className="tc-mood-desc">
              <p className="tc-mood-tag">STUDY 02</p>
              <h3 className="tc-mood-title">ALABASTER</h3>
              <p className="tc-mood-detail">Restrained highlight. A quiet contrast reflecting subtle architectural depth.</p>
            </div>
          </div>

          <div className="tc-mood-item">
            <div className="tc-mood-color" style={{ background: '#736357' }} />
            <div className="tc-mood-desc">
              <p className="tc-mood-tag">STUDY 03</p>
              <h3 className="tc-mood-title">RAW CLAY</h3>
              <p className="tc-mood-detail">Textural earth. Composed from raw, unrefined organic earth pigments.</p>
            </div>
          </div>

          <div className="tc-mood-item">
            <div className="tc-mood-color" style={{ background: '#424242' }} />
            <div className="tc-mood-desc">
              <p className="tc-mood-tag">STUDY 04</p>
              <h3 className="tc-mood-title">SHADOW GRAY</h3>
              <p className="tc-mood-detail">Refracted shadow. A transitional tone designed to layer within the collection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: ALL GARMENTS ── */}
      <section className="tc-all-garments" ref={allGarmentsRef}>
        <div className="tc-all-header">
          <p className="tc-sec-eyebrow">ARCHIVE</p>
          <h2 className="tc-sec-title">ALL GARMENTS</h2>
          <p className="tc-sec-sub">The complete lineage preserved inside the House of Tonet.</p>
        </div>

        {/* Filters & Sorting */}
        <div className="tc-controls">
          <div className="tc-filters">
            {(['all', 'him', 'her', 'foundations', 'archives'] as const).map(f => (
              <button
                key={f}
                className={`tc-filter-btn${activeFilter === f ? ' active' : ''}`}
                onClick={() => setActiveTab(f)}
              >
                {f === 'all' && 'All Selection'}
                {f === 'him' && 'For Him'}
                {f === 'her' && 'For Her'}
                {f === 'foundations' && 'Foundations'}
                {f === 'archives' && 'The Archive'}
              </button>
            ))}
          </div>

          <div className="tc-sorting">
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as any)}
              className="tc-sort-select"
              aria-label="Sort Collection"
            >
              <option value="default">Default Study</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="tc-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <Link key={product.handle} href={`/product/${product.handle}`} className="tc-card">
                <div className="tc-card-img-wrap">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="tc-card-img"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
                <div className="tc-card-info">
                  <div className="tc-card-meta">
                    <span className="tc-card-name">{product.title}</span>
                    <span className="tc-card-price">
                      {product.currencyCode === 'USD' ? '$' : '€'}
                      {Number(product.price).toFixed(0)}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="tc-empty">
              <p>No garments found matching the selected criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── STYLE ── */}
      <style>{`
        .tc {
          background: #0d0d0d;
          color: #ffffff;
          overflow: hidden;
        }

        /* ── SECTION 1: HERO ── */
        .tc-hero {
          position: relative;
          width: 100%;
          height: calc(100dvh + 60px);
          margin-top: -60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
        }
        .tc-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.55;
        }
        .tc-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%);
        }
        .tc-hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 650px;
          padding: 0 24px;
        }
        .tc-hero-eyebrow {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.5em;
          color: rgba(255,255,255,0.4);
          margin: 0 0 24px;
        }
        .tc-hero-headline {
          font-family: var(--font-primary);
          font-size: clamp(40px, 8vw, 96px);
          font-weight: 200;
          letter-spacing: 0.25em;
          line-height: 1.1;
          color: #fff;
          margin: 0 0 28px;
        }
        .tc-hero-sub {
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          margin: 0 0 60px;
        }
        .tc-hero-cta {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.45em;
          color: rgba(255,255,255,0.45);
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          padding: 0 0 8px;
          cursor: pointer;
          text-transform: uppercase;
          transition: color 0.5s ease, border-color 0.5s ease;
        }
        .tc-hero-cta:hover {
          color: rgba(255,255,255,0.9);
          border-color: rgba(255,255,255,0.45);
        }

        /* ── SECTION 2: EDITORIAL STATEMENT ── */
        .tc-statement {
          padding: 160px 24px;
          background: #0d0d0d;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .tc-statement-inner {
          max-width: 600px;
        }
        .tc-statement-line {
          font-family: var(--font-primary);
          font-size: clamp(16px, 2.5vw, 24px);
          font-weight: 300;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.45);
          line-height: 1.8;
          margin: 0;
        }
        .tc-statement-gold {
          color: #ffffff;
          margin-top: 14px;
          font-weight: 200;
          letter-spacing: 0.18em;
        }

        /* ── SECTIONS 3 & 4: FOR HIM / FOR HER ── */
        .tc-gender {
          position: relative;
          width: 100%;
          height: 90vh;
          overflow: hidden;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 0 10%;
        }
        .tc-gender-img-wrap {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .tc-gender-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.5;
          transition: transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
        }
        .tc-gender:hover .tc-gender-img {
          transform: scale(1.02);
          opacity: 0.65;
        }
        .tc-gender-veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%);
        }
        .tc-gender-her .tc-gender-veil {
          background: linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%);
        }
        .tc-gender-her {
          justify-content: flex-end;
          text-align: right;
        }
        .tc-gender-content {
          position: relative;
          z-index: 2;
          max-width: 480px;
        }
        .tc-gender-over {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.5em;
          color: rgba(255,255,255,0.25);
          margin: 0 0 16px;
        }
        .tc-gender-title {
          font-family: var(--font-primary);
          font-size: clamp(32px, 5vw, 64px);
          font-weight: 200;
          letter-spacing: 0.18em;
          color: #fff;
          margin: 0 0 32px;
        }
        .tc-gender-cta {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.45);
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          padding: 0 0 6px;
          cursor: pointer;
          text-transform: uppercase;
          transition: color 0.5s ease, border-color 0.5s ease, padding-left 0.5s ease, padding-right 0.5s ease;
        }
        .tc-gender-cta:hover {
          color: #fff;
          border-color: #fff;
        }
        .tc-gender-him .tc-gender-cta:hover {
          padding-left: 8px;
        }
        .tc-gender-her .tc-gender-cta:hover {
          padding-right: 8px;
        }

        /* Shared section styling (5 & 6) */
        .tc-sec-eyebrow {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.52em;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          margin: 0 0 24px;
        }
        .tc-sec-title {
          font-family: var(--font-primary);
          font-size: clamp(24px, 3vw, 44px);
          font-weight: 200;
          letter-spacing: 0.22em;
          color: #fff;
          text-transform: uppercase;
          margin: 0 0 28px;
        }
        .tc-sec-sub {
          font-family: var(--font-primary);
          font-size: 11px;
          font-weight: 300;
          line-height: 2;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase;
          margin: 0;
          max-width: 500px;
        }

        /* ── SECTION 5: THE FOUNDATIONS ── */
        .tc-foundations {
          background: #090909;
          padding: 160px 80px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .tc-foundations-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 100px;
        }
        .tc-foundations-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .tc-f-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          transition: transform 0.6s ease;
        }
        .tc-f-img-wrap {
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #0d0d0d;
          margin-bottom: 24px;
        }
        .tc-f-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          opacity: 0.75;
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease;
        }
        .tc-f-card:hover .tc-f-img {
          transform: scale(1.02);
          opacity: 1;
        }
        .tc-f-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tc-f-name {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.5) !important;
          text-transform: uppercase;
        }
        .tc-f-price {
          font-family: var(--font-primary);
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.75) !important;
          letter-spacing: 0.04em;
        }

        /* ── SECTION 6: THE COLOUR STUDIES ── */
        .tc-colour {
          background: #0d0d0d;
          padding: 160px 80px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .tc-colour-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 100px;
        }
        .tc-moodboard {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .tc-mood-item {
          display: flex;
          flex-direction: column;
          background: #090909;
          overflow: hidden;
        }
        .tc-mood-large {
          grid-column: span 2;
        }
        .tc-mood-color {
          height: 380px;
          width: 100%;
          opacity: 0.85;
          transition: opacity 0.6s ease;
        }
        .tc-mood-item:hover .tc-mood-color {
          opacity: 1;
        }
        .tc-mood-desc {
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .tc-mood-tag {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.4em;
          color: rgba(255,255,255,0.3);
        }
        .tc-mood-title {
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.18em;
          color: #fff;
          text-transform: uppercase;
          margin: 0;
        }
        .tc-mood-detail {
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(255,255,255,0.35);
          margin: 0;
        }

        /* ── SECTION 7: ALL GARMENTS ── */
        .tc-all-garments {
          background: #090909;
          padding: 160px 80px;
        }
        .tc-all-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 80px;
        }
        .tc-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding-bottom: 24px;
          margin-bottom: 64px;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }
        .tc-filters {
          display: flex;
          gap: 28px;
        }
        .tc-filter-btn {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: rgba(255,255,255,0.3);
          background: transparent;
          border: none;
          border-bottom: 1px solid transparent;
          padding: 0 0 6px;
          cursor: pointer;
          text-transform: uppercase;
          transition: color 0.4s ease, border-color 0.4s ease;
        }
        .tc-filter-btn:hover {
          color: rgba(255,255,255,0.65);
        }
        .tc-filter-btn.active {
          color: #fff;
          border-bottom-color: rgba(255,255,255,0.5);
        }
        .tc-sort-select {
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: none;
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          outline: none;
          cursor: pointer;
          padding: 0 12px 6px 0;
          border-bottom: 1px solid transparent;
          transition: color 0.4s, border-color 0.4s;
        }
        .tc-sort-select:hover {
          color: #fff;
          border-bottom-color: rgba(255,255,255,0.15);
        }
        .tc-sort-select option {
          background: #090909;
          color: #fff;
        }

        .tc-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px 4px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .tc-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          background: #0d0d0d;
          transition: background 0.6s ease;
        }
        .tc-card:hover {
          background: #111;
        }
        .tc-card-img-wrap {
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #0d0d0d;
        }
        .tc-card-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          opacity: 0.75;
          transition: opacity 0.8s ease, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tc-card:hover .tc-card-img {
          opacity: 1;
          transform: scale(1.02);
        }
        .tc-card-info {
          padding: 20px;
        }
        .tc-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .tc-card-name {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.55) !important;
          text-transform: uppercase;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          margin-right: 12px;
        }
        .tc-card-price {
          font-family: var(--font-primary);
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.75) !important;
          letter-spacing: 0.04em;
        }
        .tc-empty {
          grid-column: 1 / -1;
          padding: 80px 24px;
          text-align: center;
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1200px) {
          .tc-foundations { padding: 120px 40px; }
          .tc-foundations-grid { gap: 20px; }
          .tc-colour { padding: 120px 40px; }
          .tc-moodboard { gap: 12px; }
          .tc-all-garments { padding: 120px 40px; }
          .tc-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 1024px) {
          .tc-foundations-grid { grid-template-columns: repeat(2, 1fr); }
          .tc-moodboard { grid-template-columns: repeat(2, 1fr); }
          .tc-mood-large { grid-column: auto; }
        }

        @media (max-width: 767px) {
          .tc-hero { height: calc(100dvh + 60px); }
          .tc-hero-headline {
            font-size: clamp(36px, 11vw, 56px);
            letter-spacing: 0.15em;
          }
          .tc-hero-sub {
            font-size: 10px;
            letter-spacing: 0.15em;
            margin-bottom: 40px;
          }
          .tc-statement { padding: 100px 24px; }
          .tc-gender { height: 75vh; padding: 0 24px; }
          .tc-gender-title { font-size: 38px; }
          .tc-gender-veil {
            background: linear-gradient(to top, rgba(0,0,0,0.88) 15%, rgba(0,0,0,0.1) 100%);
          }
          .tc-gender-her .tc-gender-veil {
            background: linear-gradient(to top, rgba(0,0,0,0.88) 15%, rgba(0,0,0,0.1) 100%);
          }
          .tc-gender-her {
            justify-content: flex-start;
            text-align: left;
          }
          .tc-foundations { padding: 80px 24px; }
          .tc-foundations-header { margin-bottom: 60px; }
          .tc-foundations-grid { grid-template-columns: 1fr; gap: 40px; }
          .tc-colour { padding: 80px 24px; }
          .tc-colour-header { margin-bottom: 60px; }
          .tc-moodboard { grid-template-columns: 1fr; gap: 24px; }
          .tc-mood-color { height: 280px; }
          .tc-mood-desc { padding: 20px 0 0 0; }
          .tc-all-garments { padding: 80px 24px; }
          .tc-all-header { margin-bottom: 50px; }
          .tc-controls {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 40px;
          }
          .tc-filters {
            flex-wrap: wrap;
            gap: 16px 20px;
          }
          .tc-filter-btn {
            font-size: 9px;
            letter-spacing: 0.25em;
          }
          .tc-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .tc-card-info {
            padding: 16px 0;
          }
          .tc-card-meta {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px;
          }
          .tc-card-name {
            white-space: normal !important;
            margin-right: 0 !important;
            line-height: 1.4;
          }
          .tc-card-price {
            margin-top: 2px;
          }
        }
      `}</style>
    </div>
  );
}
