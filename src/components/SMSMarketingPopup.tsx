"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function SMSMarketingPopup() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const isSubscribed = localStorage.getItem("sms-subscribed") === "true";
    const isDismissed = sessionStorage.getItem("sms-dismissed") === "true";

    if (!isSubscribed && !isDismissed) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("sms-dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 9) {
      setError("INTRODUCE UN NÚMERO DE TELÉFONO VÁLIDO");
      return;
    }

    try {
      await fetch("/api/sms-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      }).catch(() => {});

      localStorage.setItem("sms-subscribed", "true");
      setSubscribed(true);
      setError("");
      window.dispatchEvent(new Event("sms-subscribed-event"));

      setTimeout(() => {
        setOpen(false);
      }, 4000);
    } catch (err) {
      setError("HA OCURRIDO UN ERROR. INTÉNTALO DE NUEVO.");
    }
  };

  if (!open) return null;

  return (
    <div className="sms-popup-backdrop">
      <div className="sms-popup-container" role="dialog" aria-modal="true">
        <button className="sms-popup-close-btn" onClick={handleClose} aria-label="Cerrar">
          <X size={18} strokeWidth={1} />
        </button>

        {!subscribed ? (
          <form className="sms-popup-form" onSubmit={handleSubmit}>
            <span className="sms-popup-tag">ACCESO EXCLUSIVO</span>
            
            <h2 className="sms-popup-title">
              10% <span>de</span> descuento
            </h2>
            <span className="sms-popup-subtitle">EN TU PRIMERA COMPRA</span>

            <div className="sms-popup-divider"></div>

            <p className="sms-popup-desc">
              ÚNETE AL CLUB SMS DE VIDA SANTA AL CREAR TU CUENTA Y OBTÉN UN DESCUENTO INMEDIATO EN TU PRIMERA ORDEN.
            </p>

            <div className="sms-input-wrap">
              <input
                type="tel"
                placeholder="TELÉFONO (EJ. +34 600 000 000)"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError("");
                }}
                className="sms-input"
                required
              />
              {error && <span className="sms-error-text">{error}</span>}
            </div>

            <button type="submit" className="sms-submit-btn">
              OBTENER DESCUENTO
            </button>

            <button type="button" className="sms-popup-decline-link" onClick={handleClose}>
              SEGUIR SIN DESCUENTO
            </button>
          </form>
        ) : (
          <div className="sms-popup-success">
            <span className="sms-popup-tag">REGISTRO COMPLETADO</span>
            <h2 className="sms-popup-title" style={{ fontSize: '20px' }}>
              CÓDIGO DE DESCUENTO:
            </h2>
            <div className="sms-coupon-box">
              <span className="sms-coupon-code">VIDASANTA10</span>
            </div>
            <p className="sms-popup-success-desc">
              APLICA ESTE CÓDIGO AL FINALIZAR TU COMPRA. TE HEMOS ENVIADO UN MENSAJE CON LA CONFIRMACIÓN.
            </p>
            <button type="button" className="sms-submit-btn" onClick={() => setOpen(false)}>
              CONTINUAR
            </button>
          </div>
        )}
      </div>

      <style>{`
        .sms-popup-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
          animation: sms-fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .sms-popup-container {
          position: relative;
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.15);
          width: 100%;
          max-width: 460px;
          padding: 56px 48px;
          box-sizing: border-box;
          text-align: center;
          border-radius: 0 !important; /* Rectangular borders */
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
          transform: translateY(20px);
          animation: sms-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .sms-popup-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          background: none;
          border: none;
          cursor: pointer;
          color: #ffffff;
          opacity: 0.5;
          padding: 4px;
          transition: opacity 0.3s;
        }
        .sms-popup-close-btn:hover {
          opacity: 1;
        }

        .sms-popup-form,
        .sms-popup-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 22px;
          width: 100%;
        }

        .sms-popup-tag {
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
        }

        .sms-popup-title {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: 38px;
          font-weight: 300;
          letter-spacing: 0.02em;
          line-height: 1.1;
          margin: 0;
          color: #ffffff;
          font-style: normal;
        }
        .sms-popup-title span {
          font-style: italic;
          font-weight: 300;
        }

        .sms-popup-subtitle {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.25em;
          color: #ffffff;
          margin-top: -6px;
        }

        .sms-popup-divider {
          width: 40px;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.2);
          margin: 4px 0;
        }

        .sms-popup-desc,
        .sms-popup-success-desc {
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 300;
          line-height: 1.6;
          letter-spacing: 0.08em;
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
        }

        .sms-input-wrap {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        .sms-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.25);
          padding: 14px 0;
          font-family: var(--font-primary), sans-serif;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: #ffffff;
          box-sizing: border-box;
          border-radius: 0 !important; /* Rectangular borders */
          outline: none;
          text-transform: uppercase;
          transition: border-color 0.3s ease;
          text-align: center;
        }
        .sms-input:focus {
          border-bottom-color: #ffffff;
        }
        .sms-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .sms-error-text {
          font-family: var(--font-primary), sans-serif;
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #d93838;
          text-align: center;
        }

        .sms-submit-btn {
          width: 100%;
          background: #ffffff;
          color: #000000;
          border: 1px solid #ffffff;
          padding: 18px;
          font-family: var(--font-primary), sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 0 !important; /* Rectangular borders */
          transition: background-color 0.3s, color 0.3s, border-color 0.3s;
        }
        .sms-submit-btn:hover {
          background-color: transparent;
          color: #ffffff;
          border-color: #ffffff;
        }

        .sms-popup-decline-link {
          background: none;
          border: none;
          font-family: var(--font-primary), sans-serif;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
          transition: color 0.3s;
          padding: 4px;
        }
        .sms-popup-decline-link:hover {
          color: #ffffff;
        }

        /* Success screen coupon box */
        .sms-coupon-box {
          border: 1px dashed rgba(255, 255, 255, 0.3);
          padding: 14px 28px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 0 !important;
          margin: 6px 0;
        }
        .sms-coupon-code {
          font-family: var(--font-primary), sans-serif;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #ffffff;
        }

        @keyframes sms-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes sms-slide-up {
          from { transform: translateY(30px); }
          to { transform: translateY(0); }
        }

        @media (max-width: 767px) {
          .sms-popup-container {
            padding: 48px 32px;
          }
          .sms-popup-title {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
}
