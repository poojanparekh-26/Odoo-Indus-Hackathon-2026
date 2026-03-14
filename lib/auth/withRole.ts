import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type RoleHandler = (
  req: NextRequest,
  context: { params: any }
) => Promise<NextResponse>;

/**
 * withRole - Wraps an API route handler to enforce role-based access.
 * @param roles Array of allowed roles (e.g., ["manager"])
 * @param handler The original route handler
 */
export function withRole(roles: string[], handler: RoleHandler) {
  return async (req: NextRequest, context: { params: any }) => {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userRole = (session.user as { role?: string }).role;

    // Fallback: If role is not in the session token, fetch it directly from the database
    if (!userRole) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
      });
      userRole = dbUser?.role;
    }

    if (!userRole || !roles.includes(userRole)) {
      return NextResponse.json(
        { error: `Forbidden: ${roles.join(" or ")} access required` },
        { status: 403 }
      );
    }

    return handler(req, context);
  };
}
