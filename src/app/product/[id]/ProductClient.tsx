"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, X, Plus, Minus } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from '@/context/LocaleContext';
import { Product, ShopifyVariant, RecommendedProduct } from '@/lib/shopify';
import { useTranslatedText } from '@/hooks/useTranslatedText';
import RecommendedCard from '@/components/RecommendedCard';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';

interface Props {
  product: Product;
  relatedProductsByTag?: Product[];
}

function TranslatedDesc({ text, className }: { text?: string | null; className?: string }) {
  const translated = useTranslatedText(text);
  if (!translated) return null;
  return <p className={className}>{translated}</p>;
}

const RECENTLY_VIEWED_KEY = 'rv_products';
const MAX_RECENTLY_VIEWED = 10;

type RecentProduct = Pick<RecommendedProduct, 'handle' | 'title' | 'imageUrl' | 'price' | 'currencyCode'>;

export default function ProductClient({ product, relatedProductsByTag }: Props) {
  const router = useRouter();
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentProduct[]>([]);

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
  const [activeImage, setActiveImage] = useState(0);
  const [displayImageUrl, setDisplayImageUrl] = useState<string>(() => images[0] ?? product.imageUrl);
  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant>(
    product.variants[0] ?? { id: '', title: '', availableForSale: true, price: { amount: String(product.price), currencyCode: product.currencyCode }, selectedOptions: [] }
  );
  const [adding, setAdding] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [availModal, setAvailModal] = useState(false);
  const [availSizes, setAvailSizes] = useState<string[]>([]);
  const [availEmail, setAvailEmail] = useState('');
  const [availPhone, setAvailPhone] = useState('');
  const [availSubmitted, setAvailSubmitted] = useState(false);
  const [availSubmitting, setAvailSubmitting] = useState(false);
  const [archiveToast, setArchiveToast] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { t } = useTranslation();
  useLocale();
  const { toggle, has } = useWishlist();
  const inWishlist = has(product.handle);
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
  const thumbsRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isDragging = useRef(false);
  const recCarouselRef = useRef<HTMLDivElement>(null);
  const recDragStart = useRef(0);
  const recScrollStart = useRef(0);
  const recIsDragging = useRef(false);
  const recDragMoved = useRef(false);

  const outfitCarouselRef = useRef<HTMLDivElement>(null);
  const outfitDragStart = useRef(0);
  const outfitScrollStart = useRef(0);
  const outfitIsDragging = useRef(false);
  const outfitDragMoved = useRef(false);
  const [completeOutfit, setCompleteOutfit] = useState<RecommendedProduct[]>([]);
  const recentCarouselRef = useRef<HTMLDivElement>(null);
  const ymalCarouselRef = useRef<HTMLDivElement>(null);
  const ymalDragStart = useRef(0);
  const ymalScrollStart = useRef(0);
  const ymalIsDragging = useRef(false);
  const ymalDragMoved = useRef(false);

  function ymalPointerDown(e: React.PointerEvent) {
    ymalDragStart.current = e.clientX;
    ymalScrollStart.current = ymalCarouselRef.current?.scrollLeft ?? 0;
    ymalIsDragging.current = true;
    ymalDragMoved.current = false;
  }
  function ymalPointerMove(e: React.PointerEvent) {
    if (!ymalIsDragging.current) return;
    const dx = e.clientX - ymalDragStart.current;
    if (Math.abs(dx) > 10) {
      ymalDragMoved.current = true;
      ymalCarouselRef.current?.classList.add('dragging');
      if (ymalCarouselRef.current) ymalCarouselRef.current.scrollLeft = ymalScrollStart.current - dx;
    }
  }
  function ymalPointerUp() {
    ymalIsDragging.current = false;
    ymalCarouselRef.current?.classList.remove('dragging');
  }
  function ymalCarouselClick(e: React.MouseEvent) {
    if (ymalDragMoved.current) { e.preventDefault(); e.stopPropagation(); ymalDragMoved.current = false; }
  }

  function outfitPointerDown(e: React.PointerEvent) {
    outfitDragStart.current = e.clientX;
    outfitScrollStart.current = outfitCarouselRef.current?.scrollLeft ?? 0;
    outfitIsDragging.current = true;
    outfitDragMoved.current = false;
  }
  function outfitPointerMove(e: React.PointerEvent) {
    if (!outfitIsDragging.current) return;
    const dx = e.clientX - outfitDragStart.current;
    if (Math.abs(dx) > 10) {
      outfitDragMoved.current = true;
      outfitCarouselRef.current?.classList.add('dragging');
      if (outfitCarouselRef.current) outfitCarouselRef.current.scrollLeft = outfitScrollStart.current - dx;
    }
  }
  function outfitPointerUp() {
    outfitIsDragging.current = false;
    outfitCarouselRef.current?.classList.remove('dragging');
  }
  function outfitCarouselClick(e: React.MouseEvent) {
    if (outfitDragMoved.current) { e.preventDefault(); e.stopPropagation(); outfitDragMoved.current = false; }
  }

  function recPointerDown(e: React.PointerEvent) {
    recDragStart.current = e.clientX;
    recScrollStart.current = recCarouselRef.current?.scrollLeft ?? 0;
    recIsDragging.current = true;
    recDragMoved.current = false;
  }
  function recPointerMove(e: React.PointerEvent) {
    if (!recIsDragging.current) return;
    const dx = e.clientX - recDragStart.current;
    if (Math.abs(dx) > 10) {
      recDragMoved.current = true;
      recCarouselRef.current?.classList.add('dragging');
      if (recCarouselRef.current) recCarouselRef.current.scrollLeft = recScrollStart.current - dx;
    }
  }
  function recPointerUp() {
    recIsDragging.current = false;
    recCarouselRef.current?.classList.remove('dragging');
  }
  function recCarouselClick(e: React.MouseEvent) {
    if (recDragMoved.current) { e.preventDefault(); e.stopPropagation(); recDragMoved.current = false; }
  }

  useEffect(() => {
    const el = recCarouselRef.current;
    if (!el) return;
    const onScroll = () => {
      const pageY = window.scrollY;
      el.style.transform = `translateX(${pageY * 0.04}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function makeSmoothWheelCarousel(el: HTMLDivElement) {
    let target = el.scrollLeft;
    let rafId = 0;
    let snapTimer: ReturnType<typeof setTimeout>;
    const animate = () => {
      const diff = target - el.scrollLeft;
      if (Math.abs(diff) < 0.5) { el.scrollLeft = target; clearTimeout(snapTimer); snapTimer = setTimeout(() => { el.style.scrollSnapType = ''; }, 250); return; }
      el.scrollLeft += diff * 0.065;
      rafId = requestAnimationFrame(animate);
    };
    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * 800 : e.deltaY;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const atStart = target <= 0 && delta < 0;
      const atEnd = target >= maxScroll && delta > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      el.style.scrollSnapType = 'none';
      clearTimeout(snapTimer);
      cancelAnimationFrame(rafId);
      target = Math.max(0, Math.min(maxScroll, target + delta));
      rafId = requestAnimationFrame(animate);
    };
    el.addEventListener('wheel', handler, { passive: false });
  }

  const outfitCallbackRef = useCallback((el: HTMLDivElement | null) => {
    outfitCarouselRef.current = el;
    if (!el) return;
    makeSmoothWheelCarousel(el);
  }, []);

  const recentCallbackRef = useCallback((el: HTMLDivElement | null) => {
    recentCarouselRef.current = el;
    if (!el) return;
    makeSmoothWheelCarousel(el);
  }, []);

  const ymalCallbackRef = useCallback((el: HTMLDivElement | null) => {
    ymalCarouselRef.current = el;
    if (!el) return;
    makeSmoothWheelCarousel(el);
  }, []);

  useEffect(() => {
    const el = infoRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, left: 0 });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    if (availModal || sizeGuideOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [availModal, sizeGuideOpen]);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  function startAutoPlay() {
    if (images.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setActiveImage(prev => {
          const next = prev < images.length - 1 ? prev + 1 : 0;
          setDisplayImageUrl(images[next]);
          carouselRef.current?.scrollTo({ left: next * (carouselRef.current.offsetWidth || 0), behavior: 'smooth' });
          return next;
        });
      }
    }, 2000);
  }

  useEffect(() => {
    startAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [images.length]);

  function goToSlide(idx: number) {
    const next = Math.max(0, Math.min(idx, images.length - 1));
    setActiveImage(next);
    setDisplayImageUrl(images[next]);
    carouselRef.current?.scrollTo({ left: next * carouselRef.current.offsetWidth, behavior: 'smooth' });
  }

  function handleCarouselTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleCarouselTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      goToSlide(activeImage + (dx < 0 ? 1 : -1));
    }
  }

  function handleCarouselMouseDown(e: React.MouseEvent) {
    isDragging.current = false;
    touchStartX.current = e.clientX;
  }

  function handleCarouselMouseMove(e: React.MouseEvent) {
    if (Math.abs(e.clientX - touchStartX.current) > 5) isDragging.current = true;
  }

  function handleCarouselMouseUp(e: React.MouseEvent) {
    const dx = e.clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      goToSlide(activeImage + (dx < 0 ? 1 : -1));
    }
  }

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
    // Gift card: use first option (e.g. Denomination, Amount) as the "type" selector
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

  const isGiftCard = product.handle === 'e-gift-card';
  const hasMultipleVariants = product.variants.length > 1;
  const hasSizes = sizeOptions.length > 0;
  const needsSizeSelection = hasSizes && !selectedSize;

  function handleSizeSelectInDrawer(sizeValue: string) {
    setSelectedSize(sizeValue);
    const next = findVariant(selectedColor, sizeValue);
    if (next) setSelectedVariant(next);
  }

  async function handleAddToBag() {
    if (!selectedVariant.id || adding) return;
    if (needsSizeSelection) { setSizeOpen(true); return; }
    setSizeOpen(false);
    setAdding(true);
    try {
      await addToCart(selectedVariant.id, 1);
      openCart();
    } finally {
      setAdding(false);
    }
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

  function handleColorChange(colorValue: string) {
    setSelectedColor(colorValue);
    const colorImg = colorOptions.find(c => c.value === colorValue)?.imageUrl;
    if (colorImg) {
      setDisplayImageUrl(colorImg);
      const idx = images.indexOf(colorImg);
      setActiveImage(idx >= 0 ? idx : 0);
    }
    const next = findVariant(colorValue, selectedSize);
    if (next) {
      setSelectedVariant(next);
    } else {
      const fallback = product.variants.find(v =>
        colorOptionName
          ? v.selectedOptions.find(o => o.name === colorOptionName)?.value === colorValue
          : false
      );
      if (fallback) {
        setSelectedVariant(fallback);
        setSelectedSize('');
      }
    }
  }

  function handleSizeSelect(sizeValue: string) {
    setSelectedSize(sizeValue);
    setSizeOpen(false);
    const next = findVariant(selectedColor, sizeValue);
    if (next) setSelectedVariant(next);
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
        imageUrl: product.imageUrl,
        sizes: availSizes,
        email: availEmail,
        submittedAt: Date.now(),
      });
      localStorage.setItem('tonet-avail-requests', JSON.stringify(stored));

      await fetch('/api/availability-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: product.handle,
          title: product.title,
          sizes: availSizes,
          email: availEmail,
          phone: availPhone || null,
        }),
      }).catch(() => {});
    } finally {
      setAvailSubmitted(true);
      setAvailSubmitting(false);
    }
  }

  function toggleAccordion(key: string) {
    setExpandedAccordion(prev => prev === key ? null : key);
  }

  function scrollThumbs(dir: number) {
    if (thumbsRef.current) {
      thumbsRef.current.scrollBy({ left: dir * 120, behavior: 'smooth' });
    }
  }

  const descriptionFirstLine = product.description?.split(/[.\n]/)[0]?.trim() || '';

  const gridImages = images.length > 0
    ? Array.from({ length: 4 }, (_, i) => images[i % images.length])
    : [];

  return (
    <>
      <div className="ss-pdp-layout">
        {/* ── GALLERY ── */}
        <div className="ss-gallery">
          {/* Mobile: horizontal carousel */}
          <div className="ss-mobile-gallery">
            <div
              className="ss-carousel"
              ref={carouselRef}
              onTouchStart={handleCarouselTouchStart}
              onTouchEnd={handleCarouselTouchEnd}
              onMouseDown={handleCarouselMouseDown}
              onMouseMove={handleCarouselMouseMove}
              onMouseUp={handleCarouselMouseUp}
              onMouseEnter={() => { isPausedRef.current = true; }}
              onMouseLeave={() => { isPausedRef.current = false; }}
            >
              {images.map((img, i) => (
                <div key={i} className="ss-carousel-slide">
                  <img
                    src={img}
                    alt={`${product.title} – ${i + 1}`}
                    className="ss-gallery-img"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <div className="ss-carousel-dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`ss-carousel-dot${activeImage === i ? ' active' : ''}`}
                    onClick={() => goToSlide(i)}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop: vertically stacked images */}
          <div className="ss-desktop-gallery">
            {images.map((img, i) => (
              <div key={i} className="ss-desktop-img-block">
                <img
                  src={img}
                  alt={`${product.title} – ${i + 1}`}
                  className="ss-gallery-img"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── INFO PANEL ── */}
        <div className="ss-info" ref={infoRef}>
          {/* Title */}
          <h1 className="ss-title">{product.title}</h1>

          <p className="ss-editorial-subtext">A garment shaped by silence.</p>

          {/* Price + variant name on second line */}
          <div className="ss-price-row">
            <span className="ss-price">{priceFormatted}</span>
            {(selectedColor || descriptionFirstLine) && (
              <span className="ss-subtitle" style={{display:'inline-flex', alignItems:'center', gap: 6}}>
                {selectedColor && (
                  <span style={{
                    display: 'inline-block',
                    width: 11,
                    height: 11,
                    borderRadius: 2,
                    background: colorNameToCSS(selectedColor),
                    border: '1px solid rgba(0,0,0,0.15)',
                    flexShrink: 0,
                  }} />
                )}
                {selectedColor || descriptionFirstLine}
              </span>
            )}
          </div>

          {/* Variant / image thumbnails — only when >1 color variant */}
          {colorOptions.length > 1 && (
            <div className="ss-thumbs-wrap">
              {colorOptions.length > 4 && (
                <button className="ss-thumbs-arrow ss-thumbs-arrow-left" onClick={() => scrollThumbs(-1)} aria-label="Previous">
                  <ChevronLeft size={14} strokeWidth={1.4} color="#111" />
                </button>
              )}
              <div className="ss-thumbs" ref={thumbsRef}>
                {colorOptions.map((co) => (
                  <button
                    key={co.value}
                    className={`ss-thumb ${selectedColor === co.value ? 'active' : ''}`}
                    onClick={() => handleColorChange(co.value)}
                    title={co.value}
                  >
                    <img src={co.imageUrl} alt={co.value} />
                  </button>
                ))}
              </div>
              {colorOptions.length > 4 && (
                <button className="ss-thumbs-arrow ss-thumbs-arrow-right" onClick={() => scrollThumbs(1)} aria-label="Next">
                  <ChevronRight size={14} strokeWidth={1.4} color="#111" />
                </button>
              )}
            </div>
          )}

          {/* Action row: select size | add to favorites — 50/50 */}
          <div className="ss-actions">
            <button
              className="ss-cta-btn"
              onClick={handleAddToBag}
              disabled={adding || !selectedVariant.availableForSale}
            >
              {adding
                ? 'Adding…'
                : !selectedVariant.availableForSale
                ? 'Unavailable'
                : needsSizeSelection
                ? (isGiftCard ? 'Select Amount' : 'Select Size')
                : 'Add to Selection'}
            </button>
            <button
              className={`ss-archive-btn${inWishlist ? ' ss-archive-btn--in' : ''}`}
              onClick={() => {
                toggle(wishlistItem);
                if (!inWishlist) {
                  setArchiveToast(true);
                  setTimeout(() => setArchiveToast(false), 3200);
                } else {
                  setArchiveToast(false);
                }
              }}
            >
              {inWishlist ? 'Archived' : 'Add to Archive'}
            </button>
          </div>

          {archiveToast && (
            <div className="ss-archive-toast">
              <span className="ss-archive-toast-main">Added to your Archive.</span>
              <span className="ss-archive-toast-sub">Available in your personal archive for 48 hours.</span>
            </div>
          )}

          {/* Description — uppercase below actions */}
          {product.description && (
            <p className="ss-desc-plain">{product.description}</p>
          )}

          {/* Delivery info */}
          {/* <div className="ss-delivery">
            <Check size={13} strokeWidth={1.5} color="#111" />
            <span>{t('common.freeDeliveryShort')}</span>
          </div> */}

          {/* Accordion sections */}
          <div className="ss-accordions">
            <div className="ss-accordion-item">
              <button className="ss-accordion-header" onClick={() => toggleAccordion('description')}>
                <span>Description</span>
                <span className={`ss-accordion-icon${expandedAccordion === 'description' ? ' open' : ''}`}><Plus size={12} strokeWidth={1.4} /></span>
              </button>
              <div className={`ss-accordion-body${expandedAccordion === 'description' ? ' open' : ''}`}>
                <div className="ss-accordion-body-inner">
                  <TranslatedDesc text={product.description} className="ss-accordion-text" />
                </div>
              </div>
            </div>

            <div className="ss-accordion-item">
              <button className="ss-accordion-header" onClick={() => toggleAccordion('details')}>
                <span>{t('common.detailsAndCare')}</span>
                <span className={`ss-accordion-icon${expandedAccordion === 'details' ? ' open' : ''}`}><Plus size={12} strokeWidth={1.4} /></span>
              </button>
              <div className={`ss-accordion-body${expandedAccordion === 'details' ? ' open' : ''}`}>
                <div className="ss-accordion-body-inner">
                  <p className="ss-accordion-text">{t('common.deliveryEstimate')}</p>
                </div>
              </div>
            </div>

            <div className="ss-accordion-item">
              <button className="ss-accordion-header" onClick={() => toggleAccordion('delivery')}>
                <span>{t('common.deliveryAndReturns')}</span>
                <span className={`ss-accordion-icon${expandedAccordion === 'delivery' ? ' open' : ''}`}><Plus size={12} strokeWidth={1.4} /></span>
              </button>
              <div className={`ss-accordion-body${expandedAccordion === 'delivery' ? ' open' : ''}`}>
                <div className="ss-accordion-body-inner">
                  <p className="ss-accordion-text">
                    <strong>{t('common.drawerDeliveryLabel')}</strong><br />
                    {t('common.drawerDeliveryBody')}
                  </p>
                  <p className="ss-accordion-text" style={{ marginTop: 12 }}>
                    <strong>{t('common.drawerReturnsLabel')}</strong><br />
                    {t('common.drawerReturnsBody')}
                  </p>
                </div>
              </div>
            </div>

            <div className="ss-accordion-item">
              <button className="ss-accordion-header" onClick={() => toggleAccordion('needtoknow')}>
                <span>The Essentials</span>
                <span className={`ss-accordion-icon${expandedAccordion === 'needtoknow' ? ' open' : ''}`}><Plus size={12} strokeWidth={1.4} /></span>
              </button>
              <div className={`ss-accordion-body${expandedAccordion === 'needtoknow' ? ' open' : ''}`}>
                <div className="ss-accordion-body-inner">
                  <p className="ss-accordion-text">
                    This piece is crafted with premium materials and designed for longevity. Handle with care and refer to the care label for specific instructions. Each item is quality-checked before dispatch.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated delivery */}
          <p className="ss-delivery-estimate">
            {(() => {
              const d = new Date();
              d.setDate(d.getDate() + 25);
              return `Estimated delivery: ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
            })()}
          </p>

        </div>

        {/* ── MOBILE IMAGE GRID ── */}
        {gridImages.length > 0 && (
          <div className="ss-mobile-img-grid">
            {gridImages.map((img, i) => (
              <div key={i} className="ss-mobile-img-cell">
                <img src={img} alt={`${product.title} – ${i + 1}`} draggable={false} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── SIZE DRAWER ── */}
      <div className={`ss-size-drawer${sizeOpen && hasSizes ? ' open' : ''}${availModal || sizeGuideOpen ? ' dimmed' : ''}`}>
        <div className="ss-size-drawer-header">
          <span className="ss-size-drawer-title">{product.title}</span>
          <div className="ss-size-header-right">
            <button className="ss-size-guide" onClick={() => setSizeGuideOpen(true)} aria-label="Size information">Sizing</button>
            <button className="ss-size-close" onClick={() => { setSizeOpen(false); setSelectedSize(''); }} aria-label="Close">
              <X size={16} strokeWidth={1.4} />
            </button>
          </div>
        </div>
        <div className="ss-size-drawer-list">
          {allSizes.map((size) => {
            const available = isSizeAvailable(size);
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                className={`ss-size-row${isSelected ? ' selected' : ''}${!available ? ' oos' : ''}`}
                onClick={() => { if (!available) { openAvailModal(size); } else { handleSizeSelectInDrawer(size); } }}
              >
                <span className="ss-size-row-name">
                  {isSelected && <span className="ss-size-bullet">•&nbsp;</span>}
                  {size}
                </span>
                {!available && (
                  <div className="ss-size-oos-wrap">
                    <span className="ss-sold-out">Reserved</span>
                    <span className="ss-get-notified-hint">Request Availability</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="ss-size-drawer-footer">
          <button
            className="ss-size-add-btn"
            onClick={handleAddToBag}
            disabled={!selectedSize || adding || !isSizeAvailable(selectedSize)}
          >
            {adding ? 'Adding…' : 'Add to Selection'}
          </button>
        </div>
      </div>


      {/* ══ THE HOUSE ══ */}
      <section className="ss-philosophy">
        <div className="ss-philosophy-inner">
          <span className="ss-philosophy-eyebrow">The House</span>
          <p className="ss-philosophy-text">
            TONET was not built for the moment. It was constructed for permanence — for those who understand that true elegance is never loud, and that refinement requires no explanation.
          </p>
          <p className="ss-philosophy-text">
            Each garment belongs to a longer conversation between structure and silence, between the body and its architecture.
          </p>
          <span className="ss-philosophy-note">— House Notes, 2026</span>
        </div>
      </section>

      {/* ══ RECENTLY VIEWED ══ */}
      {recentlyViewed.length > 0 && (
        <section className="rec-section">
          <h2 className="rec-label">Previously Considered</h2>
          <div className="rec-carousel-wrap">
            <div className="rec-carousel" ref={recentCallbackRef}>
              <div style={{flexShrink: 0, width: 16, minWidth: 16}} />
              {recentlyViewed.map((p) => (
                <div className="rec-carousel-item" key={p.handle}>
                  <a href={`/product/${p.handle}`} className="rec-card" style={{textDecoration:'none',color:'inherit'}}>
                    <div className="rec-img-wrap">
                      {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="rec-img" />}
                    </div>
                    <div className="rec-meta">
                      <span className="rec-title">{p.title.charAt(0).toUpperCase() + p.title.slice(1).toLowerCase()}</span>
                      <span className="rec-price">
                        {(() => { const sym = p.currencyCode === 'USD' ? '$' : '€'; const n = p.price; return Number.isInteger(n) ? `${sym}${n} ${p.currencyCode}` : `${sym}${n.toFixed(2)} ${p.currencyCode}`; })()}
                      </span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── YOU MAY ALSO LIKE – carousel ── */}
      {recommended.length > 0 && (
        <section className="rec-section">
          <h2 className="rec-label">House Selection</h2>
          <div className="rec-carousel-wrap">
            <div
              className="rec-carousel"
              ref={ymalCallbackRef}
              onPointerDown={ymalPointerDown}
              onPointerMove={ymalPointerMove}
              onPointerUp={ymalPointerUp}
              onPointerCancel={ymalPointerUp}
              onClick={ymalCarouselClick}
            >
              <div style={{flexShrink: 0, width: 16, minWidth: 16}} />
              {[...completeOutfit, ...recommended.filter(r => !completeOutfit.some(o => o.handle === r.handle))].slice(0, 16).map((p) => (
                <div className="rec-carousel-item" key={p.handle}>
                  <RecommendedCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ AVAILABILITY REQUEST MODAL ══ */}
      {availModal && (
        <div className="arm-overlay" onClick={() => setAvailModal(false)}>
          <div className="arm-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="arm-header">
              <span className="arm-title">Availability Request</span>
              <button className="arm-close" onClick={() => setAvailModal(false)} aria-label="Close">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1">
                  <line x1="1" y1="1" x2="13" y2="13" />
                  <line x1="13" y1="1" x2="1" y2="13" />
                </svg>
              </button>
            </div>

            {availSubmitted ? (
              /* ── Success state ── */
              <div className="arm-success">
                <span className="arm-success-title">Request registered.</span>
                <p className="arm-success-sub">You will be contacted if availability changes.</p>
              </div>
            ) : (
              <form className="arm-body" onSubmit={handleAvailSubmit}>
                <p className="arm-desc">
                  Receive a notification when selected sizes become available again.
                </p>

                {/* Size selector */}
                <div className="arm-field-group">
                  <span className="arm-field-label">Select Size</span>
                  <div className="arm-sizes">
                    {allSizes.filter(s => !isSizeAvailable(s)).map(size => (
                      <button
                        key={size}
                        type="button"
                        className={`arm-size-pill${availSizes.includes(size) ? ' selected' : ''}`}
                        onClick={() => toggleAvailSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                    {allSizes.filter(s => !isSizeAvailable(s)).length === 0 && (
                      <span className="arm-no-sizes">All sizes currently available.</span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="arm-field">
                  <label className="arm-field-label" htmlFor="arm-email">Email</label>
                  <input
                    id="arm-email"
                    className="arm-input"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={availEmail}
                    onChange={e => setAvailEmail(e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div className="arm-field">
                  <label className="arm-field-label" htmlFor="arm-phone">
                    Phone <span className="arm-optional">(optional)</span>
                  </label>
                  <input
                    id="arm-phone"
                    className="arm-input"
                    type="tel"
                    placeholder="+34 600 000 000"
                    value={availPhone}
                    onChange={e => setAvailPhone(e.target.value)}
                  />
                </div>

                {/* CTA */}
                <button
                  className="arm-cta"
                  type="submit"
                  disabled={availSubmitting || availSizes.length === 0 || !availEmail}
                >
                  {availSubmitting ? 'Registering…' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══ SIZE GUIDE MODAL ══ */}
      {sizeGuideOpen && (
        <div className="sg-overlay" onClick={() => setSizeGuideOpen(false)}>
          <div className="sg-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sg-header">
              <span className="sg-title">Size Information</span>
              <button className="sg-close" onClick={() => setSizeGuideOpen(false)} aria-label="Close">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1">
                  <line x1="1" y1="1" x2="13" y2="13" />
                  <line x1="13" y1="1" x2="1" y2="13" />
                </svg>
              </button>
            </div>

            {/* Subtext */}
            <p className="sg-subtext">
              Measurements are approximate.<br />
              Designed for a relaxed silhouette.
            </p>

            {/* Size table */}
            <div className="sg-table">
              {([
                { size: 'XS', chest: 54, length: 66 },
                { size: 'S',  chest: 56, length: 68 },
                { size: 'M',  chest: 58, length: 70 },
                { size: 'L',  chest: 60, length: 72 },
                { size: 'XL', chest: 62, length: 74 },
              ] as const).map((row) => (
                <div className="sg-table-row" key={row.size}>
                  <span className="sg-size-label">{row.size}</span>
                  <span className="sg-measurement">Chest&nbsp;&nbsp;{row.chest} cm</span>
                  <span className="sg-measurement">Length&nbsp;&nbsp;{row.length} cm</span>
                </div>
              ))}
            </div>

            {/* Fit notes */}
            <div className="sg-fit-notes">
              <p className="sg-fit-note">Model is 183 cm wearing size L.</p>
              <p className="sg-fit-note">Fits oversized by design.</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ══════════════════════════════════════
           SUITSUPPLY-STYLE PRODUCT PAGE
        ══════════════════════════════════════ */

        html, body {
          background: #ffffff !important;
        }

        .ss-pdp-layout {
          display: flex;
          flex-direction: column;
          font-family: var(--font-primary);
          color: #111;
          background: #ffffff;
        }
        @media (min-width: 768px) {
          .ss-pdp-layout { background: unset; }
        }

        /* ── GALLERY ── */
        .ss-gallery {
          position: relative;
          background: #ffffff;
          overflow: hidden;
        }
        /* Mobile: show carousel, hide desktop stack */
        .ss-mobile-gallery { display: block; }
        .ss-desktop-gallery { display: none; }
        .ss-carousel {
          width: 100%;
          aspect-ratio: 3 / 4;
          display: flex;
          overflow: hidden;
          user-select: none;
          cursor: grab;
        }
        .ss-carousel:active { cursor: grabbing; }
        .ss-carousel-slide {
          width: 100%;
          flex-shrink: 0;
          aspect-ratio: 3 / 4;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          overflow: hidden;
        }
        .ss-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          pointer-events: none;
        }
        /* Dots */
        .ss-carousel-dots {
          position: absolute;
          bottom: 14px;
          left: 0; right: 0;
          display: flex;
          justify-content: center;
          gap: 14px;
          z-index: 5;
        }
        .ss-carousel-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: none;
          background: rgba(0,0,0,0.25);
          padding: 0;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .ss-carousel-dot.active {
          background: #111;
          transform: scale(1.3);
        }
        /* Arrow buttons */
        .ss-carousel-arrow {
          display: none;
        }

        /* ── INFO PANEL ── */
        .ss-info {
          padding: 24px 20px 28px 20px;
          background: #ffffff;
        }

        .ss-title {
          font-size: 12px;
          font-weight: 300;
          line-height: 1.4;
          margin: 0 0 8px 0;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          text-align: center;
          font-family: var(--font-primary);
        }
        /* Editorial subtext */
        .ss-editorial-subtext {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.32);
          text-align: center;
          margin: 0 0 30px 0;
          font-family: var(--font-primary);
        }
        .ss-price-row {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .ss-price {
          font-size: 10px;
          font-weight: 300;
          font-family: var(--font-primary);
          color: rgba(0,0,0,0.38);
          white-space: nowrap;
          letter-spacing: 0.12em;
        }
        .ss-subtitle {
          font-size: 10px;
          font-weight: 300;
          font-family: var(--font-primary);
          color: rgba(0,0,0,0.32);
          line-height: 1.5;
          letter-spacing: 0.04em;
        }

        /* Thumbnails */
        .ss-thumbs-wrap {
          position: relative;
          margin-bottom: 24px;
        }
        .ss-thumbs {
          display: flex;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          border: 1px solid rgba(0,0,0,0.08);
          width: fit-content;
          max-width: 100%;
        }
        .ss-thumbs::-webkit-scrollbar { display: none; }
        .ss-thumb {
          width: 56px;
          height: 72px;
          padding: 0;
          border: none;
          border-right: 1px solid rgba(0,0,0,0.06);
          border-radius: 0;
          cursor: pointer;
          background: #ffffff;
          flex-shrink: 0;
          box-sizing: border-box;
          overflow: hidden;
          transition: opacity 0.4s;
        }
        .ss-thumb:last-child { border-right: none; }
        .ss-thumb.active { box-shadow: inset 0 0 0 1.5px rgba(0,0,0,0.7); }
        .ss-thumb:hover:not(.active) { opacity: 0.6; }
        .ss-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .ss-thumbs-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          z-index: 2;
        }
        .ss-thumbs-arrow-left { left: -14px; }
        .ss-thumbs-arrow-right { right: -14px; }
        .ss-thumbs-arrow:hover { background: rgba(0,0,0,0.04); }

        /* Estimated delivery */
        .ss-delivery-estimate {
          font-size: 8px;
          font-family: var(--font-primary);
          font-weight: 300;
          color: rgba(0,0,0,0.2);
          margin: 40px 0 0;
          letter-spacing: 0.32em;
          text-align: center;
          text-transform: uppercase;
        }

        /* Description plain */
        .ss-desc-plain {
          font-size: 10px;
          font-family: var(--font-primary);
          font-weight: 300;
          color: rgba(0,0,0,0.32);
          line-height: 1.8;
          margin: 20px 0 0;
          letter-spacing: 0.05em;
        }

        /* Action row */
        .ss-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 0;
        }
        .ss-cta-btn {
          width: 100%;
          height: 48px;
          background: rgba(0,0,0,0.82);
          color: rgba(255,255,255,0.88);
          border: none;
          border-radius: 0;
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.45em;
          padding-right: 0.45em;
          cursor: pointer;
          transition: background 0.7s;
        }
        .ss-cta-btn:hover:not(:disabled) { background: rgba(0,0,0,0.96); }
        .ss-cta-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .ss-archive-btn {
          width: 100%;
          height: 42px;
          background: transparent;
          border: none;
          cursor: pointer;
          border-radius: 0;
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.38em;
          padding-right: 0.38em;
          color: rgba(0,0,0,0.28);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.5s;
        }
        .ss-archive-btn:hover { color: rgba(0,0,0,0.6); }
        .ss-archive-btn--in { color: rgba(0,0,0,0.5); }
        .ss-archive-toast {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 12px 0 0;
          animation: ss-toast-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes ss-toast-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ss-archive-toast-main {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.12em;
          color: rgba(0,0,0,0.5);
        }
        .ss-archive-toast-sub {
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: rgba(0,0,0,0.22);
        }

        /* ══ SIZE DRAWER ══ */
        .ss-size-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: min(100vw, 400px);
          background: #0d0d0d;
          border-left: 1px solid rgba(255,255,255,0.05);
          z-index: 1002;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.95s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), scale 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          transform-origin: right center;
          font-family: var(--font-primary);
          color: rgba(255,255,255,0.82);
        }
        .ss-size-drawer.open { transform: translateX(0); }
        .ss-size-drawer.dimmed {
          opacity: 0.3;
          scale: 0.995;
        }

        .ss-size-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
          gap: 12px;
        }
        .ss-size-drawer-title {
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.48);
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ss-size-header-right {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-shrink: 0;
        }
        .ss-size-guide {
          font-size: 7px;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          padding-right: 0.42em;
          color: rgba(255,255,255,0.18);
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-primary);
          font-weight: 300;
          transition: color 0.4s;
        }
        .ss-size-guide:hover { color: rgba(255,255,255,0.5); }
        .ss-size-close {
          background: none; border: none;
          cursor: pointer; color: rgba(255,255,255,0.28);
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; padding: 4px;
          transition: color 0.4s;
        }
        .ss-size-close:hover { color: rgba(255,255,255,0.75); }
        .ss-size-close svg { stroke: currentColor; }

        .ss-size-drawer-list {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .ss-size-drawer-list::-webkit-scrollbar { display: none; }

        .ss-size-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 32px;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          border-left: 2px solid transparent;
          background: none;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          box-sizing: border-box;
          transition: background 0.35s, border-left-color 0.35s, opacity 0.35s;
        }
        .ss-size-row:not(.oos):not(.selected):hover {
          background: rgba(255,255,255,0.025);
        }
        .ss-size-row.selected {
          border-left-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.03);
        }
        .ss-size-row.oos {
          cursor: pointer;
          opacity: 0.38;
        }
        .ss-size-row.oos:hover {
          opacity: 0.62;
          background: rgba(255,255,255,0.015);
        }
        .ss-size-row-name {
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.72);
          display: flex;
          align-items: center;
        }
        .ss-size-row.selected .ss-size-row-name { color: rgba(255,255,255,0.9); }
        .ss-size-bullet { color: rgba(255,255,255,0.72); }
        .ss-size-oos-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .ss-sold-out {
          font-size: 7px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          padding-right: 0.35em;
        }
        .ss-get-notified-hint {
          font-size: 7px;
          font-family: var(--font-primary);
          font-weight: 300;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          padding-right: 0.32em;
          transition: color 0.35s;
        }
        .ss-size-row.oos:hover .ss-get-notified-hint { color: rgba(255,255,255,0.55); }

        .ss-size-drawer-footer {
          flex-shrink: 0;
          padding: 20px 32px 28px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .ss-size-add-btn {
          display: block;
          width: 100%;
          background: rgba(255,255,255,0.88);
          color: #0d0d0d;
          border: none;
          padding: 17px;
          font-size: 9px;
          font-family: var(--font-primary);
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.38em;
          cursor: pointer;
          transition: background 0.5s;
        }
        .ss-size-add-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .ss-size-add-btn:not(:disabled):hover { background: rgba(255,255,255,1); }

        /* Delivery line */
        .ss-delivery {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 0;
          font-size: 10px;
          font-weight: 500;
          color: #444;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-bottom: 1px solid #e8e8e8;
          margin-bottom: 0;
        }

        /* Accordion sections */
        .ss-accordions {
          margin-top: 52px;
        }
        .ss-accordion-item {
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .ss-accordion-item:first-child {
          border-top: 1px solid rgba(0,0,0,0.07);
        }
        .ss-accordion-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px 0;
          background: none;
          border: none;
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          color: rgba(0,0,0,0.55);
          cursor: pointer;
          text-align: left;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          transition: color 0.4s;
        }
        .ss-accordion-header:focus { outline: none; }
        .ss-accordion-header:hover { color: rgba(0,0,0,0.9); opacity: 1; }
        .ss-accordion-icon {
          font-size: 18px;
          font-weight: 300;
          color: rgba(0,0,0,0.35);
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
          line-height: 1;
        }
        .ss-accordion-icon.open { transform: rotate(45deg); }
        .ss-accordion-body {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .ss-accordion-body.open {
          max-height: 600px;
        }
        .ss-accordion-body-inner {
          padding-bottom: 20px;
        }
        .ss-accordion-text {
          font-size: 11px;
          font-family: var(--font-primary);
          font-weight: 300;
          line-height: 1.9;
          color: rgba(0,0,0,0.42);
          margin: 0;
          letter-spacing: 0.04em;
        }

        /* Inline size buttons inside accordion */
        .ss-inline-sizes {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .ss-inline-size {
          padding: 10px 18px;
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.3em;
          border: 1px solid rgba(0,0,0,0.1);
          background: transparent;
          cursor: pointer;
          color: rgba(0,0,0,0.6);
          border-radius: 0;
          transition: all 0.4s;
        }
        .ss-inline-size:hover:not(.sold-out):not(.active) { border-color: rgba(0,0,0,0.4); color: rgba(0,0,0,0.9); }
        .ss-inline-size.active { background: rgba(0,0,0,0.85); color: rgba(255,255,255,0.9); border-color: transparent; }
        .ss-inline-size.sold-out { color: rgba(0,0,0,0.18); border-color: rgba(0,0,0,0.05); cursor: not-allowed; text-decoration: line-through; }

        /* ── MOBILE STICKY BAR (removed) ── */
        .ss-mobile-sticky {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          display: flex;
          height: 56px;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          background: #fff;
          border-top: 1px solid #e0e0e0;
          z-index: 200;
        }
        .ss-mobile-bookmark {
          width: 56px;
          height: 56px;
          border: none;
          border-right: 1px solid #e0e0e0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .ss-mobile-cta {
          flex: 1;
          height: 56px;
          background: #111;
          color: #fff;
          border: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
        }
        .ss-mobile-cta:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ══════════════════════════════════════
           DESKTOP: side-by-side layout
           Gallery = 52%, Info = 48%
        ══════════════════════════════════════ */
        @media (min-width: 768px) {
          .ss-pdp-layout {
            flex-direction: row;
            min-height: 100vh;
            background: #ffffff;
          }

          /* Desktop: hide mobile carousel, show stacked images */
          .ss-mobile-gallery { display: none; }
          .ss-desktop-gallery { display: block; }

          /* Gallery column */
          .ss-gallery {
            width: 52%;
            flex-shrink: 0;
            background: transparent;
            overflow: visible;
          }

          /* Each image block: full width, 3:4 */
          .ss-desktop-img-block {
            width: 100%;
            aspect-ratio: 3 / 4;
            background: #ffffff;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .ss-desktop-img-block .ss-gallery-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }

          /* Info panel: sticky on the right, from header to bottom */
          .ss-info {
            width: 48%;
            position: sticky;
            top: 60px;
            height: calc(100vh - 60px);
            overflow-y: auto;
            padding: 72px 72px;
            scrollbar-width: none;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            background: #ffffff;
          }
          .ss-info::-webkit-scrollbar { display: none; }

          .ss-mobile-sticky { display: none; }
        }

        @media (min-width: 1200px) {
          .ss-info {
            padding: 96px 96px;
          }
        }

        /* ── DESKTOP EDITORIAL ALIGNMENT ── */
        @media (min-width: 768px) {
          .ss-title,
          .ss-editorial-subtext,
          .ss-delivery-estimate { text-align: left; }
          .ss-price-row { justify-content: flex-start; }
          .ss-desc-plain { text-align: left; }
          .ss-actions { margin-top: 36px; }
          .ss-thumbs-wrap { margin-bottom: 28px; }
        }


        /* ── CAROUSEL IMAGE BLOCKS ── */
        .rec-img-wrap {
          background: #ffffff;
        }

        /* ── COMPLETE THE OUTFIT ── */
        .outfit-section {
          background: #ffffff;
        }
        .outfit-label {
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.14em;
        }

        /* ══ RECOMMENDED ══ */
        .rec-section {
          padding: 80px 0 100px;
          font-family: var(--font-primary);
          overflow: hidden;
        }
        .rec-label {
          font-size: 8px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.5em;
          color: rgba(0,0,0,0.32);
          margin: 0 0 44px;
          padding-left: 0;
          text-align: center;
        }
        .rec-carousel-wrap {
          overflow: hidden;
        }
        .rec-carousel {
          display: flex;
          flex-direction: row;
          gap: 0;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          cursor: grab;
          user-select: none;
          padding-left: 0;
          padding-bottom: 4px;
          scroll-padding-left: 16px;
          will-change: transform;
        }
        .rec-carousel:active { cursor: grabbing; }
        .rec-carousel.dragging { cursor: grabbing; }
        .rec-carousel.dragging * { pointer-events: none; user-select: none; }
        .rec-carousel::-webkit-scrollbar { display: none; }
        .rec-carousel { scrollbar-width: none; }
        .rec-carousel-item {
          flex: 0 0 calc(25% - 18px);
          min-width: calc(25% - 18px);
          scroll-snap-align: start;
          padding-right: 1px;
        }
        /* ══ THE HOUSE PHILOSOPHY ══ */
        .ss-philosophy {
          padding: 100px 32px;
          background: #0d0d0d;
          text-align: center;
        }
        .ss-philosophy-inner {
          max-width: 560px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
        }
        .ss-philosophy-eyebrow {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          font-family: var(--font-primary);
        }
        .ss-philosophy-text {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.9;
          letter-spacing: 0.03em;
          color: rgba(255,255,255,0.48);
          font-family: var(--font-primary);
          margin: 0;
        }
        .ss-philosophy-note {
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.16);
          font-family: var(--font-primary);
        }

        /* ══ MOBILE IMAGE GRID ══ */
        .ss-mobile-img-grid {
          display: none;
        }
        @media (max-width: 767px) {
          .ss-mobile-img-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            background: #ffffff;
            padding: 0 20px 120px 20px;
          }
          .ss-mobile-img-cell {
            aspect-ratio: 3 / 4;
            overflow: hidden;
            background: #ffffff;
          }
          .ss-mobile-img-cell img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
        }

        @media (max-width: 767px) {
          html, body { background: #ffffff !important; }
          .ss-gallery,
          .ss-gallery-item,
          .ss-info,
          .outfit-section,
          .ss-mobile-img-cell { background: #ffffff !important; }
          .rec-section { background: #ffffff !important; padding: 60px 0 80px; }
          .ss-philosophy { padding: 80px 24px; }
          .ss-philosophy-text { font-size: 12px; }
          .rec-carousel { padding-left: 0; }
          .rec-carousel-item {
            flex: 0 0 83.333vw;
            min-width: 83.333vw;
          }
        }
        /* ══ AVAILABILITY REQUEST MODAL ══ */
        .arm-overlay {
          position: fixed;
          inset: 0;
          z-index: 5000;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 24px;
          animation: modal-fade-in 350ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes modal-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .arm-modal {
          background: linear-gradient(
            180deg,
            rgba(12,12,12,0.98) 0%,
            rgba(7,7,7,0.99) 100%
          );
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 0;
          width: 100%;
          max-width: 440px;
          padding: 40px 36px;
          box-sizing: border-box;
          margin-top: 18vh;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.02),
            0 40px 120px rgba(0,0,0,0.65);
          animation: modal-slide-in 350ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes modal-slide-in {
          from { opacity: 0; transform: translateY(10px) scale(0.985); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0) scale(1);   filter: blur(0); }
        }
        .arm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .arm-title {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          padding-right: 0.5em;
          color: rgba(255,255,255,0.55);
        }
        .arm-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #fff;
          opacity: 0.35;
          display: flex;
          align-items: center;
          padding: 6px;
          transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .arm-close:hover { opacity: 0.7; }
        .arm-desc {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          line-height: 1.7;
          letter-spacing: 0.01em;
          color: rgba(255,255,255,0.24);
          margin: 0 0 32px 0;
        }
        .arm-field-group {
          margin-bottom: 32px;
        }
        .arm-field {
          margin-bottom: 28px;
        }
        .arm-field-label {
          display: block;
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          padding-right: 0.42em;
          color: rgba(255,255,255,0.22);
          margin-bottom: 14px;
        }
        .arm-optional {
          letter-spacing: 0;
          text-transform: none;
          font-size: 9px;
          color: rgba(255,255,255,0.14);
        }
        .arm-sizes {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .arm-size-pill {
          padding: 9px 18px;
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.3em;
          padding-right: calc(18px + 0.3em);
          border: 1px solid rgba(255,255,255,0.14);
          background: transparent;
          color: rgba(255,255,255,0.38);
          border-radius: 0;
          cursor: pointer;
          transition: border-color 0.22s, background 0.22s, color 0.22s;
        }
        .arm-size-pill:hover {
          border-color: rgba(255,255,255,0.35);
          color: rgba(255,255,255,0.65);
        }
        .arm-size-pill.selected {
          border-color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.88);
        }
        .arm-no-sizes {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.04em;
        }
        .arm-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding: 0 0 10px 0;
          font-family: var(--font-primary);
          font-size: 12px;
          font-weight: 300;
          color: rgba(255,255,255,0.7);
          outline: none;
          letter-spacing: 0.02em;
          transition: border-color 0.3s;
          box-sizing: border-box;
        }
        .arm-input::placeholder { color: rgba(255,255,255,0.18); }
        .arm-input:focus { border-bottom-color: rgba(255,255,255,0.38); }
        .arm-cta {
          width: 100%;
          height: 48px;
          margin-top: 36px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.65);
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.45em;
          padding-right: 0.45em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 0;
          transition: background 0.5s, color 0.5s, border-color 0.5s;
        }
        .arm-cta:hover:not(:disabled) {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.5);
          color: rgba(255,255,255,0.9);
        }
        .arm-cta:disabled { opacity: 0.28; cursor: not-allowed; }
        .arm-success {
          text-align: center;
          padding: 24px 0 8px;
          animation: arm-success-appear 350ms cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes arm-success-appear {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .arm-success-title {
          display: block;
          font-family: var(--font-brand);
          font-size: 22px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.65);
          margin-bottom: 18px;
        }
        .arm-success-sub {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.06em;
          line-height: 1.9;
          color: rgba(255,255,255,0.22);
          margin: 0;
        }

        /* ══ SIZE GUIDE MODAL ══ */
        .sg-overlay {
          position: fixed;
          inset: 0;
          z-index: 5000;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 24px;
          animation: modal-fade-in 350ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .sg-modal {
          background: linear-gradient(
            180deg,
            rgba(12,12,12,0.98) 0%,
            rgba(7,7,7,0.99) 100%
          );
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 0;
          width: 100%;
          max-width: 440px;
          padding: 40px 36px;
          box-sizing: border-box;
          margin-top: 18vh;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.02),
            0 40px 120px rgba(0,0,0,0.65);
          animation: modal-slide-in 350ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .sg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .sg-title {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          padding-right: 0.5em;
          color: rgba(255,255,255,0.55);
        }
        .sg-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #fff;
          opacity: 0.35;
          display: flex;
          align-items: center;
          padding: 6px;
          transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sg-close:hover { opacity: 0.7; }
        .sg-subtext {
          font-family: var(--font-primary);
          font-size: 10px;
          font-weight: 300;
          line-height: 1.7;
          letter-spacing: 0.01em;
          color: rgba(255,255,255,0.24);
          margin: 0 0 32px 0;
        }
        .sg-table {
          display: flex;
          flex-direction: column;
        }
        .sg-table-row {
          display: grid;
          grid-template-columns: 44px 1fr 1fr;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.035);
          gap: 12px;
        }
        .sg-table-row:first-child {
          border-top: 1px solid rgba(255,255,255,0.035);
        }
        .sg-size-label {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          padding-right: 0.38em;
        }
        .sg-measurement {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.28);
        }
        .sg-fit-notes {
          margin-top: 32px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sg-fit-note {
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.18);
          margin: 0;
          font-style: italic;
        }
        @media (max-width: 767px) {
          .arm-overlay, .sg-overlay {
            align-items: flex-end;
            padding: 0;
          }
          .arm-modal, .sg-modal {
            margin-top: 0;
            border-radius: 24px 24px 0 0;
            max-width: 100%;
            width: 100%;
            padding: 32px 24px 48px;
            animation: modal-slide-up 350ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
        }
        @keyframes modal-slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
