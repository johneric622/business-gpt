"use client";

import { BUSINESS_PLAN_QUESTIONS } from "@/lib/questions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Sparkles, Loader2 } from "lucide-react";

interface ReviewPanelProps {
  answers: Record<string, string>;
  onEdit: (step: number) => void;
  onGenerate: () => void;
  generating: boolean;
}

export function ReviewPanel({
  answers,
  onEdit,
  onGenerate,
  generating,
}: ReviewPanelProps) {
  const answeredCount = BUSINESS_PLAN_QUESTIONS.filter(
    (q) => answers[q.id]?.trim()
  ).length;
  const allAnswered = answeredCount === BUSINESS_PLAN_QUESTIONS.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Review Your Answers
          </h2>
          <p className="text-sm text-muted-foreground">
            {answeredCount}/{BUSINESS_PLAN_QUESTIONS.length} questions answered.{" "}
            {allAnswered
              ? "Ready to generate!"
              : "Complete all questions to generate."}
          </p>
        </div>
        <Button
          onClick={onGenerate}
          disabled={!allAnswered || generating}
          className="gap-2"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate Business Plan
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {BUSINESS_PLAN_QUESTIONS.map((q, i) => (
          <Card key={q.id} className="border-border">
            <CardHeader className="flex-row items-start justify-between p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {q.label}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                onClick={() => onEdit(i)}
              >
                <Pencil className="h-3 w-3" />
                <span className="sr-only">Edit {q.label}</span>
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              {answers[q.id] ? (
                <p className="text-sm leading-relaxed text-foreground">
                  {answers[q.id]}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  Not answered yet
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
