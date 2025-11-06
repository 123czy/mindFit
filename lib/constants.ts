// Constants for the 炒词 platform

export const APP_NAME = "炒词";
export const APP_DESCRIPTION =
  "DigitalArtist Community - Share, Trade, and Monetize AI Content";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  POST_DETAIL: (id: string) => `/post/${id}`,
  PUBLISH: "/publish",
  PROFILE: (username: string) => `/profile/${username}`,
  NOTIFICATIONS: "/notifications",
  SEARCH: "/search",
} as const;

export const MAX_IMAGES_PER_POST = 10;
export const MAX_TAGS_PER_POST = 5;
export const MAX_TITLE_LENGTH = 50;
export const MAX_COMMENT_LENGTH = 500;

export const SOCIAL_PLATFORMS = [
  "Twitter",
  "Instagram",
  "GitHub",
  "LinkedIn",
  "Website",
  "YouTube",
  "TikTok",
] as const;

// 环境配置
export const ENV_CONFIG = {
  // API 配置
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "10000"),

  // 应用配置
  APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE || "炒词",

  // Google OAuth 配置
  GOOGLE_CLIENT_ID:
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "510193650175-lubal0lnrbjns8quick93ck41d6vse1n.apps.googleusercontent.com",

  // 环境标识
  IS_DEV: process.env.NEXT_PUBLIC_MODE === "development",
  IS_STAGING: process.env.NEXT_PUBLIC_MODE === "staging",
  IS_PROD: process.env.NEXT_PUBLIC_MODE === "production",

  // 开发环境 API 地址（用于代理）
  DEV_API_URL: "http://106.52.76.120:8080",

  // 生产环境 API 地址
  PROD_API_URL: "http://129.226.152.88:8080",
};
