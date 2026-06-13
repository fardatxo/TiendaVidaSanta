'use client';

import { useEffect, useState } from 'react';

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <section className="tn-hero">
      <div className="tn-hero-img-wrap">
        <img
          src="/hero/ComfyUI-main_reference_00028_.png"
          alt="Campaign Editorial"
          className="tn-hero-img"
          draggable={false}
        />
        <div className="tn-hero-overlay" />
      </div>

      <div className={`tn-hero-content ${visible ? 'visible' : ''}`}>
        <h1 className="tn-hero-title">
          WE HATE MONOTONY
        </h1>
      </div>

      <div className="tn-hero-scroll">
        <span className="tn-hero-scroll-text">SCROLL</span>
        <div className="tn-hero-scroll-line" />
      </div>

      <style>{`
        .tn-hero {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tn-hero-img-wrap {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .tn-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0.65;
          filter: brightness(0.75) contrast(1.1);
          transform: scale(1.05);
          animation: tn-zoom-out 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .tn-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.85) 100%);
          z-index: 2;
        }
        .tn-hero-content {
          position: relative;
          z-index: 3;
          text-align: center;
          max-width: 900px;
          padding: 0 40px;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 2s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tn-hero-content.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .tn-hero-title {
          font-family: var(--font-display);
          font-size: clamp(36px, 6vw, 84px);
          font-weight: 300;
          letter-spacing: 0.22em;
          color: #ffffff;
          text-transform: uppercase;
          line-height: 1.15;
          margin: 0;
          padding-left: 0.22em;
        }
        .tn-hero-scroll {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          opacity: 0;
          animation: tn-fade-in 1.5s ease 1.2s forwards;
        }
        .tn-hero-scroll-text {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.4em;
          color: rgba(255, 255, 255, 0.45);
          padding-left: 0.4em;
        }
        .tn-hero-scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.35) 0%, transparent 100%);
        }

        @keyframes tn-zoom-out {
          from { transform: scale(1.06); }
          to { transform: scale(1.0); }
        }
        @keyframes tn-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 767px) {
          .tn-hero-title {
            font-size: clamp(24px, 10vw, 44px);
            letter-spacing: 0.16em;
            padding-left: 0.16em;
          }
          .tn-hero-scroll {
            bottom: 30px;
          }
          .tn-hero-scroll-line {
            height: 30px;
          }
        }
      `}</style>
    </section>
  );
}
