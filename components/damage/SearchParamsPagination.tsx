'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '../ui/Pagination';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
}

export const SearchParamsPagination: React.FC<Props> = ({ page, totalPages, total, perPage }) => {
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
      perPage={perPage}
      onPageChange={handlePageChange}
    />
  );
};
