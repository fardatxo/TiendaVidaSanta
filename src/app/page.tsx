import Link from 'next/link';
import { getProducts, Product } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'tonet',
  description: 'tonet — tienda online oficial',
};

export default async function Home() {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch (err) {
    console.error("failed to fetch shopify products", err);
  }

  // Fallback mock products if store is empty or API variables are missing
  const fallbackProducts = [
    {
      handle: 'camiseta-espejada',
      title: 'camiseta de manga corta con logotipo de efecto espejado',
      price: 290.00,
      currencyCode: 'EUR',
      imageUrl: '/hero/ComfyUI-main_reference_00012_.png',
      images: ['/hero/ComfyUI-main_reference_00012_.png', '/hero/ComfyUI-main_reference_00016_.png']
    },
    {
      handle: 'sweater-rombos',
      title: 'suéter cuello redondo de rombos con tachuelas',
      price: 640.00,
      currencyCode: 'EUR',
      imageUrl: '/hero/ComfyUI-main_reference_00020_.png',
      images: ['/hero/ComfyUI-main_reference_00020_.png', '/hero/ComfyUI-main_reference_00021_.png']
    },
    {
      handle: 'chaqueta-denim',
      title: 'chaqueta vaquera corta clásica con costuras',
      price: 495.00,
      currencyCode: 'EUR',
      imageUrl: '/hero/ComfyUI-main_reference_00028_.png',
      images: ['/hero/ComfyUI-main_reference_00028_.png', '/hero/ComfyUI-main_reference_00032_.png']
    },
    {
      handle: 'bolso-heirloom',
      title: 'bolso bandolera de piel labrada con cierre metálico',
      price: 890.00,
      currencyCode: 'EUR',
      imageUrl: '/hero/ComfyUI-main_reference_00016_.png',
      images: ['/hero/ComfyUI-main_reference_00016_.png', '/hero/ComfyUI-main_reference_00017_.png']
    }
  ];

  const displayedProducts = products.length > 0 ? products.slice(0, 8) : fallbackProducts;

  return (
    <div className="aw-home">
      
      {/* 1. HERO CAMPAIGN BANNER */}
      <section className="aw-hero">
        <div className="aw-hero-media">
          <video
            src="/hero-campaign.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="aw-hero-video"
          />
        </div>
        <div className="aw-hero-content">
          <div className="aw-hero-text-block">
            <span className="aw-hero-eyebrow">novedades</span>
            <Link href="/collection" className="aw-hero-cta">comprar</Link>
          </div>
        </div>
      </section>

      {/* 2. SPLIT CATEGORY GRID */}
      <section className="aw-split-grid">
        <div className="aw-grid-col">
          <div className="aw-col-media">
            <img src="/hero/ComfyUI-main_reference_00012_.png" alt="ready-to-wear" className="aw-col-img" />
          </div>
          <div className="aw-col-content">
            <span className="aw-col-title">ready-to-wear</span>
            <Link href="/collection" className="aw-col-cta">comprar</Link>
          </div>
        </div>
        <div className="aw-grid-col">
          <div className="aw-col-media">
            <img src="/hero/ComfyUI-main_reference_00016_.png" alt="accesorios" className="aw-col-img" />
          </div>
          <div className="aw-col-content">
            <span className="aw-col-title">accesorios</span>
            <Link href="/collection" className="aw-col-cta">comprar</Link>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS GRID */}
      <section className="aw-new-arrivals">
        <h2 className="aw-section-title">novedades</h2>
        
        <div className="aw-product-grid">
          {displayedProducts.map((p) => {
            const priceFormatted = typeof p.price === 'number'
              ? `€${p.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : p.price;
            const img1 = p.imageUrl || p.images?.[0];
            const img2 = p.images?.[1] || img1;

            return (
              <Link href={`/product/${p.handle}`} className="aw-product-card" key={p.handle}>
                <div className="aw-product-card-media">
                  {img1 && <img src={img1} alt={p.title} className="aw-product-card-img main-img" />}
                  {img2 && <img src={img2} alt={`${p.title} alternate`} className="aw-product-card-img hover-img" />}
                </div>
                <div className="aw-product-card-info">
                  <span className="aw-product-card-title">{p.title.toLowerCase()}</span>
                  <span className="aw-product-card-price">{priceFormatted}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. LANDSCAPE CENTERFOLD BANNER */}
      <section className="aw-landscape">
        <div className="aw-landscape-media">
          <img src="/hero/hero_garden_landscape.png" alt="campaign editorial centerfold" className="aw-landscape-img" />
        </div>
        <div className="aw-landscape-content">
          <div className="aw-landscape-text-block">
            <span className="aw-landscape-eyebrow">colección cápsula</span>
            <Link href="/collection" className="aw-landscape-cta">descubrir</Link>
          </div>
        </div>
      </section>

      {/* 5. MINIMAL NEWSLETTER SIGN UP */}
      <section className="aw-newsletter">
        <div className="aw-newsletter-inner">
          <h3 className="aw-newsletter-title">boletín de noticias</h3>
          <p className="aw-newsletter-desc">recibe novedades, invitaciones a desfiles y lanzamientos privados.</p>
          <div className="aw-newsletter-form">
            <input
              type="email"
              placeholder="dirección de correo electrónico"
              className="aw-newsletter-input"
              required
            />
            <button type="button" className="aw-newsletter-btn">suscribirse</button>
          </div>
        </div>
      </section>

      <style>{`
        .aw-home {
          background-color: #ffffff;
          color: #000000;
          font-family: var(--font-primary), sans-serif;
          width: 100%;
        }

        /* ── HERO BANNER ── */
        .aw-hero {
          position: relative;
          width: 100%;
          height: 85vh;
          overflow: hidden;
          background: #ffffff;
        }
        .aw-hero-media {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .aw-hero-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .aw-hero-content {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          padding: 60px 40px;
          z-index: 10;
        }
        .aw-hero-text-block {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
        .aw-hero-eyebrow {
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.1em;
          color: #ffffff;
          text-transform: lowercase;
        }
        .aw-hero-cta {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.12em;
          color: #ffffff;
          text-transform: lowercase;
          text-decoration: underline;
          text-underline-offset: 4px;
          transition: opacity 0.3s;
        }
        .aw-hero-cta:hover {
          opacity: 0.7;
        }

        /* ── SPLIT CATEGORIES GRID ── */
        .aw-split-grid {
          display: grid;
          grid-template-columns: 1fr;
          width: 100%;
          border-top: 1px solid #eaeaea;
        }
        @media (min-width: 768px) {
          .aw-split-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .aw-grid-col {
          display: flex;
          flex-direction: column;
          position: relative;
          border-bottom: 1px solid #eaeaea;
        }
        @media (min-width: 768px) {
          .aw-grid-col:first-child {
            border-right: 1px solid #eaeaea;
          }
        }
        .aw-col-media {
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          background: #f5f5f5;
        }
        @media (min-width: 1024px) {
          .aw-col-media {
            aspect-ratio: 3 / 4;
          }
        }
        .aw-col-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .aw-col-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .aw-col-title {
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: #000000;
          text-transform: lowercase;
        }
        .aw-col-cta {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #000000;
          text-transform: lowercase;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.3s;
        }
        .aw-col-cta:hover {
          opacity: 0.7;
        }

        /* ── NEW ARRIVALS GRID ── */
        .aw-new-arrivals {
          padding: 80px 40px;
          background-color: #ffffff;
          border-bottom: 1px solid #eaeaea;
        }
        @media (max-width: 767px) {
          .aw-new-arrivals {
            padding: 40px 20px;
          }
        }
        .aw-section-title {
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.15em;
          text-align: center;
          margin-bottom: 48px;
          text-transform: lowercase;
          color: #000000;
        }
        .aw-product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .aw-product-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }
        .aw-product-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: #000000;
        }
        .aw-product-card-media {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background-color: #f5f5f5;
        }
        .aw-product-card-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 0.5s ease;
        }
        .aw-product-card-img.hover-img {
          opacity: 0;
        }
        .aw-product-card:hover .hover-img {
          opacity: 1;
        }
        .aw-product-card-info {
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
        }
        .aw-product-card-title {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.05em;
          line-height: 1.4;
          text-transform: lowercase;
          color: #000000;
        }
        .aw-product-card-price {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.02em;
          color: #666666;
        }

        /* ── LANDSCAPE BANNER ── */
        .aw-landscape {
          position: relative;
          width: 100%;
          height: 60vh;
          overflow: hidden;
          background-color: #ffffff;
          border-bottom: 1px solid #eaeaea;
        }
        .aw-landscape-media {
          width: 100%;
          height: 100%;
        }
        .aw-landscape-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .aw-landscape-content {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          padding: 48px 40px;
          z-index: 10;
        }
        .aw-landscape-text-block {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        .aw-landscape-eyebrow {
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #ffffff;
          text-transform: lowercase;
        }
        .aw-landscape-cta {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #ffffff;
          text-transform: lowercase;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: opacity 0.3s;
        }
        .aw-landscape-cta:hover {
          opacity: 0.7;
        }

        /* ── MINIMAL NEWSLETTER ── */
        .aw-newsletter {
          padding: 120px 40px;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        @media (max-width: 767px) {
          .aw-newsletter {
            padding: 80px 20px;
          }
        }
        .aw-newsletter-inner {
          max-width: 440px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .aw-newsletter-title {
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.12em;
          color: #000000;
          margin: 0 0 16px;
          text-transform: lowercase;
        }
        .aw-newsletter-desc {
          font-size: 11px;
          font-weight: 300;
          color: #666666;
          line-height: 1.6;
          letter-spacing: 0.02em;
          margin: 0 0 40px;
        }
        .aw-newsletter-form {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
        }
        .aw-newsletter-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid #000000;
          outline: none;
          color: #000000;
          font-family: inherit;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.05em;
          padding: 8px 0;
          text-align: center;
          width: 100%;
        }
        .aw-newsletter-input::placeholder {
          color: #888888;
        }
        .aw-newsletter-btn {
          background: transparent;
          color: #000000;
          border: none;
          padding: 12px 24px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: lowercase;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
          transition: opacity 0.3s;
        }
        .aw-newsletter-btn:hover {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
