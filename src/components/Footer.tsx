"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const [email, setEmail] = useState("");
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <footer className="ft-home">
        <div className="ft-home-inner">
          <div className="ft-home-logo-wrap">
            <span className="ft-home-logo">TONER TORRENTINNI</span>
          </div>

          <div className="ft-home-links">
            <Link href="/archive" className="ft-home-link">ARCHIVE</Link>
            <Link href="/collection" className="ft-home-link">JOURNAL</Link>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="ft-home-link">INSTAGRAM</a>
            <Link href="/contact" className="ft-home-link">CONTACT</Link>
          </div>

          <div className="ft-home-bottom">
            <span className="ft-home-copy">TONER TORRENTINNI ©</span>
          </div>
        </div>

        <style>{`
          .ft-home {
            background: #000000;
            color: #ffffff;
            font-family: var(--font-primary);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding: 120px 80px 60px;
          }
          .ft-home-inner {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 60px;
          }
          .ft-home-logo-wrap {
            text-align: center;
          }
          .ft-home-logo {
            font-family: var(--font-brand);
            font-size: clamp(32px, 6vw, 72px);
            font-weight: 300;
            letter-spacing: normal;
            padding-left: 0px;
            color: #ffffff;
            text-transform: uppercase;
          }
          .ft-home-links {
            display: flex;
            flex-direction: row;
            justify-content: center;
            gap: 40px;
            margin: 20px 0;
            flex-wrap: wrap;
          }
          .ft-home-link {
            font-size: 11px;
            font-weight: 300;
            letter-spacing: 0.35em;
            color: rgba(255, 255, 255, 0.5);
            text-decoration: none;
            transition: color 0.4s;
          }
          .ft-home-link:hover {
            color: #ffffff;
            opacity: 1 !important;
          }
          .ft-home-bottom {
            display: flex;
            justify-content: center;
          }
          .ft-home-copy {
            font-family: var(--font-brand) !important;
            font-size: 16px;
            font-weight: 300;
            color: #ffffff !important;
            letter-spacing: normal;
            text-transform: uppercase;
          }
          @media (max-width: 767px) {
            .ft-home {
              padding: 80px 24px 40px;
            }
            .ft-home-inner {
              gap: 40px;
            }
            .ft-home-links {
              gap: 20px;
            }
          }
        `}</style>
      </footer>
    );
  }

  return (
    <footer className="ft">

      {/* ── MAIN BODY ── */}
      <div className="ft-body">

        {/* Left: Newsletter + Socials */}
        <div className="ft-left">
          <p className="ft-nl-label">Enter the Private Circle.</p>
          <div className="ft-nl">
            <div className="ft-nl-row">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email address"
                className="ft-nl-input"
              />
              <button className="ft-nl-btn" aria-label="Submit">→</button>
            </div>
            <p className="ft-nl-sub">Not frequent. Not loud.</p>
          </div>
          <div className="ft-socials">
            <Link href="#" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </Link>
            <Link href="#" aria-label="X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
            <Link href="#" aria-label="TikTok">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9a8.2 8.2 0 0 0 4.79 1.52V7.07a4.85 4.85 0 0 1-1.02-.38z"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Right: Nav columns */}
        <div className="ft-nav">
          <div className="ft-nav-col">
            <p className="ft-col-head">CONTACT</p>
            <ul className="ft-links">
              <li><Link href="mailto:info@tonertorrentinni.com">Email</Link></li>
              <li><Link href="#">WhatsApp</Link></li>
              <li><Link href="/contact">FAQ</Link></li>
            </ul>
          </div>
          <div className="ft-nav-col">
            <p className="ft-col-head">TONER TORRENTINNI</p>
            <ul className="ft-links">
              <li><Link href="/about">About</Link></li>
              <li><Link href="#">Press</Link></li>
              <li><Link href="#">Careers</Link></li>
            </ul>
          </div>
          <div className="ft-nav-col">
            <p className="ft-col-head">LEGAL</p>
            <ul className="ft-links">
              <li><Link href="#">Privacy</Link></li>
              <li><Link href="#">Terms</Link></li>
              <li><Link href="#">Cookies</Link></li>
            </ul>
          </div>
        </div>

      </div>

      {/* ── BOTTOM ── */}
      <div className="ft-bottom">
        <span className="ft-copy">TONER TORRENTINNI ©</span>
        <span className="ft-locale">ESPAÑA / ESPAÑOL</span>
      </div>

      <style>{`
        .ft {
          background: #080808;
          color: #fff;
          font-family: var(--font-primary);
        }
        .ft a { text-decoration: none; }

        /* ── BODY ── */
        .ft-body {
          display: flex;
          padding: 120px 100px 100px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        /* ── LEFT ── */
        .ft-left {
          flex: 0 0 40%;
          padding-right: 100px;
          display: flex;
          flex-direction: column;
        }
        .ft-nl-label {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.32em;
          color: rgba(255,255,255,0.45);
          margin: 0 0 56px;
          text-transform: uppercase;
        }
        .ft-nl { margin-bottom: 80px; }
        .ft-nl-row {
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.09);
          padding-bottom: 20px;
          margin-bottom: 28px;
        }
        .ft-nl-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 13px;
          font-weight: 300;
          color: #fff;
          padding: 0;
          letter-spacing: 0.02em;
        }
        .ft-nl-input::placeholder { color: #282828; }
        .ft-nl-btn {
          background: transparent;
          border: none;
          color: #333333;
          font-size: 18px;
          cursor: pointer;
          padding: 0 0 0 12px;
          line-height: 1;
          transition: color 0.4s;
        }
        .ft-nl-btn:hover { color: #999; }
        .ft-nl-sub {
          font-size: 10px;
          font-weight: 300;
          color: #2c2c2c;
          margin: 0;
          letter-spacing: 0.05em;
        }

        /* ── SOCIALS ── */
        .ft-socials {
          display: flex;
          gap: 32px;
          align-items: center;
          margin-top: auto;
        }
        .ft-socials a {
          color: #303030;
          display: flex;
          align-items: center;
          transition: color 0.4s;
        }
        .ft-socials a:hover { color: #666; }

        /* ── NAV ── */
        .ft-nav {
          flex: 1;
          display: flex;
          padding-left: 100px;
          gap: 88px;
        }
        .ft-nav-col { flex: 1; }
        .ft-col-head {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.2em;
          color: #303030;
          margin: 0 0 44px;
          text-transform: uppercase;
        }
        .ft-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .ft-links li a {
          font-size: 12px;
          font-weight: 300;
          color: #3c3c3c;
          letter-spacing: 0.03em;
          transition: color 0.4s;
        }
        .ft-links li a:hover { color: #aaa; }

        /* ── BOTTOM ── */
        .ft-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 100px;
        }
        .ft-copy {
          font-family: var(--font-brand) !important;
          font-size: 14px;
          font-weight: 300;
          color: #ffffff !important;
          letter-spacing: normal;
        }
        .ft-locale {
          font-size: 10px;
          font-weight: 300;
          color: #262626;
          letter-spacing: 0.12em;
          cursor: pointer;
          transition: color 0.4s;
        }
        .ft-locale:hover { color: #666; }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .ft-body {
            flex-direction: column;
            padding: 64px 28px 48px;
            gap: 0;
          }
          .ft-left {
            flex: none;
            padding-right: 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding-bottom: 60px;
            margin-bottom: 56px;
          }
          .ft-socials { margin-top: 40px; }
          .ft-nav {
            padding-left: 0;
            flex-direction: row;
            gap: 0;
            justify-content: flex-start;
            gap: 48px;
          }
          .ft-nav-col { flex: none; }
          .ft-col-head { margin-bottom: 24px; }
          .ft-links { gap: 14px; }
          .ft-bottom {
            padding: 22px 28px;
          }
        }

        @media (max-width: 480px) {
          .ft-nav { flex-direction: column; gap: 40px; }
        }
      `}</style>

    </footer>
  );
}
