import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { toCsv, downloadCsvResponse } from "@/lib/csv";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const type = searchParams.get("type");
  const productId = searchParams.get("productId");

  const where: any = {};
  if (type) where.type = type;
  if (productId) where.productId = productId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  try {
    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true } },
        fromLocation: { select: { name: true } },
        toLocation: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Date",
      "Reference",
      "Product",
      "SKU",
      "Type",
      "From Location",
      "To Location",
      "Quantity",
      "Done By"
    ];

    const rows = movements.map((m: any) => [
      format(m.createdAt, "yyyy-MM-dd HH:mm:ss"),
      m.reference,
      m.product.name,
      m.product.sku,
      m.type,
      m.fromLocation?.name || "N/A",
      m.toLocation?.name || "N/A",
      m.quantity,
      m.user?.name || "System"
    ]);

    const csv = toCsv(headers, rows);
    const filename = `move-history-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;

    return downloadCsvResponse(filename, csv);
  } catch (error) {
    console.error("[api/move-history/export] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
