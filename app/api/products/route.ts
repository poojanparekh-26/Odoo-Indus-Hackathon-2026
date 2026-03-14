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
  const category = searchParams.get("category");
  const sku = searchParams.get("sku");

  const where: any = {};
  if (category) where.category = category;
  if (sku) where.sku = { contains: sku };

  try {
    const result = await getPaginatedData(prisma.product, page, perPage, where);
    
    // Add availableQty computed field
    const dataWithQty = result.data.map((p: any) => ({
      ...p,
      availableQty: p.onHandQty - p.reservedQty,
    }));

    return NextResponse.json({ ...result, data: dataWithQty });
  } catch (error) {
    console.error("[api/products] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, sku, category, unitCost, reorderThreshold, warehouseId } = body;

    if (!name || !sku || unitCost === undefined || unitCost <= 0) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    // Check SKU uniqueness
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
    }

    // Get default warehouse if none provided
    let targetWarehouseId = warehouseId;
    if (!targetWarehouseId) {
      const defaultWH = await prisma.warehouse.findFirst();
      if (!defaultWH) {
        return NextResponse.json({ error: "No warehouse configured" }, { status: 400 });
      }
      targetWarehouseId = defaultWH.id;
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category: category || "General",
        unitCost: parseFloat(unitCost),
        reorderThreshold: reorderThreshold || 10,
        warehouseId: targetWarehouseId,
      },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error("[api/products] POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
