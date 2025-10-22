"use client";

import { useState, useEffect } from "react";
import { getPosts, getProductsByPostId } from "../supabase/api";
import { mapDbPostToPost, mapDbProductToProduct, type Post } from "../types";

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
        const { data, error: fetchError } = await getPosts({
          limit: options?.limit || 20,
          userId: options?.userId,
          tags: options?.tags,
        });

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          // 为每个帖子获取关联的商品
          const postsWithProducts = await Promise.all(
            data.map(async (dbPost: any) => {
              const { data: products } = await getProductsByPostId(dbPost.id);
              return mapDbPostToPost(dbPost, products || []);
            })
          );

          setPosts(postsWithProducts);
        }
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

