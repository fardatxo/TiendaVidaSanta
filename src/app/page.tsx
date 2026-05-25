import Link from 'next/link';
import { getProducts } from '@/lib/shopify';
import HeroSection from '@/components/HeroSection';

const WORLD_IMAGES = [
  '/hero/ComfyUI-main_reference_00020_.png',
  '/hero/ComfyUI-main_reference_00021_.png',
  '/hero/ComfyUI-main_reference_00022_.png',
];

export default async function Home() {
  const products = await getProducts();
  const shuffled = [...products].sort(() => Math.random() - 0.5);

  return (
    <>
      {/* ─── HERO: randomized images from /public/hero/ ─── */}
      <HeroSection />

      {/* ─── PRODUCTS SECTION ─── */}
      <section className="shop-section" id="gallery">
        <div className="shop-grid">
          {shuffled.slice(0, 4).map((product) => (
            <Link key={product.handle} href={`/product/${product.handle}`} className="shop-card">
              <div className="shop-card-img-wrap">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.title} className="shop-card-img" loading="lazy" decoding="async" />
                )}
              </div>
              <div className="shop-card-info">
                <span className="shop-card-name">{product.title}</span>
                <span className="shop-card-price">
                  {(() => { const sym = product.currencyCode === 'USD' ? '$' : '€'; const n = Number(product.price); return `${sym}${Number.isInteger(n) ? n : n.toFixed(2)} ${product.currencyCode}`; })()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── WORLD OF TONET ─── */}
      <section className="hero-world-section">
        <h2 className="hero-world-title">WORLD OF TONET</h2>
        <div className="hero-world-grid">
          <Link href="/about" className="hero-world-panel">
            <img src={WORLD_IMAGES[0]} alt="About" className="hero-world-img" loading="lazy" decoding="async" />
            <span className="hero-world-text">ABOUT</span>
          </Link>
          <Link href="/collections" className="hero-world-panel">
            <img src={WORLD_IMAGES[1]} alt="Collections" className="hero-world-img" loading="lazy" decoding="async" />
            <span className="hero-world-text">COLLECTIONS</span>
          </Link>
          <Link href="/stores" className="hero-world-panel">
            <img src={WORLD_IMAGES[2]} alt="Stores" className="hero-world-img" loading="lazy" decoding="async" />
            <div className="hero-world-text-group">
              <span className="hero-world-text" style={{marginBottom: '6px'}}>STORES</span>
              <span className="hero-world-subtext">STORE LOCATOR</span>
              <span className="hero-world-subtext">STOCKISTS</span>
            </div>
          </Link>
        </div>
      </section>

      <style>{`
        /* ═══ PRODUCT GRID ═══ */
        .shop-section {
          background: #fff;
          width: 100%;
        }
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          width: 100%;
        }
        .shop-card {
          display: block;
          text-decoration: none;
          color: inherit;
          position: relative;
          background: #f5f4f0;
          overflow: hidden;
          cursor: pointer;
        }
        .shop-card:hover { opacity: 1; }
        .shop-card-img-wrap {
          width: 100%;
          aspect-ratio: 3 / 4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .shop-card-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .shop-card:hover .shop-card-img { transform: scale(1.03); }
        .shop-card-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 12px 14px 14px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 8px;
          background: linear-gradient(to top, rgba(245,244,240,0.95) 60%, transparent 100%);
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .shop-card:hover .shop-card-info {
          opacity: 1;
          transform: translateY(0);
        }
        .shop-card-name {
          font-size: 11px;
          font-family: var(--font-primary);
          font-weight: 300;
          text-transform: none;
          letter-spacing: 0.04em;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .shop-card-price {
          font-size: 12px;
          font-family: var(--font-primary);
          font-weight: 600;
          color: #111;
          white-space: nowrap;
          flex-shrink: 0;
        }
        @media (max-width: 1024px) {
          .shop-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 767px) {
          .shop-card-info {
            position: static;
            opacity: 1;
            transform: none;
            background: none;
            padding: 8px 10px 12px;
          }
        }

        /* ═══ WORLD OF TONET ═══ */
        .hero-world-section {
          background: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 40px;
          box-sizing: border-box;
        }
        .hero-world-title {
          font-family: var(--font-primary);
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.14em;
          margin-bottom: 60px;
          text-align: center;
          color: #000;
          text-transform: uppercase;
        }
        .hero-world-grid {
          display: flex;
          gap: 40px;
          width: 100%;
          max-width: 1100px;
        }
        .hero-world-panel {
          position: relative;
          flex: 1;
          aspect-ratio: 1 / 1;
          display: block;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
        }
        .hero-world-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .hero-world-panel::after {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.15);
          transition: background 0.3s ease;
        }
        .hero-world-panel:hover::after { background: rgba(0,0,0,0.25); }
        .hero-world-text, .hero-world-text-group {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          color: #fff;
          text-align: center;
        }
        .hero-world-text {
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.08em;
        }
        .hero-world-text-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .hero-world-subtext {
          font-family: var(--font-primary);
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.06em;
        }
        @media (max-width: 767px) {
          .hero-world-section {
            padding: 60px 20px 40px;
          }
          .hero-world-title { margin-bottom: 24px; font-size: 18px; flex: none; }
          .hero-world-grid { flex-direction: column; gap: 12px; flex: 1; height: 0; }
          .hero-world-panel { aspect-ratio: unset; height: auto; flex: 1; }
        }
      `}</style>
    </>
  );
}
