"use client";

import { useState, useEffect } from "react";
import { apiGet } from "../utils/api-client";
import { mapDbPostToPost, type Post } from "../types";

interface UsePostsOptions {
  limit?: number;
  userId?: string;
  tags?: string[];
}

/**
 * Hook to fetch posts from Supabase
 */
export function usePosts(options?: UsePostsOptions) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();
        if (options?.limit) query.set("limit", String(options.limit));
        if (options?.userId) query.set("userId", options.userId);
        if (options?.tags?.length) query.set("tags", options.tags.join(","));

        const queryString = query.toString();
        const url = queryString ? `/api/posts?${queryString}` : "/api/posts";
        const response = await apiGet<{ data: Array<any & { products?: any[] }> }>(url);

        const data = response.data ?? [];
        const postsWithProducts = data.map((dbPost) =>
          mapDbPostToPost(dbPost as any, dbPost.products || [])
        );

        setPosts(postsWithProducts);
      } catch (err) {
        console.error("Error loading posts:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, [options?.limit, options?.userId, options?.tags?.join(",")]);

  return {
    posts,
    isLoading,
    error,
  };
}
