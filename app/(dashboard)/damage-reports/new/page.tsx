import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import Link from 'next/link';
import DamageReportForm from '@/components/damage/DamageReportForm';

export default function NewDamageReportPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <Link href="/damage-reports" className="hover:text-[var(--brand-primary)]">Damage Reports</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)] font-medium">New Report</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-[var(--brand-primary)]" />
          Report Item Damage
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Deduct damaged or lost stock from the inventory records.
        </p>
      </div>

      <DamageReportForm />
    </div>
  );
}
