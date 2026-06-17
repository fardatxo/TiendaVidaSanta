"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/context/LocaleContext';
import { Product, ShopifyVariant, RecommendedProduct } from '@/lib/shopify';
import { useTranslatedText } from '@/hooks/useTranslatedText';
import RecommendedCard from '@/components/RecommendedCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';

interface Props {
  product: Product;
  relatedProductsByTag?: Product[];
}

function parseMetadata(desc?: string | null): Record<string, string> {
  if (!desc) return {};
  const regex = /(Item Number|Gender|Fabric Weight|Fabric Thickness|Fabric Stretch|Fabric|Care Instructions|Features|Print Size|Notes):\s*/gi;
  const matches: { key: string; index: number; length: number }[] = [];
  let match;
  while ((match = regex.exec(desc)) !== null) {
    matches.push({
      key: match[1],
      index: match.index,
      length: match[0].length
    });
  }
  
  const result: Record<string, string> = {};
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const start = current.index + current.length;
    const end = next ? next.index : desc.length;
    let keyName = current.key.trim();
    if (keyName.toLowerCase() === 'fabric strench') {
      keyName = 'Fabric Stretch';
    }
    result[keyName] = desc.substring(start, end).trim();
  }
  return result;
}

function colorNameToCSS(name: string): string {
  const n = name.toLowerCase().trim();
  const map: Record<string, string> = {
    black: '#111111', white: '#ffffff', grey: '#888888', gray: '#888888',
    'light gray': '#c8c8c8', 'dark gray': '#444444', 'dark grey': '#444444',
    navy: '#1a2744', blue: '#2a5caa', 'light blue': '#7ab3e0', 'sky blue': '#87ceeb',
    red: '#cc2222', burgundy: '#6e1520', wine: '#722f37', maroon: '#7b0020',
    green: '#2d6a2d', 'olive green': '#6b7c3b', olive: '#6b7c3b', khaki: '#c3b091',
    brown: '#6b3a2a', camel: '#c19a6b', tan: '#d2b48c', beige: '#f5f0e8',
    yellow: '#e8c832', gold: '#cfaa3c', orange: '#e07020', pink: '#e87090',
    purple: '#6a3090', lavender: '#b090d0', cream: '#fffdd0', ivory: '#fffff0',
    sand: '#c2b280', stone: '#928e85', ecru: '#c2b280', off_white: '#f5f0e8',
    'off white': '#f5f0e8', charcoal: '#3c3c3c', slate: '#708090',
    mint: '#98d8c8', teal: '#2a9090', cobalt: '#0047ab',
    'dark brown': '#3b1a0a', 'light brown': '#a0704a',
  };
  if (map[n]) return map[n];
  for (const key of Object.keys(map)) {
    if (n.includes(key) || key.includes(n)) return map[key];
  }
  return '#888888';
}

const RECENTLY_VIEWED_KEY = 'rv_products';
const MAX_RECENTLY_VIEWED = 10;

type RecentProduct = Pick<RecommendedProduct, 'handle' | 'title' | 'imageUrl' | 'price' | 'currencyCode'>;

