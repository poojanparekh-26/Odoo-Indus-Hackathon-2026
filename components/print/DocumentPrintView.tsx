'use client';

import React from 'react';

interface PrintLine {
  name: string;
  sku: string;
  qty: number;
  unitCost: number;
  total: number;
}

interface DocumentPrintViewProps {
  type: "Receipt" | "Delivery";
  reference: string;
  date: string;
  partyName: string;
  partyLabel: string; // "Supplier" or "Customer"
  lines: PrintLine[];
  subtotal: number;
  notes?: string;
}

const DocumentPrintView: React.FC<DocumentPrintViewProps> = ({
  type,
  reference,
  date,
  partyName,
  partyLabel,
  lines,
  subtotal,
  notes,
}) => {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#333',
      lineHeight: '1.5',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#fff',
    }}>
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          @page { size: auto; margin: 20mm; }
        }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { text-align: left; border-bottom: 2px solid #eee; padding: 10px 5px; font-size: 12px; text-transform: uppercase; color: #666; }
        td { border-bottom: 1px solid #eee; padding: 12px 5px; font-size: 14px; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .mt-40 { margin-top: 40px; }
        .border-t { border-top: 1px solid #333; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#2563eb' }}>Invo<span style={{ color: '#000' }}>Track</span></h1>
          <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>
            123 Business Plaza, Tech Hub<br />
            New Delhi, India - 110001<br />
            Email: operations@invotrack.ai | Phone: +91 11 2345 6789
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase' }}>{type} Note</h2>
          <p style={{ margin: '5px 0 0', fontWeight: 'bold' }}>#{reference}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '30px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', color: '#666', marginBottom: '5px' }}>{partyLabel} Info</h3>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{partyName}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', color: '#666', marginBottom: '5px' }}>Document Date</h3>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{date}</p>
        </div>
      </div>

      {/* Lines Table */}
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>SKU</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Unit Cost</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, idx) => (
            <tr key={idx}>
              <td>{line.name}</td>
              <td style={{ fontFamily: 'monospace' }}>{line.sku}</td>
              <td className="text-right">{line.qty}</td>
              <td className="text-right">₹{line.unitCost.toLocaleString()}</td>
              <td className="text-right font-bold">₹{line.total.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '2px solid #000' }}>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Grand Total</span>
            <span style={{ fontWeight: '900', fontSize: '18px' }}>₹{subtotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', color: '#666', marginBottom: '5px' }}>Notes / Terms</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#333' }}>{notes}</p>
        </div>
      )}

      {/* Signature Section */}
      <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px dotted #333', paddingTop: '10px', fontSize: '12px', fontWeight: 'bold' }}>Prepared By</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px dotted #333', paddingTop: '10px', fontSize: '12px', fontWeight: 'bold' }}>Checked By</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px dotted #333', paddingTop: '10px', fontSize: '12px', fontWeight: 'bold' }}>Approved By</div>
        </div>
      </div>

      {/* Footer Branding */}
      <div style={{ marginTop: '60px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <p style={{ margin: 0, fontSize: '10px', color: '#999' }}>
          System Generated Document via InvoTrack Inventory Management
        </p>
      </div>
    </div>
  );
};

export default DocumentPrintView;
