import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = {
  title: 'TONET — Global Luxury Fashion House',
  description: 'A global luxury fashion house. Presenting a vision of status, prestige, and cultural authority.',
};

export default async function Home() {
  return (
    <div className="tn-home-page">
      
      {/* 1. HERO CAMPAIGN */}
      <section className="tn-hero-section">
        <div className="tn-hero-media">
          <video
            src="/hero-campaign.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="tn-hero-video"
          />
          <div className="tn-hero-overlay" />
        </div>
        <div className="tn-hero-content">
          <ScrollReveal className="tn-hero-reveal" threshold={0.1}>
            <span className="tn-hero-brand">TONET</span>
            <span className="tn-hero-subtitle">SPRING SUMMER 2027</span>
          </ScrollReveal>
        </div>
      </section>


      {/* 3. ARCHIVE VAULT SECTION (PROTAGONIST) */}
      <section className="tn-archive">
        <div className="tn-archive-inner">
          <ScrollReveal className="tn-archive-img-wrap" threshold={0.15}>
            <img
              src="/hero/archive_garden_landscape.png"
              alt="Archive Vault Entrance"
              className="tn-archive-img"
              loading="lazy"
            />
            <div className="tn-archive-img-overlay" />
          </ScrollReveal>

          <div className="tn-archive-text-wrap">
            <ScrollReveal className="tn-archive-reveal" threshold={0.2}>
              <span className="tn-archive-eyebrow">THE ARCHIVE SYSTEM</span>
              <h2 className="tn-archive-title">ARCHIVE</h2>
              <p className="tn-archive-desc">
                Reserved pieces. Available temporarily. Then gone.
              </p>
              
              <Link href="/archive" className="tn-discover-link">
                DISCOVER
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. THE WORLD OF TONET */}
      <section className="tn-world">
        <div className="tn-world-inner">
          <ScrollReveal className="tn-world-img-wrap" threshold={0.15}>
            <img
              src="/hero/world_garden_landscape.png"
              alt="The World of TONET Architecture"
              className="tn-world-img"
              loading="lazy"
            />
            <div className="tn-world-img-overlay" />
          </ScrollReveal>

          <div className="tn-world-text-wrap">
            <ScrollReveal className="tn-world-reveal" threshold={0.2}>
              <span className="tn-world-eyebrow">THE UNIVERSE</span>
              <h2 className="tn-world-title">THE WORLD OF TONET</h2>
              <p className="tn-world-desc">
                An ongoing dialogue between minimalist architecture, classical design, and silent rebellion.
              </p>
              <Link href="/about" className="tn-discover-link">
                DISCOVER
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. JOURNAL */}
      <section className="tn-journal">
        <div className="tn-journal-inner">
          <ScrollReveal className="tn-section-header">
            <span className="tn-section-eyebrow">PUBLICATIONS</span>
            <h2 className="tn-section-title">JOURNAL</h2>
          </ScrollReveal>

          <div className="tn-journal-layout">
            <div className="tn-journal-col-left">
              <ScrollReveal className="tn-journal-item-1" threshold={0.15}>
                <div className="tn-journal-img-wrap">
                  <img
                    src="/hero/journal_garden_landscape_1.png"
                    alt="Journal Editorial Portrait"
                    className="tn-journal-img"
                    loading="lazy"
                  />
                </div>
                <span className="tn-journal-caption">
                  STUDIO DIALOGUE — ATELIER APARTMENTS, PARIS.
                </span>
              </ScrollReveal>
            </div>

            <div className="tn-journal-col-right">
              <ScrollReveal className="tn-journal-text-wrap" threshold={0.2}>
                <blockquote className="tn-journal-quote">
                  “We reject monotony not as a temporary trend, but as a lifelong discipline.”
                </blockquote>
              </ScrollReveal>

              <ScrollReveal className="tn-journal-item-2" threshold={0.15}>
                <div className="tn-journal-img-wrap-small">
                  <img
                    src="/hero/journal_garden_landscape_2.png"
                    alt="Journal Editorial Silhouette"
                    className="tn-journal-img"
                    loading="lazy"
                  />
                </div>
                <span className="tn-journal-caption">
                  LINEAGE STUDY — MONACO.
                </span>
              </ScrollReveal>

              <ScrollReveal className="tn-journal-cta-wrap" threshold={0.2}>
                <Link href="/collection" className="tn-discover-link">
                  DISCOVER
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ART & CULTURE */}
      <section className="tn-art-culture">
        <div className="tn-art-culture-inner">
          <ScrollReveal className="tn-art-culture-img-wrap" threshold={0.15}>
            <img
              src="/hero/art_garden_landscape.png"
              alt="Art and Culture Sculpture"
              className="tn-art-culture-img"
              loading="lazy"
            />
            <div className="tn-art-culture-img-overlay" />
          </ScrollReveal>

          <div className="tn-art-culture-text-wrap">
            <ScrollReveal className="tn-art-culture-reveal" threshold={0.2}>
              <span className="tn-art-culture-eyebrow">CREATIVE FOUNDATIONS</span>
              <h2 className="tn-art-culture-title">ART & CULTURE</h2>
              <p className="tn-art-culture-desc">
                Exploring the boundary between sculpture, silent architecture, and fabric.
              </p>
              <Link href="/about" className="tn-discover-link">
                DISCOVER
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 7. NEWSLETTER VIP INVITATION */}
      <section className="tn-newsletter">
        <div className="tn-newsletter-inner">
          <ScrollReveal className="tn-newsletter-content" threshold={0.25}>
            <span className="tn-newsletter-eyebrow">PRIVATE ACCESS</span>
            <h3 className="tn-newsletter-title">ENTER THE WORLD OF TONET</h3>
            <p className="tn-newsletter-desc">
              Request exclusive access to private exhibitions, runway collections, and archive vault releases.
            </p>

            <div className="tn-newsletter-form-wrap">
              <div className="tn-newsletter-form">
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  className="tn-newsletter-input"
                  aria-label="Email Address"
                />
                <button type="submit" className="tn-newsletter-btn">
                  REQUEST ACCESS
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <style>{`
        .tn-home-page {
          background: #ffffff;
          color: #000000;
        }

        /* ══ HERO SECTION ══ */
        .tn-hero-section {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tn-hero-media {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .tn-hero-img, .tn-hero-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.65;
          filter: brightness(0.75) contrast(1.05);
        }
        .tn-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 40%, rgba(0,0,0,0.9) 100%);
          z-index: 2;
        }
        .tn-hero-content {
          position: relative;
          z-index: 3;
          text-align: center;
          max-width: 900px;
          padding: 0 40px;
        }
        .tn-hero-brand {
          font-family: var(--font-brand) !important;
          font-size: clamp(42px, 8vw, 72px);
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: normal;
          color: #ffffff;
          display: block;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .tn-hero-subtitle {
          font-family: var(--font-primary);
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #cfcfcf;
          text-transform: uppercase;
          display: block;
        }



        /* ══ OVERSIZED SECTIONS (ARCHIVE, WORLD & ART) ══ */
        .tn-archive {
          background: #ffffff;
          padding: 120px 0;
          margin-bottom: 180px;
        }
        .tn-world {
          background: #ffffff;
          padding: 120px 0;
          margin-bottom: 180px;
        }
        .tn-art-culture {
          background: #ffffff;
          padding: 120px 0;
          margin-bottom: 180px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        .tn-archive-inner, .tn-world-inner, .tn-art-culture-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 60px;
        }

        /* Immersive Images: occupy between 70% and 100% of viewport width */
        .tn-archive-img-wrap, .tn-world-img-wrap, .tn-art-culture-img-wrap {
          position: relative;
          width: 85vw;
          max-width: 1300px;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #f5f5f5;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        .tn-archive-img, .tn-world-img, .tn-art-culture-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 1;
          transition: transform 2.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tn-archive-img-wrap:hover .tn-archive-img,
        .tn-world-img-wrap:hover .tn-world-img,
        .tn-art-culture-img-wrap:hover .tn-art-culture-img {
          transform: scale(1.03);
        }
        .tn-archive-img-overlay, .tn-world-img-overlay, .tn-art-culture-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 70%, rgba(255, 255, 255, 0.3) 100%);
          z-index: 2;
          pointer-events: none;
        }

        .tn-archive-text-wrap, .tn-world-text-wrap, .tn-art-culture-text-wrap {
          width: 85vw;
          max-width: 1300px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .tn-archive-eyebrow, .tn-world-eyebrow, .tn-art-culture-eyebrow {
          font-family: var(--font-primary);
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(0, 0, 0, 0.45);
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .tn-archive-title, .tn-world-title, .tn-art-culture-title {
          font-family: var(--font-serif) !important;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #000000;
          margin: 0 0 24px;
          text-transform: uppercase;
        }
        .tn-archive-desc, .tn-world-desc, .tn-art-culture-desc {
          font-family: var(--font-primary);
          font-size: 15px;
          font-weight: 300;
          color: #333333;
          line-height: 1.6;
          margin: 0 0 40px;
          max-width: 580px;
        }

        /* Premium Discover Link */
        .tn-discover-link {
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: #000000;
          text-transform: uppercase;
          text-decoration: none;
          position: relative;
          padding-bottom: 8px;
        }
        .tn-discover-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 100%; height: 1px;
          background: rgba(0, 0, 0, 0.2);
          transition: background 0.4s;
        }
        .tn-discover-link:hover::after {
          background: #000000;
        }

        /* ══ EDITORIAL JOURNAL ══ */
        .tn-journal {
          background: #ffffff;
          padding: 120px 0;
          margin-bottom: 180px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        .tn-journal-inner {
          max-width: 1400px;
          margin: 0 auto;
          width: 85vw;
        }
        .tn-section-header {
          text-align: center;
          margin-bottom: 100px;
        }
        .tn-section-eyebrow {
          font-family: var(--font-primary);
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(0, 0, 0, 0.45);
          text-transform: uppercase;
          display: block;
          margin-bottom: 16px;
        }
        .tn-section-title {
          font-family: var(--font-serif) !important;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #000000;
          margin: 0;
          text-transform: uppercase;
        }
        .tn-journal-layout {
          display: grid;
          grid-template-columns: 55% 45%;
          gap: 80px;
        }
        .tn-journal-col-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .tn-journal-col-right {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding-top: 80px;
        }
        .tn-journal-img-wrap {
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #f5f5f5;
          border: 1px solid rgba(0, 0, 0, 0.06);
          margin-bottom: 24px;
        }
        .tn-journal-img-wrap-small {
          aspect-ratio: 4 / 5;
          width: 80%;
          overflow: hidden;
          background: #f5f5f5;
          border: 1px solid rgba(0, 0, 0, 0.06);
          margin-bottom: 24px;
          align-self: flex-end;
        }
        .tn-journal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 1;
        }
        .tn-journal-caption {
          font-family: var(--font-primary);
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: rgba(0, 0, 0, 0.45);
          text-transform: uppercase;
          margin-top: 12px;
          display: block;
        }
        .tn-journal-text-wrap {
          margin-bottom: 100px;
        }
        .tn-journal-quote {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(24px, 3.2vw, 32px);
          font-weight: 400;
          letter-spacing: 0.04em;
          line-height: 1.45;
          color: #1a1a1a;
          margin: 0;
        }
        .tn-journal-cta-wrap {
          margin-top: 60px;
          align-self: flex-end;
          width: 80%;
          display: flex;
          justify-content: flex-start;
        }

        /* ══ NEWSLETTER VIP ══ */
        .tn-newsletter {
          background: #ffffff;
          padding: 160px 0;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .tn-newsletter-inner {
          max-width: 680px;
          width: 85vw;
        }
        .tn-newsletter-eyebrow {
          font-family: var(--font-primary);
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(0, 0, 0, 0.45);
          text-transform: uppercase;
          display: block;
          margin-bottom: 24px;
        }
        .tn-newsletter-title {
          font-family: var(--font-serif) !important;
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #000000;
          margin: 0 0 24px;
          text-transform: uppercase;
        }
        .tn-newsletter-desc {
          font-family: var(--font-primary);
          font-size: 15px;
          font-weight: 300;
          color: #333333;
          line-height: 1.6;
          margin: 0 0 52px;
        }
        .tn-newsletter-form-wrap {
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
        }
        .tn-newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .tn-newsletter-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.2);
          outline: none;
          color: #000000;
          font-family: var(--font-primary);
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.08em;
          padding: 16px 0;
          text-align: center;
          width: 100%;
          transition: border-color 0.4s;
        }
        .tn-newsletter-input:focus {
          border-color: #000000;
        }
        .tn-newsletter-input::placeholder {
          color: rgba(0, 0, 0, 0.3);
        }
        .tn-newsletter-btn {
          background: #000000;
          color: #ffffff;
          border: 1px solid #000000;
          padding: 18px 0;
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.6s, color 0.6s, border-color 0.6s;
        }
        .tn-newsletter-btn:hover {
          background: transparent;
          color: #000000;
          border-color: rgba(0, 0, 0, 0.3);
        }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 1024px) {
          .tn-campaign-film { margin-bottom: 120px; }
          .tn-archive, .tn-world, .tn-art-culture { margin-bottom: 120px; }
          .tn-journal { padding: 100px 0; margin-bottom: 120px; }
          .tn-journal-layout { gap: 40px; }
          .tn-newsletter { padding: 100px 0; }
        }
        @media (max-width: 767px) {
          .tn-film-wrap { height: 60vh; }
          .tn-campaign-film { margin-bottom: 80px; }
          .tn-archive, .tn-world, .tn-art-culture { padding: 60px 0; margin-bottom: 80px; }
          .tn-archive-img-wrap, .tn-world-img-wrap, .tn-art-culture-img-wrap { width: 90vw; aspect-ratio: 4 / 3; }
          .tn-archive-text-wrap, .tn-world-text-wrap, .tn-art-culture-text-wrap { width: 90vw; }
          .tn-journal { padding: 80px 0; margin-bottom: 80px; }
          .tn-journal-layout { grid-template-columns: 1fr; gap: 60px; }
          .tn-journal-col-right { padding-top: 0px; }
          .tn-journal-img-wrap-small { width: 100%; }
          .tn-journal-text-wrap { margin-bottom: 48px; }
          .tn-journal-cta-wrap { align-self: auto; width: 100%; }
          .tn-newsletter { padding: 80px 0; }
        }
      `}</style>
    </div>
  );
}
