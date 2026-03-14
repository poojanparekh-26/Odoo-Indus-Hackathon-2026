'use client';

import React, { useEffect, useState } from 'react';
import DeliveriesView from '@/components/deliveries/DeliveriesView';
import { Loader2 } from 'lucide-react';

export default function DeliveriesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = searchParams.page || '1';
  
  const [allDeliveries, setAllDeliveries] = useState<any[]>([]);
  const [paginatedDeliveries, setPaginatedDeliveries] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch(`/api/deliveries?perPage=100`).then(r => r.ok ? r.json() : { data: [] }),
      fetch(`/api/deliveries?page=${page}&perPage=20`).then(r => r.ok ? r.json() : { data: [], total: 0, page: 1, totalPages: 1 })
    ])
    .then(([allRes, paginatedRes]) => {
      if (isMounted) {
        setAllDeliveries(allRes.data || []);
        setPaginatedDeliveries(paginatedRes);
        setLoading(false);
      }
    })
    .catch(err => {
      console.error('Failed to fetch deliveries:', err);
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
    <DeliveriesView 
      deliveries={allDeliveries}
      paginatedDeliveries={paginatedDeliveries}
    />
  );
}
