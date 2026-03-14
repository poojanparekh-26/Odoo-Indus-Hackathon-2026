import React from 'react';
import DeliveriesView from '@/components/deliveries/DeliveriesView';

async function getDeliveriesData(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = searchParams.page || '1';
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  // Fetch all for Kanban
  const allRes = await fetch(`${baseUrl}/api/deliveries?perPage=100`, { cache: 'no-store' });
  const allDeliveries = await allRes.json();

  // Fetch paginated for list
  const paginatedRes = await fetch(`${baseUrl}/api/deliveries?page=${page}&perPage=20`, { cache: 'no-store' });
  const paginatedDeliveries = await paginatedRes.json();

  return {
    all: allDeliveries.data || [],
    paginated: paginatedDeliveries
  };
}

export default async function DeliveriesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { all, paginated } = await getDeliveriesData(searchParams);

  return (
    <DeliveriesView 
      deliveries={all}
      paginatedDeliveries={paginated}
    />
  );
}
