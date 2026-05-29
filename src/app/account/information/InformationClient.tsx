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
      <div className="info-wrap">
        <nav className="info-tabs">
          <Link href="/account" className="info-tab">The Residence</Link>
          <Link href="/account/orders" className="info-tab">Acquisitions</Link>
          <Link href="/account/information" className="info-tab info-tab--active">House Record</Link>
          <Link href="/archive" className="info-tab">Archive</Link>
        </nav>

        <h1 className="info-title">House Record</h1>
        <p className="info-desc">Institutional information and contact details maintained within the House.</p>

        <form className="info-form" onSubmit={handleSave}>
          <label className="info-label">First Name</label>
          <input
            className="info-input"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setEditing(true); }}
          />

          <label className="info-label">Last Name</label>
          <input
            className="info-input"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); setEditing(true); }}
          />

          <label className="info-label">Email</label>
          <input className="info-input info-input--disabled" value={user.email} disabled />

          <label className="info-label">Phone</label>
          <input
            className="info-input"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setEditing(true); }}
            placeholder="+34 600000000"
          />

          <label className="info-checkbox">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => { setNewsletter(e.target.checked); setEditing(true); }}
            />
            <span>Receive dispatches and collection notices from the House.</span>
          </label>

          {saved && <p className="info-saved">Record updated successfully.</p>}

          <button type="submit" className="info-btn" disabled={!editing}>
            Update Record
          </button>
        </form>
      </div>

      <style>{`
        html, body { background: #0c0c0c !important; }

        .info-wrap {
          max-width: 960px;
          margin: 0 auto;
          padding: 120px 24px 80px;
          font-family: var(--font-primary);
          color: rgba(255,255,255,0.85);
        }

        .info-tabs {
          display: flex;
          gap: 32px;
          margin-bottom: 60px;
          flex-wrap: wrap;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 1px;
        }
        .info-tab {
          font-size: 8px;
          font-weight: 300;
          text-decoration: none;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.4em;
          text-transform: uppercase;
          padding-bottom: 12px;
          border-bottom: 1px solid transparent;
          margin-bottom: -1px;
          transition: color 0.4s, border-color 0.4s;
        }
        .info-tab:hover { color: rgba(255,255,255,0.6); }
        .info-tab--active {
          color: rgba(255,255,255,0.8);
          border-bottom-color: rgba(255,255,255,0.4);
        }

        .info-title {
          font-family: var(--font-brand);
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 300;
          margin: 0 0 16px;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.7);
        }
        .info-desc {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
          margin: 0 0 48px;
        }

        .info-form {
          display: flex;
          flex-direction: column;
          max-width: 420px;
        }
        .info-label {
          font-size: 8px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }
        .info-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding: 12px 0;
          font-size: 11px;
          font-family: var(--font-primary);
          font-weight: 300;
          color: rgba(255,255,255,0.8);
          margin-bottom: 32px;
          outline: none;
          letter-spacing: 0.05em;
          border-radius: 0;
          transition: border-color 0.4s;
        }
        .info-input:focus { border-bottom-color: rgba(255,255,255,0.4); }
        .info-input--disabled {
          color: rgba(255,255,255,0.2);
          border-bottom-color: rgba(255,255,255,0.05);
        }

        .info-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin: 16px 0 32px;
          cursor: pointer;
        }
        .info-checkbox input {
          margin-top: 3px;
          accent-color: #ffffff;
        }
        .info-checkbox span {
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.4);
          line-height: 1.6;
        }

        .info-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 14px;
          font-size: 9px;
          font-family: var(--font-primary);
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: border-color 0.4s, color 0.4s;
          margin-top: 12px;
        }
        .info-btn:hover:not(:disabled) {
          border-color: rgba(255,255,255,0.4);
          color: rgba(255,255,255,0.9);
        }
        .info-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .info-saved {
          font-size: 10px;
          font-weight: 300;
          color: rgba(255,255,255,0.5);
          margin-bottom: 16px;
        }

        @media (max-width: 767px) {
          .info-wrap { padding: 100px 16px 80px; }
          .info-tabs { gap: 20px; margin-bottom: 40px; }
        }
      `}</style>
    </>
  );
}
