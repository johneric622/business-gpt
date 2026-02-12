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
    const rows = await sql`
      SELECT id, title, status, current_step, structured_answers, generated_plan_text, created_at, updated_at
      FROM business_plans
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan: rows[0] });
  } catch (error) {
    console.error("Get plan error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const sql = getDb();

    // Check ownership
    const existing = await sql`SELECT id FROM business_plans WHERE id = ${id} AND user_id = ${user.id}`;
    if (existing.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Update title if provided (don't update updated_at to maintain order)
    if (body.title !== undefined) {
      await sql`
        UPDATE business_plans
        SET title = ${body.title}
        WHERE id = ${id}
      `;
    }

    if (body.structured_answers !== undefined) {
      await sql`
        UPDATE business_plans
        SET structured_answers = ${JSON.stringify(body.structured_answers)}::jsonb,
            current_step = ${body.current_step ?? 0},
            title = ${body.title || existing[0].title || "Untitled Plan"},
            updated_at = NOW()
        WHERE id = ${id}
      `;
    }

    if (body.generated_plan_text !== undefined) {
      await sql`
        UPDATE business_plans
        SET generated_plan_text = ${body.generated_plan_text},
            status = 'completed',
            updated_at = NOW()
        WHERE id = ${id}
      `;
    }

    if (body.status !== undefined) {
      await sql`
        UPDATE business_plans
        SET status = ${body.status},
            updated_at = NOW()
        WHERE id = ${id}
      `;
    }

    const rows = await sql`
      SELECT id, title, status, current_step, structured_answers, generated_plan_text, created_at, updated_at
      FROM business_plans
      WHERE id = ${id}
    `;

    return NextResponse.json({ plan: rows[0] });
  } catch (error) {
    console.error("Update plan error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
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
    await sql`DELETE FROM business_plans WHERE id = ${id} AND user_id = ${user.id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete plan error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
