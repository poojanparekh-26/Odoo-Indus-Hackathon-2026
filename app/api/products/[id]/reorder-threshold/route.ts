import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkLowStock } from "@/lib/alerts";

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
    const { threshold } = body;

    if (typeof threshold !== "number" || threshold < 0) {
      return NextResponse.json({ error: "Threshold must be a non-negative number" }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: { reorderThreshold: threshold },
    });

    // Trigger alert check
    await checkLowStock();

    return NextResponse.json({ data: updatedProduct });
  } catch (error) {
    console.error("[api/products/[id]/reorder-threshold] PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
