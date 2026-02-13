"use client";

import React from "react"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ArrowLeft, Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PlanViewerProps {
  planText: string;
  planTitle: string;
  onBack: () => void;
  onContinueChatting: () => void;
  onRegenerate: (instructions: string) => Promise<void>;
  planId: string;
  isGenerating?: boolean;
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="mt-8 mb-3 text-xl font-bold text-foreground first:mt-0"
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="mt-5 mb-2 text-base font-semibold text-foreground">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      const content = line.slice(2);
      // Handle inline bold text within list items
      const parts = content.split(/(\*\*.*?\*\*)/g);
      elements.push(
        <li key={i} className="ml-4 text-sm leading-relaxed text-foreground list-disc">
          {parts.map((part, idx) => 
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={idx}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </li>
      );
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={i} className="mt-2 text-sm font-semibold text-foreground">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      // Process inline bold text in regular paragraphs
      const parts = line.split(/(\*\*.*?\*\*)/g);
      elements.push(
        <p key={i} className="text-sm leading-relaxed text-foreground">
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

  return elements;
}

export function PlanViewer({ planText, planTitle, onBack, onContinueChatting, onRegenerate, planId, isGenerating = false }: PlanViewerProps) {
  const [downloading, setDownloading] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  
  const isProcessing = regenerating || isGenerating;

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;
      let pageNum = 1;

      function addPageNumber() {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
        doc.setTextColor(30, 30, 30);
      }

      function checkPageBreak(needed: number) {
        if (y + needed > pageHeight - 20) {
          addPageNumber();
          doc.addPage();
          pageNum++;
          y = margin;
        }
      }

      // Title page
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(planTitle, pageWidth / 2, pageHeight / 3, { align: "center" });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Business Plan", pageWidth / 2, pageHeight / 3 + 12, {
        align: "center",
      });
      doc.text(
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        pageWidth / 2,
        pageHeight / 3 + 22,
        { align: "center" }
      );
      doc.setTextColor(30, 30, 30);
      addPageNumber();
      doc.addPage();
      pageNum++;

      // Content
      const lines = planText.split("\n");
      for (const line of lines) {
        if (line.startsWith("## ")) {
          checkPageBreak(20);
          y += 12;
          const headingText = line.slice(3).trim();
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text(headingText, margin, y);
          doc.setFont("helvetica", "normal"); // Reset to normal after heading
          y += 5;
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, y, pageWidth - margin, y);
          y += 10;
        } else if (line.startsWith("### ")) {
          checkPageBreak(15);
          y += 8;
          const subHeadingText = line.slice(4).trim();
          doc.setFontSize(13);
          doc.setFont("helvetica", "bold");
          doc.text(subHeadingText, margin, y);
          doc.setFont("helvetica", "normal"); // Reset to normal after subheading
          y += 10;
        } else if (line.startsWith("- ")) {
          checkPageBreak(8);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          const content = line.slice(2);
          // Process inline bold text: split by **text** patterns
          const parts = content.split(/(\*\*.*?\*\*)/g);
          let currentX = margin + 8;
          doc.text("\u2022", margin, y);
          
          for (const part of parts) {
            if (!part) continue;
            
            if (part.startsWith("**") && part.endsWith("**")) {
              // Bold text
              const boldText = part.slice(2, -2);
              doc.setFont("helvetica", "bold");
              const wrapped = doc.splitTextToSize(boldText, contentWidth - 8);
              for (let i = 0; i < wrapped.length; i++) {
                if (i > 0) {
                  y += 5;
                  currentX = margin + 8;
                  checkPageBreak(5);
                }
                doc.text(wrapped[i], currentX, y);
                currentX = margin + 8 + doc.getTextWidth(wrapped[i]);
              }
              doc.setFont("helvetica", "normal");
            } else {
              // Normal text
              const wrapped = doc.splitTextToSize(part, contentWidth - 8);
              for (let i = 0; i < wrapped.length; i++) {
                if (i > 0) {
                  y += 5;
                  currentX = margin + 8;
                  checkPageBreak(5);
                }
                doc.text(wrapped[i], currentX, y);
                currentX = margin + 8 + doc.getTextWidth(wrapped[i]);
              }
            }
          }
          y += 6;
        } else if (line.trim() === "") {
          y += 4;
        } else {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          // Process inline bold text in regular paragraphs
          const parts = line.split(/(\*\*.*?\*\*)/g);
          let currentX = margin;
          
          for (const part of parts) {
            if (!part) continue;
            
            if (part.startsWith("**") && part.endsWith("**")) {
              // Bold text
              const boldText = part.slice(2, -2);
              doc.setFont("helvetica", "bold");
              const wrapped = doc.splitTextToSize(boldText, contentWidth);
              for (let i = 0; i < wrapped.length; i++) {
                if (i > 0 || currentX > margin) {
                  y += 5;
                  currentX = margin;
                  checkPageBreak(5);
                }
                doc.text(wrapped[i], currentX, y);
                currentX = margin + doc.getTextWidth(wrapped[i]);
              }
              doc.setFont("helvetica", "normal");
            } else {
              // Normal text
              const wrapped = doc.splitTextToSize(part, contentWidth - (currentX - margin));
              for (let i = 0; i < wrapped.length; i++) {
                if (i > 0 || currentX > margin) {
                  y += 5;
                  currentX = margin;
                  checkPageBreak(5);
                }
                doc.text(wrapped[i], currentX, y);
                currentX = margin + doc.getTextWidth(wrapped[i]);
              }
            }
          }
          y += 6;
        }
      }

      addPageNumber();
      doc.save(`${planTitle.replace(/[^a-zA-Z0-9]/g, "_")}_Business_Plan.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  async function handleRegenerate() {
    if (!instructions.trim()) {
      return;
    }
    
    // Close dialog immediately when user clicks Regenerate
    setShowRegenerateDialog(false);
    const userInstructions = instructions.trim();
    setInstructions("");
    
    setRegenerating(true);
    try {
      await onRegenerate(userInstructions);
    } catch (error) {
      console.error("Regeneration error:", error);
      // Reopen dialog on error so user can try again
      setShowRegenerateDialog(true);
      setInstructions(userInstructions);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 sm:mt-2">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onContinueChatting}
            disabled={isProcessing}
            className="gap-1.5 text-xs shrink-0"
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Continue Chatting</span>
            <span className="sm:hidden">Chat</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRegenerateDialog(true)}
            disabled={isProcessing}
            className="gap-1.5 text-xs shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Regenerate Plan</span>
            <span className="sm:hidden">Regenerate</span>
          </Button>
        </div>
        <Button
          onClick={handleDownloadPDF}
          disabled={downloading || isProcessing}
          className="gap-2 shrink-0"
          size="sm"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          ) : (
            <Download className="h-4 w-4 shrink-0" />
          )}
          <span className="hidden sm:inline">Download PDF</span>
          <span className="sm:hidden">Download</span>
        </Button>
      </div>

      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Business Plan</DialogTitle>
            <DialogDescription>
              What would you like to change? For example: "Make it more detailed", "Remove financial projections", "Add marketing strategy section", etc.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter your instructions here..."
              className="min-h-[120px] resize-none"
              disabled={regenerating}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRegenerateDialog(false);
                setInstructions("");
              }}
              disabled={regenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={!instructions.trim() || regenerating}
              className="gap-2"
            >
              {regenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-border">
        <CardContent className="p-6 sm:p-8">
          <article className="prose-sm max-w-none">{renderMarkdown(planText)}</article>
        </CardContent>
      </Card>
    </div>
  );
}