export default function ProductClient({ product, relatedProductsByTag }: Props) {
  const router = useRouter();
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentProduct[]>([]);
  const [completeOutfit, setCompleteOutfit] = useState<RecommendedProduct[]>([]);

  useEffect(() => {
    import('@/lib/shopify').then(({ getRecommendedProducts }) => {
      getRecommendedProducts(product.handle, 16)
        .then(setRecommended)
        .catch(() => {});
    });
  }, [product.handle]);

  useEffect(() => {
    import('@/lib/shopify').then(({ getRecommendedProducts }) => {
      getRecommendedProducts(product.handle, 8)
        .then(prods => setCompleteOutfit(prods.slice(0, 6)))
        .catch(() => {});
    });
  }, [product.handle]);

  useEffect(() => {
    try {
      const stored: RecentProduct[] = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) ?? '[]');
      const current: RecentProduct = {
        handle: product.handle,
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.price,
        currencyCode: product.currencyCode,
      };
      const filtered = stored.filter(p => p.handle !== product.handle);
      const updated = [current, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      setRecentlyViewed(filtered.slice(0, 8));
    } catch {}
  }, [product.handle]);

  const images = product.images.length > 0 ? product.images : [product.imageUrl].filter(Boolean);
  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant>(
    product.variants[0] ?? { id: '', title: '', availableForSale: true, price: { amount: String(product.price), currencyCode: product.currencyCode }, selectedOptions: [] }
  );
  const [adding, setAdding] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('desc');
  const [availModal, setAvailModal] = useState(false);
  const [availSizes, setAvailSizes] = useState<string[]>([]);
  const [availEmail, setAvailEmail] = useState('');
  const [availPhone, setAvailPhone] = useState('');
  const [availSubmitted, setAvailSubmitted] = useState(false);
  const [availSubmitting, setAvailSubmitting] = useState(false);
  const [ceremonyOpen, setCeremonyOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const { t } = useTranslation();
  const { toggle, has, items } = useWishlist();
  const inWishlist = has(product.handle);

  const getHouseState = (handle: string) => {
    const hash = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    if (hash % 3 === 0) return 'HOUSE_01 — PERMANENCE';
    if (hash % 3 === 1) return 'HOUSE_02 — REPLICA';
    return 'HOUSE_03 — INHERITANCE';
  };

  const getArchiveRef = (handle: string) => {
    const hash = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const num = String((hash % 9000) + 1000).padStart(4, '0');
    return `ARC-26-${num}`;
  };

  const metadata = useMemo(() => parseMetadata(product.description), [product.description]);

  const detailsRows = useMemo(() => {
    const features = (metadata['Features'] || '').split(',').map(f => f.trim());
    const fitKeywords = ['loose', 'regular', 'oversized', 'slim', 'boxy', 'cropped', 'structured', 'relaxed', 'fit'];
    const foundFit = features
      .filter(f => fitKeywords.includes(f.toLowerCase()))
      .map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase());
    const fitValue = foundFit.length > 0 ? foundFit.join(' / ') : 'Structured / relaxed';

    const finishKeywords = ['washed', 'ripped', 'pleated', 'drawstring', 'pocket', 'raw edge', 'hooded', 'button', 'zipper', 'embroidered'];
    const foundFinish = features
      .filter(f => finishKeywords.includes(f.toLowerCase()))
      .map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase());
    const finishValue = foundFinish.length > 0 ? foundFinish.join(' / ') : 'Soft wash';

    const rawFabric = metadata['Fabric'] || '';
    const formattedFabric = rawFabric ? rawFabric.replace(/,\s*/g, ' / ') : '';

    return [
      { label: 'Fabric', value: formattedFabric },
      { label: 'Weight', value: metadata['Fabric Weight'] || '240 GSM' },
      { label: 'Fit', value: fitValue },
      { label: 'Finish', value: finishValue },
      { label: 'Production', value: 'Limited production' }
    ].filter(r => r.value);
  }, [metadata]);

  const wishlistItem = {
    handle: product.handle,
    title: product.title,
    imageUrl: product.imageUrl,
    price: product.price,
    currencyCode: product.currencyCode,
    collectionTitle: '',
  };

  const [selectedColor, setSelectedColor] = useState<string>(
    () => product.variants[0]?.selectedOptions.find(o => {
      const n = o.name.toLowerCase(); return n === 'color' || n === 'colour';
    })?.value ?? ''
  );
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { openCart } = useUI();
  const { addToCart } = useCart();

  const colorOptionName = useMemo(() => {
    for (const v of product.variants)
      for (const o of v.selectedOptions) {
        const n = o.name.toLowerCase();
        if (n === 'color' || n === 'colour') return o.name;
      }
    return null;
  }, []);

  const sizeOptionName = useMemo(() => {
    for (const v of product.variants)
      for (const o of v.selectedOptions)
        if (o.name.toLowerCase() === 'size') return o.name;
    if (product.handle === 'e-gift-card') {
      const first = product.variants[0]?.selectedOptions[0];
      return first?.name ?? null;
    }
    return null;
  }, []);

  const colorOptions = useMemo(() => {
    if (!colorOptionName) return [];
    const seen = new Set<string>();
    const result: { value: string; imageUrl: string }[] = [];
    for (const v of product.variants) {
      const opt = v.selectedOptions.find(o => o.name === colorOptionName);
      if (opt && !seen.has(opt.value)) {
        seen.add(opt.value);
        result.push({ value: opt.value, imageUrl: v.image?.url ?? '' });
      }
    }
    return result;
  }, [colorOptionName]);

  const sizeOptions = useMemo(() => {
    if (!sizeOptionName) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const v of product.variants) {
      const opt = v.selectedOptions.find(o => o.name === sizeOptionName);
      if (opt && !seen.has(opt.value)) { seen.add(opt.value); result.push(opt.value); }
    }
    return result;
  }, [sizeOptionName]);

  const priceNum = parseFloat(selectedVariant.price.amount);
  const currencyCode = selectedVariant.price.currencyCode || 'EUR';
  const currencySymbol = currencyCode === 'USD' ? '$' : '€';
  const priceFormatted = Number.isInteger(priceNum)
    ? `${currencySymbol}${priceNum} ${currencyCode}`
    : `${currencySymbol}${priceNum.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyCode}`;

  const allSizes = sizeOptions;
  const hasSizes = sizeOptions.length > 0;
  const needsSizeSelection = hasSizes && !selectedSize;

  function handleSizeSelectInDrawer(sizeValue: string) {
    setSelectedSize(sizeValue);
    const next = findVariant(selectedColor, sizeValue);
    if (next) setSelectedVariant(next);
  }

  async function handleAddToBag() {
    if (!selectedVariant.id || adding) return;
    if (needsSizeSelection) {
      setSizeDropdownOpen(true);
      return;
    }
    setAdding(true);
    try {
      await addToCart(selectedVariant.id, 1);
      openCart();
    } finally {
      setAdding(false);
    }
  }

  function findVariant(color: string, size: string): ShopifyVariant | undefined {
    return product.variants.find(v => {
      const c = colorOptionName ? v.selectedOptions.find(o => o.name === colorOptionName)?.value : undefined;
      const s = sizeOptionName ? v.selectedOptions.find(o => o.name === sizeOptionName)?.value : undefined;
      if (colorOptionName && sizeOptionName) return c === color && s === size;
      if (colorOptionName) return c === color;
      if (sizeOptionName) return s === size;
      return false;
    });
  }

  function isSizeAvailable(size: string): boolean {
    const v = findVariant(selectedColor, size);
    return v?.availableForSale ?? false;
  }

  function openAvailModal(preSize?: string) {
    const soldOut = allSizes.filter(s => !isSizeAvailable(s));
    setAvailSizes(preSize ? [preSize] : soldOut.length === 1 ? soldOut : []);
    setAvailEmail('');
    setAvailPhone('');
    setAvailSubmitted(false);
    setAvailSubmitting(false);
    setAvailModal(true);
  }

  function toggleAvailSize(size: string) {
    setAvailSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  }

  async function handleAvailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!availEmail || availSizes.length === 0) return;
    setAvailSubmitting(true);
    try {
      const stored = JSON.parse(localStorage.getItem('tonet-avail-requests') ?? '[]');
      stored.push({
        id: `${product.handle}-${Date.now()}`,
        product: product.handle,
        title: product.title,
        sizes: availSizes,
        email: availEmail,
        submittedAt: Date.now(),
      });
      localStorage.setItem('tonet-avail-requests', JSON.stringify(stored));
    } finally {
      setAvailSubmitted(true);
      setAvailSubmitting(false);
    }
  }

  function handleColorChange(colorValue: string) {
    setSelectedColor(colorValue);
    const next = findVariant(colorValue, selectedSize);
    if (next) setSelectedVariant(next);
  }

  function toggleAccordion(key: string) {
    setExpandedAccordion(prev => prev === key ? null : key);
  }

  return (
    <>
      <div className="aw-pdp-page">
        <div className="aw-pdp-layout">
          
          {/* MOBILE ONLY: Purchase info at the top */}
          <div className="aw-purchase-section-mobile">
            <h1 className="aw-product-title">{product.title.toLowerCase()}</h1>
            <div className="aw-product-price">
              <span>{priceFormatted}</span>
            </div>

            {/* Colors Selection - Mobile */}
            {colorOptions.length > 1 && (
              <div className="aw-color-section">
                <span className="aw-color-label">colors</span>
                <div className="aw-color-grid">
                  {colorOptions.map((co) => {
                    const isSelected = selectedColor === co.value;
                    return (
                      <button
                        key={co.value}
                        type="button"
                        className={`aw-color-option ${isSelected ? 'active' : ''}`}
                        onClick={() => handleColorChange(co.value)}
                        aria-label={`Select color ${co.value}`}
                      >
                        <span className="aw-color-swatch" style={{ background: colorNameToCSS(co.value) }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Size selector trigger */}
            {hasSizes && (
              <div className="aw-size-selector-container">
                <button 
                  type="button"
                  className="aw-size-selector-trigger"
                  onClick={() => setSizeDropdownOpen(true)}
                >
                  <span>{selectedSize ? `talla: ${selectedSize.toLowerCase()} v` : 'Seleccionar Talla v'}</span>
                </button>
              </div>
            )}

            {/* Add to Cart button */}
            <button 
              className="aw-add-to-cart-btn"
              onClick={handleAddToBag}
              disabled={adding || (!needsSizeSelection && !selectedVariant.availableForSale)}
            >
              {adding ? 'Añadiendo...' : 'Añadir A La Cesta'}
            </button>
          </div>

          {/* GALLERY COLUMN (DESKTOP STACKED, MOBILE CAROUSEL) */}
          <div className="aw-gallery-column">
            {/* Mobile Carousel (CSS scroll snap) */}
            <div className="aw-mobile-gallery">
              <div className="aw-mobile-carousel">
                {images.map((img, i) => (
                  <div key={i} className="aw-mobile-slide">
                    <img src={img} alt={`${product.title} - ${i}`} className="aw-pdp-img" />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Stacked */}
            <div className="aw-desktop-gallery">
              {images.map((img, i) => (
                <div key={i} className="aw-desktop-img-wrapper">
                  <img src={img} alt={`${product.title} - ${i}`} className="aw-pdp-img" />
                </div>
              ))}
            </div>
          </div>

          {/* INFO COLUMN (DESKTOP ONLY) */}
          <div className="aw-info-column">
            <div className="aw-info-sticky">
              
              {/* Product flatlay image at the top of the details panel */}
              <div className="aw-info-flatlay">
                <img src={images[1] || images[0]} alt={product.title} className="aw-flatlay-img" />
              </div>

              <h1 className="aw-product-title">{product.title.toLowerCase()}</h1>
              
              <div className="aw-product-price">
                <span>{priceFormatted}</span>
              </div>

              {/* Colors Selection - Desktop */}
              {colorOptions.length > 1 && (
                <div className="aw-color-section">
                  <span className="aw-color-label">colors</span>
                  <div className="aw-color-grid">
                    {colorOptions.map((co) => {
                      const isSelected = selectedColor === co.value;
                      return (
                        <button
                          key={co.value}
                          type="button"
                          className={`aw-color-option ${isSelected ? 'active' : ''}`}
                          onClick={() => handleColorChange(co.value)}
                          aria-label={`Select color ${co.value}`}
                        >
                          <span className="aw-color-swatch" style={{ background: colorNameToCSS(co.value) }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size selector trigger */}
              {hasSizes && (
                <div className="aw-size-selector-container">
                  <button 
                    type="button"
                    className="aw-size-selector-trigger"
                    onClick={() => setSizeDropdownOpen(true)}
                  >
                    <span>{selectedSize ? `talla: ${selectedSize.toLowerCase()} v` : 'Seleccionar Talla v'}</span>
                  </button>
                </div>
              )}

              {/* Add to Cart button */}
              <button 
                className="aw-add-to-cart-btn"
                onClick={handleAddToBag}
                disabled={adding || (!needsSizeSelection && !selectedVariant.availableForSale)}
              >
                {adding ? 'Añadiendo...' : 'Añadir A La Cesta'}
              </button>

              {/* Wishlist triggers */}
              <button
                type="button"
                className={`aw-wishlist-action ${inWishlist ? 'active' : ''}`}
                onClick={() => {
                  toggle(wishlistItem);
                  if (!inWishlist) setCeremonyOpen(true);
                }}
              >
                {inWishlist ? 'en tu archivo (eliminar)' : 'guardar en el archivo'}
              </button>

              {/* Accordions */}
              <div className="aw-accordions">
                <div className="aw-accordion-item">
                  <button className="aw-accordion-header" onClick={() => toggleAccordion('desc')}>
                    <span>descripción</span>
                    <span>{expandedAccordion === 'desc' ? '—' : '+'}</span>
                  </button>
                  {expandedAccordion === 'desc' && (
                    <div className="aw-accordion-content">
                      <p>{product.description?.split('Item Number:')[0]?.trim()}</p>
                      <ul className="aw-specs-list">
                        {detailsRows.map((row, i) => (
                          <li key={i}>— {row.label.toLowerCase()}: {row.value.toLowerCase()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="aw-accordion-item">
                  <button className="aw-accordion-header" onClick={() => toggleAccordion('comp')}>
                    <span>composición</span>
                    <span>{expandedAccordion === 'comp' ? '—' : '+'}</span>
                  </button>
                  {expandedAccordion === 'comp' && (
                    <div className="aw-accordion-content">
                      <p>{metadata['Fabric'] ? metadata['Fabric'].toLowerCase() : '54 % lana, 25 % poliamida, 20 % algodón y 1 % elastano'}</p>
                    </div>
                  )}
                </div>

                <div className="aw-accordion-item">
                  <button className="aw-accordion-header" onClick={() => toggleAccordion('care')}>
                    <span>manténlo en buen estado</span>
                    <span>{expandedAccordion === 'care' ? '—' : '+'}</span>
                  </button>
                  {expandedAccordion === 'care' && (
                    <div className="aw-accordion-content">
                      <p>{metadata['Care Instructions'] ? metadata['Care Instructions'].toLowerCase() : 'limpieza en seco únicamente. planchar a baja temperatura.'}</p>
                    </div>
                  )}
                </div>

                <div className="aw-accordion-item">
                  <button className="aw-accordion-header" onClick={() => toggleAccordion('support')}>
                    <span>atención al cliente</span>
                    <span>{expandedAccordion === 'support' ? '—' : '+'}</span>
                  </button>
                  {expandedAccordion === 'support' && (
                    <div className="aw-accordion-content">
                      <p>contáctanos a contact@tonertorrentinni.com. estamos a tu disposición para ayudarte con cualquier consulta sobre tallas, envíos o devoluciones.</p>
                    </div>
                  )}
                </div>

                <div className="aw-accordion-item">
                  <button className="aw-accordion-header" onClick={() => toggleAccordion('shipping')}>
                    <span>devoluciones y envíos</span>
                    <span>{expandedAccordion === 'shipping' ? '—' : '+'}</span>
                  </button>
                  {expandedAccordion === 'shipping' && (
                    <div className="aw-accordion-content">
                      <p>envío estándar gratuito en todos los pedidos. entrega estimada en 2-4 días hábiles. devoluciones gratuitas en un plazo de 14 días.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* MOBILE ONLY: Accordions below the image gallery */}
          <div className="aw-accordions-mobile mobile-only">
            <div className="aw-accordion-item">
              <button className="aw-accordion-header" onClick={() => toggleAccordion('desc')}>
                <span>descripción</span>
                <span>{expandedAccordion === 'desc' ? '—' : '+'}</span>
              </button>
              {expandedAccordion === 'desc' && (
                <div className="aw-accordion-content">
                  <p>{product.description?.split('Item Number:')[0]?.trim()}</p>
                  <ul className="aw-specs-list">
                    {detailsRows.map((row, i) => (
                      <li key={i}>— {row.label.toLowerCase()}: {row.value.toLowerCase()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="aw-accordion-item">
              <button className="aw-accordion-header" onClick={() => toggleAccordion('comp')}>
                <span>composición</span>
                <span>{expandedAccordion === 'comp' ? '—' : '+'}</span>
              </button>
              {expandedAccordion === 'comp' && (
                <div className="aw-accordion-content">
                  <p>{metadata['Fabric'] ? metadata['Fabric'].toLowerCase() : '54 % lana, 25 % poliamida, 20 % algodón y 1 % elastano'}</p>
                </div>
              )}
            </div>

            <div className="aw-accordion-item">
              <button className="aw-accordion-header" onClick={() => toggleAccordion('care')}>
                <span>manténlo en buen estado</span>
                <span>{expandedAccordion === 'care' ? '—' : '+'}</span>
              </button>
              {expandedAccordion === 'care' && (
                <div className="aw-accordion-content">
                  <p>{metadata['Care Instructions'] ? metadata['Care Instructions'].toLowerCase() : 'limpieza en seco únicamente. planchar a baja temperatura.'}</p>
                </div>
              )}
            </div>

            <div className="aw-accordion-item">
              <button className="aw-accordion-header" onClick={() => toggleAccordion('support')}>
                <span>atención al cliente</span>
                <span>{expandedAccordion === 'support' ? '—' : '+'}</span>
              </button>
              {expandedAccordion === 'support' && (
                <div className="aw-accordion-content">
                  <p>contáctanos a contact@tonertorrentinni.com. estamos a tu disposición para ayudarte con cualquier consulta sobre tallas, envíos o devoluciones.</p>
                </div>
              )}
            </div>

            <div className="aw-accordion-item">
              <button className="aw-accordion-header" onClick={() => toggleAccordion('shipping')}>
                <span>devoluciones y envíos</span>
                <span>{expandedAccordion === 'shipping' ? '—' : '+'}</span>
              </button>
              {expandedAccordion === 'shipping' && (
                <div className="aw-accordion-content">
                  <p>envío estándar gratuito en todos los pedidos. entrega estimada en 2-4 días hábiles. devoluciones gratuitas en un plazo de 14 días.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RELATED & RECOMMENDED WITHIN THE HOUSE */}
        {recommended.length > 0 && (
          <section className="aw-house-carousel">
            <h2 className="aw-carousel-header">te puede interesar</h2>
            <div className="aw-carousel-wrap">
              <div className="aw-carousel-track">
                {recommended.slice(0, 8).map((p) => (
                  <div className="aw-carousel-item" key={p.handle}>
                    <RecommendedCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ══ SIZE SELECTOR OVERLAY MODAL / DRAWER ══ */}
      {sizeDropdownOpen && (
        <div className="aw-size-selector-overlay" onClick={() => setSizeDropdownOpen(false)}>
          <div className="aw-size-selector-modal" onClick={e => e.stopPropagation()}>
            <div className="aw-size-modal-header">
              <div className="aw-size-header-left">
                <button type="button" className="aw-size-close-btn" onClick={() => setSizeDropdownOpen(false)}>ⓧ</button>
                <button type="button" className="aw-size-guide-btn" onClick={() => { setSizeDropdownOpen(false); setSizeGuideOpen(true); }}>guia de tallas</button>
              </div>
            </div>
            
            <div className="aw-size-modal-body">
              <span className="aw-size-modal-title">seleccionar talla</span>
              
              <div className="aw-size-modal-grid">
                {sizeOptions.map(size => {
                  const isAvailable = isSizeAvailable(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      className={`aw-size-box-btn ${!isAvailable ? 'sold-out' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isAvailable) {
                          handleSizeSelectInDrawer(size);
                        } else {
                          openAvailModal(size);
                        }
                      }}
                    >
                      {size.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              
              {selectedSize && isSizeAvailable(selectedSize) && (
                <div className="aw-stock-warning">stock bajo</div>
              )}
            </div>

            <button 
              type="button"
              className="aw-size-modal-cta"
              onClick={() => {
                if (selectedSize) {
                  handleAddToBag();
                  setSizeDropdownOpen(false);
                }
              }}
              disabled={adding || !selectedSize}
            >
              {adding ? 'Añadiendo...' : 'Añadir A La Cesta'}
            </button>
          </div>
        </div>
      )}

      {/* ══ AVAILABILITY REQUEST MODAL ══ */}
      {availModal && (
        <div className="arm-overlay" onClick={() => setAvailModal(false)}>
          <div className="arm-modal" onClick={e => e.stopPropagation()}>
            <div className="arm-header">
              <span className="arm-title">avisar disponibilidad</span>
              <button className="arm-close" onClick={() => setAvailModal(false)} aria-label="Close">
                ✕
              </button>
            </div>

            {availSubmitted ? (
              <div className="arm-success">
                <span className="arm-success-title">solicitud registrada.</span>
                <p className="arm-success-sub">te contactaremos si vuelve a haber stock.</p>
              </div>
            ) : (
              <form className="arm-body" onSubmit={handleAvailSubmit}>
                <p className="arm-desc">
                  deja tu email para recibir un aviso en cuanto esta talla esté disponible.
                </p>

                <div className="arm-field">
                  <label className="arm-field-label">talla seleccionada</label>
                  <div className="arm-sizes-list">
                    {availSizes.map(s => <span key={s} className="arm-size-tag">{s.toLowerCase()}</span>)}
                  </div>
                </div>

                <div className="arm-field">
                  <label className="arm-field-label" htmlFor="arm-email">correo electrónico</label>
                  <input
                    id="arm-email"
                    className="arm-input"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={availEmail}
                    onChange={e => setAvailEmail(e.target.value)}
                  />
                </div>

                <button
                  className="arm-cta"
                  type="submit"
                  disabled={availSubmitting || !availEmail}
                >
                  {availSubmitting ? 'registrando…' : 'avisar disponibilidad'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══ SIZE GUIDE MODAL ══ */}
      {sizeGuideOpen && (
        <div className="arm-overlay" onClick={() => setSizeGuideOpen(false)}>
          <div className="arm-modal" onClick={e => e.stopPropagation()}>
            <div className="arm-header">
              <span className="arm-title">guía de tallas</span>
              <button className="arm-close" onClick={() => setSizeGuideOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="arm-body">
              <p className="arm-desc" style={{ marginBottom: '16px' }}>
                las medidas son aproximadas y se toman en plano.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {([
                  { size: 'XS', chest: '54 cm', length: '66 cm' },
                  { size: 'S',  chest: '56 cm', length: '68 cm' },
                  { size: 'M',  chest: '58 cm', length: '70 cm' },
                  { size: 'L',  chest: '60 cm', length: '72 cm' },
                  { size: 'XL', chest: '62 cm', length: '74 cm' },
                ] as const).map((row) => (
                  <div key={row.size} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eaeaea', paddingBottom: '6px' }}>
                    <span style={{ fontWeight: 400 }}>{row.size}</span>
                    <span>pecho {row.chest}</span>
                    <span>largo {row.length}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ CINEMATIC ARCHIVAL CEREMONY MODAL ══ */}
      {ceremonyOpen && (
        <div className="ac-overlay" onClick={() => setCeremonyOpen(false)}>
          <div className="ac-modal" onClick={e => e.stopPropagation()}>
            <button className="ac-close" onClick={() => setCeremonyOpen(false)} aria-label="Close">
              ✕
            </button>

            <div className="ac-header">
              <span className="ac-supra">registro de archivo</span>
              <h2 className="ac-title">prenda guardada en el archivo</h2>
              <p className="ac-desc">
                esta pieza ha sido registrada de forma temporal en tu archivo personal.
              </p>
            </div>

            <div className="ac-split">
              <div className="ac-image-panel">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.title} className="ac-tonet-img" />
                )}
              </div>

              <div className="ac-details-panel">
                <div className="ac-tech-grid">
                  <div className="ac-tech-item">
                    <span className="ac-tech-label">nombre</span>
                    <span className="ac-tech-value">{product.title.toLowerCase()}</span>
                  </div>

                  <div className="ac-tech-item">
                    <span className="ac-tech-label">colección</span>
                    <span className="ac-tech-value">{getHouseState(product.handle).toLowerCase()}</span>
                  </div>

                  <div className="ac-tech-item">
                    <span className="ac-tech-label">referencia</span>
                    <span className="ac-tech-value">{getArchiveRef(product.handle).toLowerCase()}</span>
                  </div>

                  <div className="ac-tech-item">
                    <span className="ac-tech-label">estado</span>
                    <span className="ac-tech-value">
                      {selectedVariant.availableForSale ? 'disponible' : 'archivado temporalmente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ac-actions">
              <Link href="/archive" className="ac-btn-primary">
                ver archivo
              </Link>
              <button className="ac-btn-secondary" onClick={() => setCeremonyOpen(false)}>
                volver a la tienda
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ══════════════════════════════════════
           ALEXANDER WANG PDP STYLES
        ══════════════════════════════════════ */

        .aw-pdp-page {
          background-color: #ffffff;
          color: #000000;
          min-height: 100vh;
          font-family: var(--font-primary), sans-serif;
          font-variant-numeric: lining-nums tabular-nums;
          padding-top: 56px;
          text-transform: lowercase;
        }

        .aw-pdp-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          width: 100%;
        }

        @media (min-width: 1024px) {
          .aw-pdp-layout {
            grid-template-columns: 50% 50%;
          }
        }

        /* ── GALLERY COLUMN ── */
        .aw-gallery-column {
          width: 100%;
        }

        /* Mobile Swipe Gallery */
        .aw-mobile-gallery {
          display: block;
          width: 100%;
          overflow: hidden;
        }
        .aw-mobile-carousel {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .aw-mobile-carousel::-webkit-scrollbar {
          display: none;
        }
        .aw-mobile-slide {
          flex: 0 0 100%;
          width: 100%;
          scroll-snap-align: start;
        }
        .aw-mobile-slide img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }

        /* Desktop Stacked Gallery */
        .aw-desktop-gallery {
          display: none;
          flex-direction: column;
          gap: 0;
        }
        @media (min-width: 1024px) {
          .aw-mobile-gallery { display: none; }
          .aw-desktop-gallery { display: flex; }
        }
        .aw-desktop-img-wrapper {
          width: 100%;
        }
        .aw-desktop-img-wrapper img {
          width: 100%;
          height: auto;
          display: block;
        }

        /* ── INFO COLUMN (DESKTOP) ── */
        .aw-info-column {
          display: none;
          padding: 60px 48px;
        }
        @media (min-width: 1024px) {
          .aw-info-column {
            display: block;
          }
        }
        .aw-info-sticky {
          position: sticky;
          top: 112px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }

        /* Flatlay Image in detail panel */
        .aw-info-flatlay {
          width: 100%;
          max-width: 320px;
          aspect-ratio: 3 / 4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .aw-flatlay-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Title */
        .aw-product-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.08em;
          line-height: 1.4;
          margin: 0 0 8px;
          text-transform: lowercase;
          color: #000000;
        }

        /* Price */
        .aw-product-price {
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.05em;
          margin-bottom: 24px;
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .aw-price-original {
          text-decoration: line-through;
          color: #888888;
        }
        .aw-price-sale {
          color: #000000;
        }

        /* Colors selection styling */
        .aw-color-section {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        .aw-color-label {
          font-size: 11px;
          font-weight: 300;
          color: #000000;
          text-transform: lowercase;
          letter-spacing: 0.05em;
        }
        .aw-color-grid {
          display: flex;
          justify-content: center;
          gap: 12px;
        }
        .aw-color-option {
          background: transparent;
          border: 1px solid #cccccc;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .aw-color-option.active {
          border-color: #000000;
        }
        .aw-color-option:hover {
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
        }
        .aw-color-swatch {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.05);
          display: block;
        }

        /* Size Selector */
        .aw-size-selector-container {
          position: relative;
          width: 100%;
          margin-bottom: 16px;
        }
        .aw-size-selector-trigger {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          padding: 12px 0;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: #000000;
          cursor: pointer;
          transition: opacity 0.3s;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .aw-size-selector-trigger:hover {
          opacity: 0.7;
        }

        /* Add to Cart Button */
        .aw-add-to-cart-btn {
          width: 100%;
          background: transparent;
          color: #000000;
          border: none;
          padding: 16px 0;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: opacity 0.3s;
          margin-bottom: 16px;
          text-align: center;
        }
        .aw-add-to-cart-btn:hover {
          opacity: 0.7;
        }
        .aw-add-to-cart-btn:disabled {
          color: #999999;
          cursor: not-allowed;
        }

        /* Wishlist action */
        .aw-wishlist-action {
          background: none;
          border: none;
          outline: none;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.08em;
          text-transform: lowercase;
          color: #666666;
          cursor: pointer;
          padding: 8px 0;
          margin-bottom: 40px;
          transition: color 0.3s;
        }
        .aw-wishlist-action:hover {
          color: #000000;
        }

        /* Accordions */
        .aw-accordions {
          width: 100%;
          border-top: 1px solid #eaeaea;
        }
        .aw-accordion-item {
          border-bottom: 1px solid #eaeaea;
          width: 100%;
        }
        .aw-accordion-header {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #000000;
          text-transform: lowercase;
          cursor: pointer;
        }
        .aw-accordion-content {
          padding: 0 0 24px;
          text-align: left;
          font-size: 12px;
          line-height: 1.6;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: #333333;
        }
        .aw-accordion-content p {
          margin-bottom: 12px;
        }
        .aw-specs-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* ── MOBILE ONLY PURCHASE SECTION ── */
        .aw-purchase-section-mobile {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px 20px;
          border-bottom: 1px solid #eaeaea;
        }
        @media (min-width: 1024px) {
          .aw-purchase-section-mobile {
            display: none;
          }
        }
        .aw-purchase-section-mobile .aw-size-selector-container {
          border-bottom: 1px solid #eaeaea;
        }
        .aw-purchase-section-mobile .aw-add-to-cart-btn {
          margin-bottom: 0;
        }

        /* Mobile Accordions */
        .aw-accordions-mobile {
          display: block;
          padding: 0 20px;
          border-top: 1px solid #eaeaea;
          margin-bottom: 80px;
        }
        @media (min-width: 1024px) {
          .aw-accordions-mobile {
            display: none;
          }
        }

        /* ── RELATED CAROUSEL ── */
        .aw-house-carousel {
          padding: 80px 20px;
          background-color: #ffffff;
          border-top: 1px solid #eaeaea;
          text-align: center;
        }
        .aw-carousel-header {
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.1em;
          text-transform: lowercase;
          margin-bottom: 40px;
        }
        .aw-carousel-wrap {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .aw-carousel-wrap::-webkit-scrollbar {
          display: none;
        }
        .aw-carousel-track {
          display: flex;
          gap: 20px;
          width: max-content;
        }
        .aw-carousel-item {
          width: 220px;
        }

        /* ── SIZE SELECTOR OVERLAY MODAL / DRAWER ── */
        .aw-size-selector-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 2000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        @media (min-width: 1024px) {
          .aw-size-selector-overlay {
            background: transparent;
            align-items: center;
            justify-content: center;
          }
        }
        .aw-size-selector-modal {
          background: #ffffff;
          border: 1px solid #000000;
          width: 100%;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: center;
          box-sizing: border-box;
        }
        @media (max-width: 1023px) {
          .aw-size-selector-modal {
            border-bottom: none;
            border-left: none;
            border-right: none;
            border-top: 1px solid #000000;
            padding-bottom: 40px;
          }
        }
        @media (min-width: 1024px) {
          .aw-size-selector-modal {
            position: fixed;
            bottom: 40px;
            right: 40px;
            width: 450px;
          }
        }
        .aw-size-modal-header {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
        }
        .aw-size-header-left {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .aw-size-close-btn {
          background: none;
          border: none;
          outline: none;
          font-size: 14px;
          cursor: pointer;
          color: #000000;
          padding: 0;
        }
        .aw-size-guide-btn {
          background: none;
          border: none;
          outline: none;
          font-size: 11px;
          font-weight: 300;
          color: #000000;
          cursor: pointer;
          text-transform: lowercase;
          padding: 0;
        }
        .aw-size-modal-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }
        .aw-size-modal-title {
          font-size: 13px;
          font-weight: 300;
          letter-spacing: 0.05em;
          text-transform: lowercase;
          color: #000000;
        }
        .aw-size-modal-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin: 8px 0;
          width: 100%;
        }
        .aw-size-box-btn {
          border: 1px solid transparent;
          background: transparent;
          color: #000000;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.05em;
          box-sizing: border-box;
        }
        .aw-size-box-btn:hover {
          border-color: #e0e0e0;
        }
        .aw-size-box-btn.selected {
          border: 1px solid #000000;
          background: transparent;
          color: #000000;
        }
        .aw-size-box-btn.sold-out {
          color: #cccccc;
          text-decoration: line-through;
          cursor: not-allowed;
        }
        .aw-stock-warning {
          color: #ff0000;
          font-size: 11px;
          font-weight: 400;
          margin-top: 4px;
          text-transform: lowercase;
        }
        .aw-size-modal-cta {
          width: 100%;
          background: transparent;
          color: #000000;
          border: none;
          padding: 14px 0;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: opacity 0.3s;
          text-align: center;
        }
        .aw-size-modal-cta:hover {
          opacity: 0.7;
        }
        .aw-size-modal-cta:disabled {
          color: #999999;
          cursor: not-allowed;
        }

        /* ── MODALS ── */
        .arm-overlay, .ac-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        .arm-modal, .ac-modal {
          background: #ffffff;
          border: 1px solid #000000;
          width: 100%;
          max-width: 480px;
          padding: 32px;
          position: relative;
          color: #000000;
          box-shadow: 0 20px 50px rgba(0,0,0,0.08);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .arm-close, .ac-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: #000000;
          font-size: 14px;
          cursor: pointer;
        }
        .arm-title, .ac-title {
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: lowercase;
        }
        .arm-desc, .ac-desc {
          font-size: 12px;
          font-weight: 300;
          line-height: 1.5;
          color: #666666;
        }
        .arm-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .arm-field-label, .ac-tech-label {
          font-size: 11px;
          font-weight: 300;
          color: #999999;
          text-transform: lowercase;
        }
        .arm-input {
          border: none;
          border-bottom: 1px solid #000000;
          padding: 10px 0;
          font-size: 13px;
          outline: none;
          background: transparent;
        }
        .arm-cta, .ac-btn-primary {
          background: #000000;
          color: #ffffff;
          border: 1px solid #000000;
          padding: 14px 0;
          font-size: 12px;
          text-align: center;
          text-transform: lowercase;
          cursor: pointer;
          transition: opacity 0.3s;
          display: block;
          width: 100%;
        }
        .arm-cta:hover, .ac-btn-primary:hover {
          opacity: 0.8;
        }

        .ac-split {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 24px;
          align-items: center;
        }
        .ac-image-panel {
          aspect-ratio: 3/4;
          background: #f5f5f5;
          overflow: hidden;
        }
        .ac-tonet-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .ac-tech-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ac-tech-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }
        .ac-tech-value {
          font-weight: 400;
        }
        .ac-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ac-btn-secondary {
          background: transparent;
          border: 1px solid #cccccc;
          color: #000000;
          padding: 14px 0;
          font-size: 12px;
          cursor: pointer;
          text-transform: lowercase;
          text-align: center;
        }
      `}</style>
    </>
  );
}
