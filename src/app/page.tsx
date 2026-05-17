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
            <Link
              key={product.handle}
              href={`/product/${product.handle}`}
              className="shop-col shop-col-link"
            >
              <div className="shop-col-label">
                {product.title}<span className="shop-now-suffix"> › SHOP NOW</span>
              </div>
              {product.imageUrl && (
                <div className="shop-product shop-product--collection">
                  <div className="shop-product-img">
                    <img src={product.imageUrl} alt={product.title} loading="lazy" decoding="async" />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ─── WORLD OF TONET PARIS ─── */}
      <section className="hero-world-section">
        <h2 className="hero-world-title">WORLD OF TONET PARIS</h2>
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
        /* Scroll-snap at page level for homepage — mandatory snapping */
        html {
          scroll-snap-type: y mandatory;
          scroll-behavior: smooth;
        }

        /* ═══════════════════════════════════════════════════
           PRODUCT SECTION — 4 columns, Tonet Paris style
        ═══════════════════════════════════════════════════ */

        .shop-section {
          background: #ffffff;
          position: relative;
          z-index: 10;
          scroll-snap-align: start;
          height: 100vh;
          height: 100dvh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .shop-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .shop-grid::-webkit-scrollbar {
          display: none;
        }

        .shop-col {
          flex: 0 0 25vw;
          width: 25vw;
          scroll-snap-align: start;
          min-width: 0;
        }
        .shop-col-link {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .shop-col-link:hover { opacity: 1; }
        .shop-product--collection { cursor: pointer; }

        .shop-col-label {
          position: relative;
          padding: 12px 16px;
          font-size: 0.82rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #000;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .shop-now-suffix {
          display: none;
        }

        .shop-col:hover .shop-now-suffix {
          display: inline;
        }

        .shop-product {
          display: block;
          padding: 48px 15% 32px;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .shop-product:hover {
          background: #e8e8e8;
        }

        /* Image wrapper: portrait 3:4 ratio, float-like appearance */
        .shop-product-img {
          width: 100%;
          aspect-ratio: 3 / 4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .shop-product-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;   /* show full product, floating look */
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .shop-product:hover .shop-product-img img {
          transform: scale(1.04);
        }



        .shop-col-empty {
          height: 400px;
        }

        /* ═══════════════════════════════════════════════════
           MOBILE — 2 columns, labels not sticky
        ═══════════════════════════════════════════════════ */
        @media (max-width: 767px) {
          .shop-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .shop-col {
            width: 100%;
          }

          .shop-col-label {
            font-size: 0.6875rem;
            padding: 10px 12px;
          }

          .shop-product {
            padding: 24px 10% 20px;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .shop-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .shop-col {
            width: 100%;
          }
        }

        /* ═══ WORLD OF TONET PARIS ═══ */
        .hero-world-section {
          background: #fff;
          height: 100vh;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          scroll-snap-align: start;
          padding: 0 40px;
          box-sizing: border-box;
        }
        .hero-world-title {
          font-family: var(--font-primary);
          font-size: 20px;
          font-weight: 400;
          letter-spacing: 0.1em;
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
          font-size: 17px;
          font-weight: 500;
          letter-spacing: 0.05em;
        }
        .hero-world-text-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .hero-world-subtext {
          font-family: var(--font-primary);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.05em;
        }
        @media (max-width: 767px) {
          .hero-world-section {
            height: 100vh;
            height: 100dvh;
            padding: 100px 20px 20px;
            scroll-snap-align: start;
          }
          .hero-world-title { margin-bottom: 24px; font-size: 18px; flex: none; }
          .hero-world-grid { flex-direction: column; gap: 12px; flex: 1; height: 0; }
          .hero-world-panel { aspect-ratio: unset; height: auto; flex: 1; }
        }
      `}</style>
    </>
  );
}
