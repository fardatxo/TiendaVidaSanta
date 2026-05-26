'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'tonet_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const respond = (value: 'accepted' | 'declined') => {
    localStorage.setItem(CONSENT_KEY, value);
    setDismissing(true);
    setTimeout(() => setVisible(false), 800);
  };

  if (!visible) return null;

  return (
    <div className={`ck-bar${dismissing ? ' ck-dismissing' : ''}`} role="dialog" aria-label="Cookie consent">
      <div className="ck-inner">
        <div className="ck-text">
          <p className="ck-over">Privacy &mdash; House of Tonet</p>
          <p className="ck-body">
            This house uses data to curate your experience
            with the care it deserves.{' '}
            <Link href="/privacy" className="ck-link">Privacy Policy</Link>
          </p>
        </div>
        <div className="ck-actions">
          <button className="ck-btn ck-btn--decline" onClick={() => respond('declined')}>
            Decline
          </button>
          <button className="ck-btn ck-btn--accept" onClick={() => respond('accepted')}>
            Accept
          </button>
        </div>
      </div>

      <style>{`
        .ck-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: #0d0d0d;
          border-top: 1px solid rgba(255,255,255,0.06);
          animation: ck-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes ck-rise {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes ck-fall {
          from { transform: translateY(0);   opacity: 1; }
          to   { transform: translateY(100%); opacity: 0; }
        }
        .ck-bar.ck-dismissing {
          animation: ck-fall 0.8s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }
        .ck-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px 60px;
        }
        .ck-text {
          flex: 1;
        }
        .ck-over {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.45em;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          margin: 0 0 10px;
        }
        .ck-body {
          font-family: var(--font-primary);
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          margin: 0;
        }
        .ck-link {
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          padding-bottom: 1px;
          transition: color 0.3s, border-color 0.3s;
        }
        .ck-link:hover {
          color: rgba(255,255,255,0.7);
          border-color: rgba(255,255,255,0.35);
          opacity: 1 !important;
        }
        .ck-actions {
          display: flex;
          align-items: center;
          gap: 40px;
          flex-shrink: 0;
        }
        .ck-btn {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.4s;
        }
        .ck-btn--decline {
          color: rgba(255,255,255,0.25);
        }
        .ck-btn--decline:hover { color: rgba(255,255,255,0.55); }
        .ck-btn--accept {
          color: rgba(255,255,255,0.75);
          border-bottom: 1px solid rgba(255,255,255,0.2);
          padding-bottom: 4px;
          transition: color 0.4s, border-color 0.4s;
        }
        .ck-btn--accept:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.5);
        }
        @media (max-width: 767px) {
          .ck-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
            padding: 28px 24px 32px;
          }
          .ck-actions { gap: 32px; }
        }
      `}</style>
    </div>
  );
}
