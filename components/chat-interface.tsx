"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Download, Sparkles, Copy, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { PlanViewer } from "./plan-viewer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let inList = false;

  const closeList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="ml-4 mb-2 list-disc space-y-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle headings
    if (trimmedLine.startsWith("## ")) {
      closeList();
      elements.push(
        <h2 key={`h2-${i}`} className="mt-4 mb-2 text-base font-bold first:mt-0">
          {trimmedLine.slice(3)}
        </h2>
      );
    } else if (trimmedLine.startsWith("### ")) {
      closeList();
      elements.push(
        <h3 key={`h3-${i}`} className="mt-3 mb-1.5 text-sm font-semibold">
          {trimmedLine.slice(4)}
        </h3>
      );
    } 
    // Handle bullet points
    else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
      if (!inList) {
        inList = true;
      }
      const content = trimmedLine.slice(2);
      // Handle bold text within list items
      const parts = content.split(/(\*\*.*?\*\*)/g);
      listItems.push(
        <li key={`li-${i}`} className="text-sm leading-relaxed">
          {parts.map((part, idx) => 
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={idx}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </li>
      );
    } 
    // Handle bold text (standalone)
    else if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**") && trimmedLine.length > 4) {
      closeList();
      elements.push(
        <p key={`bold-${i}`} className="mb-2 text-sm font-semibold">
          {trimmedLine.slice(2, -2)}
        </p>
      );
    } 
    // Handle empty lines
    else if (trimmedLine === "") {
      closeList();
      elements.push(<div key={`empty-${i}`} className="h-1" />);
    } 
    // Handle regular text
    else {
      closeList();
      // Process inline bold text
      const parts = trimmedLine.split(/(\*\*.*?\*\*)/g);
      elements.push(
        <p key={`p-${i}`} className="mb-2 text-sm leading-relaxed">
          {parts.map((part, idx) => 
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={idx}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </p>
      );
    }
  }

  // Close any open list
  closeList();

  return <div className="space-y-1">{elements}</div>;
}

interface ChatInterfaceProps {
  planId: string;
  planTitle: string;
}

