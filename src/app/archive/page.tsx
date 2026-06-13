import { Suspense } from 'react';
import ArchiveClient from './ArchiveClient';

export const metadata = { title: 'Archive — TONER TORRENTINNI' };

export default function ArchivePage() {
  return (
    <Suspense>
      <ArchiveClient />
    </Suspense>
  );
}
