"use client";

import { useUI } from "@/context/UIContext";
import { useCart, CartLine } from "@/context/CartContext";
import { useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { X, Plus, Minus } from "lucide-react";

interface CartItem {
  id: string;
  variantId: string;
  name: string;
  price: number;
  colour: string;
  size: string;
  qty: number;
  image: string;
}

function lineToItem(line: CartLine): CartItem {
  const colourOpt = line.options.find(
    (o) => o.name.toLowerCase() === "color" || o.name.toLowerCase() === "colour"
  );
  const sizeOpt = line.options.find((o) => o.name.toLowerCase() === "size");
  return {
    id: line.id,
    variantId: line.variantId,
    name: line.name,
    price: line.price,
    colour: colourOpt?.value ?? "",
    size: sizeOpt?.value ?? (line.variantTitle || ""),
    qty: line.quantity,
    image: line.image,
  };
}

export default function CartDrawer() {
  const { isCartOpen, closeCart } = useUI();
  const { cart, updateQty, removeFromCart } = useCart();
  const { formatPrice } = useLocale();

  const items: CartItem[] = cart.lines.map(lineToItem);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen]);

  async function changeQty(id: string, delta: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const next = item.qty + delta;
    if (next <= 0) await removeFromCart(id);
    else await updateQty(id, next);
  }

  const totalFormatted = formatPrice(cart.totalAmount, cart.currencyCode ?? 'EUR');

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cd-backdrop ${isCartOpen ? "open" : ""}`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`cd-drawer ${isCartOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="The Selection"
      >
        {/* ── HEADER ── */}
        <div className="cd-header">
          <div className="cd-header-spacer" />
          <span className="cd-title">The Selection</span>
          <button className="cd-close" onClick={closeCart} aria-label="Close">
            <X size={18} strokeWidth={1.4} />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="cd-body">
          {items.length === 0 ? (
            <div className="cd-empty-state">
              <p className="cd-empty-text">The selection is empty</p>
              <button className="cd-continue-btn" onClick={closeCart}>
                Return to the House
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cd-item">
                <div className="cd-item-img">
                  {item.image && <img src={item.image} alt={item.name} draggable={false} />}
                </div>
                <div className="cd-item-info">
                  <span className="cd-item-name">{item.name}</span>
                  <span className="cd-item-variant">
                    {[item.colour, item.size].filter(Boolean).join(' / ').toUpperCase() || 'ONE SIZE'}
                  </span>
                  <div className="cd-qty-row">
                    <button className="cd-qty-btn" onClick={() => changeQty(item.id, -1)} aria-label="Decrease"><Minus size={12} strokeWidth={1.5} /></button>
                    <span className="cd-qty-val">{item.qty}</span>
                    <button className="cd-qty-btn" onClick={() => changeQty(item.id, 1)} aria-label="Increase"><Plus size={12} strokeWidth={1.5} /></button>
                  </div>
                  <span className="cd-item-price">
                    {formatPrice(item.price * item.qty, 'EUR')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── FOOTER ── */}
        {items.length > 0 && (
          <div className="cd-footer">
            <div className="cd-subtotal-row">
              <span className="cd-subtotal-label">Total</span>
              <span className="cd-subtotal-price">{totalFormatted}</span>
            </div>
            <div className="cd-cta-group">
              <button
                className="cd-checkout-btn"
                onClick={() => {
                  if (cart.checkoutUrl) window.location.href = cart.checkoutUrl;
                }}
              >
                Continue to Checkout
              </button>
              <button className="cd-favorites-btn">
                Archive
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* ══ BACKDROP ══ */
        .cd-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1);
          z-index: 1000;
        }
        .cd-backdrop.open { opacity: 1; pointer-events: auto; }

        /* ══ DRAWER ══ */
        .cd-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: min(100vw, 480px);
          background: #0d0d0d;
          border-left: 1px solid rgba(255,255,255,0.05);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.95s cubic-bezier(0.16,1,0.3,1);
          font-family: var(--font-primary);
          color: rgba(255,255,255,0.82);
          overflow: hidden;
        }
        .cd-drawer.open { transform: translateX(0); }

        /* ══ HEADER ══ */
        .cd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }
        .cd-header-spacer { width: 28px; }
        .cd-title {
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.5em;
          padding-right: 0.5em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }
        .cd-close {
          background: none; border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.28);
          padding: 4px;
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          transition: color 0.5s;
        }
        .cd-close:hover { color: rgba(255,255,255,0.75); }
        .cd-close svg { stroke: currentColor; }

        /* ══ BODY ══ */
        .cd-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .cd-body::-webkit-scrollbar { display: none; }

        /* ══ EMPTY STATE ══ */
        .cd-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 0 32px 48px;
          gap: 32px;
        }
        .cd-empty-text {
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          margin: 0;
        }
        .cd-continue-btn {
          width: 100%;
          background: transparent;
          color: rgba(255,255,255,0.45);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 16px;
          font-size: 9px;
          font-family: inherit;
          font-weight: 300;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.5s, color 0.5s;
        }
        .cd-continue-btn:hover { border-color: rgba(255,255,255,0.32); color: rgba(255,255,255,0.75); }

        /* ══ ITEM ══ */
        .cd-item {
          display: flex;
          flex-direction: row;
          padding: 20px 24px;
          gap: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .cd-item-img {
          width: 40%;
          flex-shrink: 0;
          background: #1a1a1a;
          aspect-ratio: 3 / 4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .cd-item-img img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .cd-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 4px 0;
          gap: 8px;
        }
        .cd-item-name {
          font-size: 9px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.32em;
          line-height: 1.5;
          color: rgba(255,255,255,0.72);
        }
        .cd-item-variant {
          font-size: 8px;
          font-weight: 300;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }
        .cd-qty-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }
        .cd-qty-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.28);
          line-height: 1;
          padding: 0;
          width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.4s;
        }
        .cd-qty-btn:hover { color: rgba(255,255,255,0.72); }
        .cd-qty-btn svg { stroke: currentColor; }
        .cd-qty-val {
          font-size: 10px;
          font-weight: 300;
          min-width: 16px;
          text-align: center;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.1em;
        }
        .cd-item-price {
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.32);
          margin-top: auto;
        }

        /* ══ FOOTER ══ */
        .cd-footer {
          flex-shrink: 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 24px 32px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .cd-subtotal-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cd-subtotal-label {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
        }
        .cd-subtotal-price {
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.52);
        }
        .cd-cta-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        .cd-checkout-btn {
          width: 100%;
          border: none;
          padding: 17px 8px;
          font-size: 9px;
          font-family: inherit;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.38em;
          cursor: pointer;
          border-radius: 0;
          background: rgba(255,255,255,0.88);
          color: #0d0d0d;
          transition: background 0.5s;
        }
        .cd-checkout-btn:hover { background: rgba(255,255,255,1); }
        .cd-favorites-btn {
          width: 100%;
          padding: 15px 8px;
          font-size: 9px;
          font-family: inherit;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.38em;
          cursor: pointer;
          border-radius: 0;
          background: transparent;
          color: rgba(255,255,255,0.25);
          border: 1px solid rgba(255,255,255,0.08);
          transition: border-color 0.5s, color 0.5s;
        }
        .cd-favorites-btn:hover { border-color: rgba(255,255,255,0.28); color: rgba(255,255,255,0.6); }

        /* ══ MOBILE ══ */
        @media (max-width: 767px) {
          .cd-drawer { width: 100vw; border-left: none; }
          .cd-header { padding: 22px 24px; }
          .cd-item { padding: 16px 20px; }
          .cd-footer { padding: 20px 24px 28px; }
          .cd-empty-state { padding: 0 24px 48px; }
        }
      `}</style>
    </>
  );
}