export function ChatInterface({ planId, planTitle }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [showPlan, setShowPlan] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isCreatingWelcomeRef = useRef(false);

  // Load existing messages
  useEffect(() => {
    let isCancelled = false;
    isCreatingWelcomeRef.current = false;

    async function loadMessages() {
      try {
        const res = await fetch(`/api/plans/${planId}/messages`);
        if (res.ok) {
          const data = await res.json();
          const loadedMessages = data.messages || [];
          
          // Check if welcome message already exists
          const welcomeContent = "Hello! I'm here to help you create a comprehensive business plan. Let's start with the basics - what's the name of your business, and what industry are you in?";
          const hasWelcomeMessage = loadedMessages.some(
            (msg: Message) => msg.role === "assistant" && msg.content === welcomeContent
          );
          
          setMessages(loadedMessages);
          
          // If no messages and no welcome message exists, start the conversation
          if (loadedMessages.length === 0 && !hasWelcomeMessage && !isCreatingWelcomeRef.current && !isCancelled) {
            isCreatingWelcomeRef.current = true;
            
            const welcomeMessage: Message = {
              id: `msg-${Date.now()}`,
              role: "assistant",
              content: welcomeContent,
              createdAt: new Date().toISOString(),
            };
            
            setMessages([welcomeMessage]);
            
            // Save to database
            try {
              const saveRes = await fetch(`/api/plans/${planId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  role: "assistant",
                  content: welcomeMessage.content,
                }),
              });
              
              // If save failed or was cancelled, reload messages to check if another instance created it
              if (!saveRes.ok && !isCancelled) {
                const reloadRes = await fetch(`/api/plans/${planId}/messages`);
                if (reloadRes.ok) {
                  const reloadData = await reloadRes.json();
                  setMessages(reloadData.messages || []);
                }
              }
            } catch (error) {
              console.error("Failed to save initial message:", error);
              // Reload messages in case another instance created it
              if (!isCancelled) {
                try {
                  const reloadRes = await fetch(`/api/plans/${planId}/messages`);
                  if (reloadRes.ok) {
                    const reloadData = await reloadRes.json();
                    setMessages(reloadData.messages || []);
                  }
                } catch (reloadError) {
                  console.error("Failed to reload messages:", reloadError);
                }
              }
            } finally {
              isCreatingWelcomeRef.current = false;
            }
          }
        } else {
          // If request fails, still start conversation (only if not cancelled and not already creating)
          if (!isCancelled && !isCreatingWelcomeRef.current) {
            isCreatingWelcomeRef.current = true;
            const welcomeMessage: Message = {
              id: `msg-${Date.now()}`,
              role: "assistant",
              content: "Hello! I'm here to help you create a comprehensive business plan. Let's start with the basics - what's the name of your business, and what industry are you in?",
              createdAt: new Date().toISOString(),
            };
            setMessages([welcomeMessage]);
            isCreatingWelcomeRef.current = false;
          }
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        // Start conversation even if loading fails (only if not cancelled and not already creating)
        if (!isCancelled && !isCreatingWelcomeRef.current) {
          isCreatingWelcomeRef.current = true;
          const welcomeMessage: Message = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: "Hello! I'm here to help you create a comprehensive business plan. Let's start with the basics - what's the name of your business, and what industry are you in?",
            createdAt: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
          isCreatingWelcomeRef.current = false;
        }
      }
    }
    
    loadMessages();
    
    // Cleanup function to prevent race conditions
    return () => {
      isCancelled = true;
      isCreatingWelcomeRef.current = false;
    };
  }, [planId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Auto-focus textarea after AI response completes
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      // Small delay to ensure UI has updated
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);


  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Save user message
      await fetch(`/api/plans/${planId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content: userMessage.content,
        }),
      });

      // Get AI response
      const res = await fetch(`/api/plans/${planId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let assistantMessageId = `msg-${Date.now() + 1}`;

      // Add placeholder assistant message
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };
      setMessages([...updatedMessages, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          
          // Update streaming message
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: assistantContent }
                : msg
            )
          );
        }
      }

      // Check if AI suggested generating the plan
      if (assistantContent.toLowerCase().includes("generate your business plan") || 
          assistantContent.toLowerCase().includes("ready to generate") ||
          assistantContent.toLowerCase().includes("create your business plan")) {
        // Auto-trigger plan generation after a short delay
        setTimeout(() => {
          handleGeneratePlan();
        }, 2000);
      }

      // Save assistant message
      await fetch(`/api/plans/${planId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content: assistantContent,
        }),
      });
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGeneratePlan() {
    setIsGeneratingPlan(true);
    setShowPlan(true);

    try {
      const res = await fetch(`/api/plans/${planId}/generate`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Generation failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setGeneratedPlan(fullText);
        }
      }

      // Save the generated plan
      await fetch(`/api/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          generated_plan_text: fullText,
          status: "completed"
        }),
      });
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGeneratingPlan(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleCopyMessage(messageId: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }

  if (showPlan && generatedPlan) {
    return (
      <PlanViewer
        planText={generatedPlan}
        planTitle={planTitle}
        onBack={() => setShowPlan(false)}
        planId={planId}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <ScrollArea className="flex-1 px-4 pt-16 md:pt-4">
        <div className="mx-auto max-w-3xl space-y-6 py-6" ref={scrollRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "group flex flex-col gap-2",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "flex gap-3 w-full",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {message.role === "assistant" ? (
                    <div className="text-sm leading-relaxed [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:first:mt-0 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_p]:mb-2 [&_ul]:ml-4 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_li]:text-sm [&_li]:leading-relaxed [&_strong]:font-semibold">
                      {renderMarkdown(message.content)}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <span className="text-xs font-medium text-muted-foreground">
                      You
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyMessage(message.id, message.content)}
                className={cn(
                  "h-7 px-2 text-xs text-muted-foreground hover:text-foreground",
                  message.role === "user" ? "mr-11" : "ml-11"
                )}
              >
                {copiedMessageId === message.id ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl bg-secondary px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-secondary-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="bg-background">
        <div className="mx-auto max-w-3xl p-4">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading || isGeneratingPlan}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isGeneratingPlan}
              size="icon"
              className="h-[60px] w-[60px] shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          {messages.length > 2 && !generatedPlan && (
            <div className="mt-3 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
                className="gap-2"
              >
                {isGeneratingPlan ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Generate Business Plan
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

