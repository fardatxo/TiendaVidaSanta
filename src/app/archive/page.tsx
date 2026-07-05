import { Suspense } from 'react';
import ArchiveClient from './ArchiveClient';

export const metadata = { title: 'Archivo' };

export default function ArchivePage() {
  return (
    <Suspense>
      <ArchiveClient />
    </Suspense>
  );
}
