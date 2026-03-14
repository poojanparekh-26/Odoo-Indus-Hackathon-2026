import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkLowStock } from "@/lib/alerts";
import { invalidateLowStockCache } from "@/lib/stock-cache";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = (await getServerSession(authOptions)) as { user: { id: string } } | null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { adjustment, reason } = body;

    if (typeof adjustment !== "number" || !reason) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { onHandQty: true, sku: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.onHandQty + adjustment < 0) {
      return NextResponse.json({ error: "Stock cannot go below zero" }, { status: 400 });
    }

    const updatedProduct = await prisma.$transaction(async (tx: any) => {
      // 1. Update product quantity
      const updated = await tx.product.update({
        where: { id: params.id },
        data: { onHandQty: { increment: adjustment } },
      });

      // 2. Create StockMovement
      await tx.stockMovement.create({
        data: {
          reference: `ADJ-${Date.now()}`,
          productId: params.id,
          type: "ADJUST",
          quantity: Math.abs(adjustment),
          doneBy: session.user.id,
        },
      });

      // 3. Create AuditLog
      await tx.auditLog.create({
        data: {
          action: "STOCK_ADJUSTMENT",
          entityType: "Product",
          entityId: params.id,
          userId: session.user.id,
          metadata: JSON.stringify({ adjustment, reason, sku: product.sku }),
        },
      });

      return updated;
    });

    // Post-transaction tasks
    invalidateLowStockCache();
    await checkLowStock();

    return NextResponse.json({ data: updatedProduct });
  } catch (error) {
    console.error("[api/stock/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
