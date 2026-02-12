"use client";

import React from "react"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";

interface PlanViewerProps {
  planText: string;
  planTitle: string;
  onBack: () => void;
  planId: string;
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
      elements.push(
        <li key={i} className="ml-4 text-sm leading-relaxed text-foreground list-disc">
          {line.slice(2)}
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
      elements.push(
        <p key={i} className="text-sm leading-relaxed text-foreground">
          {line}
        </p>
      );
    }
  }

  return elements;
}

export function PlanViewer({ planText, planTitle, onBack, planId }: PlanViewerProps) {
  const [downloading, setDownloading] = useState(false);

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
          checkPageBreak(16);
          y += 8;
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text(line.slice(3), margin, y);
          y += 3;
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, y, pageWidth - margin, y);
          y += 6;
        } else if (line.startsWith("### ")) {
          checkPageBreak(12);
          y += 5;
          doc.setFontSize(13);
          doc.setFont("helvetica", "bold");
          doc.text(line.slice(4), margin, y);
          y += 6;
        } else if (line.startsWith("- ")) {
          checkPageBreak(8);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          const splitLines = doc.splitTextToSize(
            `  \u2022  ${line.slice(2)}`,
            contentWidth
          );
          for (const sl of splitLines) {
            checkPageBreak(5);
            doc.text(sl, margin, y);
            y += 5;
          }
        } else if (line.trim() === "") {
          y += 3;
        } else {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          const splitLines = doc.splitTextToSize(line, contentWidth);
          for (const sl of splitLines) {
            checkPageBreak(5);
            doc.text(sl, margin, y);
            y += 5;
          }
        }
      }

      addPageNumber();
      doc.save(`${planTitle.replace(/[^a-zA-Z0-9]/g, "_")}_Business_Plan.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Editor
        </Button>
        <Button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="gap-2"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-6 sm:p-8">
          <article className="prose-sm max-w-none">{renderMarkdown(planText)}</article>
        </CardContent>
      </Card>
    </div>
  );
}
