/**
 * API 类型定义
 * 基于 doc.json (Swagger 2.0) 生成的 TypeScript 类型
 */

// ==================== 通用类型 ====================

export interface ErrorResponse {
  error: string;
}

export interface MetaResponse {
  default_locale?: string;
  locale?: string;
  locale_fallback?: boolean;
}

// ==================== 认证相关 ====================

export interface GoogleSignInRequest {
  id_token: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// ==================== 用户相关 ====================

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  avatarURL?: string;
  bio?: string;
  locale?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UpdateMeRequest {
  avatar_url?: string;
  bio?: string;
  display_name?: string;
  locale?: string;
}

// ==================== 帖子相关 ====================

export interface AuthorResource {
  id: string;
  display_name: string;
  avatar_url?: string;
}

export interface TagResource {
  id: string;
  display_name: string;
  slug: string;
  locale_fallback?: boolean;
}

export interface ResourceMeta {
  locale?: string;
  locale_fallback?: boolean;
}

export interface SalableResource {
  id: string;
  title: string;
  description?: string;
  price_cents: number;
  currency: string;
}

export interface PostResource {
  id: string;
  title: string;
  body: string;
  cover_image_url?: string;
  author: AuthorResource;
  tags: TagResource[];
  salable?: SalableResource;
  meta?: ResourceMeta;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface PostListResponse {
  data: PostResource[];
  meta: MetaResponse;
}

export interface PostSingleResponse {
  data: PostResource;
  meta: MetaResponse;
}

export interface CreatePostRequest {
  title: string;
  body: string;
  tag_ids?: string[];
  salable_id?: string;
}

export interface UpdatePostRequest {
  title?: string;
  body?: string;
  tag_ids?: string[];
  salable_id?: string;
}

// ==================== Prompt 相关 ====================

export type GenerationType = "Text" | "Image" | "Video";
export type PromptStatus = "draft" | "published" | "archived";

export interface PromptExampleOutputView {
  id: string;
  content: string;
  imageID?: string;
  order: number;
}

export interface PromptVersionView {
  id: string;
  promptTemplate: string;
  model: string;
  description?: string;
  latest: boolean;
  createdAt: string;
  exampleOutputs: PromptExampleOutputView[];
}

export interface PromptView {
  promptFileID: string;
  salableID?: string;
  ownerID: string;
  title: string;
  generationType: GenerationType;
  priceCents: number;
  currency: string;
  status: PromptStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  latestVersion?: PromptVersionView;
  versions?: PromptVersionView[];
  blockedAccess?: boolean;
}

export interface CreatePromptRequest {
  title: string;
  description?: string;
  prompt_template: string;
  model: string;
  generation_type?: string;
  price_cents: number;
  currency: string;
  tag_ids?: string[];
  example_outputs?: string[];
}

export interface UpdatePromptRequest {
  title?: string;
  price_cents?: number;
  currency?: string;
  status?: string;
  tag_ids?: string[];
}

export interface AddVersionRequest {
  prompt_template: string;
  model: string;
  description?: string;
  example_outputs?: string[];
}

// ==================== Salable 相关 ====================

export interface PromptFileMetaResource {
  id: string;
  title: string;
  generation_type: string;
  tags: string[];
}

export interface SalableListItemResource {
  id: string;
  owner_id: string;
  type: "PROMPT_FILE" | "BUNDLE";
  status: "draft" | "published" | "archived";
  price_cents: number;
  currency: string;
  created_at: string;
  updated_at: string;
  prompt_file?: PromptFileMetaResource;
}

export interface SalableListResponse {
  data: SalableListItemResource[];
}

export interface TransactionInfoResource {
  id: string;
  price_cents: number;
  currency: string;
  purchased_at: string;
}

export interface PurchasedSalableResource {
  salable: SalableListItemResource;
  transaction: TransactionInfoResource;
}

export interface PurchasedSalableListResponse {
  data: PurchasedSalableResource[];
}

export interface SuccessMessageResponse {
  success: boolean;
  message: string;
}

// ==================== Transaction 相关 ====================

export interface TransactionView {
  id: string;
  salable_id: string;
  from_user_id: string;
  to_user_id: string;
  price_cents: number;
  currency: string;
  created_at: string;
}

export interface CreateTransactionRequest {
  salable_id: string;
}
