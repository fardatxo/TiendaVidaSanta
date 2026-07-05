import { getProducts, getCollections } from '@/lib/shopify';
import SearchClient from './SearchClient';

export const metadata = { title: 'Búsqueda' };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const query = q.trim().toLowerCase();

  const [products, collections] = await Promise.all([
    getProducts(),
    getCollections(50),
  ]);

  const matchedProducts = query
    ? products.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query)) ||
        p.variants.some(v =>
          v.title.toLowerCase().includes(query) ||
          v.selectedOptions.some(o => o.value.toLowerCase().includes(query))
        )
      )
    : [];

  const matchedCollections = query
    ? collections.filter(c =>
        c.title.toLowerCase().includes(query)
      )
    : [];

  return (
    <SearchClient
      query={q}
      products={matchedProducts}
      collections={matchedCollections}
    />
  );
}
