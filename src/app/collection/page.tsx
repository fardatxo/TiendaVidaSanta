import { getProducts } from '@/lib/shopify';
import CollectionLandingClient from './CollectionLandingClient';

export const metadata = {
  title: 'Colecciones',
  description: 'Una selección de productos oficiales de VIDA SANTA.',
};

export default async function CollectionLandingPage() {
  const products = await getProducts();
  return <CollectionLandingClient products={products} />;
}
