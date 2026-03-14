import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendLowStockAlert } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as { user: { id: string } } | null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch low stock products (LTE reorderThreshold)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        onHandQty: { lte: prisma.product.fields.reorderThreshold },
      },
      include: {
        warehouse: { select: { name: true } },
      },
    });

    if (lowStockProducts.length === 0) {
      return NextResponse.json({ sent: false, count: 0, message: "No low stock products found" });
    }

    // 2. Get manager email from environment
    const managerEmail = process.env.MANAGER_EMAIL;
    if (!managerEmail) {
      console.warn("[api/notifications/low-stock-email] MANAGER_EMAIL environment variable is not set.");
      return NextResponse.json({ 
        sent: false, 
        count: lowStockProducts.length, 
        error: "Manager email not configured" 
      }, { status: 500 });
    }

    // 3. Trigger email
    await sendLowStockAlert(lowStockProducts, managerEmail);

    // 4. Create Audit Log for the notification
    await prisma.auditLog.create({
      data: {
        action: "LOW_STOCK_EMAIL_SENT",
        entityType: "Notification",
        entityId: "system",
        userId: session.user.id,
        metadata: JSON.stringify({ count: lowStockProducts.length, recipient: managerEmail }),
      },
    });

    return NextResponse.json({ sent: true, count: lowStockProducts.length });
  } catch (error) {
    console.error("[api/notifications/low-stock-email] POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
