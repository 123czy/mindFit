// Google OAuth 相关类型定义

// Google Identity Services 全局对象类型
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          renderButton: (
            element: HTMLElement,
            config: GoogleButtonConfiguration
          ) => void;
          prompt: (
            callback?: (notification: PromptMomentNotification) => void
          ) => void;
          disableAutoSelect: () => void;
          storeCredential: (
            credential: CredentialResponse,
            callback?: () => void
          ) => void;
          cancel: () => void;
          onGoogleLibraryLoad: () => void;
          revoke: (accessToken: string, callback: () => void) => void;
        };
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient;
        };
      };
    };
  }
}

// Google ID 配置
export interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: "signin" | "signup" | "use";
  itp_support?: boolean;
  login_uri?: string;
  native_callback?: (response: CredentialResponse) => void;
  nonce?: string;
  prompt_parent_id?: string;
  state_cookie_domain?: string;
  ux_mode?: "popup" | "redirect";
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: () => void;
}

// Google 按钮配置
export interface GoogleButtonConfiguration {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: string | number;
  locale?: string;
}

// 凭据响应
export interface CredentialResponse {
  credential: string; // JWT ID Token
  select_by:
    | "auto"
    | "user"
    | "user_1tap"
    | "user_2tap"
    | "btn"
    | "btn_confirm"
    | "btn_add_session"
    | "btn_confirm_add_session";
  client_id?: string;
}

// 提示通知
export interface PromptMomentNotification {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () =>
    | "browser_not_supported"
    | "invalid_client"
    | "missing_client_id"
    | "opt_out_or_no_session"
    | "secure_http_required"
    | "suppressed_by_user"
    | "unregistered_origin"
    | "unknown_reason";
  isSkippedMoment: () => boolean;
  getSkippedReason: () =>
    | "auto_cancel"
    | "user_cancel"
    | "tap_outside"
    | "issuing_failed";
  isDismissedMoment: () => boolean;
  getDismissedReason: () =>
    | "credential_returned"
    | "cancel_called"
    | "flow_restarted";
  getMomentType: () => "display" | "skipped" | "dismissed";
}

// Token 客户端配置
export interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  error_callback?: (error: Error) => void;
  state?: string;
  enable_granular_consent?: boolean;
  hint?: string;
  hosted_domain?: string;
  select_account?: boolean;
}

// Token 客户端
export interface TokenClient {
  requestAccessToken: (overrideConfig?: Partial<TokenClientConfig>) => void;
}

// Token 响应
export interface TokenResponse {
  access_token: string;
  authuser: string;
  expires_in: number;
  hd?: string;
  prompt: string;
  scope: string;
  state?: string;
  token_type: string;
}

// Google 用户信息
export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  verified_email: boolean;
}

export interface GoogleUserResponse {
  user: {
    avatar_url: "string";
    bio: "string";
    created_at: "string";
    display_name: "string";
    email: "string";
    email_verified: true;
    id: "string";
    last_login_at: "string";
    locale: "string";
    role: "string";
    updated_at: "string";
  };
  access_token: string;
}

// JWT Token 载荷
export interface GoogleJwtPayload {
  iss: string; // Issuer
  aud: string; // Audience
  sub: string; // Subject (user ID)
  iat: number; // Issued at
  exp: number; // Expiration time
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  hd?: string; // Hosted domain
  nonce?: string;
}

export default {};
