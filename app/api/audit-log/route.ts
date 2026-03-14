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

  // Optional: Restrict audit log to managers if desired
  // if (session.user.role !== "manager") {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "20");
  const userId = searchParams.get("userId");
  const action = searchParams.get("action");
  const entityType = searchParams.get("entityType");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: any = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  try {
    const result = await getPaginatedData(
      prisma.auditLog,
      page,
      perPage,
      where,
      {
        user: { select: { name: true, email: true } },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/audit-log] GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
