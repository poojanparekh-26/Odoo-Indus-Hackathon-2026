import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { emitEvent } from "@/lib/socket";
import { checkLowStock } from "@/lib/alerts";
import { getPaginatedData } from "@/lib/pagination";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { productId, quantity, reason, warehouseId, reportedBy, photoPath } = body;

    if (!productId || !quantity || quantity <= 0 || !reason || !warehouseId || !reportedBy) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (quantity > product.onHandQty) {
      return NextResponse.json({ error: "Quantity exceeds on-hand stock" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create DamageReport
      const report = await tx.damageReport.create({
        data: {
          productId,
          quantity,
          reason,
          warehouseId,
          reportedBy,
          photoPath,
          status: "Pending",
        },
      });

      // 2. Decrement onHandQty
      await tx.product.update({
        where: { id: productId },
        data: { onHandQty: { decrement: quantity } },
      });

      // 3. Create StockMovement
      await tx.stockMovement.create({
        data: {
          reference: `DMG-${report.id.substring(0, 8).toUpperCase()}`,
          type: "DAMAGE",
          productId,
          quantity,
          doneBy: reportedBy,
          fromLocationId: warehouseId, 
        },
      });

      // 4. Create AuditLog
      await tx.auditLog.create({
        data: {
          action: "DAMAGE_REPORT",
          entityType: "DamageReport",
          entityId: report.id,
          userId: (session.user as { id: string }).id,
          metadata: `Reported ${quantity} damaged for ${product.name}. Reason: ${reason}`,
        },
      });

      return report;
    });

    // Post-transaction emissions
    emitEvent("damage-alert", {
      productName: product.name,
      quantity,
      reason,
      warehouseId,
      reportedBy,
      timestamp: new Date().toISOString(),
    });

    await checkLowStock();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[api/damage-reports] POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "20");
  const productId = searchParams.get("productId");
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: any = {};
  if (productId) where.productId = productId;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  try {
    const result = await getPaginatedData(prisma.damageReport, page, perPage, where, {
      product: { select: { name: true, sku: true } },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/damage-reports] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
