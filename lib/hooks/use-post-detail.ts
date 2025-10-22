"use client";

import { useState, useEffect } from "react";
import {
  getPostById,
  getProductsByPostId,
  incrementViewCount,
} from "../supabase/api";
import { mapDbPostToPost, type Post } from "../types";

/**
 * Hook to fetch a single post by ID
 */
export function usePostDetail(postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function loadPost() {
      if (!postId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data: dbPost, error: fetchError } = await getPostById(postId);

        if (fetchError) {
          throw fetchError;
        }

        if (dbPost) {
          // 获取关联的商品
          const { data: products } = await getProductsByPostId(postId);

          // 增加浏览次数
          incrementViewCount(postId);

          setPost(mapDbPostToPost(dbPost as any, products || []));
        } else {
          setError(new Error("Post not found"));
        }
      } catch (err) {
        console.error("Error loading post:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPost();
  }, [postId]);

  return {
    post,
    isLoading,
    error,
  };
}

