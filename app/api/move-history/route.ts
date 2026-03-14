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
  const type = searchParams.get("type");
  const productId = searchParams.get("productId");
  const sku = searchParams.get("sku");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: any = {};
  if (type) where.type = type;
  if (productId) where.productId = productId;
  if (sku) {
    where.product = {
      OR: [
        { name: { contains: sku } },
        { sku: { contains: sku } },
      ],
    };
  }
  
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
    const result = await getPaginatedData(prisma.stockMovement, page, perPage, where, {
      product: { select: { name: true, sku: true } },
      fromLocation: true,
      toLocation: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/move-history] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
