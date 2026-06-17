"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [playing, setPlaying] = useState(true);
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const [nlEmail, setNlEmail] = useState('');
  const [nlSubmitted, setNlSubmitted] = useState(false);

  useEffect(() => {
    document.body.classList.add('landing-page');
    return () => document.body.classList.remove('landing-page');
  }, []);

  function togglePlay() {
    const left = leftVideoRef.current;
    const right = rightVideoRef.current;
    if (playing) {
      left?.pause();
      right?.pause();
    } else {
      left?.play();
      right?.play();
    }
    setPlaying(!playing);
  }

  function handleNlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nlEmail) return;
    try {
      const stored = JSON.parse(localStorage.getItem('tonet-newsletter') ?? '[]');
      stored.push({ email: nlEmail, at: Date.now() });
      localStorage.setItem('tonet-newsletter', JSON.stringify(stored));
    } catch {}
    setNlSubmitted(true);
  }

  return (
    <>
      {/* ══════ SPLIT-SCREEN HERO ══════ */}
      <div className="landing-split">

        {/* Left Half — Moda Y Accesorios */}
        <Link href="/fashion" className="landing-half">
          <video
            ref={leftVideoRef}
            autoPlay
            muted
            loop
            playsInline
            className="landing-video"
          >
            <source src="/hero-campaign.mp4" type="video/mp4" />
          </video>
          <div className="landing-overlay" />
          <div className="landing-content">
            <h2 className="landing-category">Moda Y Accesorios</h2>
            <span className="landing-discover">Descubrir</span>
          </div>
        </Link>

        {/* Right Half — Perfume Y Belleza */}
        <Link href="/about" className="landing-half">
          <video
            ref={rightVideoRef}
            autoPlay
            muted
            loop
            playsInline
            className="landing-video"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="landing-overlay" />
          <div className="landing-content">
            <h2 className="landing-category">Perfume Y Belleza</h2>
            <span className="landing-discover">Descubrir</span>
          </div>
        </Link>

        {/* Center Logo */}
        <div className="landing-logo">TONET</div>

        {/* Video Controls */}
        <div className="landing-controls">
          <button className="landing-ctrl-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? (
              /* Pause icon — two vertical bars */
              <svg width="12" height="14" viewBox="0 0 12 14" fill="white">
                <rect x="0" y="0" width="3" height="14" />
                <rect x="8" y="0" width="3" height="14" />
              </svg>
            ) : (
              /* Play icon — triangle */
              <svg width="12" height="14" viewBox="0 0 12 14" fill="white">
                <polygon points="0,0 12,7 0,14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ══════ DIOR-STYLE FOOTER ══════ */}
      <footer className="landing-footer">
        {/* Newsletter */}
        <div className="lf-newsletter">
          <h3 className="lf-nl-title">Deseo recibir las últimas noticias de Tonet</h3>
          {nlSubmitted ? (
            <p className="lf-nl-thanks">Gracias por suscribirte.</p>
          ) : (
            <form className="lf-nl-form" onSubmit={handleNlSubmit}>
              <input
                type="email"
                className="lf-nl-input"
                placeholder="* E-mail"
                value={nlEmail}
                onChange={e => setNlEmail(e.target.value)}
                required
              />
              <button type="submit" className="lf-nl-btn">Validar</button>
            </form>
          )}
        </div>

        {/* Footer Columns */}
        <div className="lf-columns">
          <div className="lf-col">
            <h4 className="lf-col-title">Tonet Studios</h4>
            <Link href="/about" className="lf-col-link">Tonet</Link>
            <Link href="/about" className="lf-col-link">Toner Torrentinni</Link>
          </div>
          <div className="lf-col">
            <h4 className="lf-col-title">Servicio De Atención Al Cliente</h4>
            <Link href="/contact" className="lf-col-link">Contacto</Link>
            <Link href="/contact" className="lf-col-link">Entregas y Devoluciones</Link>
            <Link href="/contact" className="lf-col-link">FAQ</Link>
          </div>
          <div className="lf-col">
            <h4 className="lf-col-title">The House Of Tonet</h4>
            <Link href="/about" className="lf-col-link">Nuestra Historia</Link>
            <Link href="/about" className="lf-col-link">Ética y Compromiso</Link>
            <Link href="/about" className="lf-col-link">Carreras</Link>
          </div>
          <div className="lf-col">
            <h4 className="lf-col-title">Ámbito Legal</h4>
            <Link href="/contact" className="lf-col-link">Menciones legales</Link>
            <Link href="/contact" className="lf-col-link">Aviso de privacidad</Link>
            <Link href="/contact" className="lf-col-link">Gestión de las cookies</Link>
            <Link href="/contact" className="lf-col-link">Condiciones generales</Link>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="lf-bottom">
          <div className="lf-socials">
            <span className="lf-social-label">Síguenos</span>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="lf-social-link">TikTok</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="lf-social-link">Instagram</a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="lf-social-link">X</a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="lf-social-link">Pinterest</a>
          </div>
          <span className="lf-bottom-logo">Tonet</span>
          <div className="lf-region">
            <span>País/región</span>
            <span className="lf-region-value">España (Español) ›</span>
          </div>
        </div>
      </footer>

      <style>{`
        /* ══════════════════════════════════════
           BODY OVERRIDE FOR LANDING PAGE
        ══════════════════════════════════════ */
        body.landing-page {
          padding-top: 0 !important;
        }

        /* ══════════════════════════════════════
           SPLIT-SCREEN HERO
        ══════════════════════════════════════ */
        .landing-split {
          display: flex;
          width: 100%;
          height: 100vh;
          position: relative;
          overflow: hidden;
          background: #000000;
        }

        .landing-half {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: block;
          text-decoration: none;
          color: #ffffff;
          cursor: pointer;
        }

        .landing-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .landing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.05) 0%,
            rgba(0, 0, 0, 0.15) 50%,
            rgba(0, 0, 0, 0.45) 100%
          );
          pointer-events: none;
          transition: background 0.5s ease;
        }

        .landing-half:hover .landing-overlay {
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.0) 0%,
            rgba(0, 0, 0, 0.1) 50%,
            rgba(0, 0, 0, 0.35) 100%
          );
        }

        .landing-content {
          position: absolute;
          bottom: 60px;
          left: 0;
          right: 0;
          text-align: center;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .landing-category {
          font-family: var(--font-cormorant), 'Cormorant Garamond', 'Times New Roman', serif;
          font-size: 28px;
          font-weight: 300;
          font-style: normal;
          letter-spacing: 0.04em;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        .landing-discover {
          font-family: var(--font-primary), 'Helvetica Neue', Arial, sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.75);
          text-decoration: none;
          display: inline-block;
          position: relative;
          padding-bottom: 2px;
        }

        .landing-discover::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.6);
          transition: width 0.4s ease, left 0.4s ease;
        }

        .landing-half:hover .landing-discover::after {
          width: 100%;
          left: 0;
        }

        /* ── CENTER LOGO ── */
        .landing-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--font-cormorant), 'Cormorant Garamond', 'Times New Roman', serif;
          font-size: 110px;
          font-weight: 300;
          font-style: normal;
          color: #ffffff;
          letter-spacing: 0.12em;
          z-index: 20;
          pointer-events: none;
          text-shadow: 0 2px 40px rgba(0, 0, 0, 0.25);
          white-space: nowrap;
          line-height: 1;
        }

        /* ── VIDEO CONTROLS ── */
        .landing-controls {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .landing-ctrl-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.6;
          transition: opacity 0.3s;
        }
        .landing-ctrl-btn:hover {
          opacity: 1;
        }

        /* ══════════════════════════════════════
           DIOR-STYLE FOOTER
        ══════════════════════════════════════ */
        .landing-footer {
          background: #ffffff;
          color: #000000;
          font-family: var(--font-primary), 'Helvetica Neue', Arial, sans-serif;
          padding: 0;
        }

        /* Newsletter */
        .lf-newsletter {
          padding: 48px 64px;
          border-bottom: 1px solid #e5e5e5;
        }
        .lf-nl-title {
          font-size: 16px;
          font-weight: 400;
          letter-spacing: 0.01em;
          margin: 0 0 20px;
          color: #000000;
        }
        .lf-nl-form {
          display: flex;
          align-items: stretch;
          gap: 12px;
          max-width: 420px;
        }
        .lf-nl-input {
          flex: 1;
          border: 1px solid #cccccc;
          padding: 10px 14px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          background: #ffffff;
          color: #000000;
          transition: border-color 0.3s;
        }
        .lf-nl-input:focus {
          border-color: #000000;
        }
        .lf-nl-input::placeholder {
          color: #999999;
          font-weight: 300;
        }
        .lf-nl-btn {
          background: #000000;
          color: #ffffff;
          border: none;
          padding: 10px 24px;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.04em;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.3s;
        }
        .lf-nl-btn:hover {
          opacity: 0.85;
        }
        .lf-nl-thanks {
          font-size: 13px;
          color: #666666;
          font-weight: 300;
        }

        /* Columns */
        .lf-columns {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
          padding: 48px 64px;
          border-bottom: 1px solid #e5e5e5;
        }
        .lf-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .lf-col-title {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.01em;
          margin: 0 0 6px;
          color: #000000;
        }
        .lf-col-link {
          font-size: 13px;
          font-weight: 300;
          color: #555555;
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: color 0.3s;
        }
        .lf-col-link:hover {
          color: #000000;
        }

        /* Bottom Row */
        .lf-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 64px;
          font-size: 12px;
          font-weight: 300;
          color: #555555;
        }
        .lf-socials {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .lf-social-label {
          color: #000000;
          font-weight: 400;
        }
        .lf-social-link {
          color: #555555;
          text-decoration: none;
          transition: color 0.3s;
        }
        .lf-social-link:hover {
          color: #000000;
        }
        .lf-bottom-logo {
          font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 400;
          color: #000000;
          letter-spacing: 0.05em;
        }
        .lf-region {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .lf-region-value {
          color: #000000;
          font-weight: 400;
        }

        /* ══════════════════════════════════════
           MOBILE
        ══════════════════════════════════════ */
        @media (max-width: 768px) {
          .landing-split {
            flex-direction: column;
          }
          .landing-half {
            flex: none;
            height: 50vh;
          }
          .landing-logo {
            font-size: 56px;
            letter-spacing: 0.1em;
          }
          .landing-category {
            font-size: 20px;
          }
          .landing-content {
            bottom: 40px;
          }
          .landing-controls {
            bottom: 10px;
          }

          /* Footer mobile */
          .lf-newsletter {
            padding: 32px 24px;
          }
          .lf-nl-form {
            flex-direction: column;
            max-width: 100%;
          }
          .lf-columns {
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            padding: 32px 24px;
          }
          .lf-bottom {
            flex-direction: column;
            gap: 16px;
            padding: 20px 24px;
            text-align: center;
          }
          .lf-socials {
            justify-content: center;
          }
          .lf-region {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
