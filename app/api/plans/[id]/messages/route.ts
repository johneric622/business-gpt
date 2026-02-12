import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sql = getDb();

    // Verify plan belongs to user
    const planCheck = await sql`
      SELECT id FROM business_plans
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    if (planCheck.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Get messages
    const messages = await sql`
      SELECT id, role, content, created_at
      FROM messages
      WHERE plan_id = ${id}
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.created_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { role, content } = await req.json();

    if (!role || !content) {
      return NextResponse.json(
        { error: "Role and content are required" },
        { status: 400 }
      );
    }

    if (!["user", "assistant", "system"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const sql = getDb();

    // Verify plan belongs to user
    const planCheck = await sql`
      SELECT id FROM business_plans
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    if (planCheck.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Insert message
    const rows = await sql`
      INSERT INTO messages (plan_id, role, content)
      VALUES (${id}, ${role}, ${content})
      RETURNING id, role, content, created_at
    `;

    return NextResponse.json({
      message: {
        id: rows[0].id,
        role: rows[0].role,
        content: rows[0].content,
        createdAt: rows[0].created_at.toISOString(),
      },
    });
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}


