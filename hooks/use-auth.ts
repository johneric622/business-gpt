"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) return { user: null };
    return res.json();
  });

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
  });
  const router = useRouter();

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await mutate();
      router.push("/dashboard");
      return data;
    },
    [mutate, router]
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await mutate();
      router.push("/dashboard");
      return data;
    },
    [mutate, router]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await mutate({ user: null }, false);
    router.push("/");
  }, [mutate, router]);

  return {
    user: data?.user ?? null,
    isLoading,
    isError: error,
    login,
    signup,
    logout,
  };
}
