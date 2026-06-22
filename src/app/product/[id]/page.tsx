import { getProducts, getProduct } from '@/lib/shopify';
import ProductClient from './ProductClient';
import { Suspense } from 'react';

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || !process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN) {
    return [];
  }
  const products = await getProducts();
  const baseHandles = Array.from(new Set(products.map((p) => p.handle.split('?')[0])));
  return baseHandles.map((h) => ({ id: h }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return <div style={{ padding: '80px 24px' }}>Product not found.</div>;
  
  // Find related products by tag
  // We filter products that share at least one tag with the current product,
  // excluding all variants of the current product itself (by comparing base handle).
  const allProducts = await getProducts();
  const relatedProductsByTag = allProducts.filter(p => 
    p.handle.split('?')[0] !== product.handle && 
    p.tags && product.tags && p.tags.some(t => product.tags.includes(t))
  );

  return (
    <Suspense fallback={<div style={{ padding: '80px 24px', textAlign: 'center' }}>Loading product details...</div>}>
      <ProductClient product={product} relatedProductsByTag={relatedProductsByTag} />
    </Suspense>
  );
}
