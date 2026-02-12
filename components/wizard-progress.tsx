"use client";

import { BUSINESS_PLAN_QUESTIONS, TOTAL_STEPS } from "@/lib/questions";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: number;
  answers: Record<string, string>;
  onStepClick: (step: number) => void;
}

export function WizardProgress({
  currentStep,
  answers,
  onStepClick,
}: WizardProgressProps) {
  const progress = Math.round((currentStep / TOTAL_STEPS) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Progress
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {currentStep}/{TOTAL_STEPS}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        {BUSINESS_PLAN_QUESTIONS.map((q, i) => {
          const isCompleted = !!answers[q.id];
          const isCurrent = i === currentStep;

          return (
            <button
              key={q.id}
              onClick={() => onStepClick(i)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                isCurrent
                  ? "bg-primary/10 font-medium text-primary"
                  : isCompleted
                    ? "text-foreground hover:bg-secondary"
                    : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className="truncate">{q.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
