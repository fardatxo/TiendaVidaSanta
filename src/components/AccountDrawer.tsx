"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";

type Step = 'select' | 'login' | 'register' | 'tracking';

export default function AccountDrawer() {
  const { login, register, loginWithGoogle, logout, user } = useAuth();
  const { isAccountOpen, closeAccount, openCart, openSearch } = useUI();
  const { items: wishlistItems } = useWishlist();
  const router = useRouter();

  const [step, setStep] = useState<Step>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Tracking states
  const [trackingOrder, setTrackingOrder] = useState("");
  const [trackingEmail, setTrackingEmail] = useState("");
  const [trackingResult, setTrackingResult] = useState<'idle' | 'loading' | 'not_found'>('idle');

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isAccountOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAccountOpen]);

  // Reset steps on drawer close/open
  useEffect(() => {
    if (!isAccountOpen) {
      const t = setTimeout(() => {
        setStep('select');
        setError('');
        setTrackingResult('idle');
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isAccountOpen]);

  const handleBackToSelect = () => {
    setStep('select');
    setError('');
    setTrackingResult('idle');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    const err = await login(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      closeAccount();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    const err = await register(email, password, firstName, lastName);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      closeAccount();
    }
  };

  const handleGoogleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const err = await loginWithGoogle();
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        closeAccount();
      }
    } catch (e: any) {
      setError(e?.message ?? 'Error inesperado al conectar con Google.');
      setLoading(false);
    }
  };

  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingOrder.trim() || !trackingEmail.trim()) return;
    setTrackingResult('loading');
    setTimeout(() => {
      setTrackingResult('not_found');
    }, 1200);
  };

  const handleLogout = async () => {
    await logout();
    closeAccount();
  };

  const handleNavigation = (href: string) => {
    closeAccount();
    router.push(href);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`ad-backdrop ${isAccountOpen ? "open" : ""}`}
        onClick={closeAccount}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`ad-drawer ${isAccountOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Acceso a la cuenta"
      >
        {/* HEADER */}
        <div className="ad-header">
          <button className="ad-close-btn" onClick={closeAccount}>
            <X size={14} strokeWidth={1.5} />
            <span>cerrar</span>
          </button>

          <div className="ad-header-icons">
            {/* Account (Active state link/indicator) */}
            <span className="ad-icon-btn active" aria-label="Cuenta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
          </div>
        </div>

        {/* BODY */}
        <div className="ad-body">
          {/* USER LOGGED IN: SHOW RESIDENCE DASHBOARD */}
          {user ? (
            <div className="ad-welcome-view">
              <div className="ad-welcome-block">
                <h1 className="ad-welcome-title">Bienvenido a TONET</h1>
                <p className="ad-welcome-sub">
                  {user.firstName} {user.lastName} — {user.email}
                </p>
              </div>

              <div className="ad-options-list">
                {/* Residence Overview */}
                <div className="ad-option-row" onClick={() => handleNavigation("/account")}>
                  <div className="ad-radio-circle">
                    <span className="ad-radio-dot" />
                  </div>
                  <div className="ad-option-content">
                    <h3 className="ad-option-title">The Residence</h3>
                    <p className="ad-option-desc">Ver tu panel general de la residencia.</p>
                  </div>
                </div>

                {/* Acquisitions */}
                <div className="ad-option-row" onClick={() => handleNavigation("/account/orders")}>
                  <div className="ad-radio-circle">
                    <span className="ad-radio-dot" />
                  </div>
                  <div className="ad-option-content">
                    <h3 className="ad-option-title">Mis adquisiciones</h3>
                    <p className="ad-option-desc">Historial de tus compras y pedidos realizados.</p>
                  </div>
                </div>

                {/* House Record */}
                <div className="ad-option-row" onClick={() => handleNavigation("/account/information")}>
                  <div className="ad-radio-circle">
                    <span className="ad-radio-dot" />
                  </div>
                  <div className="ad-option-content">
                    <h3 className="ad-option-title">House Record</h3>
                    <p className="ad-option-desc">Gestiona tus datos de facturación y perfil.</p>
                  </div>
                </div>

                {/* Wishlist */}
                <div className="ad-option-row" onClick={() => handleNavigation("/wishlist")}>
                  <div className="ad-radio-circle">
                    <span className="ad-radio-dot" />
                  </div>
                  <div className="ad-option-content">
                    <h3 className="ad-option-title">Garments Archivados</h3>
                    <p className="ad-option-desc">Consulta las prendas guardadas en tu archivo.</p>
                  </div>
                </div>

                {/* Logout */}
                <div className="ad-option-row" onClick={handleLogout}>
                  <div className="ad-radio-circle">
                    <span className="ad-radio-dot" />
                  </div>
                  <div className="ad-option-content">
                    <h3 className="ad-option-title">Salir de la casa</h3>
                    <p className="ad-option-desc">Cerrar sesión de forma segura.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* USER LOGGED OUT: SHOW ACCESS FLOWS */
            <div className="ad-welcome-view">
              {/* STEP 1: PATH SELECTION */}
              {step === 'select' && (
                <>
                  <div className="ad-welcome-block">
                    <h1 className="ad-welcome-title">Bienvenido a TONET</h1>
                    <p className="ad-welcome-sub">
                      Inicia sesión, crea una cuenta o consulta el estado de tus pedidos.
                    </p>
                  </div>

                  <div className="ad-options-list">
                    {/* Option 1: Iniciar sesión */}
                    <div className="ad-option-row" onClick={() => setStep('login')}>
                      <div className="ad-radio-circle">
                        <span className="ad-radio-dot" />
                      </div>
                      <div className="ad-option-content">
                        <h3 className="ad-option-title">Iniciar sesión</h3>
                        <p className="ad-option-desc">Accede a tu cuenta.</p>
                      </div>
                    </div>

                    {/* Option 2: Crear una cuenta */}
                    <div className="ad-option-row" onClick={() => setStep('register')}>
                      <div className="ad-radio-circle">
                        <span className="ad-radio-dot" />
                      </div>
                      <div className="ad-option-content">
                        <h3 className="ad-option-title">Crear una cuenta</h3>
                        <p className="ad-option-desc">Guarda tus pedidos, favoritos y datos de compra.</p>
                      </div>
                    </div>

                    {/* Option 3: Seguimiento de pedido */}
                    <div className="ad-option-row" onClick={() => setStep('tracking')}>
                      <div className="ad-radio-circle">
                        <span className="ad-radio-dot" />
                      </div>
                      <div className="ad-option-content">
                        <h3 className="ad-option-title">Seguimiento de mi pedido</h3>
                        <p className="ad-option-desc">Consulta el estado y las últimas actualizaciones de tu pedido.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2: LOGIN FORM */}
              {step === 'login' && (
                <div className="ad-flow-view">
                  <button className="ad-flow-back" onClick={handleBackToSelect}>
                    <ArrowLeft size={12} strokeWidth={1.5} />
                    <span>volver</span>
                  </button>

                  <div className="ad-flow-container">
                    <h2 className="ad-flow-title">Iniciar sesión</h2>
                    <p className="ad-flow-sub">Introduce tus datos para acceder a tu cuenta.</p>

                    <form onSubmit={handleLoginSubmit} className="ad-form-layout">
                      <div className="ad-input-group">
                        <input
                          type="email"
                          required
                          placeholder="correo electrónico"
                          className="ad-flow-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="ad-input-group">
                        <input
                          type="password"
                          required
                          placeholder="contraseña"
                          className="ad-flow-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      {error && <p className="ad-flow-error">{error}</p>}

                      <button type="submit" className="ad-flow-btn" disabled={loading}>
                        {loading ? "iniciando sesión…" : "acceder"}
                      </button>
                    </form>

                    <div className="ad-social-divider">
                      <span>o</span>
                    </div>

                    <button type="button" className="ad-social-btn" onClick={handleGoogleSubmit} disabled={loading}>
                      <svg className="ad-social-icon" viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#000"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#000"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#000"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#000"/>
                      </svg>
                      <span>continuar con google</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: REGISTER FORM */}
              {step === 'register' && (
                <div className="ad-flow-view">
                  <button className="ad-flow-back" onClick={handleBackToSelect}>
                    <ArrowLeft size={12} strokeWidth={1.5} />
                    <span>volver</span>
                  </button>

                  <div className="ad-flow-container">
                    <h2 className="ad-flow-title">Crear una cuenta</h2>
                    <p className="ad-flow-sub">Regístrate para guardar tus pedidos y gestionar tus datos.</p>

                    <form onSubmit={handleRegisterSubmit} className="ad-form-layout">
                      <div className="ad-input-group">
                        <input
                          type="text"
                          required
                          placeholder="nombre"
                          className="ad-flow-input"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="ad-input-group">
                        <input
                          type="text"
                          required
                          placeholder="apellidos"
                          className="ad-flow-input"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                      <div className="ad-input-group">
                        <input
                          type="email"
                          required
                          placeholder="correo electrónico"
                          className="ad-flow-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="ad-input-group">
                        <input
                          type="password"
                          required
                          placeholder="contraseña (mínimo 6 caracteres)"
                          className="ad-flow-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      {error && <p className="ad-flow-error">{error}</p>}

                      <button type="submit" className="ad-flow-btn" disabled={loading}>
                        {loading ? "creando cuenta…" : "crear cuenta"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* STEP 4: ORDER TRACKING FORM */}
              {step === 'tracking' && (
                <div className="ad-flow-view">
                  <button className="ad-flow-back" onClick={handleBackToSelect}>
                    <ArrowLeft size={12} strokeWidth={1.5} />
                    <span>volver</span>
                  </button>

                  <div className="ad-flow-container">
                    <h2 className="ad-flow-title">Seguimiento de pedido</h2>
                    <p className="ad-flow-sub">Introduce los datos de tu compra para ver el estado de tu envío.</p>

                    <form onSubmit={handleTrackingSubmit} className="ad-form-layout">
                      <div className="ad-input-group">
                        <input
                          type="text"
                          required
                          placeholder="número de pedido (ej: #1001)"
                          className="ad-flow-input"
                          value={trackingOrder}
                          onChange={(e) => setTrackingOrder(e.target.value)}
                        />
                      </div>
                      <div className="ad-input-group">
                        <input
                          type="email"
                          required
                          placeholder="correo electrónico de facturación"
                          className="ad-flow-input"
                          value={trackingEmail}
                          onChange={(e) => setTrackingEmail(e.target.value)}
                        />
                      </div>

                      {trackingResult === 'not_found' && (
                        <p className="ad-flow-error">
                          No se ha encontrado ningún pedido con la información facilitada. Por favor, compruebe los datos e inténtelo de nuevo.
                        </p>
                      )}

                      <button type="submit" className="ad-flow-btn" disabled={trackingResult === 'loading'}>
                        {trackingResult === 'loading' ? "buscando pedido…" : "consultar estado"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Backdrop overlay */
        .ad-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1);
          z-index: 1000;
        }
        .ad-backdrop.open { opacity: 1; pointer-events: auto; }

        /* Drawer container */
        .ad-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: min(100vw, 480px);
          background: #ffffff !important;
          z-index: 1001;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
          font-family: var(--font-primary), sans-serif;
          color: #000000 !important;
          overflow: hidden;
          box-shadow: -10px 0 40px rgba(0,0,0,0.08);
        }
        .ad-drawer.open { transform: translateX(0); }

        /* Force all text inside drawer to be black — overrides global body color: #fff */
        .ad-drawer h1,
        .ad-drawer h2,
        .ad-drawer h3,
        .ad-drawer p,
        .ad-drawer span,
        .ad-drawer div,
        .ad-drawer label {
          color: inherit !important;
        }

        /* ══ HEADER ══ */
        .ad-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 72px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          flex-shrink: 0;
        }

        .ad-close-btn {
          background: none !important; border: none !important;
          font-family: inherit;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.15em;
          text-transform: lowercase;
          color: #000000 !important;
          cursor: pointer;
          display: flex; align-items: center;
          gap: 8px;
          padding: 0;
          transition: opacity 0.3s;
        }
        .ad-close-btn:hover { opacity: 0.5; }

        .ad-header-icons {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .ad-icon-btn {
          background: none !important; border: none !important;
          color: #000000 !important;
          cursor: pointer;
          padding: 4px;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.3s;
          text-decoration: none;
        }
        .ad-icon-btn:hover { opacity: 0.5; }
        .ad-icon-btn.active {
          opacity: 1;
          pointer-events: none;
          border-bottom: 1px solid #000000;
          padding-bottom: 2px;
          margin-bottom: -3px;
        }

        .ad-badge-wrap { position: relative; }
        .ad-dot-badge {
          position: absolute; top: 1px; right: 1px;
          width: 4px; height: 4px;
          background-color: #000000;
          border-radius: 50%;
        }

        /* ══ BODY ══ */
        .ad-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          scrollbar-width: none;
          display: flex;
          flex-direction: column;
          color: #000000;
        }
        .ad-body::-webkit-scrollbar { display: none; }

        /* Welcome view wrapper */
        .ad-welcome-view {
          display: flex;
          flex-direction: column;
          flex: 1;
          color: #000000;
        }

        /* ══ WELCOME BLOCK ══ */
        .ad-welcome-block {
          padding: 64px 40px 48px;
          text-align: center;
        }

        .ad-welcome-title {
          font-family: var(--font-brand), serif;
          font-size: clamp(20px, 2.5vw, 26px);
          font-weight: 300;
          letter-spacing: 0.04em;
          color: #000000 !important;
          margin: 0 0 16px;
        }

        .ad-welcome-sub {
          font-size: 11.5px;
          font-weight: 300;
          color: rgba(0, 0, 0, 0.45);
          letter-spacing: 0.05em;
          line-height: 1.6;
          max-width: 320px;
          margin: 0 auto;
        }

        /* ══ OPTIONS LIST ══ */
        .ad-options-list {
          padding: 0 40px;
          display: flex;
          flex-direction: column;
        }

        .ad-option-row {
          display: flex;
          align-items: center;
          padding: 28px 0;
          cursor: pointer;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          gap: 20px;
          transition: background-color 0.3s ease;
        }
        .ad-option-row:first-child {
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }
        .ad-option-row:hover {
          background-color: #fafafa;
        }

        .ad-radio-circle {
          width: 16px; height: 16px;
          border: 1px solid rgba(0, 0, 0, 0.25);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.3s ease;
        }
        .ad-option-row:hover .ad-radio-circle {
          border-color: #000000;
        }

        .ad-radio-dot {
          width: 6px; height: 6px;
          background: transparent;
          border-radius: 50%;
          transition: background-color 0.3s ease;
        }
        .ad-option-row:hover .ad-radio-dot {
          background: rgba(0, 0, 0, 0.25);
        }

        .ad-option-content { flex: 1; }

        .ad-option-title {
          font-size: 11.5px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #000000 !important;
          margin: 0 0 4px;
        }

        .ad-option-desc {
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: rgba(0, 0, 0, 0.4);
          margin: 0;
        }

        /* ══ SUBFLOW FORMS ══ */
        .ad-flow-view {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .ad-flow-back {
          background: none !important; border: none !important;
          font-family: inherit;
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: lowercase;
          color: rgba(0, 0, 0, 0.4) !important;
          cursor: pointer;
          display: flex; align-items: center;
          gap: 8px;
          padding: 0;
          margin: 28px 40px 0;
          transition: color 0.3s;
          align-self: flex-start;
        }
        .ad-flow-back:hover { color: #000000 !important; }

        .ad-flow-container { padding: 40px; }

        .ad-flow-title {
          font-family: var(--font-brand), serif;
          font-size: 24px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: #000000;
          margin: 0 0 12px;
        }

        .ad-flow-sub {
          font-size: 11.5px;
          font-weight: 300;
          color: rgba(0, 0, 0, 0.45);
          letter-spacing: 0.05em;
          line-height: 1.6;
          margin: 0 0 40px;
        }

        .ad-form-layout { display: flex; flex-direction: column; }
        .ad-input-group { margin-bottom: 24px; }

        .ad-flow-input {
          width: 100%;
          padding: 16px 0;
          font-family: inherit;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #000000;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 0;
          outline: none;
          transition: border-bottom-color 0.3s;
        }
        .ad-flow-input:focus { border-bottom-color: #000000; }
        .ad-flow-input::placeholder {
          color: rgba(0, 0, 0, 0.25);
          letter-spacing: 0.12em;
        }

        .ad-flow-error {
          font-size: 10.5px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: #cc0000;
          margin: -12px 0 24px;
          line-height: 1.5;
        }

        .ad-flow-btn {
          width: 100%;
          padding: 18px;
          font-family: inherit;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #ffffff !important;
          background: #000000 !important;
          border: none !important;
          cursor: pointer;
          transition: opacity 0.3s;
          margin-top: 12px;
        }
        .ad-flow-btn:hover:not(:disabled) { opacity: 0.85; }
        .ad-flow-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ══ SOCIALS ══ */
        .ad-social-divider {
          text-align: center;
          margin: 32px 0;
          position: relative;
        }
        .ad-social-divider::before {
          content: "";
          position: absolute;
          top: 50%; left: 0; right: 0;
          height: 1px;
          background: rgba(0, 0, 0, 0.06);
        }
        .ad-social-divider span {
          background: #ffffff;
          padding: 0 16px;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .ad-social-btn {
          width: 100%;
          padding: 14px 16px;
          font-family: inherit;
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.12em;
          text-transform: lowercase;
          color: rgba(0, 0, 0, 0.7) !important;
          background: transparent !important;
          border: 1px solid rgba(0, 0, 0, 0.15) !important;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 12px;
          transition: border-color 0.3s, color 0.3s;
        }
        .ad-social-btn:hover {
          border-color: #000000 !important;
          color: #000000 !important;
        }

        /* ══ RESPONSIVE OVERRIDES ══ */
        @media (max-width: 767px) {
          .ad-drawer {
            width: 100vw;
            min-width: 100vw;
          }
          .ad-backdrop {
            display: none;
          }
          .ad-header { padding: 0 24px; }
          .ad-welcome-block { padding: 48px 24px 32px; }
          .ad-options-list { padding: 0 24px; }
          .ad-flow-back { margin-left: 24px; margin-right: 24px; }
          .ad-flow-container { padding: 32px 24px; }
          .ad-flow-btn { font-size: 11px; }
        }
      `}</style>
    </>
  );
}
