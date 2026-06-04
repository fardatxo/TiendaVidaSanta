import Link from 'next/link';
import { getProducts } from '@/lib/shopify';
import HeroSection from '@/components/HeroSection';

export default async function Home() {
  const products = await getProducts();
  const featured = [...products].sort(() => Math.random() - 0.5).slice(0, 3);

  return (
    <>
      {/* ── 1. HERO ── */}
      <HeroSection />

      {/* ── 2. MANIFESTO ── */}
      <section className="tn-mani">
        <div className="tn-mani-inner">
          <div className="tn-mani-rule" />
          <p className="tn-mani-body">
            Not a brand.<br />
            A house.<br /><br />
            Not a collection.<br />
            A lineage.<br /><br />
            Built in silence,<br />
            worn in permanence.
          </p>
          <div className="tn-mani-rule" />
          <p className="tn-mani-sig">TONET PARIS &mdash; EST. MMXXIV</p>
        </div>
      </section>

      {/* ── 3. FULLSCREEN EDITORIAL IMAGE ── */}
      <div className="tn-cinematic">
        <img
          src="/hero/ComfyUI-main_reference_00028_.png"
          alt=""
          className="tn-cinematic-img"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* ── 3.5. HORIZONTAL EDITORIAL GALLERY ── */}
      <section className="homepage-gallery">
        <div className="hg-scroll">
          <div className="hg-item">
            <img src="/hero/ComfyUI-main_reference_00016_.png" alt="" className="hg-img" loading="lazy" decoding="async" />
          </div>
          <div className="hg-item">
            <img src="/hero/ComfyUI-main_reference_00017_.png" alt="" className="hg-img" loading="lazy" decoding="async" />
          </div>
          <div className="hg-item">
            <img src="/hero/ComfyUI-main_reference_00018_.png" alt="" className="hg-img" loading="lazy" decoding="async" />
          </div>
          <div className="hg-item">
            <img src="/hero/ComfyUI-main_reference_00021_.png" alt="" className="hg-img" loading="lazy" decoding="async" />
          </div>
          <div className="hg-item">
            <img src="/hero/ComfyUI-main_reference_00023_.png" alt="" className="hg-img" loading="lazy" decoding="async" />
          </div>
          <div className="hg-item">
            <img src="/hero/ComfyUI-main_reference_00028_.png" alt="" className="hg-img" loading="lazy" decoding="async" />
          </div>
          <div className="hg-item">
            <img src="/hero/ComfyUI-main_reference_00032_.png" alt="" className="hg-img" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      {/* ── 3.5. THE DECLARATION ── */}
      <section className="tn-decl">
        <div className="tn-decl-inner">
          <p className="tn-decl-over">House of Tonet</p>
          <h2 className="tn-decl-headline">
            A contemporary dynasty<br />
            built between history<br />
            and modernity.
          </h2>
          <p className="tn-decl-sub">Not shaped by seasons. Defined only by silence.</p>
        </div>
      </section>

      {/* ── 4. FEATURED GARMENTS ── */}
      <section className="tn-garments homepage-product-grid">
        <div className="tn-garm-header">
          <p className="tn-garm-season">TONET &mdash; SS MMXXVI</p>
          <h2 className="tn-garm-title">The Collection</h2>
        </div>
        <div className="tn-garm-grid pg-grid">
          {featured.map((product) => (
            <Link key={product.handle} href={`/product/${product.handle}`} className="tn-garm-card pg-card">
              <div className="tn-garm-img-wrap pg-img-wrap">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="tn-garm-img pg-img"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
              <div className="tn-garm-info pg-info">
                <span className="tn-garm-name pg-name">{product.title}</span>
                <span className="tn-garm-price pg-price">
                  {product.currencyCode === 'USD' ? '$' : '€'}
                  {Number(product.price).toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/search" className="tn-garm-all pg-all">Enter the Collection</Link>
      </section>

      {/* ── 4.5. PULL QUOTE ── */}
      <section className="tn-quote">
        <div className="tn-quote-inner">
          <blockquote className="tn-quote-text">
            Worn by those<br />
            who need<br />
            no introduction.
          </blockquote>
          <p className="tn-quote-attr">House of Tonet &mdash; MMXXVI</p>
        </div>
      </section>

      {/* ── 5. WORLD OF TONET ── */}
      <section className="tn-world">
        <p className="tn-world-eyebrow">The World</p>
        <div className="tn-world-grid">
          <Link href="/about" className="tn-world-panel">
            <img src="/hero/ComfyUI-main_reference_00016_.png" alt="Archive" className="tn-world-img" loading="lazy" decoding="async" />
            <div className="tn-world-veil" />
            <span className="tn-world-label">Archive</span>
          </Link>
          <Link href="/collections" className="tn-world-panel">
            <img src="/hero/ComfyUI-main_reference_00021_.png" alt="Atelier" className="tn-world-img" loading="lazy" decoding="async" />
            <div className="tn-world-veil" />
            <span className="tn-world-label">Atelier</span>
          </Link>
          <Link href="/stores" className="tn-world-panel">
            <img src="/hero/ComfyUI-main_reference_00023_.png" alt="Residence" className="tn-world-img" loading="lazy" decoding="async" />
            <div className="tn-world-veil" />
            <span className="tn-world-label">Residence</span>
          </Link>
        </div>
      </section>

      {/* ── 5.5. CRAFT & MATERIALS ── */}
      <section className="tn-craft">
        <div className="tn-craft-img-col">
          <img src="/hero/ComfyUI-main_reference_00017_.png" alt="The Craft" className="tn-craft-img" loading="lazy" decoding="async" />
        </div>
        <div className="tn-craft-text-col">
          <p className="tn-craft-over">The Craft</p>
          <h2 className="tn-craft-headline">Made with<br />intention.</h2>
          <p className="tn-craft-body">
            Every garment bearing the House mark is constructed
            with deliberate restraint. No excess. No ornament
            beyond what is necessary. Only the precision of form,
            the weight of fabric, and the silence of craft.
          </p>
          <Link href="/about" className="tn-craft-cta">The House</Link>
        </div>
      </section>

      {/* ── 6. COLLECTION PREVIEW ── */}
      <section className="tn-season">
        <Link href="/collection/i9nm9inm" className="tn-season-card">
          <img src="/hero/ComfyUI-main_reference_00018_.png" alt="Spring Summer 2026" className="tn-season-img" loading="lazy" decoding="async" />
          <div className="tn-season-veil" />
          <div className="tn-season-meta">
            <p className="tn-season-over">House of Tonet</p>
            <h3 className="tn-season-name">SS MMXXVI</h3>
            <p className="tn-season-cta">Enter</p>
          </div>
        </Link>
        <Link href="/collection/summer-ttes-2" className="tn-season-card">
          <img src="/hero/ComfyUI-main_reference_00032_.png" alt="Essentials" className="tn-season-img" loading="lazy" decoding="async" />
          <div className="tn-season-veil" />
          <div className="tn-season-meta">
            <p className="tn-season-over">The House</p>
            <h3 className="tn-season-name">The Archive</h3>
            <p className="tn-season-cta">Enter</p>
          </div>
        </Link>
      </section>

      <style>{`
        /* ══ MANIFESTO ══ */
        .tn-mani {
          background: #0d0d0d;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 160px 40px;
        }
        .tn-mani-inner {
          max-width: 520px;
          width: 100%;
          text-align: center;
        }
        .tn-mani-rule {
          width: 1px;
          height: 52px;
          background: rgba(255,255,255,0.12);
          margin: 0 auto 60px;
        }
        .tn-mani-body {
          font-family: var(--font-primary);
          font-size: 14px;
          font-weight: 300;
          line-height: 2.4;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.05em;
          margin: 0 0 60px;
        }
        .tn-mani-sig {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.45em;
          color: rgba(255,255,255,0.18);
          text-transform: uppercase;
          margin: 0;
        }

        /* ══ EDITORIAL CINEMATIC ══ */
        .tn-cinematic {
          width: 100%;
          height: 78dvh;
          overflow: hidden;
          background: #111;
        }
        .tn-cinematic-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          display: block;
          opacity: 0.82;
        }

        /* ══ DECLARATION ══ */
        .tn-decl {
          background: #f0efe9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 160px 48px;
        }
        .tn-decl-inner {
          text-align: center;
          max-width: 700px;
          width: 100%;
        }
        .tn-decl-over {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.52em;
          color: #bbb;
          text-transform: uppercase;
          margin: 0 0 60px;
        }
        .tn-decl-headline {
          font-family: var(--font-primary);
          font-size: clamp(22px, 3.2vw, 44px);
          font-weight: 200;
          letter-spacing: 0.13em;
          color: #181818;
          text-transform: uppercase;
          line-height: 1.4;
          margin: 0 0 56px;
        }
        .tn-decl-sub {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.38em;
          color: #aaa;
          text-transform: uppercase;
          margin: 0;
        }

        /* ══ FEATURED GARMENTS ══ */
        .tn-garments {
          background: #f5f4f0;
          padding: 160px 80px 140px;
        }
        .tn-garm-header {
          text-align: center;
          margin-bottom: 96px;
        }
        .tn-garm-season {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: #aaa;
          text-transform: uppercase;
          margin: 0 0 18px;
        }
        .tn-garm-title {
          font-family: var(--font-primary);
          font-size: 28px;
          font-weight: 200;
          letter-spacing: 0.18em;
          color: #111;
          text-transform: uppercase;
          margin: 0;
        }
        .tn-garm-grid {
          display: grid;
          grid-template-columns: 58% 42%;
          grid-template-rows: 1fr 1fr;
          gap: 4px;
          max-width: 1280px;
          margin: 0 auto 96px;
          height: 85dvh;
        }
        .tn-garm-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          background: #ece9e3;
          overflow: hidden;
        }
        .tn-garm-card:hover { opacity: 1; }
        .tn-garm-card--hero { grid-row: 1 / 3; }
        .tn-garm-img-wrap {
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }
        .tn-garm-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .tn-garm-card:hover .tn-garm-img { transform: scale(1.04); }
        .tn-garm-info {
          padding: 18px 22px 20px;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          background: #ece9e3;
          flex-shrink: 0;
        }
        .tn-garm-name {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.14em;
          color: #444;
          text-transform: uppercase;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          margin-right: 16px;
        }
        .tn-garm-price {
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 400;
          color: #111;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .tn-garm-all {
          display: block;
          text-align: center;
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.35em;
          color: #888;
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
          width: fit-content;
          margin: 0 auto;
          transition: color 0.4s, border-color 0.4s;
        }
        .tn-garm-all:hover {
          color: #111;
          border-color: #888;
          opacity: 1 !important;
        }

        /* ══ PULL QUOTE ══ */
        .tn-quote {
          background: #0d0d0d;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 160px 80px;
          border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .tn-quote-inner { text-align: center; }
        .tn-quote-text {
          font-family: var(--font-primary);
          font-size: clamp(40px, 7vw, 96px);
          font-weight: 200;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.82);
          text-transform: uppercase;
          line-height: 1.0;
          margin: 0 0 64px;
        }
        .tn-quote-attr {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.48em;
          color: rgba(255,255,255,0.18);
          text-transform: uppercase;
          margin: 0;
        }

        /* ══ CRAFT ══ */
        .tn-craft {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #0d0d0d;
          min-height: 80dvh;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .tn-craft-img-col {
          overflow: hidden;
          position: relative;
        }
        .tn-craft-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.7;
        }
        .tn-craft-text-col {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 100px 80px;
        }
        .tn-craft-over {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.48em;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          margin: 0 0 48px;
        }
        .tn-craft-headline {
          font-family: var(--font-primary);
          font-size: clamp(28px, 3.8vw, 52px);
          font-weight: 200;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.82);
          text-transform: uppercase;
          line-height: 1.1;
          margin: 0 0 48px;
        }
        .tn-craft-body {
          font-family: var(--font-primary);
          font-size: 13px;
          font-weight: 300;
          line-height: 2.2;
          color: rgba(255,255,255,0.38);
          letter-spacing: 0.04em;
          margin: 0 0 56px;
          max-width: 400px;
        }
        .tn-craft-cta {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.4em;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.14);
          padding-bottom: 5px;
          width: fit-content;
          transition: color 0.5s, border-color 0.5s;
        }
        .tn-craft-cta:hover {
          color: rgba(255,255,255,0.72);
          border-color: rgba(255,255,255,0.32);
          opacity: 1 !important;
        }

        /* ══ WORLD OF TONET ══ */
        .tn-world {
          background: #0a0a0a;
          padding-top: 120px;
        }
        .tn-world-eyebrow {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.42em;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          text-align: center;
          margin: 0 0 64px;
        }
        .tn-world-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .tn-world-panel {
          display: block;
          position: relative;
          text-decoration: none;
          overflow: hidden;
          aspect-ratio: 2 / 3;
        }
        .tn-world-panel:hover { opacity: 1 !important; }
        .tn-world-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.65;
          transition: transform 1.1s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      opacity 0.6s ease;
        }
        .tn-world-panel:hover .tn-world-img {
          transform: scale(1.04);
          opacity: 0.8;
        }
        .tn-world-veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%);
        }
        .tn-world-label {
          position: absolute;
          bottom: 36px;
          left: 36px;
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.38em;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          z-index: 2;
          transition: color 0.5s ease;
        }
        .tn-world-panel:hover .tn-world-label {
          color: rgba(255,255,255,0.88);
        }

        /* ══ COLLECTION PREVIEW ══ */
        .tn-season {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #0a0a0a;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .tn-season-card {
          display: block;
          position: relative;
          text-decoration: none;
          overflow: hidden;
          height: 100dvh;
        }
        .tn-season-card:hover { opacity: 1 !important; }
        .tn-season-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.7;
          transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      opacity 0.6s ease;
        }
        .tn-season-card:hover .tn-season-img {
          transform: scale(1.03);
          opacity: 0.85;
        }
        .tn-season-veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.7) 0%,
            rgba(0,0,0,0.1) 50%,
            rgba(0,0,0,0.25) 100%
          );
          transition: background 0.6s ease;
        }
        .tn-season-meta {
          position: absolute;
          bottom: 64px;
          left: 0;
          right: 0;
          text-align: center;
          z-index: 2;
        }
        .tn-season-over {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.38em;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase;
          margin: 0 0 16px;
        }
        .tn-season-name {
          font-family: var(--font-primary);
          font-size: clamp(32px, 4.5vw, 68px);
          font-weight: 200;
          letter-spacing: 0.14em;
          color: #fff;
          text-transform: uppercase;
          margin: 0 0 28px;
        }
        .tn-season-cta {
          display: inline-block;
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.42em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.14);
          padding-bottom: 5px;
          transition: color 0.5s, border-color 0.5s;
          margin: 0;
        }
        .tn-season-card:hover .tn-season-cta {
          color: rgba(255,255,255,0.75);
          border-color: rgba(255,255,255,0.38);
        }

        /* ══ HOMEPAGE GALLERY ══ */
        .homepage-gallery {
          width: 100%;
          background: #f5f4f0;
          padding: 40px 0;
          overflow: hidden;
        }
        .hg-scroll {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 0 80px;
        }
        .hg-scroll::-webkit-scrollbar { display: none; }
        .hg-item {
          flex: 0 0 auto;
          width: 320px;
          height: 420px;
          scroll-snap-align: start;
          overflow: hidden;
          background: #ece9e3;
        }
        .hg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.82;
          transition: opacity 0.8s ease, transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .hg-item:hover .hg-img {
          opacity: 1;
          transform: scale(1.03);
        }

        /* ══ HOMEPAGE PRODUCT GRID ══ */
        .homepage-product-grid .pg-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          max-width: 1280px;
          margin: 0 auto 96px;
        }
        .homepage-product-grid .pg-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          background: #ece9e3;
          overflow: hidden;
          transition: opacity 0.6s ease;
        }
        .homepage-product-grid .pg-card:hover {
          opacity: 0.78;
        }
        .homepage-product-grid .pg-img-wrap {
          aspect-ratio: 3 / 4;
          overflow: hidden;
        }
        .homepage-product-grid .pg-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: opacity 0.6s ease;
        }
        .homepage-product-grid .pg-card:hover .pg-img {
          opacity: 0.88;
        }
        .homepage-product-grid .pg-info {
          padding: 18px 22px 20px;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          background: #ece9e3;
        }
        .homepage-product-grid .pg-name {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.14em;
          color: #444;
          text-transform: uppercase;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          margin-right: 16px;
        }
        .homepage-product-grid .pg-price {
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 400;
          color: #111;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 1024px) {
          .tn-garments { padding: 120px 40px 100px; }
          .tn-decl { padding: 120px 40px; }
          .tn-craft-text-col { padding: 80px 48px; }
        }
        @media (max-width: 767px) {
          .tn-mani { padding: 100px 28px; }
          .tn-mani-body { font-size: 13px; line-height: 2.2; }
          .tn-cinematic { height: 55dvh; }
          .tn-decl { padding: 100px 28px; }
          .tn-decl-headline { font-size: clamp(20px, 7vw, 32px); }
          .tn-garments { padding: 80px 20px 60px; }
          .tn-garm-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            height: auto;
            gap: 2px;
          }
          .tn-garm-card--hero { grid-row: auto; }
          .tn-garm-img-wrap { flex: none; aspect-ratio: 3 / 4; }
          .tn-garm-title { font-size: 22px; }
          .tn-quote { padding: 100px 28px; }
          .tn-craft { grid-template-columns: 1fr; }
          .tn-craft-img-col { height: 55dvh; }
          .tn-craft-text-col { padding: 60px 24px; }
          .tn-world-grid { grid-template-columns: 1fr; }
          .tn-world-panel { aspect-ratio: 4 / 3; }
          .tn-world-label { bottom: 28px; left: 24px; }
          .tn-season { grid-template-columns: 1fr; }
          .tn-season-card { height: 80dvh; }
          .tn-season-meta { bottom: 48px; }
          .hg-scroll { padding: 0 20px; }
          .hg-item { width: 260px; height: 340px; }
          .homepage-product-grid .pg-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2px;
          }
        }
      `}</style>
    </>
  );
}
