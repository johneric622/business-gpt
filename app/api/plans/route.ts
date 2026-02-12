import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = getDb();
    const plans = await sql`
      SELECT id, title, status, current_step, created_at, updated_at
      FROM business_plans
      WHERE user_id = ${user.id}
      ORDER BY updated_at DESC
    `;

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("List plans error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json();
    const sql = getDb();

    const rows = await sql`
      INSERT INTO business_plans (user_id, title)
      VALUES (${user.id}, ${title || "Untitled Plan"})
      RETURNING id, title, status, current_step, structured_answers, generated_plan_text, created_at, updated_at
    `;

    return NextResponse.json({ plan: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
