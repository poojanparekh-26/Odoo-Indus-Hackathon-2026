import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], receipts: [], deliveries: [] });
  }

  try {
    const [products, receipts, deliveries] = await prisma.$transaction([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, lte: undefined } },
            { sku: { contains: q, lte: undefined } },
          ],
        },
        take: 5,
        select: { id: true, name: true, sku: true, category: true, onHandQty: true, reservedQty: true },
      }),
      prisma.receipt.findMany({
        where: { reference: { contains: q } },
        take: 5,
        select: { id: true, reference: true, status: true, supplierId: true },
      }),
      prisma.delivery.findMany({
        where: { reference: { contains: q } },
        take: 5,
        select: { id: true, reference: true, status: true, customerId: true },
      }),
    ]);

    return NextResponse.json({ products, receipts, deliveries });
  } catch (error) {
    console.error("[api/search] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
