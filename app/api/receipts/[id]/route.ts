import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { emitEvent } from "@/lib/socket";
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
    const receipt = await prisma.receipt.findUnique({
      where: { id: params.id },
      include: {
        lines: {
          include: { product: true },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json({ data: receipt });
  } catch (error) {
    console.error("[api/receipts/[id]] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const PATCH = withRole(["manager"], async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = (await getServerSession(authOptions)) as {
    user: { id: string };
  } | null;
  // Session is guaranteed by withRole

  try {
    const body = await req.json();
    const { status } = body;

    const receipt = await prisma.receipt.findUnique({
      where: { id: params.id },
      include: { lines: true },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      Draft: ["Ready", "Cancelled"],
      Ready: ["Done", "Cancelled"],
    };

    if (status && !validTransitions[receipt.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid transition from ${receipt.status} to ${status}` },
        { status: 400 }
      );
    }

    // Atomic transaction for Status Change
    return await prisma.$transaction(async (tx: any) => {
      const updatedReceipt = await tx.receipt.update({
        where: { id: params.id },
        data: { status: status! },
      });

      // Business Logic for status -> Done
      if (status === "Done" && receipt.status !== "Done") {
        for (const line of receipt.lines) {
          // 1. Increment onHandQty
          await tx.product.update({
            where: { id: line.productId },
            data: { onHandQty: { increment: line.quantity } },
          });

          // 2. Create StockMovement
          await tx.stockMovement.create({
            data: {
              reference: receipt.reference,
              productId: line.productId,
              type: "IN",
              quantity: line.quantity,
              doneBy: session!.user.id,
            },
          });
        }

        // 3. Create AuditLog
        await tx.auditLog.create({
          data: {
            action: "RECEIPT_DONE",
            entityType: "Receipt",
            entityId: receipt.id,
            userId: session!.user.id,
            metadata: JSON.stringify({ reference: receipt.reference }),
          },
        });

        // 4. Emit Socket Event (after transaction)
        emitEvent("stock-updated", { type: "RECEIPT", id: receipt.id });
      }

      return NextResponse.json({ data: updatedReceipt });
    });
  } catch (error: any) {
    console.error("[api/receipts/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
