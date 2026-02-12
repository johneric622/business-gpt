"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppHeader } from "@/components/app-header";
import {
  FileText,
  MessageSquare,
  Download,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

function ChatPreview() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        {/* Chat window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <Sparkles className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground">
            BusinessPlan GPT
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            AI Assistant
          </span>
        </div>

        {/* Chat bubbles */}
        <div className="flex flex-col gap-4 p-4">
          {/* AI message */}
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="rounded-xl rounded-tl-sm bg-secondary px-4 py-2.5">
              <p className="text-sm leading-relaxed text-secondary-foreground">
                {"What's the name of your business and what industry are you in?"}
              </p>
            </div>
          </div>

          {/* User message */}
          <div className="flex justify-end gap-2.5">
            <div className="rounded-xl rounded-tr-sm bg-primary px-4 py-2.5">
              <p className="text-sm leading-relaxed text-primary-foreground">
                {"EcoBloom \u2014 we're building sustainable packaging for e-commerce brands."}
              </p>
            </div>
          </div>

          {/* AI message */}
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="rounded-xl rounded-tl-sm bg-secondary px-4 py-2.5">
              <p className="text-sm leading-relaxed text-secondary-foreground">
                {"Great choice! Who is your target customer, and what problem does EcoBloom solve for them?"}
              </p>
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
            <span className="text-sm text-muted-foreground">
              Type your answer...
            </span>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: MessageSquare,
    title: "AI-Guided Questions",
    description:
      "Answer simple, focused questions one at a time. Our AI guides you through every section of a professional business plan.",
  },
  {
    icon: FileText,
    title: "Investor-Ready Formatting",
    description:
      "Your answers are transformed into a polished, structured business plan with executive summaries, market analysis, and financial outlines.",
  },
  {
    icon: Download,
    title: "Download as PDF",
    description:
      "Export your completed business plan as a professionally formatted PDF document, ready to share with investors and stakeholders.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Hero */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Create Professional Business Plans in Minutes
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Answer a few guided questions and generate an investor-ready
            business plan instantly. Powered by AI, designed for founders.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2 px-8">
              <Link href="/auth?mode=signup">
                Start Creating
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="px-8 text-foreground bg-transparent"
            >
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Chat Preview */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Like chatting with a business advisor
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Our AI assistant walks you through each section, one question at a
              time.
            </p>
          </div>
          <ChatPreview />
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Everything you need to launch with confidence
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              From first idea to investor deck, all in one place.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border bg-card transition-colors hover:border-primary/20"
              >
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base text-card-foreground">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to build your business plan?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
            Join founders who use BusinessPlan GPT to go from idea to
            investor-ready plan in minutes.
          </p>
          <Button size="lg" asChild className="mt-8 gap-2 px-8">
            <Link href="/auth?mode=signup">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <FileText className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                BusinessPlan GPT
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              AI-powered business plan generation for modern founders.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </a>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl px-6">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            {"\u00A9"} {new Date().getFullYear()} BusinessPlan GPT. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
