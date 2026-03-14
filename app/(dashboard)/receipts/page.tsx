'use client';

import React, { useEffect, useState } from 'react';
import ReceiptsView from '@/components/receipts/ReceiptsView';
import { Loader2 } from 'lucide-react';

export default function ReceiptsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = searchParams.page || '1';
  
  const [allReceipts, setAllReceipts] = useState<any[]>([]);
  const [paginatedReceipts, setPaginatedReceipts] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch(`/api/receipts?perPage=100`).then(r => r.ok ? r.json() : { data: [] }),
      fetch(`/api/receipts?page=${page}&perPage=20`).then(r => r.ok ? r.json() : { data: [], total: 0, page: 1, totalPages: 1 })
    ])
    .then(([allRes, paginatedRes]) => {
      if (isMounted) {
        setAllReceipts(allRes.data || []);
        setPaginatedReceipts(paginatedRes);
        setLoading(false);
      }
    })
    .catch(err => {
      console.error('Failed to fetch receipts:', err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [page]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  return (
    <ReceiptsView 
      receipts={allReceipts}
      paginatedReceipts={paginatedReceipts}
    />
  );
}
