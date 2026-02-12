"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Loader2,
  MessageSquare,
} from "lucide-react";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

export function DashboardContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const { data } = useSWR(
    user ? "/api/plans" : null,
    fetcher
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [authLoading, user, router]);

  const createPlan = useCallback(async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Business Plan" }),
      });
      const { plan } = await res.json();
      router.push(`/plan/${plan.id}`);
    } catch {
      setCreating(false);
    }
  }, [router]);


  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }


  return (
    <div className="flex h-full flex-col items-center justify-center p-6 pt-20 md:pt-6">
      <div className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Welcome to BusinessPlan GPT
          </h1>
          <p className="text-base text-muted-foreground">
            Create professional business plans with AI assistance. Start a new conversation or select an existing plan from the sidebar.
          </p>
        </div>
        <Button onClick={createPlan} disabled={creating} size="lg" className="gap-2">
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Create New Business Plan
        </Button>
      </div>
    </div>
  );
}
