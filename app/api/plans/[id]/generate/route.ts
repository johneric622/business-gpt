import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const SYSTEM_PROMPT = `You are a senior business consultant and expert business plan writer. Your task is to generate a comprehensive, professional business plan based on the conversation history with the user.

INSTRUCTIONS:
- Write in a professional, clear, and confident tone suitable for investors and lenders.
- Use proper business plan formatting with clear section headings.
- Do NOT hallucinate financial data. Only use numbers and projections the user has provided or clearly stated assumptions.
- If information is missing in certain areas, still write a complete section but note any assumptions made.
- Use Markdown formatting with ## for major sections and ### for subsections.
- Make the plan detailed, typically 3000-5000 words.
- Extract all relevant information from the conversation history to build a complete business plan.

REQUIRED SECTIONS:
## Executive Summary
## Company Overview
## Market Analysis
## Organization & Management
## Product / Service Line
## Marketing & Sales Strategy
## Funding Request
## Financial Projections
## Goals & Milestones

Write the complete business plan now based on the conversation history provided.`;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const sql = getDb();

  // Verify plan belongs to user
  const planCheck = await sql`
    SELECT id FROM business_plans
    WHERE id = ${id} AND user_id = ${user.id}
  `;

  if (planCheck.length === 0) {
    return new Response("Plan not found", { status: 404 });
  }

  // Get conversation history
  const messageRows = await sql`
    SELECT role, content
    FROM messages
    WHERE plan_id = ${id}
    ORDER BY created_at ASC
  `;

  const conversationHistory = messageRows.map((row) => ({
    role: row.role as "user" | "assistant" | "system",
    content: row.content,
  }));

  // Build context from conversation
  const conversationText = conversationHistory
    .filter((msg) => msg.role !== "system")
    .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n\n");

  // Initialize LangChain ChatOpenAI with streaming
  const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.7,
    streaming: true,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Create a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messages = [
          new SystemMessage(SYSTEM_PROMPT),
          new HumanMessage(
            `Here is the conversation history with the user about their business plan:\n\n${conversationText}\n\nPlease generate a complete, professional business plan based on all the information gathered in this conversation. Extract all relevant details about the business, market, operations, team, finances, and goals.`
          ),
        ];

        const stream = await model.stream(messages);

        for await (const chunk of stream) {
          let textContent = "";
          
          // Handle different content types from LangChain
          if (typeof chunk.content === "string") {
            textContent = chunk.content;
          } else if (Array.isArray(chunk.content)) {
            textContent = chunk.content
              .map((c: any) => (typeof c === "string" ? c : c.text || c.content || ""))
              .join("");
          } else {
            textContent = String(chunk.content || "");
          }
          
          if (textContent) {
            controller.enqueue(new TextEncoder().encode(textContent));
          }
        }

        controller.close();
      } catch (error) {
        console.error("Streaming error:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
