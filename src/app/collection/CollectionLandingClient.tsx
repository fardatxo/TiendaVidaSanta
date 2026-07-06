'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/shopify';
import { useLocale } from '@/context/LocaleContext';
import { useWishlist } from '@/context/WishlistContext';

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

const hasBlackColor = (product: Product): boolean => {
  return product.variants.some(v => 
    v.selectedOptions.some(opt => {
      const name = opt.name.toLowerCase();
      if (name === 'color' || name === 'colour') {
        const val = opt.value.toLowerCase();
        return val.includes('black') || val.includes('negro');
      }
      return false;
    })
  );
};

const philosophicalQuotes = [
  "We are not interested in trends. Only permanence and the raw truth of nature.",
  "Repetition is the ultimate form of restraint, mirroring the eternal cycles of landscapes.",
  "A garment is not a transaction. It is an artifact of the House of Toner Torrentinni.",
  "Restraint is not the absence of design. It is the absolute presence of intention, shaped by natural simplicity.",
  "Garments are not products. They are pieces of a cumulative archive under nature's silent watch."
];

export default function CollectionLandingClient({ products }: CollectionLandingClientProps) {
  const { formatPrice } = useLocale();
  const { toggle, has } = useWishlist();
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
    // Validate: filter out invalid products
    const validProducts = products.filter(p => p && typeof p === 'object' && p.handle);
    
    // Log missing images for debugging
    validProducts.forEach((product) => {
      if (!product.imageUrl) console.warn("Missing image:", product);
    });

    const filtered = validProducts.filter(product => {
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

    // Sort by color first (black first), then by garment type (tops/camisetas first, bottoms/pantalones second, outerwear/others third)
    return [...filtered].sort((a, b) => {
      const blackA = hasBlackColor(a) ? 0 : 1;
      const blackB = hasBlackColor(b) ? 0 : 1;
      if (blackA !== blackB) return blackA - blackB;

      const typeA = getGarmentType(a);
      const typeB = getGarmentType(b);
      const scoreA = typeA === 'tops' ? 0 : typeA === 'bottoms' ? 1 : 2;
      const scoreB = typeB === 'tops' ? 0 : typeB === 'bottoms' ? 1 : 2;
      return scoreA - scoreB;
    });
  }, [products, filterGarmentType, filterCollection, filterState]);

  return (
    <div className="tonet-archive">


      {/* ── SECTION TITLE: LOS ESENCIALES ── */}
      <section className="tonet-archive-section-title-wrap">
        <h2 className="tonet-archive-section-title">LOS ESENCIALES</h2>
      </section>

      {/* ── MAIN PRODUCT GRID ── */}
      <section className="tonet-archive-grid-section">
        <div className="tonet-archive-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => {
              const isExclusive = p.tags.some(t => /exclusivo|exclusive|premium/i.test(t));
              const isNew = p.tags.some(t => /nuevo|new|novedad/i.test(t));
              const tagLabel = isExclusive ? 'ARTÍCULO EXCLUSIVO' : isNew ? 'NOVEDAD' : null;

              // Get clean subtitle
              const cleanDesc = p.description ? p.description.replace(/<[^>]*>/g, '').replace(/[*#]/g, '').trim() : '';
              const firstSentence = cleanDesc.split(/[.:!|]/)[0].trim().toUpperCase();
              const subtitle = firstSentence.length > 50 ? firstSentence.substring(0, 47) + "..." : (firstSentence || "CUIDADO PREMIUM");

              // Get shade/variant name
              const firstVariantName = p.variants && p.variants[0] && p.variants[0].title.toLowerCase() !== 'default title' ? p.variants[0].title.toUpperCase() : '';

              return (
                <Link
                  href={`/product/${p.handle}`}
                  key={p.id}
                  className="am-chanel-card"
                >
                  <div className="am-chanel-tag-container">
                    <span className="am-chanel-tag">DESTACADO</span>
                    <button
                      type="button"
                      className={`am-chanel-favorite-btn ${has(p.handle) ? 'is-active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggle({
                          handle: p.handle,
                          title: p.title,
                          imageUrl: p.imageUrl || '',
                          price: p.price,
                          currencyCode: p.currencyCode,
                          collectionTitle: ''
                        });
                      }}
                    >
                      {has(p.handle) ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  <div className="am-chanel-img-wrap">
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="am-chanel-img"
                        loading="lazy"
                      />
                    )}
                  </div>

                  <div className="am-chanel-divider"></div>

                  <div className="am-chanel-info">
                    <h3 className="am-chanel-title">{p.title}</h3>
                    <p className="am-chanel-subtitle">{subtitle}</p>
                    {firstVariantName && <p className="am-chanel-variant">{firstVariantName}</p>}
                    <p className="am-chanel-price">
                      <span>{formatPrice(p.price, p.currencyCode)}</span>
                      {p.compareAtPrice && (
                        <span style={{ textDecoration: 'line-through', marginLeft: '8px', color: '#767676', fontSize: '9.5px', fontWeight: '400' }}>
                          {formatPrice(p.compareAtPrice, p.currencyCode)}
                        </span>
                      )}
                    </p>
                    
                    <div className="am-chanel-actions">
                      <span className="am-chanel-add">AÑADIR A LA CESTA</span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="tonet-archive-empty">
              <p>NO PRODUCTS FOUND.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER (Silent, Editorial) ── */}
      <footer className="tonet-archive-footer">
        <div className="tonet-archive-footer__content">
          <p className="tonet-archive-footer__label">PRIVATE RELEASES</p>
          <p className="tonet-archive-footer__note">
            New garments are introduced quietly. No campaigns. No restocks.
          </p>
          <div className="tonet-archive-footer__socials">
            <a href="https://instagram.com/tonetparis" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
            <span className="tonet-archive-footer__sep">·</span>
            <a href="mailto:contact@tonetparis.com">CONTACT</a>
          </div>
        </div>
      </footer>

      {/* ── STYLE ── */}
      <style>{`
        .tonet-archive {
          background: #ffffff;
          color: #000000;
          overflow-x: hidden;
          min-height: 100vh;
          font-family: var(--font-primary), sans-serif;
        }

        /* ── HEADER / HERO (Simple, centered header) ── */
        .tonet-archive-hero {
          width: 100%;
          padding: 80px 24px 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border-bottom: 1px solid #eaeaea;
        }
        .tonet-archive-hero__content {
          text-align: center;
          max-width: 600px;
        }
        .tonet-archive-hero__title {
          font-family: var(--font-primary), sans-serif;
          font-size: clamp(24px, 4vw, 42px);
          font-weight: 700;
          letter-spacing: 0.25em;
          color: #000000;
          margin: 0;
          text-transform: uppercase;
        }

        /* ── SECTION TITLE: PRODUCTOS ESENCIALES ── */
        .tonet-archive-section-title-wrap {
          width: 100%;
          text-align: center;
          padding: 120px 24px 32px;
          background: #ffffff;
        }
        .tonet-archive-section-title {
          font-family: var(--font-primary), sans-serif;
          font-size: clamp(24px, 3.5vw, 36px);
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #000000;
          margin: 0;
          text-transform: uppercase;
        }

        /* ── MAIN PRODUCT GRID ── */
        .tonet-archive-grid-section {
          background: #ffffff;
          padding: 24px 40px 120px;
        }
        .tonet-archive-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 48px 24px;
        }

        @media (max-width: 1023px) {
          .tonet-archive-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 36px 16px;
          }
        }
        @media (max-width: 767px) {
          .tonet-archive-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 28px 12px;
          }
          .tonet-archive-grid-section {
            padding: 16px 12px 80px;
          }
          .tonet-archive-hero {
            padding: 60px 16px 30px;
          }
        }

        /* CHANEL PRODUCT CARDS */
        .am-chanel-card {
          background-color: #ffffff;
          position: relative;
          box-sizing: border-box;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: inherit;
          padding: 24px 16px 36px;
          border: 1px solid transparent;
          transition: border-color 0.3s;
          min-height: 500px;
          justify-content: flex-start;
        }

        .am-chanel-tag-container {
          height: 18px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 12px;
          width: 100%;
          position: relative;
        }

        .am-chanel-favorite-btn {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          color: #000000;
          opacity: 0;
          transition: opacity 0.2s ease, color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }
        .am-chanel-favorite-btn:hover {
          color: #767676;
        }
        .am-chanel-card:hover .am-chanel-favorite-btn,
        .am-chanel-favorite-btn.is-active {
          opacity: 1;
        }

        .am-chanel-divider {
          width: 100%;
          height: 2px;
          background-color: #000000;
          margin-bottom: 16px;
        }
        .am-chanel-tag {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #000000;
          background-color: #f2f2f2;
          padding: 4px 10px;
          text-transform: uppercase;
        }

        .am-chanel-img-wrap {
          width: 100%;
          aspect-ratio: 1 / 1.1;
          position: relative;
          margin-bottom: 24px;
          background-color: #ffffff;
        }

        .am-chanel-img {
          position: absolute;
          top: 5%;
          left: 5%;
          width: 90%;
          height: 90%;
          object-fit: contain;
        }

        .am-chanel-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 7px;
          width: 100%;
          margin-top: auto;
        }

        .am-chanel-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #000000;
          margin: 0;
          line-height: 1.4;
        }

        .am-chanel-subtitle {
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          font-weight: 400;
          color: #767676;
          letter-spacing: 0.08em;
          margin: 0;
          text-transform: uppercase;
          line-height: 1.4;
          max-width: 90%;
        }

        .am-chanel-variant {
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          font-weight: 400;
          color: #767676;
          letter-spacing: 0.05em;
          margin: 0 0 2px;
        }

        .am-chanel-price {
          font-family: var(--font-primary), sans-serif;
          font-size: 10.5px;
          font-weight: 500;
          color: #000000;
          letter-spacing: 0.05em;
          margin: 0 0 8px;
        }

        .am-chanel-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .am-chanel-tryon {
          display: inline-flex;
          align-items: center;
          font-family: var(--font-primary), sans-serif;
          font-size: 8.5px;
          font-weight: 400;
          letter-spacing: 0.12em;
          color: #000000;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .am-chanel-tryon:hover {
          opacity: 1;
        }

        .am-chanel-add {
          display: inline-block;
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: #000000;
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .am-chanel-add:hover {
          opacity: 0.6;
        }

        /* ── FOOTER ── */
        .tonet-archive-footer {
          padding: 80px 40px;
          background: #ffffff;
          border-top: 1px solid #eaeaea;
        }
        .tonet-archive-footer__content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
        }
        .tonet-archive-footer__label {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: #000000;
          margin: 0;
          text-transform: uppercase;
        }
        .tonet-archive-footer__note {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          color: #767676;
          margin: 0;
        }
        .tonet-archive-footer__socials {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .tonet-archive-footer__socials a {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          color: #000000;
          text-decoration: none;
          letter-spacing: 0.1em;
        }
        .tonet-archive-footer__socials a:hover {
          text-decoration: underline;
        }
        .tonet-archive-footer__sep {
          color: #767676;
        }
      `}</style>
    </div>
  );
}
