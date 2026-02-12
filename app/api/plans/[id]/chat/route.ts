import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const SYSTEM_PROMPT = `You are a helpful business consultant AI assistant helping a user create a comprehensive business plan. Your role is to:

1. Ask questions naturally and conversationally (one or two at a time, not all at once)
2. Guide the user through all essential business plan sections:
   - Business name and description
   - Target market and customer demographics
   - Problem being solved
   - Solution/product offering
   - Revenue model and pricing
   - Customer acquisition strategy
   - Competitive landscape
   - Operations model
   - Leadership team
   - Financial projections
   - Funding needs
   - Goals and milestones

3. Be conversational and friendly - like chatting with a business advisor
4. Ask follow-up questions when answers are vague or incomplete
5. Acknowledge good answers and show enthusiasm
6. When you have gathered sufficient information across all key areas, suggest generating the business plan
7. Don't ask all questions at once - have a natural conversation flow
8. If the user provides information that covers multiple topics, acknowledge it and ask about the next missing piece

Remember: You're having a conversation, not conducting an interrogation. Make it feel natural and engaging.`;

// Check if we have enough information
function hasEnoughInformation(messages: Array<{ role: string; content: string }>) {
  const userMessages = messages.filter((m) => m.role === "user");
  const conversationLength = userMessages.length;
  
  // Rough heuristic: if we have 8+ user messages, we likely have enough info
  // The AI will make the final determination
  return conversationLength >= 8;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const { message } = await req.json();

    if (!message) {
      return new Response("Message is required", { status: 400 });
    }

    const sql = getDb();

    // Verify plan belongs to user
    const planCheck = await sql`
      SELECT id, title FROM business_plans
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

    // Build context for AI
    const hasEnough = hasEnoughInformation(conversationHistory);
    const contextPrompt = hasEnough
      ? "\n\nNote: You've gathered substantial information. Consider suggesting that the user is ready to generate their business plan, but continue the conversation naturally if they want to add more details."
      : "\n\nContinue asking questions to gather all necessary information for a complete business plan.";

    // Initialize LangChain ChatOpenAI with streaming
    const model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.7,
      streaming: true,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Convert conversation history to LangChain messages
    const langchainMessages = [
      new SystemMessage(SYSTEM_PROMPT + contextPrompt),
      ...conversationHistory.map((msg) => {
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        } else if (msg.role === "assistant") {
          return new AIMessage(msg.content);
        }
        return null;
      }).filter((msg): msg is HumanMessage | AIMessage => msg !== null),
      new HumanMessage(message),
    ];

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const stream = await model.stream(langchainMessages);

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
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

