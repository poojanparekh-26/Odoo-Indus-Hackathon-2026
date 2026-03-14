import { Resend } from 'resend';
import nodemailer from 'nodemailer';

interface LowStockProduct {
  name: string;
  sku: string;
  onHandQty: number;
  reorderThreshold: number;
  warehouse: { name: string };
}

/**
 * Sends a low stock alert email to the specified recipient.
 * Uses Resend if API key is provided, otherwise falls back to Nodemailer SMTP.
 */
export async function sendLowStockAlert(products: LowStockProduct[], to: string): Promise<void> {
  if (products.length === 0) return;

  const subject = `⚠️ Low Stock Alert — ${products.length} products need attention`;
  
  const html = `
    <h1>Low Stock Alert</h1>
    <p>The following products are at or below their reorder threshold:</p>
    <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th>Product</th>
          <th>SKU</th>
          <th>Current Stock</th>
          <th>Threshold</th>
          <th>Warehouse</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td>${p.name}</td>
            <td><code>${p.sku}</code></td>
            <td>${p.onHandQty}</td>
            <td>${p.reorderThreshold}</td>
            <td>${p.warehouse.name}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p>Please check the dashboard for more details.</p>
  `;

  try {
    if (process.env.RESEND_API_KEY) {
      console.log(`[email] Sending via Resend to ${to}`);
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'inventory@updates.yourdomain.com',
        to,
        subject,
        html,
      });
    } else if (process.env.SMTP_HOST) {
      console.log(`[email] Sending via Nodemailer to ${to}`);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Inventory System" <inventory@example.com>',
        to,
        subject,
        html,
      });
    } else {
      console.warn('[email] No email service configured (RESEND_API_KEY or SMTP_HOST missing). Logging email content to console.');
      console.log(`Subject: ${subject}`);
      console.log(`To: ${to}`);
      // console.log(`HTML: ${html}`);
    }
  } catch (error) {
    console.error('[email] Failed to send email:', error);
    // Do not throw to prevent crashing the caller, as per requirements
  }
}
