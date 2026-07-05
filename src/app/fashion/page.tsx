import { Metadata } from 'next';
import FashionClient from './FashionClient';

export const metadata: Metadata = {
  title: 'Moda y Accesorios',
  description: 'Descubre la colección de moda y accesorios de VIDA SANTA.',
};

export default function FashionPage() {
  return <FashionClient />;
}
