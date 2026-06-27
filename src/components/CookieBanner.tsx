'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './CookieBanner.css';

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

  const respond = (value: 'accepted' | 'declined' | 'settings') => {
    localStorage.setItem(CONSENT_KEY, value);
    setDismissing(true);
    setTimeout(() => setVisible(false), 800);
  };

  if (!visible) return null;

  return (
    <div className={`ck-bar${dismissing ? ' ck-dismissing' : ''}`} role="dialog" aria-label="Cookie consent">
      <div className="ck-inner">
        <div className="ck-text">
          <p className="ck-body">
            By clicking &ldquo;Accept All Cookies&rdquo;, you agree to the storing of cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts.
          </p>
        </div>

        <div className="ck-actions">
          <button className="ck-btn ck-btn--settings" onClick={() => respond('settings')}>
            Cookies Settings
          </button>
          <button className="ck-btn ck-btn--decline" onClick={() => respond('declined')}>
            Reject All
          </button>
          <button className="ck-btn ck-btn--accept" onClick={() => respond('accepted')}>
            Accept All Cookies
          </button>
        </div>

        <button className="ck-close" onClick={() => respond('declined')} aria-label="Close cookie banner">
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
