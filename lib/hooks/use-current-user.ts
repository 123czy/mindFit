"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getOrCreateUser } from "../supabase/api";
import type { Database } from "../supabase/types";

type User = Database["public"]["Tables"]["users"]["Row"];

/**
 * Hook to get current user data from Supabase
 * Automatically creates user if doesn't exist
 */
export function useCurrentUser() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      if (!address || !isConnected) {
        setUser(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await getOrCreateUser(address);

        if (error) {
          setError(error);
          console.error("Error loading user:", error);
        } else {
          setUser(data);
        }
      } catch (err) {
        setError(err);
        console.error("Error in useCurrentUser:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [address, isConnected]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && isConnected,
  };
}
