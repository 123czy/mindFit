/**
 * 前端统一类型定义
 * 映射 Supabase 数据库类型到前端使用的类型
 */

import type { Database } from "./supabase/types";

// Supabase 数据库表类型
type DbUser = Database["public"]["Tables"]["users"]["Row"];
type DbPost = Database["public"]["Tables"]["posts"]["Row"];
type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbComment = Database["public"]["Tables"]["comments"]["Row"];

// 前端用户类型
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  bio?: string;
  walletAddress: string;
}

// 前端帖子类型
export interface Post {
  id: string;
  userId: string;
  title: string;
  body: string;
  images: string[];
  hasPaidContent: boolean;
  price?: number;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  author: User;
  products?: Product[];
  tags: string[];
}

// 前端商品类型
export interface Product {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  stockLimit: number | null;
  stockRemaining: number;
  contentType: "text" | "file" | "prompt";
  contentData?: any;
  imageUrl?: string;
  fileUrl?: string;
  category?: string;
  salesCount: number;
  chainProductId?: bigint; // 链上商品ID（用于智能合约交互）
  work_id?: Text | null;
}

// 前端评论类型
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentCommentId: string | null;
  content: string;
  likeCount: number;
  createdAt: string;
  author: User;
  replies?: Comment[];
}

// 转换函数：Supabase User -> Frontend User
export function mapDbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    username: dbUser.username || `user_${dbUser.id.substring(0, 8)}`,
    email: undefined,
    avatar: dbUser.avatar_url || "/placeholder-user.jpg",
    bio: dbUser.bio || undefined,
    walletAddress: dbUser.wallet_address,
  };
}

// 转换函数：Supabase Post -> Frontend Post
export function mapDbPostToPost(
  dbPost: DbPost & { users?: DbUser },
  products?: DbProduct[]
): Post {
  const author = dbPost.users
    ? mapDbUserToUser(dbPost.users)
    : {
        id: dbPost.user_id,
        username: "Unknown",
        avatar: "/placeholder-user.jpg",
        email: undefined,
        walletAddress: dbPost.wallet_address,
      };

  return {
    id: dbPost.id,
    userId: dbPost.user_id,
    title: dbPost.title,
    body: dbPost.content,
    images: dbPost.images || [],
    hasPaidContent: dbPost.is_paid,
    price: dbPost.price ? Number(dbPost.price) : undefined,
    likeCount: dbPost.like_count,
    commentCount: dbPost.comment_count,
    viewCount: dbPost.view_count,
    createdAt: dbPost.created_at,
    author,
    products: products?.map(mapDbProductToProduct),
    tags: dbPost.tags || [],
  };
}

// 转换函数：Supabase Product -> Frontend Product
export function mapDbProductToProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    userId: dbProduct.user_id,
    title: dbProduct.name,
    description: dbProduct.description,
    price: Number(dbProduct.price),
    isFree: Number(dbProduct.price) === 0,
    stockLimit: dbProduct.stock,
    stockRemaining: dbProduct.stock
      ? dbProduct.stock - dbProduct.sales_count
      : 999,
    contentType: (dbProduct.category as any) || "text",
    contentData: undefined,
    imageUrl: dbProduct.image_url || undefined,
    fileUrl: dbProduct.file_url || undefined,
    category: dbProduct.category || undefined,
    salesCount: dbProduct.sales_count,
    chainProductId: (dbProduct as any).chain_product_id
      ? BigInt((dbProduct as any).chain_product_id)
      : undefined,
  };
}

// 转换函数：Supabase Comment -> Frontend Comment
export function mapDbCommentToComment(
  dbComment: DbComment & { users?: DbUser }
): Comment {
  const author = dbComment.users
    ? mapDbUserToUser(dbComment.users)
    : {
        id: dbComment.user_id,
        username: "Unknown",
        avatar: "/placeholder-user.jpg",
        email: undefined,
        walletAddress: dbComment.wallet_address,
      };

  return {
    id: dbComment.id,
    postId: dbComment.post_id,
    userId: dbComment.user_id,
    parentCommentId: dbComment.parent_id,
    content: dbComment.content,
    likeCount: 0, // 可以后续添加点赞功能
    createdAt: dbComment.created_at,
    author,
    replies: [],
  };
}
