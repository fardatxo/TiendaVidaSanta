"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const [email, setEmail] = useState("");
  const pathname = usePathname();

  return (
    <footer className="ft">

      {/* ── MAIN BODY ── */}
      <div className="ft-body">

        {/* Left: Newsletter + Socials */}
        <div className="ft-left">
          <p className="ft-nl-label">boletín de noticias</p>
          <div className="ft-nl">
            <div className="ft-nl-row">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="dirección de correo electrónico"
                className="ft-nl-input"
              />
              <button className="ft-nl-btn" aria-label="Submit">→</button>
            </div>
            <p className="ft-nl-sub">suscríbete para recibir novedades, lanzamientos y más.</p>
          </div>
          <div className="ft-socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9a8.2 8.2 0 0 0 4.79 1.52V7.07a4.85 4.85 0 0 1-1.02-.38z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Right: Nav columns */}
        <div className="ft-nav">
          <div className="ft-nav-col">
            <p className="ft-col-head">contacto</p>
            <ul className="ft-links">
              <li><Link href="mailto:info@tonertorrentinni.com">email</Link></li>
              <li><Link href="#">whatsapp</Link></li>
              <li><Link href="/contact">faq</Link></li>
            </ul>
          </div>
          <div className="ft-nav-col">
            <p className="ft-col-head">tonet</p>
            <ul className="ft-links">
              <li><Link href="/about">sobre nosotros</Link></li>
              <li><Link href="#">prensa</Link></li>
              <li><Link href="#">empleo</Link></li>
            </ul>
          </div>
          <div className="ft-nav-col">
            <p className="ft-col-head">legal</p>
            <ul className="ft-links">
              <li><Link href="#">privacidad</Link></li>
              <li><Link href="#">condiciones</Link></li>
              <li><Link href="#">cookies</Link></li>
            </ul>
          </div>
        </div>

      </div>

      {/* ── BOTTOM ── */}
      <div className="ft-bottom">
        <span className="ft-copy">tonet ©</span>
        <span className="ft-locale">españa / es / eur</span>
      </div>

      <style>{`
        .ft {
          background: #ffffff;
          color: #000000;
          font-family: var(--font-primary), sans-serif;
          border-top: 1px solid #000000;
          text-transform: lowercase;
        }
        .ft a { text-decoration: none; }

        /* ── BODY ── */
        .ft-body {
          display: flex;
          padding: 80px 40px 60px;
          border-bottom: 1px solid #eaeaea;
        }

        /* ── LEFT ── */
        .ft-left {
          flex: 0 0 40%;
          padding-right: 60px;
          display: flex;
          flex-direction: column;
        }
        .ft-nl-label {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #000000;
          margin: 0 0 32px;
          text-transform: lowercase;
        }
        .ft-nl { margin-bottom: 40px; }
        .ft-nl-row {
          display: flex;
          align-items: center;
          border-bottom: 1px solid #000000;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .ft-nl-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 300;
          color: #000000;
          padding: 0;
          letter-spacing: 0.02em;
        }
        .ft-nl-input::placeholder { color: #888888; }
        .ft-nl-btn {
          background: transparent;
          border: none;
          color: #000000;
          font-size: 16px;
          cursor: pointer;
          padding: 0 0 0 8px;
          line-height: 1;
          transition: opacity 0.3s;
        }
        .ft-nl-btn:hover { opacity: 0.7; }
        .ft-nl-sub {
          font-size: 10px;
          font-weight: 300;
          color: #888888;
          margin: 0;
          letter-spacing: 0.02em;
        }

        /* ── SOCIALS ── */
        .ft-socials {
          display: flex;
          gap: 24px;
          align-items: center;
          margin-top: auto;
        }
        .ft-socials a {
          color: #000000;
          display: flex;
          align-items: center;
          transition: opacity 0.3s;
        }
        .ft-socials a:hover { opacity: 0.7; }

        /* ── NAV ── */
        .ft-nav {
          flex: 1;
          display: flex;
          padding-left: 60px;
          gap: 60px;
        }
        .ft-nav-col { flex: 1; }
        .ft-col-head {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          color: #000000;
          margin: 0 0 24px;
          text-transform: lowercase;
        }
        .ft-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ft-links li a {
          font-size: 11px;
          font-weight: 300;
          color: #666666;
          letter-spacing: 0.02em;
          transition: color 0.3s;
        }
        .ft-links li a:hover { color: #000000; }

        /* ── BOTTOM ── */
        .ft-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
        }
        .ft-copy {
          font-size: 11px;
          font-weight: 300;
          color: #000000 !important;
          letter-spacing: 0.05em;
          font-family: var(--font-primary), sans-serif !important;
        }
        .ft-locale {
          font-size: 10px;
          font-weight: 300;
          color: #666666;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: color 0.3s;
        }
        .ft-locale:hover { color: #000000; }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .ft-body {
            flex-direction: column;
            padding: 40px 20px 30px;
            gap: 0;
          }
          .ft-left {
            flex: none;
            padding-right: 0;
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 40px;
            margin-bottom: 40px;
          }
          .ft-socials { margin-top: 32px; }
          .ft-nav {
            padding-left: 0;
            flex-direction: row;
            gap: 0;
            justify-content: flex-start;
            gap: 40px;
          }
          .ft-nav-col { flex: none; }
          .ft-col-head { margin-bottom: 16px; }
          .ft-links { gap: 10px; }
          .ft-bottom {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .ft-nav { flex-direction: column; gap: 32px; }
        }
      `}</style>

    </footer>
  );
}
