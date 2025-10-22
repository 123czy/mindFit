"use client";

import { useState, useEffect } from "react";
import { getProducts } from "../supabase/api";
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
        const { data, error: fetchError } = await getProducts({
          limit: options?.limit || 20,
          userId: options?.userId,
          category: options?.category,
          isActive: options?.isActive,
        });

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          const mappedProducts = data.map((dbProduct: any) =>
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

