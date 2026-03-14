import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;

    if (!roles.includes(userRole)) {
      return NextResponse.json(
        { error: `Forbidden: ${roles.join(" or ")} access required` },
        { status: 403 }
      );
    }

    return handler(req, context);
  };
}
