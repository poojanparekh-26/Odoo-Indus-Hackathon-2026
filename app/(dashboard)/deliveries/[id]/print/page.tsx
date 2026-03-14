import React from 'react';
import { notFound } from 'next/navigation';
import DocumentPrintView from '@/components/print/DocumentPrintView';
import { format } from 'date-fns';

async function getDelivery(id: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/deliveries/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching delivery ${id}:`, error);
    return null;
  }
}

export default async function DeliveryPrintPage({
  params,
}: {
  params: { id: string };
}) {
  const delivery = await getDelivery(params.id);

  if (!delivery) {
    notFound();
  }

  const lines = delivery.lines.map((line: any) => ({
    name: line.product.name,
    sku: line.product.sku,
    qty: line.quantity,
    unitCost: line.product.unitCost,
    total: line.quantity * line.product.unitCost,
  }));

  const subtotal = lines.reduce((acc: number, line: any) => acc + line.total, 0);

  return (
    <>
      <DocumentPrintView
        type="Delivery"
        reference={delivery.reference}
        date={format(new Date(delivery.createdAt), 'PPP')}
        partyName={delivery.customerId}
        partyLabel="Customer"
        lines={lines}
        subtotal={subtotal}
        notes="Goods dispatched for delivery. Customer copy."
      />
      <script
        dangerouslySetInnerHTML={{
          __html: "window.onload = () => { setTimeout(() => window.print(), 500); }",
        }}
      />
    </>
  );
}
