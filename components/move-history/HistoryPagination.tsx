'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '../ui/Pagination';

interface HistoryPaginationProps {
  page: number;
  totalPages: number;
  total: number;
}

const HistoryPagination: React.FC<HistoryPaginationProps> = ({ page, totalPages, total }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      total={total}
      perPage={20}
      onPageChange={handlePageChange}
    />
  );
};

export default HistoryPagination;
