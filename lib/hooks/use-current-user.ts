"use client";

import { useAuth } from "../auth/auth-context";

/**
 * Hook to get current user data from Supabase Auth
 * This is now a wrapper around useAuth for backward compatibility
 */
export function useCurrentUser() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return {
    user,
    isLoading,
    error: null,
    isAuthenticated,
  };
}
