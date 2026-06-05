'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    image: '/hero/ComfyUI-main_reference_00028_.png',
    eyebrow: 'SS — MMXXVI',
    lines: ['SILENCE.', 'STRUCTURE.', 'PERMANENCE.'],
  },
  {
    image: '/hero/ComfyUI-main_reference_00016_.png',
    eyebrow: 'THE HOUSE',
    lines: ['TONET AT NIGHT.'],
  },
  {
    image: '/hero/ComfyUI-main_reference_00021_.png',
    eyebrow: 'PERMANENCE',
    lines: ['BUILT IN SILENCE.', 'WORN IN PERMANENCE.'],
  },
];

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const goTo = useCallback((idx: number, dir = 1) => {
    setDirection(dir);
    setActive(idx);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setActive(prev => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[active];

  return (
    <section className="tn-hero">
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={`tn-hero-slide${i === active ? ' active' : ''}`}
          style={{ zIndex: i === active ? 2 : 1 }}
        >
          <img src={s.image} alt="" className="tn-hero-img" draggable={false} />
          <div className="tn-hero-overlay" />
        </div>
      ))}

      {/* Content */}
      <div className={`tn-hero-content${visible ? ' tn-visible' : ''}`}>
        <p className="tn-hero-eyebrow" key={`eyebrow-${active}`}>{slide.eyebrow}</p>
        <h1 className="tn-hero-headline">
          {slide.lines.map((line, i) => (
            <span key={i} className="tn-hero-line" style={{ animationDelay: `${i * 0.12 + 0.2}s` }}>
              {line}
            </span>
          ))}
        </h1>
        <Link href="/collection/i9nm9inm" className="tn-hero-cta">
          Enter the House
        </Link>
      </div>

      {/* Dots */}
      <div className="tn-hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`tn-hero-dot${i === active ? ' active' : ''}`}
            onClick={() => goTo(i, i > active ? 1 : -1)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <style>{`
        .tn-hero {
          position: relative;
          width: 100%;
          height: calc(100dvh + 60px);
          overflow: hidden;
          margin-top: -60px;
          background: #0d0d0d;
        }
        .tn-hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .tn-hero-slide.active {
          opacity: 1;
        }
        .tn-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tn-hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 30%),
            linear-gradient(to top,    rgba(0,0,0,0.55) 0%, transparent 50%),
            linear-gradient(to right,  rgba(0,0,0,0.2) 0%, transparent 35%);
        }
        .tn-hero-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 40px;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 1.8s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 3;
          pointer-events: none;
        }
        .tn-hero-content.tn-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .tn-hero-content > * {
          pointer-events: auto;
        }
        .tn-hero-eyebrow {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.5em;
          color: rgba(255,255,255,0.32);
          margin: 0 0 52px;
          text-transform: uppercase;
          opacity: 0;
          animation: tn-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
        }
        .tn-hero-headline {
          font-family: var(--font-primary);
          font-size: clamp(44px, 8vw, 110px);
          font-weight: 200;
          letter-spacing: 0.18em;
          line-height: 1.05;
          color: #ffffff;
          margin: 0 0 64px;
          text-transform: uppercase;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tn-hero-line {
          display: block;
          opacity: 0;
          transform: translateY(12px);
          animation: tn-fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .tn-hero-cta {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.42em;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.14);
          padding-bottom: 6px;
          transition: color 0.6s ease, border-color 0.6s ease;
          opacity: 0;
          animation: tn-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }
        .tn-hero-cta:hover {
          color: rgba(255,255,255,0.9);
          border-color: rgba(255,255,255,0.45);
          opacity: 1 !important;
        }
        .tn-hero-dots {
          position: absolute;
          bottom: 48px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 14px;
          z-index: 4;
        }
        .tn-hero-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.18);
          background: transparent;
          padding: 0;
          cursor: pointer;
          transition: background 0.5s ease, border-color 0.5s ease;
        }
        .tn-hero-dot.active {
          background: rgba(255,255,255,0.55);
          border-color: rgba(255,255,255,0.55);
        }
        .tn-hero-dot:hover {
          border-color: rgba(255,255,255,0.45);
        }
        @keyframes tn-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 767px) {
          .tn-hero { height: calc(100dvh + 60px); }
          .tn-hero-headline {
            font-size: clamp(32px, 11vw, 64px);
            letter-spacing: 0.12em;
            margin-bottom: 48px;
          }
          .tn-hero-eyebrow { margin-bottom: 36px; }
          .tn-hero-cta { letter-spacing: 0.35em; }
        }
      `}</style>
    </section>
  );
}
