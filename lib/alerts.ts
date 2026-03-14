import prisma from "@/lib/prisma";
import { emitEvent } from "@/lib/socket";

/**
 * checkLowStock - Scans products and emits alerts for those at or below threshold.
 */
export async function checkLowStock(): Promise<void> {
  try {
    const products = await prisma.product.findMany({
      where: {
        onHandQty: { lte: prisma.product.fields.reorderThreshold }
      },
      include: {
        warehouse: { select: { name: true } }
      }
    });

    for (const p of products) {
      emitEvent("low-stock-alert", {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        currentStock: p.onHandQty,
        threshold: p.reorderThreshold,
        warehouseName: p.warehouse.name
      });
    }
  } catch (error) {
    console.error("[alerts] checkLowStock error:", error);
  }
}

/**
 * checkLateOperations - Monitors "Ready" operations older than 24 hours.
 */
export async function checkLateOperations(): Promise<void> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [lateReceipts, lateDeliveries] = await Promise.all([
      prisma.receipt.findMany({
        where: { status: "Ready", createdAt: { lt: oneDayAgo } },
        select: { id: true, reference: true, createdAt: true }
      }),
      prisma.delivery.findMany({
        where: { status: "Ready", createdAt: { lt: oneDayAgo } },
        select: { id: true, reference: true, createdAt: true }
      })
    ]);

    const now = Date.now();

    for (const r of lateReceipts) {
      emitEvent("late-operation-alert", {
        type: "Receipt",
        reference: r.reference,
        hoursLate: Math.floor((now - r.createdAt.getTime()) / 3600000),
        id: r.id
      });
    }

    for (const d of lateDeliveries) {
      emitEvent("late-operation-alert", {
        type: "Delivery",
        reference: d.reference,
        hoursLate: Math.floor((now - d.createdAt.getTime()) / 3600000),
        id: d.id
      });
    }
  } catch (error) {
    console.error("[alerts] checkLateOperations error:", error);
  }
}

/**
 * checkInventoryLoss - Emits alert if damaged value exceeds 10% of total valuation in last 24h.
 */
export async function checkInventoryLoss(): Promise<void> {
  try {
    const [products, recentDamage] = await Promise.all([
      prisma.product.findMany({ select: { onHandQty: true, unitCost: true } }),
      prisma.stockMovement.findMany({
        where: {
          type: "DAMAGE",
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        },
        include: { product: { select: { unitCost: true } } }
      })
    ]);

    const currentValue = products.reduce((acc: number, p: { onHandQty: number; unitCost: number }) => acc + (p.onHandQty * p.unitCost), 0);
    const damagedValue = recentDamage.reduce((acc: number, m: { quantity: number; product: { unitCost: number } }) => acc + (m.quantity * m.product.unitCost), 0);

    if (currentValue > 0 && (damagedValue / currentValue) > 0.10) {
      emitEvent("inventory-loss-alert", {
        damagedValue,
        currentValue,
        percentLoss: ((damagedValue / currentValue) * 100).toFixed(1)
      });
    }
  } catch (error) {
    console.error("[alerts] checkInventoryLoss error:", error);
  }
}
