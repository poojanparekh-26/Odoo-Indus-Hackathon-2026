import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { getCachedLowStock, setCachedLowStock } from "@/lib/stock-cache";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cachedData = getCachedLowStock();
  if (cachedData) {
    return NextResponse.json({ data: cachedData, cached: true });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        onHandQty: { lte: prisma.product.fields.reorderThreshold },
      },
      include: {
        warehouse: { select: { name: true } },
      },
    });

    setCachedLowStock(products);

    return NextResponse.json({ data: products, cached: false });
  } catch (error) {
    console.error("[api/stock/low] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
