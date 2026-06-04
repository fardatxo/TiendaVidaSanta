"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
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

function TranslatedDesc({ text, className }: { text?: string | null; className?: string }) {
  const translated = useTranslatedText(text);
  if (!translated) return null;
  return <p className={className}>{translated}</p>;
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
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [availModal, setAvailModal] = useState(false);
  const [availSizes, setAvailSizes] = useState<string[]>([]);
  const [availEmail, setAvailEmail] = useState('');
  const [availPhone, setAvailPhone] = useState('');
  const [availSubmitted, setAvailSubmitted] = useState(false);
  const [availSubmitting, setAvailSubmitting] = useState(false);
  const [ceremonyOpen, setCeremonyOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { t } = useTranslation();
  useLocale();
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

  function getDeliveryEstimate(): string {
    const today = new Date();
    const addBusinessDays = (date: Date, days: number): Date => {
      const result = new Date(date);
      let added = 0;
      while (added < days) {
        result.setDate(result.getDate() + 1);
        const day = result.getDay();
        if (day !== 0 && day !== 6) added++;
      }
      return result;
    };
    const start = addBusinessDays(today, 2);
    const end = addBusinessDays(today, 4);
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${fmt(start)} — ${fmt(end)}`;
  }

  const metadata = useMemo(() => parseMetadata(product.description), [product.description]);

  const editorialNotes = useMemo(() => {
    const notes = [
      "An archival piece designed for daily calm.",
      "A tonet shaped by silence.",
      "A quiet layer preserved within the House.",
      "A structured piece designed for daily permanence.",
      "A restrained tonet for permanent rotation.",
      "A daily layer composed with quiet intention.",
      "Crafted for permanence, worn with intention.",
      "A silhouette born from restraint."
    ];
    let hash = 0;
    for (let i = 0; i < product.title.length; i++) {
      hash = ((hash * 31) + product.title.charCodeAt(i)) >>> 0;
    }
    const idx = hash % notes.length;
    return [
      notes[idx % notes.length],
      notes[(idx + 1) % notes.length],
      notes[(idx + 3) % notes.length]
    ];
  }, [product.title]);

  const conciseDescription = useMemo(() => {
    if (!product.description) return '';
    const fabric = (metadata['Fabric'] || 'premium fibers').replace(/,\s*$/, '');
    const thickness = (metadata['Fabric Thickness'] || 'moderate').toLowerCase();
    const features = (metadata['Features'] || '').split(',').map(f => f.trim().toLowerCase());
    const fit = features.find(f => ['loose', 'oversized', 'regular', 'slim', 'boxy'].includes(f)) || 'relaxed';
    return `Crafted from ${fabric}. A ${thickness} weave with a ${fit} silhouette — designed for permanence.`;
  }, [product.description, metadata]);

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
    const finishValue = foundFinish.length > 0 ? foundFinish.join(' / ') : 'Soft tonet wash';

    const rawFabric = metadata['Fabric'] || '';
    const formattedFabric = rawFabric ? rawFabric.replace(/,\s*/g, ' / ') : '';

    return [
      { label: 'Fabric', value: formattedFabric },
      { label: 'Weight', value: metadata['Fabric Weight'] || '240 GSM' },
      { label: 'Fit', value: fitValue },
      { label: 'Finish', value: finishValue },
      { label: 'Production', value: 'Limited tonet production' }
    ].filter(r => r.value);
  }, [metadata]);

  const careLines = useMemo(() => {
    const careStr = metadata['Care Instructions'] || '';
    if (!careStr) return ['Dry clean only'];
    return careStr.split(';').map(l => l.trim()).filter(Boolean);
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
    if (needsSizeSelection) return;
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
      const targetIdx = idx >= 0 ? idx : 0;
      setActiveImage(targetIdx);
      
      // Keep mobile carousel in sync
      if (carouselRef.current) {
        const slideWidth = carouselRef.current.offsetWidth || window.innerWidth;
        carouselRef.current.scrollTo({
          left: targetIdx * slideWidth,
          behavior: 'smooth'
        });
      }
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

  const descriptionFirstLine = product.description?.split(/[.\n]/)[0]?.trim() || '';

  const gridImages = images.length > 0
    ? Array.from({ length: 4 }, (_, i) => images[i % images.length])
    : [];

  return (
    <>
      <div className="ss-pdp-layout product-page">
        {/* ── GALLERY ── */}
        <div className="ss-gallery product-hero">
          {/* Mobile: horizontal carousel */}
          <div className="ss-mobile-gallery mobile-hero">
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
        <div className="ss-info mobile-product-info" ref={infoRef}>
          <div className="product-info-column">
            {/* Title */}
            <h1 className="ss-title">{product.title}</h1>

          {/* Editorial Notes */}
          <div className="ss-editorial-subtext">
            {editorialNotes.map((note, i) => (
              <span key={i} style={{ display: 'block', marginBottom: i < editorialNotes.length - 1 ? 6 : 0 }}>{note}</span>
            ))}
          </div>

          {/* Price + selected shade metadata */}
          <div className="ss-price-row">
            <span className="ss-price">{priceFormatted}</span>
            {selectedColor && (
              <span className="ss-selected-shade-metadata">
                <span className="ss-metadata-swatch" style={{ background: colorNameToCSS(selectedColor) }} />
                <span className="ss-metadata-name">{selectedColor}</span>
              </span>
            )}
            <span className="ss-minimal-metadata">— {getArchiveRef(product.handle)}</span>
          </div>

          {/* Refined color/shade selection system */}
          {colorOptions.length > 1 && (
            <div className="ss-shade-section">
              <span className="ss-shade-label">TONET SHADE</span>
              <div className="ss-shade-grid">
                {colorOptions.map((co) => {
                  const isSelected = selectedColor === co.value;
                  return (
                    <button
                      key={co.value}
                      className={`ss-shade-option ${isSelected ? 'active' : ''}`}
                      onClick={() => handleColorChange(co.value)}
                      aria-label={`Select shade ${co.value}`}
                      aria-pressed={isSelected}
                    >
                      <span className="ss-shade-swatch" style={{ background: colorNameToCSS(co.value) }} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Select Size Grid */}
          {hasSizes && (
            <div className="ss-sizes-select-area mobile-inline-sizes">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span className="ss-shade-label">SELECT SIZE</span>
                <button
                  type="button"
                  className="ss-size-guide-link"
                  onClick={() => setSizeGuideOpen(true)}
                  aria-label="Open size guide"
                >
                  Sizing
                </button>
              </div>
              <div className="ss-inline-sizes">
                {sizeOptions.map((size) => {
                  const isSelected = selectedSize === size;
                  const variantForSize = findVariant(selectedColor, size);
                  const isOutOfStock = variantForSize ? !variantForSize.availableForSale : true;
                  return (
                    <button
                      key={size}
                      className={`ss-inline-size ${isSelected ? 'active' : ''} ${isOutOfStock ? 'sold-out' : ''}`}
                      onClick={() => {
                        if (isOutOfStock) {
                          openAvailModal(size);
                        } else {
                          handleSizeSelectInDrawer(size);
                        }
                      }}
                      aria-label={isOutOfStock ? `Request size ${size} availability` : `Select size ${size}`}
                      aria-pressed={isSelected}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action row */}
          <div className="ss-actions">
            <button
              className="ss-cta-btn"
              onClick={handleAddToBag}
              disabled={adding || !selectedVariant.availableForSale || needsSizeSelection}
            >
              {adding
                ? 'ADDING…'
                : !selectedVariant.availableForSale
                ? 'UNAVAILABLE'
                : needsSizeSelection
                ? (isGiftCard ? 'SELECT AMOUNT' : 'SELECT A SIZE')
                : 'ADD TO SELECTION'}
            </button>
            <button
              className={`ss-archive-btn${inWishlist ? ' ss-archive-btn--in' : ''}`}
              onClick={() => {
                toggle(wishlistItem);
                if (!inWishlist) {
                  setCeremonyOpen(true);
                }
              }}
            >
              {inWishlist ? 'ARCHIVED · 48H' : 'ADD TO ARCHIVE'}
            </button>
          </div>

          {/* Accordion sections */}
          <div className="ss-accordions mobile-accordions">
            {/* Description */}
            {product.description && (
              <div className="ss-accordion-item">
                <button className="ss-accordion-header" onClick={() => toggleAccordion('notes')} aria-expanded={expandedAccordion === 'notes'}>
                  <span>Description</span>
                  <span className={`ss-accordion-icon${expandedAccordion === 'notes' ? ' open' : ''}`}>
                    <Plus size={10} strokeWidth={1} />
                  </span>
                </button>
                <div className={`ss-accordion-body${expandedAccordion === 'notes' ? ' open' : ''}`}>
                  <div className="ss-accordion-body-inner">
                    <p className="ss-accordion-text">{conciseDescription}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TONET RECORD */}
            {detailsRows.length > 0 && (
              <div className="ss-accordion-item">
                <button className="ss-accordion-header" onClick={() => toggleAccordion('record')} aria-expanded={expandedAccordion === 'record'}>
                  <span>TONET RECORD</span>
                  <span className={`ss-accordion-icon${expandedAccordion === 'record' ? ' open' : ''}`}>
                    <Plus size={10} strokeWidth={1} />
                  </span>
                </button>
                <div className={`ss-accordion-body${expandedAccordion === 'record' ? ' open' : ''}`}>
                  <div className="ss-accordion-body-inner">
                    <div className="ss-details-table" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {detailsRows.map((row, idx) => (
                        <div key={idx} className="ss-details-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="ss-details-label" style={{ fontWeight: 400, textTransform: 'uppercase', fontSize: '8px', letterSpacing: '0.25em', color: 'rgba(0, 0, 0, 0.45)' }}>{row.label}</span>
                          <span className="ss-details-value" style={{ fontWeight: 300, fontSize: '10px', color: 'rgba(0, 0, 0, 0.7)', letterSpacing: '0.05em' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CARE */}
            {careLines.length > 0 && (
              <div className="ss-accordion-item">
                <button className="ss-accordion-header" onClick={() => toggleAccordion('care')} aria-expanded={expandedAccordion === 'care'}>
                  <span>CARE</span>
                  <span className={`ss-accordion-icon${expandedAccordion === 'care' ? ' open' : ''}`}>
                    <Plus size={10} strokeWidth={1} />
                  </span>
                </button>
                <div className={`ss-accordion-body${expandedAccordion === 'care' ? ' open' : ''}`}>
                  <div className="ss-accordion-body-inner">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {careLines.map((line, idx) => (
                        <span key={idx} className="ss-accordion-text ss-care-line">
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery & Returns */}
            <div className="ss-accordion-item">
              <button className="ss-accordion-header" onClick={() => toggleAccordion('policy')} aria-expanded={expandedAccordion === 'policy'}>
                <span>Delivery & Returns</span>
                <span className={`ss-accordion-icon${expandedAccordion === 'policy' ? ' open' : ''}`}>
                  <Plus size={10} strokeWidth={1} />
                </span>
              </button>
              <div className={`ss-accordion-body${expandedAccordion === 'policy' ? ' open' : ''}`}>
                <div className="ss-accordion-body-inner">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="ss-details-label" style={{ fontWeight: 400, textTransform: 'uppercase', fontSize: '8px', letterSpacing: '0.25em', color: 'rgba(0, 0, 0, 0.45)' }}>DELIVERY</span>
                      <span className="ss-accordion-text" style={{ fontSize: '10px', color: 'rgba(0, 0, 0, 0.7)' }}>
                        Free standard delivery on all selections. Prepared with care inside our Parisian studio. Estimated arrival {getDeliveryEstimate()}.
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="ss-details-label" style={{ fontWeight: 400, textTransform: 'uppercase', fontSize: '8px', letterSpacing: '0.25em', color: 'rgba(0, 0, 0, 0.45)' }}>RETURNS</span>
                      <span className="ss-accordion-text" style={{ fontSize: '10px', color: 'rgba(0, 0, 0, 0.7)' }}>
                        Complimentary returns within 14 days of receipt. Tonets must remain in their original, unworn state with archival labels intact.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
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
            Each tonet belongs to a longer conversation between structure and silence, between the body and its architecture.
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

      {/* ══ CINEMATIC ARCHIVAL CEREMONY MODAL ══ */}
      {ceremonyOpen && (
        <div className="ac-overlay" onClick={() => setCeremonyOpen(false)}>
          <div className="ac-modal" onClick={e => e.stopPropagation()}>
            {/* Minimal Close button top right */}
            <button className="ac-close" onClick={() => setCeremonyOpen(false)} aria-label="Close Ceremony">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1">
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>

            {/* Institutional Header */}
            <div className="ac-header">
              <span className="ac-supra">ARCHIVE RECORD</span>
              <h2 className="ac-title">Archive Entry Created</h2>
              <p className="ac-desc">
                This tonet has been preserved within your private archive and will remain accessible while availability permits.
              </p>
            </div>

            {/* Main Split Content: TONET Data + Visual Layout */}
            <div className="ac-split">
              {/* Left: Curated Large TONET Image */}
              <div className="ac-image-panel">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.title} className="ac-tonet-img" />
                )}
              </div>

              {/* Right: Technical Archival Details */}
              <div className="ac-details-panel">
                <div className="ac-tech-grid">
                  <div className="ac-tech-item">
                    <span className="ac-tech-label">TONET Name</span>
                    <span className="ac-tech-value ac-tech-value--name">{product.title.toUpperCase()}</span>
                  </div>

                  <div className="ac-tech-item">
                    <span className="ac-tech-label">Collection</span>
                    <span className="ac-tech-value">{getHouseState(product.handle)}</span>
                  </div>

                  <div className="ac-tech-item">
                    <span className="ac-tech-label">Archive Reference</span>
                    <span className="ac-tech-value ac-tech-value--ref">{getArchiveRef(product.handle)}</span>
                  </div>

                  <div className="ac-tech-item">
                    <span className="ac-tech-label">Date Preserved</span>
                    <span className="ac-tech-value">
                      {new Date().toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }).toUpperCase()}
                    </span>
                  </div>

                  <div className="ac-tech-item">
                    <span className="ac-tech-label">Archive Position</span>
                    <span className="ac-tech-value">
                      Position {items.findIndex(i => i.handle === product.handle) + 1 > 0 ? items.findIndex(i => i.handle === product.handle) + 1 : items.length + 1} of {Math.max(items.length, items.findIndex(i => i.handle === product.handle) + 1)}
                    </span>
                  </div>

                  <div className="ac-tech-item">
                    <span className="ac-tech-label">Collection Status</span>
                    <span className="ac-tech-value">
                      {product.variants.some(v => v.availableForSale) ? 'ACTIVE COLLECTION' : 'PERMANENT ARCHIVE'}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="ac-divider" />

                {/* Availability Section */}
                <div className="ac-avail-section">
                  <span className="ac-section-label">Archive Availability</span>
                  <p className="ac-avail-desc">
                    This tonet remains temporarily preserved inside the House for private consideration.
                  </p>

                  <div className="ac-avail-status-block">
                    <div className="ac-status-row">
                      <span className="ac-status-label">Availability State</span>
                      <span className={`ac-status-value ${!product.variants.some(v => v.availableForSale) ? 'ac-status-value--closed' : ''}`}>
                        {product.variants.some(v => v.availableForSale) ? 'AVAILABLE' : 'PERMANENTLY ARCHIVED'}
                      </span>
                    </div>

                    <div className="ac-status-row">
                      <span className="ac-status-label">Estimated Window</span>
                      <span className="ac-status-value">
                        {product.variants.some(v => v.availableForSale) ? '48H ACTIVE PRESERVATION' : 'PERMANENTLY RETAINED'}
                      </span>
                    </div>

                    {product.variants.some(v => v.availableForSale) ? (
                      <div className="ac-timeline-wrap">
                        <span className="ac-timeline-label">PRESERVATION STATUS · ACTIVE 48H WINDOW</span>
                        <div className="ac-active-bar-container">
                          <div className="ac-active-bar-fill" />
                        </div>
                        <div className="ac-timeline-footer">
                          <span>Preserved</span>
                          <span>Auto-Release in 48h</span>
                        </div>
                      </div>
                    ) : (
                      <div className="ac-timeline-wrap">
                        <span className="ac-timeline-label">PRESERVATION STATUS · PERMANENT ARCHIVE</span>
                        <div className="ac-active-bar-container ac-active-bar-container--permanent">
                          <div className="ac-active-bar-fill ac-active-bar-fill--permanent" />
                        </div>
                        <div className="ac-timeline-footer">
                          <span>Historical Record Only</span>
                          <span>Acquisition Inactive</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="ac-divider" />

                {/* House Notes Section */}
                <div className="ac-notes-section">
                  <span className="ac-section-label">House Notes</span>
                  <p className="ac-notes-text">
                    Archived tonets remain accessible for future consideration. Availability is not guaranteed and may change as pieces enter permanent archive status.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="ac-actions">
              <Link href="/archive" className="ac-btn-primary">
                View Archive
              </Link>
              <button className="ac-btn-secondary" onClick={() => setCeremonyOpen(false)}>
                Continue Through The House
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ══════════════════════════════════════
           CINEMATIC ARCHIVAL CEREMONY MODAL
        ══════════════════════════════════════ */

        .ac-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(12, 12, 12, 0.93); /* overlay background remaining 90-95% */
          backdrop-filter: blur(12px); /* soft blur on background */
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          opacity: 0;
          animation: ac-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .ac-modal {
          background: #111111;
          border: 1px solid rgba(243, 240, 234, 0.08);
          width: 100%;
          max-width: 820px;
          padding: 48px;
          position: relative;
          color: rgba(255, 255, 255, 0.85);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          gap: 32px;
          box-sizing: border-box;
          opacity: 0;
          transform: translateY(16px);
          animation: ac-slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; /* cinematic fade + translateY */
        }

        .ac-close {
          position: absolute;
          top: 28px;
          right: 28px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          padding: 8px;
          transition: color 0.4s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ac-close:hover {
          color: #ffffff;
        }

        .ac-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-bottom: 1px solid rgba(243, 240, 234, 0.05);
          padding-bottom: 24px;
          opacity: 0;
          animation: ac-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.12s forwards; /* sequential fade */
        }

        .ac-supra {
          font-size: 7px;
          font-weight: 300;
          letter-spacing: 0.4em;
          color: rgba(255, 255, 255, 0.35);
          text-transform: uppercase;
        }

        .ac-title {
          font-family: var(--font-brand);
          font-size: clamp(18px, 3vw, 24px); /* prominent but refined */
          font-weight: 300;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
        }

        .ac-desc {
          font-size: 9.5px; /* small, muted editorial tone */
          font-weight: 300;
          letter-spacing: 0.06em;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.35);
          margin: 0;
          max-width: 600px;
        }

        .ac-split {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 48px;
          align-items: start;
        }

        .ac-image-panel {
          aspect-ratio: 3 / 4;
          background: rgba(255, 255, 255, 0.015);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid rgba(243, 240, 234, 0.04);
          opacity: 0;
          transform: scale(0.97);
          animation: ac-img-fade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.48s forwards; /* tonet image appears last */
        }

        .ac-tonet-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: grayscale(0.15);
          transition: filter 0.5s;
        }
        .ac-tonet-img:hover {
          filter: grayscale(0);
        }

        .ac-details-panel {
          display: flex;
          flex-direction: column;
          gap: 24px;
          opacity: 0;
          animation: ac-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.24s forwards; /* sequential fade */
        }

        .ac-tech-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px 24px;
        }

        .ac-tech-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ac-tech-label {
          font-size: 7px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.3em; /* high letter spacing */
          color: rgba(255, 255, 255, 0.25);
        }

        .ac-tech-value {
          font-size: 9.5px; /* thin typography */
          font-weight: 300;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.65);
        }
        .ac-tech-value--name {
          font-family: var(--font-brand);
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.8);
        }
        .ac-tech-value--ref {
          font-family: monospace;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.5);
        }

        .ac-divider {
          height: 1px;
          background: rgba(243, 240, 234, 0.05);
        }

        .ac-section-label {
          font-size: 7px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.35);
          display: block;
          margin-bottom: 8px;
        }

        .ac-avail-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ac-avail-desc {
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.06em;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.35);
          margin: 0;
        }

        .ac-avail-status-block {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(243, 240, 234, 0.03);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }

        .ac-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(243, 240, 234, 0.03);
          padding-bottom: 8px;
        }
        .ac-status-row:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
        }

        .ac-status-label {
          font-size: 7px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.3);
        }

        .ac-status-value {
          font-size: 8px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.7);
        }
        .ac-status-value--closed {
          color: rgba(255, 255, 255, 0.35); /* quiet monochromatic gray (no red alerts or retail colors) */
        }

        .ac-timeline-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }

        .ac-timeline-label {
          font-size: 7px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.25);
        }

        /* Monochromatic thin Visual Timeline Bar */
        .ac-active-bar-container {
          width: 100%;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          position: relative;
          margin: 6px 0;
        }
        .ac-active-bar-fill {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 65%;
          background: rgba(255, 255, 255, 0.35);
        }
        .ac-active-bar-container--permanent {
          background: rgba(255, 255, 255, 0.03);
        }
        .ac-active-bar-fill--permanent {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
        }

        .ac-timeline-footer {
          display: flex;
          justify-content: space-between;
          font-size: 6.5px;
          font-weight: 300;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.2);
          text-transform: uppercase;
        }

        .ac-notes-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ac-notes-text {
          font-size: 8.5px; /* clearly separated, highly subtle house notes */
          font-weight: 300;
          letter-spacing: 0.06em;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.28);
          margin: 0;
        }

        .ac-actions {
          display: flex;
          gap: 16px;
          border-top: 1px solid rgba(243, 240, 234, 0.05);
          padding-top: 24px;
          margin-top: 12px;
          opacity: 0;
          animation: ac-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.36s forwards; /* sequential fade */
        }

        .ac-btn-primary {
          flex: 1;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15); /* restrained primary border */
          text-align: center;
          text-decoration: none;
          padding: 14px;
          font-size: 9px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: border-color 0.8s cubic-bezier(0.16, 1, 0.3, 1), color 0.8s cubic-bezier(0.16, 1, 0.3, 1), background 0.8s cubic-bezier(0.16, 1, 0.3, 1); /* slow and atmospheric */
        }
        .ac-btn-primary:hover {
          border-color: rgba(255, 255, 255, 0.45);
          color: #ffffff;
          background: rgba(255, 255, 255, 0.015);
        }

        .ac-btn-secondary {
          flex: 1.2;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.05); /* restrained secondary border */
          padding: 14px;
          font-size: 9px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(255, 255, 255, 0.35);
          cursor: pointer;
          transition: border-color 0.8s cubic-bezier(0.16, 1, 0.3, 1), color 0.8s cubic-bezier(0.16, 1, 0.3, 1), background 0.8s cubic-bezier(0.16, 1, 0.3, 1); /* slow and atmospheric */
        }
        .ac-btn-secondary:hover {
          border-color: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.005);
        }

        /* ── ANIMATIONS ── */
        @keyframes ac-fade-in {
          to {
            opacity: 1;
          }
        }

        @keyframes ac-slide-up {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ac-img-fade {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 767px) {
          .ac-modal {
            padding: 24px;
            gap: 20px;
            overflow-y: auto;
            max-height: 90vh;
            margin: 16px;
          }
          .ac-split {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .ac-image-panel {
            max-width: 140px;
            margin: 0 auto;
          }
          .ac-actions {
            flex-direction: column;
            gap: 10px;
          }
        }

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
          background: #ffffff;
        }
        .product-info-column {
          padding: 24px 20px 28px 20px;
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
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 22px; /* reduced vertical gap (from 28px) */
        }
        .ss-price {
          font-size: 10px;
          font-weight: 300;
          font-family: var(--font-primary);
          color: rgba(0,0,0,0.38);
          white-space: nowrap;
          letter-spacing: 0.12em;
        }
        .ss-selected-shade-metadata {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .ss-metadata-swatch {
          width: 8px;
          height: 8px;
          display: inline-block;
          flex-shrink: 0;
          border: 1px solid rgba(0, 0, 0, 0.15);
        }
        .ss-metadata-name {
          font-size: 10px;
          font-weight: 300;
          font-family: var(--font-primary);
          color: rgba(0, 0, 0, 0.38);
          text-transform: capitalize;
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

        /* Refined Shade Selection */
        .ss-shade-section {
          margin-top: 18px; /* reduced vertical gap (from 24px) */
          margin-bottom: 40px;
          font-family: var(--font-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @media (min-width: 768px) {
          .ss-shade-section {
            align-items: flex-start;
          }
        }
        .ss-shade-label {
          display: block;
          font-size: 8px; /* technical, extremely precise size */
          font-weight: 400;
          letter-spacing: 0.42em; /* wider technical letter tracking */
          color: rgba(0, 0, 0, 0.48); /* slightly more authoritative metadata tone */
          text-transform: uppercase;
          margin-bottom: 18px; /* intentional spacing to list */
        }
        .ss-shade-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }
        @media (min-width: 768px) {
          .ss-shade-list {
            align-items: flex-start;
          }
        }
        .ss-shade-option {
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          border: none;
          padding: 10px 0; /* generous tap-targets for mobile consistency */
          cursor: pointer;
          text-align: left;
          opacity: 0.45; /* increased opacity from 0.35 (+10% visibility) */
          transition: opacity 0.25s ease;
          width: fit-content;
        }
        .ss-shade-option:hover {
          opacity: 0.85;
        }
        .ss-shade-option.active {
          opacity: 1;
        }
        .ss-shade-swatch {
          width: 8px; /* precise metadata-aligned 8px swatch */
          height: 8px;
          display: inline-block;
          flex-shrink: 0;
          border: 1px solid rgba(0, 0, 0, 0.15);
          transition: border-color 0.25s ease;
        }
        .ss-shade-option.active .ss-shade-swatch {
          border-color: rgba(0, 0, 0, 0.8);
        }
        .ss-shade-name {
          font-size: 9.5px; /* microtypography rhythm adjustment */
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.7); /* restrained secondary contrast */
          display: inline-flex;
          align-items: center;
          transition: color 0.25s ease, font-weight 0.25s ease;
        }
        .ss-shade-option.active .ss-shade-name {
          font-weight: 400; /* subtle weight shift */
          color: #111111; /* full contrast when active */
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-thickness: 1px;
        }
        .ss-shade-selected-tag {
          font-size: 7.5px; /* micro miniature size */
          letter-spacing: 0.18em;
          color: rgba(0, 0, 0, 0.22); /* extremely restrained, quiet selected word */
          margin-left: 12px;
          font-weight: 300;
        }

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
            overflow: hidden;
            padding: 0;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            background: #ffffff;
          }
          .product-info-column {
            padding: 72px;
            max-height: calc(100vh - 60px);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .product-info-column::-webkit-scrollbar {
            display: none;
          }

          .ss-mobile-sticky { display: none; }
        }

        @media (min-width: 1200px) {
          .product-info-column {
            padding: 96px;
          }
        }

        /* ── DESKTOP EDITORIAL ALIGNMENT ── */
        @media (min-width: 768px) {
          .ss-title,
          .ss-editorial-subtext { text-align: left; }
          .ss-price-row { justify-content: flex-start; }
          .ss-actions { margin-top: 36px; }
          .ss-shade-section { margin-bottom: 36px; }
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
        .ss-shade-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          width: 100%;
          margin-top: 12px;
        }
        @media (max-width: 767px) {
          .ss-shade-grid {
            justify-content: center;
          }
        }
        .ss-shade-section .ss-shade-option {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          opacity: 1;
        }
        .ss-shade-section .ss-shade-option:hover {
          border-color: rgba(0, 0, 0, 0.3);
        }
        .ss-shade-section .ss-shade-option.active {
          border-color: #111111;
          background: rgba(0, 0, 0, 0.02);
        }
        .ss-shade-section .ss-shade-swatch {
          width: 14px;
          height: 14px;
          display: block;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .ss-minimal-metadata {
          font-size: 9px;
          font-weight: 300;
          font-family: var(--font-primary);
          color: rgba(0,0,0,0.25);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ss-sizes-select-area {
          margin-top: 24px;
          margin-bottom: 24px;
          width: 100%;
        }
        .ss-inline-sizes {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
          gap: 8px;
          margin-top: 14px;
          width: 100%;
        }
        .ss-inline-size {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 0.25em;
          padding-left: 0.25em;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: transparent;
          cursor: pointer;
          color: rgba(0, 0, 0, 0.55);
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
        }
        .ss-inline-size:hover:not(.sold-out) {
          border-color: rgba(0, 0, 0, 0.3);
          color: rgba(0, 0, 0, 0.9);
        }
        .ss-inline-size.active {
          background: #111111;
          color: #ffffff;
          border-color: #111111;
        }
        .ss-inline-size.sold-out {
          color: rgba(0, 0, 0, 0.25);
          background: rgba(0, 0, 0, 0.01);
          border-color: rgba(0, 0, 0, 0.04);
          cursor: pointer;
        }
        .ss-inline-size.sold-out::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top right, transparent calc(50% - 0.5px), rgba(0,0,0,0.15) 50%, transparent calc(50% + 0.5px));
          pointer-events: none;
        }
        .ss-inline-size.sold-out:hover {
          border-color: rgba(0, 0, 0, 0.2);
          color: rgba(0, 0, 0, 0.5);
        }

        .ss-size-guide-link {
          font-family: var(--font-primary);
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.25);
          background: none;
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding: 0 0 2px 0;
          cursor: pointer;
          transition: color 0.3s, border-color 0.3s;
        }
        .ss-size-guide-link:hover {
          color: rgba(0, 0, 0, 0.6);
          border-bottom-color: rgba(0, 0, 0, 0.25);
        }

        @media (max-width: 767px) {
          .ss-sizes-select-area {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .ss-inline-sizes {
            justify-content: center;
            max-width: 320px;
          }
        }

        .ss-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 32px;
          margin-bottom: 32px;
          width: 100%;
        }
        .ss-cta-btn {
          width: 100%;
          height: 48px;
          background: #111111;
          color: #ffffff;
          border: none;
          border-radius: 0;
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.35em;
          padding-left: 0.35em;
          cursor: pointer;
          transition: background 0.3s ease, opacity 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ss-cta-btn:hover:not(:disabled) {
          background: #222222;
        }
        .ss-cta-btn:disabled {
          background: #f5f5f5;
          color: rgba(0,0,0,0.25);
          cursor: not-allowed;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .ss-archive-btn {
          width: 100%;
          height: 48px;
          background: transparent;
          color: #111111;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 0;
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.35em;
          padding-left: 0.35em;
          cursor: pointer;
          transition: border-color 0.3s ease, background-color 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ss-archive-btn:hover {
          border-color: rgba(0,0,0,0.4);
          background-color: rgba(0,0,0,0.02);
        }
        .ss-archive-btn--in {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0,0,0,0.08);
          color: rgba(0, 0, 0, 0.45);
        }

        .ss-accordions {
          margin-top: 48px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          width: 100%;
        }
        .ss-accordion-item {
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .ss-accordion-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          background: none;
          border: none;
          font-family: var(--font-primary);
          font-size: 9px;
          font-weight: 300;
          color: rgba(0, 0, 0, 0.55);
          cursor: pointer;
          text-align: left;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          transition: color 0.4s;
        }
        .ss-accordion-header:focus { outline: none; }
        .ss-accordion-header:hover { color: rgba(0, 0, 0, 0.85); }
        .ss-accordion-icon {
          font-size: 10px;
          font-weight: 300;
          color: rgba(0, 0, 0, 0.25);
          transition: transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
          line-height: 1;
        }
        .ss-accordion-icon.open { transform: rotate(45deg); }
        .ss-accordion-body {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transform: translateY(4px);
          transition: max-height 250ms cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 250ms cubic-bezier(0.22, 1, 0.36, 1),
                      transform 250ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .ss-accordion-body.open {
          max-height: 2000px;
          opacity: 1;
          transform: translateY(0);
        }
        .ss-accordion-body-inner {
          padding-bottom: 24px;
          padding-top: 4px;
        }
        .ss-accordion-text {
          font-size: 9.5px;
          font-family: var(--font-primary);
          font-weight: 300;
          line-height: 1.8;
          color: rgba(0, 0, 0, 0.45);
          margin: 0;
          letter-spacing: 0.05em;
        }
        
        .ss-details-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          gap: 16px;
        }
        .ss-details-row:last-child {
          border-bottom: none;
        }
        .ss-details-label {
          font-size: 7.5px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: rgba(0, 0, 0, 0.35);
          width: 100px;
          flex-shrink: 0;
        }
        .ss-details-value {
          font-size: 9.5px;
          font-weight: 300;
          letter-spacing: 0.06em;
          color: rgba(0, 0, 0, 0.55);
          text-align: right;
        }

        .ss-care-line {
          display: block;
          position: relative;
          padding-left: 12px;
        }
        .ss-care-line::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.18);
        }

        button:focus-visible {
          outline: 1px solid rgba(0, 0, 0, 0.25);
          outline-offset: 2px;
        }
        .ss-shade-option:focus-visible {
          outline: 1px solid rgba(0, 0, 0, 0.4);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}
