'use client';

import Link from 'next/link';
import type { RecommendedProduct } from '@/lib/shopify';

interface Props {
  product: RecommendedProduct;
}

const getArchiveRef = (handle: string) => {
  const hash = handle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const num = String((hash % 9000) + 1000).padStart(4, '0');
  return `ARC-26-${num}`;
};

export default function RecommendedCard({ product }: Props) {
  const displayHref = `/product/${product.handle}`;
  const secondImage = product.siblings.length > 0 ? product.siblings[0].imageUrl : null;

  return (
    <div className="rec-card-wrap">
      <Link href={displayHref} className="rec-card">
        <div className="rec-img-wrap">
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.title} className="rec-img rec-img-primary" />
          )}
          {secondImage && (
            <img src={secondImage} alt={product.title} className="rec-img rec-img-secondary" />
          )}
        </div>
        <div className="rec-meta">
          <span className="rec-title">{product.title}</span>
          <span className="rec-archive-ref">{getArchiveRef(product.handle)}</span>
        </div>
      </Link>

      <style>{`
        .rec-card-wrap {
          position: relative;
        }
        .rec-card {
          display: block;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }
        .rec-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #f7f7f7;
          overflow: hidden;
        }
        .rec-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          transition: opacity 0.5s ease-in-out;
        }
        .rec-img-secondary {
          position: absolute;
          inset: 0;
          opacity: 0;
        }
        .rec-card:hover .rec-img-primary {
          opacity: ${secondImage ? 0 : 1};
        }
        .rec-card:hover .rec-img-secondary {
          opacity: 1;
        }
        .rec-meta {
          padding-top: 18px;
          padding-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
          text-align: center;
        }
        .rec-title {
          font-family: var(--font-primary), sans-serif;
          font-size: 9.5px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          line-height: 1.5;
          color: #111;
          max-width: 280px;
          margin: 0 auto;
        }
        .rec-archive-ref {
          font-family: var(--font-primary), sans-serif;
          font-size: 8px;
          font-weight: 300;
          letter-spacing: 0.1em;
          color: #888;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
