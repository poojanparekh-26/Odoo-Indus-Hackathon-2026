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
    const result = await getPaginatedData(prisma.delivery, page, perPage, where, {
      lines: { include: { product: true } },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/deliveries] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as {
    user: { id: string };
  } | null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { customerId, scheduledDate, lines } = body;

    if (!customerId || !scheduledDate || !lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: "Invalid delivery data" }, { status: 400 });
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Generate reference
      const count = await tx.delivery.count();
      const reference = `DEL-${String(count + 1).padStart(3, "0")}`;

      // 2. Validate availability for every line
      for (const line of lines) {
        const product = await tx.product.findUnique({
          where: { id: line.productId },
          select: { onHandQty: true, reservedQty: true, name: true },
        });

        if (!product) {
          throw new Error(`Product ${line.productId} not found`);
        }

        const availableQty = product.onHandQty - product.reservedQty;
        if (availableQty < line.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${availableQty}, Requested: ${line.quantity}`);
        }
      }

      // 3. Create Delivery
      const delivery = await tx.delivery.create({
        data: {
          reference,
          customerId,
          scheduledDate: new Date(scheduledDate),
          createdBy: session.user.id,
          lines: {
            create: lines.map((l: any) => ({
              productId: l.productId,
              quantity: l.quantity,
            })),
          },
        },
        include: { lines: true },
      });

      return NextResponse.json({ data: delivery }, { status: 201 });
    });
  } catch (error: any) {
    console.error("[api/deliveries] POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
