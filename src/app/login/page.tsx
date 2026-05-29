"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Step = 'email' | 'login' | 'register';

export default function LoginPage() {
  const { login, register, loginWithGoogle, emailExists, user } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div className="auth-wrap">
        <div className="auth-panel-right">
          <p style={{ textAlign: 'center', paddingTop: 80, color: '#fff' }}>Redirecting to the Residence…</p>
        </div>
      </div>
    );
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    const exists = await emailExists(email);
    setLoading(false);
    if (exists) {
      setStep('login');
    } else {
      setStep('register');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const err = await login(email, password);
    if (err) { setError(err); setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const err = await register(email, password, firstName, lastName);
    if (err) { setError(err); setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const err = await loginWithGoogle();
      console.log('[Google auth] result:', err ?? 'success');
      if (err) { setError(err); setLoading(false); }
    } catch (e: any) {
      console.error('[Google auth] unexpected error:', e);
      setError(e?.message ?? 'Unexpected error');
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      {/* LEFT: ATMOSPHERE */}
      <div className="auth-panel-left">
        <div className="auth-bg-img" />
        <div className="auth-overlay" />
      </div>

      {/* RIGHT: INTERACTION */}
      <div className="auth-panel-right">
        <div className="auth-container">
          {step === 'email' && (
            <>
              <h1 className="auth-title">Enter The House</h1>
              <p className="auth-subtext">Continue through the House.</p>

              <form className="auth-form" onSubmit={handleEmailSubmit}>
                <div className="auth-input-wrap">
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="auth-btn" disabled={loading}>
                  Continue
                </button>
              </form>

              <div className="auth-divider"><span>or</span></div>

              <button type="button" className="auth-btn-social" onClick={handleGoogle} disabled={loading}>
                <svg className="auth-social-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {step === 'login' && (
            <>
              <h1 className="auth-title">Enter The House</h1>
              <p className="auth-step-info">{email}</p>
              <button className="auth-back-link" onClick={() => { setStep('email'); setError(''); }}>Change email</button>

              <form className="auth-form" onSubmit={handleLogin}>
                <div className="auth-input-wrap">
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Entering…' : 'Enter'}
                </button>
              </form>
            </>
          )}

          {step === 'register' && (
            <>
              <h1 className="auth-title">Join The House</h1>
              <p className="auth-subtext">Establish your place within the House.</p>
              <p className="auth-step-info">{email}</p>
              <button className="auth-back-link" onClick={() => { setStep('email'); setError(''); }}>Change email</button>

              <form className="auth-form" onSubmit={handleRegister}>
                <div className="auth-input-wrap">
                  <input
                    type="text"
                    placeholder="First name"
                    required
                    className="auth-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="auth-input-wrap">
                  <input
                    type="text"
                    placeholder="Last name"
                    required
                    className="auth-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="auth-input-wrap">
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    minLength={6}
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Joining…' : 'Join'}
                </button>
              </form>
            </>
          )}

          <p className="auth-privacy">
            We process your personal data to create your House Record. Read in our{' '}
            <a href="#">Privacy policy</a> how we process this data.
          </p>

        </div>
      </div>

      <style>{`
        /* Hide navbar/footer contextually or let it blend */
        html, body {
          background: #0c0c0c !important;
        }

        .auth-wrap {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          background: #0c0c0c;
          font-family: var(--font-primary);
        }

        /* ── LEFT PANEL ── */
        .auth-panel-left {
          flex: 0 0 60%;
          position: relative;
          display: none;
        }

        .auth-bg-img {
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?q=80&w=2000&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: grayscale(0.2) contrast(1.1);
        }

        .auth-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(12,12,12,0.1) 0%, rgba(12,12,12,0.6) 100%);
        }

        /* ── RIGHT PANEL ── */
        .auth-panel-right {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 80px 40px;
          background: #0c0c0c;
        }

        .auth-container {
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
        }

        .auth-title {
          font-family: var(--font-brand);
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 300;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.7);
          margin: 0 0 12px;
        }

        .auth-subtext {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.3);
          margin: 0 0 48px;
        }

        /* ── FORM ── */
        .auth-form {
          display: flex;
          flex-direction: column;
        }

        .auth-input-wrap {
          margin-bottom: 24px;
        }

        .auth-input {
          width: 100%;
          padding: 16px 0;
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.8);
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          border-radius: 0;
          outline: none;
          transition: border-color 0.4s;
        }

        .auth-input:focus {
          border-bottom-color: rgba(255,255,255,0.4);
        }

        .auth-input::placeholder {
          color: rgba(255,255,255,0.15);
          letter-spacing: 0.15em;
        }

        .auth-error {
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: rgba(200, 50, 50, 0.8);
          margin: -12px 0 24px;
        }

        .auth-btn {
          width: 100%;
          padding: 16px;
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #0c0c0c;
          background: rgba(255,255,255,0.85);
          border: none;
          cursor: pointer;
          transition: background 0.4s;
          margin-top: 8px;
        }

        .auth-btn:hover:not(:disabled) {
          background: rgba(255,255,255,1);
        }

        .auth-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ── EXTRAS ── */
        .auth-divider {
          text-align: center;
          margin: 40px 0;
          position: relative;
        }

        .auth-divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .auth-divider span {
          background: #0c0c0c;
          padding: 0 16px;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          position: relative;
        }

        .auth-btn-social {
          width: 100%;
          padding: 14px 16px;
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.5);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          transition: border-color 0.4s, color 0.4s;
        }

        .auth-btn-social:hover:not(:disabled) {
          border-color: rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.8);
        }

        .auth-btn-social:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .auth-step-info {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.4);
          margin: 0 0 12px;
        }

        .auth-back-link {
          background: none;
          border: none;
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          cursor: pointer;
          padding: 0;
          margin-bottom: 48px;
          display: inline-block;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-align: left;
          transition: color 0.4s;
        }

        .auth-back-link:hover {
          color: rgba(255,255,255,0.6);
        }

        .auth-privacy {
          margin-top: 60px;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.2);
          line-height: 2;
        }

        .auth-privacy a {
          color: rgba(255,255,255,0.4);
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.4s;
        }

        .auth-privacy a:hover {
          color: rgba(255,255,255,0.7);
        }

        @media (min-width: 900px) {
          .auth-panel-left { display: block; }
        }

        @media (max-width: 899px) {
          .auth-panel-right { padding: 100px 24px; }
          .auth-title { font-size: 24px; margin-bottom: 8px; }
        }
      `}</style>
    </div>
  );
}
