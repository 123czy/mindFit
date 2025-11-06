// Database types generated from Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          username: string | null;
          avatar_url: string | null;
          bio: string | null;
          twitter: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          twitter?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          twitter?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          wallet_address: string;
          title: string;
          content: string;
          images: string[] | null;
          tags: string[] | null;
          is_paid: boolean;
          price: number | null;
          paid_content: string | null;
          view_count: number;
          like_count: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
          badge: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_address: string;
          title: string;
          content: string;
          images?: string[] | null;
          tags?: string[] | null;
          is_paid?: boolean;
          price?: number | null;
          paid_content?: string | null;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
          badge?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_address?: string;
          title?: string;
          content?: string;
          images?: string[] | null;
          tags?: string[] | null;
          is_paid?: boolean;
          price?: number | null;
          paid_content?: string | null;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          created_at?: string;
          updated_at?: string;
          badge?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          wallet_address: string;
          post_id: string | null;
          name: string;
          description: string;
          price: number;
          currency: string;
          image_url: string | null;
          file_url: string | null;
          category: string | null;
          stock: number | null;
          sales_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          chain_product_id: number | null;
          work_id: Text | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_address: string;
          post_id?: string | null;
          name: string;
          description: string;
          price: number;
          currency?: string;
          image_url?: string | null;
          file_url?: string | null;
          category?: string | null;
          stock?: number | null;
          sales_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          chain_product_id?: number | null;
          work_id?: Text | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_address?: string;
          post_id?: string | null;
          name?: string;
          description?: string;
          price?: number;
          currency?: string;
          image_url?: string | null;
          file_url?: string | null;
          category?: string | null;
          stock?: number | null;
          sales_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          chain_product_id?: number | null;
          work_id?: Text | null;
        };
      };
      purchases: {
        Row: {
          id: string;
          buyer_id: string;
          buyer_wallet: string;
          product_id: string;
          seller_id: string;
          seller_wallet: string;
          amount: number;
          currency: string;
          tx_hash: string | null;
          status: "pending" | "completed" | "failed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          buyer_wallet: string;
          product_id: string;
          seller_id: string;
          seller_wallet: string;
          amount: number;
          currency?: string;
          tx_hash?: string | null;
          status?: "pending" | "completed" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          buyer_wallet?: string;
          product_id?: string;
          seller_id?: string;
          seller_wallet?: string;
          amount?: number;
          currency?: string;
          tx_hash?: string | null;
          status?: "pending" | "completed" | "failed";
          created_at?: string;
          updated_at?: string;
        };
      };
      post_purchases: {
        Row: {
          id: string;
          buyer_id: string;
          buyer_wallet: string;
          post_id: string;
          seller_id: string;
          seller_wallet: string;
          amount: number;
          tx_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          buyer_wallet: string;
          post_id: string;
          seller_id: string;
          seller_wallet: string;
          amount: number;
          tx_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          buyer_wallet?: string;
          post_id?: string;
          seller_id?: string;
          seller_wallet?: string;
          amount?: number;
          tx_hash?: string | null;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          wallet_address: string;
          content: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          wallet_address: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          wallet_address?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          wallet_address: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          wallet_address: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          wallet_address?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
