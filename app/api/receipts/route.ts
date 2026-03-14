import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPaginatedData } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "20");
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  try {
    const result = await getPaginatedData(prisma.receipt, page, perPage, where, {
      lines: { include: { product: true } },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/receipts] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as { user: { id: string } } | null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { supplierId, scheduledDate, lines } = body;

    if (!supplierId || !scheduledDate || !lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: "Invalid receipt data" }, { status: 400 });
    }

    // Atomic transaction for Receipt creation
    return await prisma.$transaction(async (tx) => {
      // 1. Generate reference
      const count = await tx.receipt.count();
      const reference = `REC-${String(count + 1).padStart(3, "0")}`;

      // 2. Validate products exist
      const productIds = lines.map((l: any) => l.productId);
      const existingProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
      });

      if (existingProducts.length !== productIds.length) {
        throw new Error("One or more products not found");
      }

      // 3. Create Receipt
      const receipt = await tx.receipt.create({
        data: {
          reference,
          supplierId,
          scheduledDate: new Date(scheduledDate),
          createdBy: session.user.id,
          lines: {
            create: lines.map((l: any) => ({
              productId: l.productId,
              quantity: l.quantity,
              unitCost: l.unitCost,
            })),
          },
        },
        include: { lines: true },
      });

      return NextResponse.json({ data: receipt }, { status: 201 });
    });
  } catch (error: any) {
    console.error("[api/receipts] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message === "One or more products not found" ? 400 : 500 }
    );
  }
}
