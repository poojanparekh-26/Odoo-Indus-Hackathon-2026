import React from 'react';
import { notFound } from 'next/navigation';
import DocumentPrintView from '@/components/print/DocumentPrintView';
import { format } from 'date-fns';

async function getReceipt(id: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/receipts/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching receipt ${id}:`, error);
    return null;
  }
}

export default async function ReceiptPrintPage({
  params,
}: {
  params: { id: string };
}) {
  const receipt = await getReceipt(params.id);

  if (!receipt) {
    notFound();
  }

  const lines = receipt.lines.map((line: any) => ({
    name: line.product.name,
    sku: line.product.sku,
    qty: line.quantity,
    unitCost: line.unitCost,
    total: line.quantity * line.unitCost,
  }));

  const subtotal = lines.reduce((acc: number, line: any) => acc + line.total, 0);

  return (
    <>
      <DocumentPrintView
        type="Receipt"
        reference={receipt.reference}
        date={format(new Date(receipt.createdAt), 'PPP')}
        partyName={receipt.supplierId}
        partyLabel="Supplier"
        lines={lines}
        subtotal={subtotal}
        notes="Goods received against purchase order. All items inspected and verified."
      />
      <script
        dangerouslySetInnerHTML={{
          __html: "window.onload = () => { setTimeout(() => window.print(), 500); }",
        }}
      />
    </>
  );
}
