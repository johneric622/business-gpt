import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  try {
    await destroySession();
    const response = NextResponse.json({ success: true });
    response.cookies.delete("session_token");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
