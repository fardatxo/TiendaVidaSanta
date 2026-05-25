"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [openSections, setOpenSections] = useState<Set<number>>(new Set());
  const toggleSection = (idx: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  return (
    <footer className="ft">

      {/* â”€â”€ MAIN COLUMNS â”€â”€ */}
      <div className="ft-main">

        {/* Col 1: Newsletter + Socials */}
        <div className="ft-col ft-col--wide">
          <p className="ft-heading">SUSCRÃBASE A NUESTRO BOLETÃN</p>
          <div className="ft-nl">
            <div className="ft-nl-row">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Introduzca su direcciÃ³n de correo electrÃ³nico *"
                className="ft-nl-input"
              />
              <button className="ft-nl-btn" aria-label="Suscribirse">â†’</button>
            </div>
            <p className="ft-nl-disclaimer">
              Al hacer clic en "Suscribirse" confirma que ha leÃ­do y entendido nuestra{" "}
              <Link href="#">PolÃ­tica de Privacidad</Link>.
            </p>
          </div>
          <div className="ft-socials">
            <Link href="#" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </Link>
            <Link href="#" aria-label="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9a8.2 8.2 0 0 0 4.79 1.52V7.07a4.85 4.85 0 0 1-1.02-.38z"/>
              </svg>
            </Link>
            <Link href="#" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </Link>
            <Link href="#" aria-label="X / Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
            <Link href="#" aria-label="Pinterest">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Col 2: Contact */}
        <div className={`ft-col${openSections.has(0) ? ' ft-col--open' : ''}`}>
          <p className="ft-heading" onClick={() => toggleSection(0)}>CONTÁCTENOS <span className="ft-chevron" /></p>
          <ul className="ft-links">
            <li><Link href="mailto:info@tonetparis.com">EscrÃ­benos por Email</Link></li>
            <li><Link href="#">EscrÃ­benos por WhatsApp</Link></li>
            <li><Link href="/contact">Contacto</Link></li>
            <li><Link href="#">Preguntas frecuentes</Link></li>
          </ul>
        </div>

        {/* Col 3: Services */}
        <div className={`ft-col${openSections.has(1) ? ' ft-col--open' : ''}`}>
          <p className="ft-heading" onClick={() => toggleSection(1)}>SERVICIOS <span className="ft-chevron" /></p>
          <ul className="ft-links">
            <li><Link href="#">Seguimiento del pedido</Link></li>
            <li><Link href="#">Devoluciones</Link></li>
            <li><Link href="#">EnvÃ­os y entregas</Link></li>
            <li><Link href="#">AtenciÃ³n al cliente</Link></li>
          </ul>
        </div>

        {/* Col 4: Company */}
        <div className={`ft-col${openSections.has(2) ? ' ft-col--open' : ''}`}>
          <p className="ft-heading" onClick={() => toggleSection(2)}>EMPRESA <span className="ft-chevron" /></p>
          <ul className="ft-links">
            <li><Link href="#">Sobre Tonet</Link></li>
            <li><Link href="#">Press</Link></li>
            <li><Link href="#">Sostenibilidad</Link></li>
            <li><Link href="#">Trabaja con nosotros</Link></li>
          </ul>
        </div>

        {/* Col 5: Legal */}
        <div className={`ft-col${openSections.has(3) ? ' ft-col--open' : ''}`}>
          <p className="ft-heading" onClick={() => toggleSection(3)}>TÉRMINOS Y CONDICIONES LEGALES <span className="ft-chevron" /></p>
          <ul className="ft-links">
            <li><Link href="#">Aviso legal</Link></li>
            <li><Link href="#">PolÃ­tica de Privacidad</Link></li>
            <li><Link href="#">PolÃ­tica de cookies</Link></li>
            <li><Link href="#">Condiciones de venta</Link></li>
            <li><Link href="#">Sitemap</Link></li>
          </ul>
        </div>

      </div>

      {/* â”€â”€ BOTTOM BAR â”€â”€ */}
      <div className="ft-bottom">
        <span className="ft-copy">Â©TONET PARIS 2024</span>
        <div className="ft-bottom-right">
          <Link href="#" className="ft-bottom-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            LOCALIZADOR DE TIENDAS
          </Link>
          <Link href="#" className="ft-bottom-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            ESPAÃ‘A / ESPAÃ‘OL
          </Link>
        </div>
      </div>

      <style>{`
        .ft {
          background: #111;
          color: #fff;
          font-family: var(--font-primary);
          font-size: 11px;
          font-weight: 400;
          line-height: 1.6;
          letter-spacing: 0.02em;
        }
        .ft a { color: #fff; text-decoration: none; }
        .ft a:hover { text-decoration: underline; text-underline-offset: 3px; }

        /* â”€â”€ MAIN GRID â”€â”€ */
        .ft-main {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 0;
          padding: 56px 48px 64px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .ft-col {
          padding-right: 32px;
        }
        .ft-col--wide {
          padding-right: 48px;
        }
        .ft-heading {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #fff;
          margin: 0 0 20px;
        }

        /* â”€â”€ LINKS â”€â”€ */
        .ft-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ft-links li a {
          font-size: 11px;
          color: #bbb;
          transition: color 0.15s;
        }
        .ft-links li a:hover { color: #fff; text-decoration: none; }

        /* â”€â”€ NEWSLETTER â”€â”€ */
        .ft-nl { margin-bottom: 32px; }
        .ft-nl-row {
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.35);
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .ft-nl-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 11px;
          color: #fff;
          padding: 0;
        }
        .ft-nl-input::placeholder { color: #888; }
        .ft-nl-btn {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          padding: 0 0 0 8px;
          line-height: 1;
          transition: opacity 0.15s;
        }
        .ft-nl-btn:hover { opacity: 0.6; }
        .ft-nl-disclaimer {
          font-size: 10px;
          color: #777;
          line-height: 1.5;
          margin: 0;
        }
        .ft-nl-disclaimer a { color: #aaa; text-decoration: underline; text-underline-offset: 2px; }

        /* â”€â”€ SOCIALS â”€â”€ */
        .ft-socials {
          display: flex;
          gap: 18px;
          align-items: center;
          margin-top: 32px;
        }
        .ft-socials a {
          color: #bbb;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .ft-socials a:hover { color: #fff; text-decoration: none; }

        /* â”€â”€ BOTTOM BAR â”€â”€ */
        .ft-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 48px;
          background: #0a0a0a;
        }
        .ft-copy {
          font-size: 10px;
          color: #666;
          letter-spacing: 0.04em;
        }
        .ft-bottom-right {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .ft-bottom-link {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #888 !important;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: color 0.15s;
        }
        .ft-bottom-link:hover { color: #fff !important; text-decoration: none !important; }

        /* â”€â”€ MOBILE â”€â”€ */
        @media (max-width: 767px) {
          .ft-main {
            grid-template-columns: 1fr;
            padding: 0;
            border-bottom: none;
          }
          .ft-col, .ft-col--wide {
            padding: 0;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }
          .ft-col--wide {
            padding: 28px 20px 24px;
          }
          .ft-col:not(.ft-col--wide) .ft-heading {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 20px;
            margin: 0;
            cursor: pointer;
            user-select: none;
          }
          .ft-chevron {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-right: 1px solid rgba(255,255,255,0.5);
            border-bottom: 1px solid rgba(255,255,255,0.5);
            transform: rotate(45deg);
            transition: transform 0.25s;
            flex-shrink: 0;
            margin-left: 8px;
          }
          .ft-col--open .ft-chevron {
            transform: rotate(-135deg);
          }
          .ft-col:not(.ft-col--wide) .ft-links {
            display: none;
          }
          .ft-col--open .ft-links {
            display: flex;
          }
          .ft-links {
            padding: 0 20px 16px;
            gap: 12px;
          }
          .ft-bottom {
            flex-direction: column;
            gap: 14px;
            padding: 20px;
            text-align: center;
          }
          .ft-bottom-right { gap: 20px; flex-wrap: wrap; justify-content: center; }
        }
      `}</style>

    </footer>
  );
}
