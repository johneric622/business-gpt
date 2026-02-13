"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Plus,
  FileText,
  LogOut,
  Loader2,
  MessageSquare,
  Search,
  Pencil,
  Sparkles,
  PanelLeft,
  MoreVertical,
  Trash2,
  ExternalLink,
} from "lucide-react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Plan {
  id: string;
  title: string;
  status: string;
  updated_at: string;
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch");
    return r.json();
  });

export function PlansSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [renamingPlanId, setRenamingPlanId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isCollapsed = state === "collapsed";

  const { data, isLoading, mutate } = useSWR(
    user ? "/api/plans" : null,
    fetcher
  );

  const plans: Plan[] = data?.plans ?? [];
  const currentPlanId = pathname?.split("/plan/")[1];
  
  // Filter plans based on search query
  const filteredPlans = plans.filter((plan) =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createPlan = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Business Plan" }),
      });
      const { plan } = await res.json();
      router.push(`/plan/${plan.id}`);
      mutate();
    } catch (error) {
      console.error("Failed to create plan:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (planId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    try {
      await fetch(`/api/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      mutate();
      setRenamingPlanId(null);
      setRenameValue("");
    } catch (error) {
      console.error("Failed to rename plan:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletePlanId) return;
    setDeleting(true);
    try {
      await fetch(`/api/plans/${deletePlanId}`, {
        method: "DELETE",
      });
      mutate();
      if (currentPlanId === deletePlanId) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to delete plan:", error);
    } finally {
      setDeleting(false);
      setDeletePlanId(null);
    }
  };

  const startRename = (plan: Plan) => {
    setRenamingPlanId(plan.id);
    setRenameValue(plan.title);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/" 
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-sidebar-foreground" />
              </Link>
              <div className="flex-1" />
              <SidebarTrigger className="h-8 w-8" variant="ghost" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link 
                href="/" 
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-sidebar-foreground" />
              </Link>
              <SidebarTrigger className="h-8 w-8" variant="ghost" />
            </div>
          )}
          <div className={cn("mt-3", isCollapsed && "flex flex-col items-center gap-1")}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={createPlan}
                    disabled={creating}
                    className="h-8 w-8 justify-center p-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    size="sm"
                    variant="ghost"
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Pencil className="h-4 w-4 shrink-0" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>New Plan</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                onClick={createPlan}
                disabled={creating}
                className="w-full justify-start gap-2 bg-transparent hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                size="sm"
                variant="ghost"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="h-4 w-4 shrink-0" />
                )}
                New Plan
              </Button>
            )}
          </div>
        </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      type="search"
                      placeholder=""
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-10 pl-2 pr-2 bg-sidebar text-sidebar-foreground border-sidebar-border"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Search plans</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 bg-sidebar text-sidebar-foreground border-sidebar-border"
                />
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 text-xs font-medium text-sidebar-foreground/70">
              Your Plans
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-280px)]">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : filteredPlans.length === 0 ? (
                !isCollapsed && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {searchQuery ? "No plans found" : "No plans yet. Create your first one!"}
                  </div>
                )
              ) : (
                <SidebarMenu>
                  {filteredPlans.map((plan) => {
                    const isActive = currentPlanId === plan.id;
                    const isRenaming = renamingPlanId === plan.id;
                    
                    return (
                      <SidebarMenuItem key={plan.id}>
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton
                                onClick={() => router.push(`/plan/${plan.id}`)}
                                isActive={isActive}
                                className={cn(
                                  "w-full justify-center px-2 rounded-lg",
                                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                                )}
                              >
                                <span className="text-xs truncate max-w-[2rem]">
                                  {plan.title.charAt(0).toUpperCase()}
                                </span>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{plan.title}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div className="group/item relative">
                            {isRenaming ? (
                              <div className="w-full px-3 py-2.5">
                                <Input
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  onBlur={() => handleRename(plan.id, renameValue)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleRename(plan.id, renameValue);
                                    } else if (e.key === "Escape") {
                                      setRenamingPlanId(null);
                                      setRenameValue("");
                                    }
                                  }}
                                  className="h-8 text-sm"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <>
                                <SidebarMenuButton
                                  onClick={() => router.push(`/plan/${plan.id}`)}
                                  isActive={isActive}
                                  className={cn(
                                    "w-full justify-start px-3 py-2.5 rounded-lg",
                                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                                  )}
                                >
                                  <span className="truncate text-sm flex-1">
                                    {plan.title}
                                  </span>
                                </SidebarMenuButton>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity",
                                        "hover:bg-sidebar-accent text-sidebar-foreground/70"
                                      )}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">More options</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent 
                                    align="start" 
                                    side="right"
                                    sideOffset={8}
                                    alignOffset={0}
                                    className="min-w-[180px]"
                                  >
                                    <DropdownMenuItem onClick={() => router.push(`/plan/${plan.id}`)}>
                                      <ExternalLink className="mr-2 h-4 w-4" />
                                      Open
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => startRename(plan)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setDeletePlanId(plan.id)}
                                      variant="destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </>
                            )}
                          </div>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 cursor-pointer">
                  <span className="text-xs font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{user?.email?.split("@")[0] || "User"}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                <span className="text-xs font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user?.email?.split("@")[0] || "User"}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="h-8 w-8 text-muted-foreground hover:text-sidebar-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Sign out</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Sign out</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>

    {/* Delete confirmation dialog */}
    <AlertDialog open={!!deletePlanId} onOpenChange={(open) => !open && setDeletePlanId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Business Plan</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this business plan and all its data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-white hover:bg-destructive/90 hover:text-white"
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </TooltipProvider>
  );
}

