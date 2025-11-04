// Export all API functions
export * from "./users";
export * from "./posts";
export * from "./products";
export * from "./purchases";

// Export optimized functions
export { getPostsWithProducts } from "./posts";
export { getProductsByPostIds } from "./products";
