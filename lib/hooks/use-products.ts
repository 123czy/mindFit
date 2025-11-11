"use client";

import { useState, useEffect } from "react";
import { apiGet } from "../utils/api-client";
import { mapDbProductToProduct, type Product } from "../types";

interface UseProductsOptions {
  limit?: number;
  userId?: string;
  category?: string;
  isActive?: boolean;
}

/**
 * Hook to fetch products from Supabase
 */
export function useProducts(options?: UseProductsOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();
        if (options?.limit) query.set("limit", String(options.limit));
        if (options?.userId) query.set("userId", options.userId);
        if (options?.category) query.set("category", options.category);
        if (options?.isActive !== undefined) {
          query.set("isActive", String(options.isActive));
        }

        const queryString = query.toString();
        const url = queryString ? `/api/products?${queryString}` : "/api/products";

        const response = await apiGet<{ data: any[] }>(url);

        if (response.data) {
          const mappedProducts = response.data.map((dbProduct: any) =>
            mapDbProductToProduct(dbProduct)
          );
          setProducts(mappedProducts);
        }
      } catch (err) {
        console.error("Error loading products:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [
    options?.limit,
    options?.userId,
    options?.category,
    options?.isActive,
  ]);

  return {
    products,
    isLoading,
    error,
  };
}
