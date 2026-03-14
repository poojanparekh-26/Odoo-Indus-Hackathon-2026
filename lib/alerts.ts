import prisma from "@/lib/prisma";
import { emitEvent } from "@/lib/socket";

/**
 * checkLowStock - Scans products and emits alerts for those at or below threshold.
 * This is a stub that will be expanded in Hour 4.
 */
export async function checkLowStock(): Promise<void> {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        onHandQty: true,
        reorderThreshold: true,
      }
    });

    const lowStockProducts = products.filter(p => p.onHandQty <= p.reorderThreshold);

    for (const p of lowStockProducts) {
      emitEvent("low-stock-alert", {
        productId: p.id,
        productName: p.name,
        currentStock: p.onHandQty,
        threshold: p.reorderThreshold
      });
    }
  } catch (error) {
    console.error("[alerts] checkLowStock error:", error);
  }
}
