"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { ChatInterface } from "@/components/chat-interface";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

interface PlanEditorProps {
  planId: string;
}

export function PlanEditor({ planId }: PlanEditorProps) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading } = useSWR(
    user ? `/api/plans/${planId}` : null,
    fetcher
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [authLoading, user, router]);

  if (authLoading || isLoading || !data?.plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const plan = data.plan;
  const planTitle = plan.title || "Business Plan";

  return (
    <div className="flex h-full flex-col">
      <ChatInterface planId={planId} planTitle={planTitle} />
    </div>
  );
}
