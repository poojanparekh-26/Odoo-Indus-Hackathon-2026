import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
  const dbPath = process.env.DATABASE_URL || "prisma/dev.db";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(`${aiServiceUrl}/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ db_path: dbPath }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`AI Service responded with status: ${res.status}`);
      return NextResponse.json(
        { error: "AI service unavailable", fallback: true },
        { status: 503 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.error("AI Service request timed out after 10s");
    } else {
      console.error("AI Service fetch error:", error);
    }
    
    return NextResponse.json(
      { error: "AI service unreachable", fallback: true },
      { status: 503 }
    );
  }
}
