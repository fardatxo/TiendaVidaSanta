'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

function resolveLabel(href: string): string {
  const path = href.split('?')[0];
  if (path === '/') return 'Toner Torrentinni';
  if (path.startsWith('/about'))      return 'The House';
  if (path.startsWith('/product/'))   return 'The Garment';
  if (path.startsWith('/collection/')) return 'The Collection';
  if (path.startsWith('/search'))     return 'The Archive';
  if (path.startsWith('/wishlist'))   return 'The Archive';
  if (path.startsWith('/archive'))    return 'The Archive';
  if (path.startsWith('/account'))    return 'The Account';
  if (path.startsWith('/contact'))    return 'The House';
  if (path.startsWith('/login'))      return 'Toner Torrentinni';
  return 'Toner Torrentinni';
}

type Phase = 'idle' | 'in' | 'out';

export default function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router   = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>('idle');
  const [label, setLabel] = useState('Toner Torrentinni');

  const navigating = useRef(false);
  const prevPath   = useRef(pathname);
  const t1 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const t2 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* ── Watch pathname → start fade-out ── */
  useEffect(() => {
    if (pathname !== prevPath.current && navigating.current) {
      prevPath.current = pathname;
      clearTimeout(t1.current);
      clearTimeout(t2.current);
      t1.current = setTimeout(() => {
        setPhase('out');
        t2.current = setTimeout(() => {
          setPhase('idle');
          navigating.current = false;
        }, 480);
      }, 90);
    }
  }, [pathname]);

  /* ── Trigger transition & navigate ── */
  const go = useCallback(
    (href: string) => {
      if (navigating.current) return;
      navigating.current = true;
      prevPath.current   = pathname;

      setLabel(resolveLabel(href));
      setPhase('in');

      /* Navigate after overlay is fully visible */
      setTimeout(() => router.push(href), 380);
    },
    [pathname, router],
  );

  /* ── Global link click interceptor ── */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
      if (!a) return;

      const href = a.getAttribute('href') ?? '';

      /* Only internal, non-hash, same-tab links */
      if (!href.startsWith('/') || href.startsWith('//')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === '_blank') return;

      /* Already on this page */
      const bare = href.split('?')[0];
      if (bare === pathname || bare === pathname.replace(/\/$/, '')) return;

      e.preventDefault();
      go(href);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [go, pathname]);

  /* ── Cleanup on unmount ── */
  useEffect(() => () => {
    clearTimeout(t1.current);
    clearTimeout(t2.current);
  }, []);

  const cls = phase === 'idle' ? 'tn-ov' : `tn-ov tn-ov--${phase}`;

  return (
    <>
      {children}

      <style>{`
        /* ════ TONET CINEMATIC TRANSITION ════ */
        .tn-ov {
          position: fixed;
          inset: 0;
          z-index: 9000;
          background: #0d0d0d;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 380ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity;
        }
        .tn-ov--in {
          opacity: 1;
          pointer-events: all;
        }
        .tn-ov--out {
          opacity: 0;
          pointer-events: none;
          transition-duration: 460ms;
        }

        /* Subtle radial vignette — barely visible */
        .tn-ov-vgn {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at 50% 50%,
            transparent 20%,
            rgba(0, 0, 0, 0.45) 100%
          );
          pointer-events: none;
        }

        /* Centered label */
        .tn-ov-lbl {
          font-family: var(--font-brand);
          font-size: clamp(12px, 1.4vw, 16px);
          font-weight: 300;
          letter-spacing: 0.58em;
          text-transform: uppercase;
          padding-right: 0.58em;          /* compensate tracking shift */
          color: rgba(255, 255, 255, 0);  /* invisible until overlay is in */
          position: relative;
          z-index: 1;
          transition: color 360ms cubic-bezier(0.16, 1, 0.3, 1);
          transition-delay: 160ms;
        }
        .tn-ov--in .tn-ov-lbl {
          color: rgba(255, 255, 255, 0.2);
        }

        /* Architectural hairline — bottom of overlay */
        .tn-ov-rule {
          position: absolute;
          bottom: 52px;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 44px;
          background: rgba(255, 255, 255, 0.06);
        }
      `}</style>

      <div className={cls} aria-hidden="true">
        <div className="tn-ov-vgn" />
        <span className="tn-ov-lbl">{label}</span>
        <div className="tn-ov-rule" />
      </div>
    </>
  );
}
