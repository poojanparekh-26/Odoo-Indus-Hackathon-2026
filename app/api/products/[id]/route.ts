import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { withRole } from "@/lib/auth/withRole";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        stockMovements: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            fromLocation: true,
            toLocation: true,
          },
        },
        damageReports: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      data: {
        ...product,
        availableQty: product.onHandQty - product.reservedQty
      } 
    });
  } catch (error) {
    console.error("[api/products/[id]] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, unitCost, reorderThreshold, category } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        unitCost: unitCost !== undefined ? parseFloat(unitCost) : undefined,
        reorderThreshold,
        category,
      },
    });

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error("[api/products/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const DELETE = withRole(["manager"], async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions);
  // Session is guaranteed by withRole

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { onHandQty: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.onHandQty > 0) {
      return NextResponse.json(
        { error: "Cannot delete product with stock" },
        { status: 400 }
      );
    }

    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("[api/products/[id]] DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
