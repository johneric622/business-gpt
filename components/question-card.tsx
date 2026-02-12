"use client";

import React from "react"

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, MessageSquare } from "lucide-react";
import type { Question } from "@/lib/questions";

interface QuestionCardProps {
  question: Question;
  stepNumber: number;
  totalSteps: number;
  value: string;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function QuestionCard({
  question,
  stepNumber,
  totalSteps,
  value,
  onAnswer,
  onNext,
  onPrev,
  isFirst,
  isLast,
}: QuestionCardProps) {
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [question.id]);

  function handleSubmit() {
    onAnswer(localValue.trim());
    onNext();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && localValue.trim()) {
      handleSubmit();
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Question {stepNumber} of {totalSteps}
            </p>
            <h2 className="text-sm font-semibold text-foreground">
              {question.label}
            </h2>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-foreground">
          {question.prompt}
        </p>
        <Textarea
          ref={textareaRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder}
          className="min-h-[120px] resize-none text-sm"
          onBlur={() => {
            if (localValue.trim() !== value) {
              onAnswer(localValue.trim());
            }
          }}
        />
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={isFirst}
            className="gap-1.5 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              Ctrl+Enter to continue
            </span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!localValue.trim()}
              className="gap-1.5 text-xs"
            >
              {isLast ? "Review Answers" : "Next"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
