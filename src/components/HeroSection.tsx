'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const HERO_IMAGES = [
  '/hero/ComfyUI-main_reference_00012_.png',
  '/hero/ComfyUI-main_reference_00016_.png',
  '/hero/ComfyUI-main_reference_00017_.png',
  '/hero/ComfyUI-main_reference_00018_.png',
  '/hero/ComfyUI-main_reference_00019_.png',
  '/hero/ComfyUI-main_reference_00020_.png',
  '/hero/ComfyUI-main_reference_00021_.png',
  '/hero/ComfyUI-main_reference_00022_.png',
  '/hero/ComfyUI-main_reference_00023_.png',
  '/hero/ComfyUI-main_reference_00028_.png',
  '/hero/ComfyUI-main_reference_00032_.png',
];

function pickNine(): string[] {
  const shuffled = [...HERO_IMAGES].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1], shuffled[2], shuffled[3], shuffled[4], shuffled[5], shuffled[6], shuffled[7], shuffled[8]];
}

export default function HeroSection() {
  const [imgs, setImgs] = useState<string[]>([
    HERO_IMAGES[0], HERO_IMAGES[1], HERO_IMAGES[2], HERO_IMAGES[3], HERO_IMAGES[4], HERO_IMAGES[5], HERO_IMAGES[6], HERO_IMAGES[7], HERO_IMAGES[8]
  ]);

  useEffect(() => {
    setImgs(pickNine());
  }, []);

  return (
    <div className="hero-wrapper">
      {/* Viewport 1: Video hero */}
      <section className="hero-video-section">
        <video
          className="hero-video"
          src="/hero-video.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="hero-video-overlay">
          <Link href="/collection/amazing-super-summer" className="hero-cta">
            EXPLORE THE BEST SUMMER
          </Link>
          <svg className="hero-chevron" width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2">
            <path d="M1 1l9 9 9-9" />
          </svg>
        </div>
      </section>

      {/* Viewport 2: Dual collection blocks */}
      <section className="hero-dual-section">
        <Link href="/collection/amazing-super-summer" className="hero-dual-panel">
          <img src={imgs[0]} alt="Mens" className="hero-dual-img" loading="lazy" decoding="async" />
          <span className="hero-dual-cta">MENS HIGH SUMMER</span>
        </Link>
        <Link href="/collection/hoodie-2" className="hero-dual-panel">
          <img src={imgs[1]} alt="Womens" className="hero-dual-img" loading="lazy" decoding="async" />
          <span className="hero-dual-cta">WOMEN&apos;S HIGH SUMMER</span>
        </Link>
      </section>

      {/* Viewport 2.5: Single collection block */}
      <section className="hero-single-section dark-section">
        <Link href="/collection/spring-summer-2026" className="hero-single-panel">
          <img src={imgs[8]} alt="Spring Summer" className="hero-single-img" loading="lazy" decoding="async" />
          <span className="hero-single-cta">SPRING-SUMMER 2026 COLLECTION</span>
        </Link>
      </section>

      {/* Viewport 3: Triple collection blocks */}
      <section className="hero-triple-section">
        <Link href="/collection/eyewear" className="hero-triple-panel">
          <img src={imgs[2]} alt="Eyewear" className="hero-triple-img" loading="lazy" decoding="async" />
          <span className="hero-triple-cta">EYEWEAR</span>
        </Link>
        <Link href="/collection/mothers-day" className="hero-triple-panel">
          <img src={imgs[3]} alt="Mother's Day" className="hero-triple-img" loading="lazy" decoding="async" />
          <span className="hero-triple-cta">MOTHER&apos;S DAY GIFTING</span>
        </Link>
        <Link href="/collection/mens-shirts" className="hero-triple-panel">
          <img src={imgs[4]} alt="Mens Shirts" className="hero-triple-img" loading="lazy" decoding="async" />
          <span className="hero-triple-cta">MEN&apos;S SHIRTS</span>
        </Link>
      </section>


      <style>{`
        /* ═══ VIEWPORT 1: Video Hero ═══ */
        .hero-video-section {
          position: relative;
          width: 100%;
          height: calc(100vh + 48px);
          height: calc(100dvh + 48px);
          overflow: hidden;
          margin-top: -48px;
        }

        .hero-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-video-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 40px;
          z-index: 2;
        }

        .hero-cta {
          display: inline-block;
          padding: 14px 36px;
          border: 1px solid rgba(255,255,255,0.6);
          color: #fff;
          font-family: var(--font-primary);
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          background: transparent;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .hero-cta:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.9);
          opacity: 1 !important;
        }

        .hero-chevron {
          margin-top: 18px;
          animation: hero-bounce 2.5s ease-in-out infinite;
        }

        @keyframes hero-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(6px); opacity: 1; }
        }

        /* ═══ VIEWPORT 2: Dual Blocks ═══ */
        .hero-dual-section {
          display: flex;
          gap: 24px;
          padding: 0 60px;
          padding-top: 70px;
          background: #fff;
          height: 100vh;
          height: 100dvh;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
        }

        .hero-dual-panel {
          position: relative;
          overflow: hidden;
          display: block;
          text-decoration: none;
          color: inherit;
          aspect-ratio: 12 / 16;
          height: calc(100dvh - 70px - 30px);
          flex-shrink: 0;
        }
        .hero-dual-panel:hover {
          opacity: 1 !important;
        }

        .hero-dual-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hero-dual-cta {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          padding: 14px 36px;
          border: 1px solid rgba(255,255,255,0.6);
          color: #fff;
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          white-space: nowrap;
          background: transparent;
          transition: background 0.3s ease, border-color 0.3s ease;
          z-index: 2;
        }
        .hero-dual-panel:hover .hero-dual-cta {
          background: rgba(0, 0, 0, 0.8);
          border-color: rgba(255,255,255,0.9);
        }

        /* ═══ VIEWPORT 2.5: Single Block ═══ */
        .hero-single-section {
          position: relative;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
        }
        .hero-single-panel {
          display: block;
          width: 100%;
          height: 100%;
          text-decoration: none;
          color: inherit;
        }
        .hero-single-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .hero-single-cta {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          padding: 14px 36px;
          border: 1px solid rgba(255,255,255,0.6);
          color: #fff;
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          white-space: nowrap;
          background: transparent;
          transition: background 0.3s ease, border-color 0.3s ease;
          z-index: 2;
        }
        .hero-single-panel:hover {
          opacity: 1 !important;
        }
        .hero-single-panel:hover .hero-single-cta {
          background: rgba(0, 0, 0, 0.8);
          border-color: rgba(255,255,255,0.9);
        }

        /* ═══ VIEWPORT 3: Triple Blocks ═══ */
        .hero-triple-section {
          display: flex;
          gap: 24px;
          padding: 0 60px;
          padding-top: 70px;
          background: #fff;
          height: 100vh;
          height: 100dvh;
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
        }

        .hero-triple-panel {
          position: relative;
          overflow: hidden;
          display: block;
          text-decoration: none;
          color: inherit;
          flex: 1;
          height: calc(100dvh - 70px - 30px);
        }
        .hero-triple-panel:hover {
          opacity: 1 !important;
        }

        .hero-triple-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hero-triple-cta {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          padding: 14px 36px;
          border: 1px solid rgba(255,255,255,0.6);
          color: #fff;
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          white-space: nowrap;
          background: transparent;
          transition: background 0.3s ease, border-color 0.3s ease;
          z-index: 2;
        }
        .hero-triple-panel:hover .hero-triple-cta {
          background: rgba(0, 0, 0, 0.8);
          border-color: rgba(255,255,255,0.9);
        }


        @media (max-width: 767px) {
          .hero-dual-section {
            flex-direction: column;
            gap: 0;
            padding: 0;
            height: calc(2 * 100dvh);
            align-items: stretch;
          }
          .hero-triple-section {
            flex-direction: column;
            gap: 0;
            padding: 0;
            height: calc(3 * 100dvh);
            align-items: stretch;
          }
          .hero-triple-panel, .hero-dual-panel {
            aspect-ratio: unset;
            height: 100dvh;
            width: 100%;
            flex: none;
            padding-top: 80px;
            padding-bottom: 20px;
            padding-left: 8vw;
            padding-right: 8vw;
            box-sizing: border-box;
            background: #fff;
          }
          .hero-triple-cta, .hero-dual-cta {
            bottom: 40px;
          }
        }
      `}</style>
    </div>
  );
}
