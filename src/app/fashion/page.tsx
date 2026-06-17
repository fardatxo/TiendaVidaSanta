import { Metadata } from 'next';
import FashionClient from './FashionClient';

export const metadata: Metadata = {
  title: 'TONET — Moda Y Accesorios',
  description: 'Descubre la colección de moda y accesorios de Tonet.',
};

export default function FashionPage() {
  return <FashionClient />;
}
