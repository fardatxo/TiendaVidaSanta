'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRequireAuth, useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/lib/i18n';

export default function InformationClient() {
  const { user, isLoading } = useRequireAuth();
  const { updateProfile } = useAuth();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  // Sync form with user data once loaded
  if (user && !editing && !saved) {
    if (firstName !== user.firstName || lastName !== user.lastName) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone || '');
      setNewsletter(user.newsletter);
    }
  }

  if (isLoading || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone || undefined,
      newsletter,
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div className="info-space-wrap">
        {/* Collector Metadata Header */}
        <div className="info-client-summary">
          <div className="info-summary-item">
            <span className="info-summary-label">CLIENT REGISTRY</span>
            <span className="info-summary-val">
              {`TNT-${String(user.email.split('').reduce((a,c)=>a+c.charCodeAt(0),0) % 9000 + 1000)}`}
            </span>
          </div>
          <div className="info-summary-item info-summary-center">
            <span className="info-summary-label">MAISON ACCESS</span>
            <span className="info-summary-val">{`${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`}</span>
          </div>
          <div className="info-summary-item">
            <span className="info-summary-label">MEMBER STATUS</span>
            <span className="info-summary-val">VERIFIED RECORD</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="info-nav-tabs">
          <Link href="/account" className="info-nav-tab">The Residence</Link>
          <Link href="/account/orders" className="info-nav-tab">Acquisitions</Link>
          <Link href="/account/information" className="info-nav-tab active">House Record</Link>
          <Link href="/archive" className="info-nav-tab">Archive Room</Link>
        </nav>

        {/* Title */}
        <div className="info-editorial-header">
          <h1 className="info-main-title">HOUSE RECORD</h1>
          <p className="info-main-subtitle">
            Manage your verified registry information and contact preferences for receiving collections notices.
          </p>
        </div>

        {/* Form */}
        <div className="info-content-panel">
          <form className="info-form" onSubmit={handleSave}>
            <div className="info-form-grid">
              <div className="info-form-group">
                <label className="info-form-label">First Name</label>
                <input
                  className="info-form-input"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setEditing(true); }}
                />
              </div>

              <div className="info-form-group">
                <label className="info-form-label">Last Name</label>
                <input
                  className="info-form-input"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setEditing(true); }}
                />
              </div>
            </div>

            <div className="info-form-grid">
              <div className="info-form-group">
                <label className="info-form-label">Email Address (Registry Primary)</label>
                <input className="info-form-input info-form-input--disabled" value={user.email} disabled />
              </div>

              <div className="info-form-group">
                <label className="info-form-label">Phone Connection</label>
                <input
                  className="info-form-input"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setEditing(true); }}
                  placeholder="+34 600000000"
                />
              </div>
            </div>

            <div className="info-checkbox-wrap">
              <label className="info-checkbox-label">
                <input
                  type="checkbox"
                  className="info-checkbox-input"
                  checked={newsletter}
                  onChange={(e) => { setNewsletter(e.target.checked); setEditing(true); }}
                />
                <span className="info-checkbox-text">
                  Subscribe to receive seasonal dispatches, product releases and exclusive collection notices from the House.
                </span>
              </label>
            </div>

            {saved && (
              <p className="info-success-msg">Maison profile record updated successfully.</p>
            )}

            <button type="submit" className="info-submit-btn" disabled={!editing}>
              UPDATE COLLECTOR RECORD
            </button>
          </form>
        </div>
      </div>

      <style>{`
        /* Light Theme overrides */
        html, body {
          background: #ffffff !important;
        }

        .info-space-wrap {
          max-width: 1000px;
          margin: 0 auto;
          padding: 140px 24px 100px;
          font-family: var(--font-primary), sans-serif;
          color: rgba(0, 0, 0, 0.85);
          box-sizing: border-box;
        }

        /* ══ COLLECTOR SUMMARY HEADER ══ */
        .info-client-summary {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding: 18px 0;
          margin-bottom: 56px;
          font-size: 8px;
          letter-spacing: 0.25em;
          color: rgba(0, 0, 0, 0.45);
        }
        .info-summary-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .info-summary-item:last-child {
          align-items: flex-end;
        }
        .info-summary-center {
          align-items: center;
          color: rgba(0, 0, 0, 0.75);
        }
        .info-summary-label {
          font-weight: 300;
          color: rgba(0, 0, 0, 0.3);
        }
        .info-summary-val {
          font-weight: 400;
        }

        /* ══ NAVIGATION TABS ══ */
        .info-nav-tabs {
          display: flex;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          margin-bottom: 72px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .info-nav-tabs::-webkit-scrollbar {
          display: none;
        }
        .info-nav-tab {
          flex-shrink: 0;
          padding: 14px 0;
          margin-right: 44px;
          font-size: 8.5px;
          font-weight: 300;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.35);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          margin-bottom: -1px;
          transition: color 0.4s, border-color 0.4s;
        }
        .info-nav-tab:hover {
          color: rgba(0, 0, 0, 0.7);
        }
        .info-nav-tab.active {
          color: #000000;
          border-bottom-color: rgba(0, 0, 0, 0.4);
        }

        /* ══ WELCOME HEADER ══ */
        .info-editorial-header {
          margin-bottom: 64px;
          max-width: 720px;
        }
        .info-main-title {
          font-family: var(--font-brand), serif;
          font-size: clamp(24px, 4.5vw, 38px);
          font-weight: 300;
          letter-spacing: 0.15em;
          color: rgba(0, 0, 0, 0.85);
          margin: 0 0 20px;
        }
        .info-main-subtitle {
          font-size: 11px;
          font-weight: 300;
          line-height: 2.1;
          letter-spacing: 0.06em;
          color: rgba(0, 0, 0, 0.45);
          margin: 0;
        }

        /* ══ FORM LAYOUT ══ */
        .info-content-panel {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.04);
          padding: 44px;
        }
        .info-form {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }
        .info-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 36px;
        }
        .info-form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .info-form-label {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.35);
        }
        .info-form-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.12);
          color: rgba(0, 0, 0, 0.85);
          font-family: inherit;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.12em;
          padding: 12px 0;
          outline: none;
          border-radius: 0;
          transition: border-color 0.4s;
        }
        .info-form-input:focus {
          border-color: #000000;
        }
        .info-form-input--disabled {
          border-bottom-color: rgba(0, 0, 0, 0.04);
          color: rgba(0, 0, 0, 0.4);
          cursor: not-allowed;
        }

        .info-checkbox-wrap {
          display: flex;
          align-items: center;
          margin-top: 12px;
        }
        .info-checkbox-label {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          cursor: pointer;
        }
        .info-checkbox-input {
          accent-color: #000000;
          width: 14px;
          height: 14px;
          border-radius: 0 !important;
          margin-top: 2px;
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.2);
        }
        .info-checkbox-text {
          font-size: 10px;
          font-weight: 300;
          line-height: 1.8;
          letter-spacing: 0.04em;
          color: rgba(0, 0, 0, 0.45);
        }

        .info-success-msg {
          font-size: 10px;
          letter-spacing: 0.08em;
          color: #555555;
          margin: 0;
        }

        .info-submit-btn {
          background: #000000;
          color: #ffffff;
          font-family: inherit;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.35em;
          border: none;
          padding: 18px;
          cursor: pointer;
          transition: opacity 0.3s;
          border-radius: 0;
          align-self: flex-start;
          min-width: 240px;
        }
        .info-submit-btn:disabled {
          background: rgba(0, 0, 0, 0.05);
          color: rgba(0, 0, 0, 0.35);
          cursor: not-allowed;
        }
        .info-submit-btn:not(:disabled):hover {
          opacity: 0.85;
        }

        @media (max-width: 767px) {
          .info-space-wrap {
            padding: 100px 16px 80px;
          }
          .info-client-summary {
            grid-template-columns: 1fr;
            gap: 12px;
            text-align: center;
            margin-bottom: 48px;
          }
          .info-summary-item:last-child {
            align-items: center;
          }
          .info-nav-tabs {
            margin-bottom: 48px;
          }
          .info-nav-tab {
            margin-right: 28px;
          }
          .info-editorial-header {
            margin-bottom: 40px;
          }
          .info-content-panel {
            padding: 24px;
          }
          .info-form-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .info-submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
