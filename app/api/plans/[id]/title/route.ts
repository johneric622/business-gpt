import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";

const TITLE_PROMPT = `Based on the conversation history below, generate a concise, descriptive title for this business plan conversation. 

Requirements:
- The title should be 3-8 words maximum
- It should capture the essence of the business being discussed
- Focus on the business name, industry, or main product/service
- Make it clear and professional
- Do NOT include quotes, punctuation marks, or special characters
- Return ONLY the title, nothing else

Conversation history:`;

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
    const sql = getDb();

    // Verify plan belongs to user
    const planCheck = await sql`
      SELECT id, title FROM business_plans
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    if (planCheck.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Get conversation history (only first few messages for title generation)
    const messageRows = await sql`
      SELECT role, content
      FROM messages
      WHERE plan_id = ${id}
      ORDER BY created_at ASC
      LIMIT 10
    `;

    const conversationHistory = messageRows.map((row) => ({
      role: row.role as "user" | "assistant" | "system",
      content: row.content,
    }));

    // Build conversation text for context
    const conversationText = conversationHistory
      .filter((msg) => msg.role !== "system")
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n\n");

    // Initialize LangChain ChatOpenAI (non-streaming for title generation)
    const model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.3, // Lower temperature for more consistent titles
      streaming: false,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Convert conversation history to LangChain messages
    const langchainMessages = [
      new SystemMessage(TITLE_PROMPT + "\n\n" + conversationText),
      new HumanMessage("Generate the title now:"),
    ];

    // Generate title
    const response = await model.invoke(langchainMessages);
    
    let title = "";
    if (typeof response.content === "string") {
      title = response.content.trim();
    } else if (Array.isArray(response.content)) {
      title = response.content
        .map((c: any) => (typeof c === "string" ? c : c.text || c.content || ""))
        .join("")
        .trim();
    } else {
      title = String(response.content || "").trim();
    }

    // Clean up the title - remove quotes, extra whitespace, etc.
    title = title
      .replace(/^["']|["']$/g, "") // Remove surrounding quotes
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // Fallback if title is empty
    if (!title) {
      // Fallback: use first user message
      const firstUserMessage = conversationHistory.find((msg) => msg.role === "user");
      if (firstUserMessage) {
        title = firstUserMessage.content.trim();
      } else {
        title = "Business Plan";
      }
    }

    // Truncate title to 35 characters max (32 + "...")
    const MAX_TITLE_LENGTH = 30;
    const TRUNCATE_AT = 27;

    if (title.length > MAX_TITLE_LENGTH) {
      title = title.substring(0, TRUNCATE_AT) + "...";      
    }

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Generate title error:", error);
    return NextResponse.json(
      { error: "Failed to generate title" },
      { status: 500 }
    );
  }
}

