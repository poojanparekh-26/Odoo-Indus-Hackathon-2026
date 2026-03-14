import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export function withRole(allowedRoles: string[], handler: Function) {
  return async function(req: NextRequest, context: any) {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Always fetch role fresh from database — never trust token cache
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden: manager access required" }, 
        { status: 403 }
      );
    }

    return handler(req, context);
  };
}
