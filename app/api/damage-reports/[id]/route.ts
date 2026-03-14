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
    const report = await prisma.damageReport.findUnique({
      where: { id: params.id },
      include: {
        product: { select: { name: true, sku: true, category: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("[api/damage-reports/[id]] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const PATCH = withRole(["manager"], async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions);
  // Role check is guaranteed by withRole

  try {
    const body = await req.json();
    const { status } = body;

    if (status !== "Resolved") {
      return NextResponse.json({ error: "Only 'Resolved' status updates are allowed" }, { status: 400 });
    }

    const existing = await prisma.damageReport.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (existing.status !== "Pending") {
      return NextResponse.json({ error: "Only 'Pending' reports can be resolved" }, { status: 400 });
    }

    const updated = await prisma.damageReport.update({
      where: { id: params.id },
      data: { status: "Resolved" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[api/damage-reports/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
