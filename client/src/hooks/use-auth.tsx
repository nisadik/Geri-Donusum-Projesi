import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import type { PublicUser } from "@shared/schema";

type AuthContextValue = {
  user: PublicUser | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const query = useQuery<PublicUser | null>({
    queryKey: ["/api/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  return (
    <AuthContext.Provider
      value={{ user: query.data ?? null, isLoading: query.isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export async function refreshAuth() {
  await queryClient.invalidateQueries({ queryKey: ["/api/me"] });
}
