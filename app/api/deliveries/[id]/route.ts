import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { emitEvent } from "@/lib/socket";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: {
        lines: {
          include: { product: true },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    return NextResponse.json({ data: delivery });
  } catch (error) {
    console.error("[api/deliveries/[id]] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = (await getServerSession(authOptions)) as {
    user: { id: string };
  } | null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status } = body;

    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: { lines: true },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      Draft: ["Waiting", "Ready", "Cancelled"],
      Waiting: ["Ready", "Cancelled"],
      Ready: ["Done", "Cancelled"],
    };

    if (status && !validTransitions[delivery.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid transition from ${delivery.status} to ${status}` },
        { status: 400 }
      );
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Logic for status -> Ready (Reserve Stock)
      if (status === "Ready" && delivery.status !== "Ready") {
        for (const line of delivery.lines) {
          // Check stock one more time before reserving
          const product = await tx.product.findUnique({
            where: { id: line.productId },
            select: { onHandQty: true, reservedQty: true, name: true },
          });

          if (!product) throw new Error(`Product ${line.productId} not found`);

          const available = product.onHandQty - product.reservedQty;
          if (available < line.quantity) {
            throw new Error(`Insufficient stock for ${product.name} to fulfill reservation.`);
          }

          await tx.product.update({
            where: { id: line.productId },
            data: { reservedQty: { increment: line.quantity } },
          });
        }
      }

      // 2. Logic for status -> Done (Consume Stock)
      if (status === "Done" && delivery.status === "Ready") {
        for (const line of delivery.lines) {
          // Decrement both onHand and reserved
          await tx.product.update({
            where: { id: line.productId },
            data: {
              onHandQty: { decrement: line.quantity },
              reservedQty: { decrement: line.quantity },
            },
          });

          // Create StockMovement
          await tx.stockMovement.create({
            data: {
              reference: delivery.reference,
              productId: line.productId,
              type: "OUT",
              quantity: line.quantity,
              doneBy: session.user.id,
            },
          });
        }

        await tx.auditLog.create({
          data: {
            action: "DELIVERY_DONE",
            entityType: "Delivery",
            entityId: delivery.id,
            userId: session.user.id,
            metadata: JSON.stringify({ reference: delivery.reference }),
          },
        });

        emitEvent("stock-updated", { type: "DELIVERY", id: delivery.id });
      }

      // 3. Logic for status -> Cancelled from Ready (Release Reservation)
      if (status === "Cancelled" && delivery.status === "Ready") {
        for (const line of delivery.lines) {
          await tx.product.update({
            where: { id: line.productId },
            data: { reservedQty: { decrement: line.quantity } },
          });
        }
      }

      const updatedDelivery = await tx.delivery.update({
        where: { id: params.id },
        data: { status },
      });

      return NextResponse.json({ data: updatedDelivery });
    });
  } catch (error: any) {
    console.error("[api/deliveries/[id]] PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
