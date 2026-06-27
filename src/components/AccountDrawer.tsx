"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import "./AccountDrawer.css";

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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

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
    </>
  );
}
