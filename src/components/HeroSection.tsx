'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="tn-hero">
      <video
        className="tn-hero-video"
        src="/hero-video.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="tn-hero-vignette" />

      <div className={`tn-hero-content${visible ? ' tn-visible' : ''}`}>
        <p className="tn-hero-eyebrow">TONET &mdash; PARIS</p>
        <h1 className="tn-hero-headline">
          Silence.<br />
          Structure.<br />
          Status.
        </h1>
        <Link href="/collection/spring-summer-2026" className="tn-hero-cta">
          The Collection
        </Link>
      </div>

      <div className="tn-scroll-wire" aria-hidden="true">
        <span className="tn-scroll-line" />
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
        .tn-hero-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .tn-hero-vignette {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 25%),
            linear-gradient(to top,    rgba(0,0,0,0.65) 0%, transparent 55%),
            linear-gradient(to right,  rgba(0,0,0,0.15) 0%, transparent 40%);
        }
        .tn-hero-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding-top: 60px;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 1.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tn-hero-content.tn-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .tn-hero-eyebrow {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.5em;
          color: rgba(255,255,255,0.35);
          margin: 0 0 52px;
          text-transform: uppercase;
        }
        .tn-hero-headline {
          font-family: var(--font-primary);
          font-size: clamp(52px, 9vw, 110px);
          font-weight: 200;
          letter-spacing: 0.14em;
          line-height: 1.0;
          color: #ffffff;
          margin: 0 0 72px;
          text-transform: uppercase;
        }
        .tn-hero-cta {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.45em;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.18);
          padding-bottom: 6px;
          transition: color 0.6s ease, border-color 0.6s ease;
        }
        .tn-hero-cta:hover {
          color: rgba(255,255,255,0.9);
          border-color: rgba(255,255,255,0.45);
          opacity: 1 !important;
        }
        .tn-scroll-wire {
          position: absolute;
          bottom: 44px;
          left: 50%;
          transform: translateX(-50%);
        }
        .tn-scroll-line {
          display: block;
          width: 1px;
          height: 60px;
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.45) 50%,
            rgba(255,255,255,0) 100%
          );
          animation: tn-wire-drop 2.8s ease-in-out infinite;
        }
        @keyframes tn-wire-drop {
          0%   { transform: scaleY(0); transform-origin: top; opacity: 0; }
          35%  { transform: scaleY(1); transform-origin: top; opacity: 1; }
          65%  { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        }
        @media (max-width: 767px) {
          .tn-hero { height: calc(100dvh + 60px); }
          .tn-hero-headline {
            font-size: clamp(40px, 13vw, 72px);
            letter-spacing: 0.1em;
            margin-bottom: 56px;
          }
          .tn-hero-eyebrow { margin-bottom: 40px; }
        }
      `}</style>
    </section>
  );
}
