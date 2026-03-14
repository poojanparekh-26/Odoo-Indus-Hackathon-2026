import React from 'react';
import ReceiptsView from '@/components/receipts/ReceiptsView';

async function getReceiptsData(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = searchParams.page || '1';
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  // Fetch all for Kanban (or at least more than one page)
  const allRes = await fetch(`${baseUrl}/api/receipts?perPage=100`, { cache: 'no-store' });
  const allReceipts = await allRes.json();

  // Fetch paginated for list
  const paginatedRes = await fetch(`${baseUrl}/api/receipts?page=${page}&perPage=20`, { cache: 'no-store' });
  const paginatedReceipts = await paginatedRes.json();

  return {
    all: allReceipts.data || [],
    paginated: paginatedReceipts
  };
}

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { all, paginated } = await getReceiptsData(searchParams);

  return (
    <ReceiptsView 
      receipts={all}
      paginatedReceipts={paginated}
    />
  );
}
