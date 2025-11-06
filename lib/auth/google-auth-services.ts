import {
  GoogleIdConfiguration,
  CredentialResponse,
  GoogleUserInfo,
  GoogleJwtPayload,
} from "@/types/google-auth";

// Google OAuth 服务类
export class GoogleAuthService {
  private static clientId: string = "";
  private static isInitialized: boolean = false;
  private static callbacks: ((response: CredentialResponse) => void)[] = [];

  // 初始化 Google Identity Services
  static async initialize(clientId: string): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.clientId = clientId;

    return new Promise((resolve, reject) => {
      // 检查 Google 库是否已加载
      if (window.google?.accounts?.id) {
        this.setupGoogleId();
        resolve();
        return;
      }

      // 等待 Google 库加载
      const checkGoogle = () => {
        if (window.google?.accounts?.id) {
          this.setupGoogleId();
          resolve();
        } else {
          setTimeout(checkGoogle, 100);
        }
      };

      // 设置超时
      setTimeout(() => {
        if (!this.isInitialized) {
          reject(new Error("Google Identity Services failed to load"));
        }
      }, 10000);

      checkGoogle();
    });
  }

  // 设置 Google ID 服务
  private static setupGoogleId(): void {
    if (!window.google?.accounts?.id) {
      throw new Error("Google Identity Services not available");
    }

    const config: GoogleIdConfiguration = {
      client_id: this.clientId,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true,
      context: "signin",
      ux_mode: "popup",
    };

    window.google.accounts.id.initialize(config);
    this.isInitialized = true;
  }

  // 处理凭据响应
  private static handleCredentialResponse(response: CredentialResponse): void {
    this.callbacks.forEach((callback) => callback(response));
  }

  // 注册回调函数
  static onCredentialResponse(
    callback: (response: CredentialResponse) => void
  ): void {
    this.callbacks.push(callback);
  }

  // 移除回调函数
  static removeCallback(
    callback: (response: CredentialResponse) => void
  ): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  // 渲染 Google 登录按钮
  static renderButton(
    element: HTMLElement,
    options: {
      onSuccess: (response: CredentialResponse) => void;
      onError?: (error: Error) => void;
      buttonText?: string;
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
    }
  ): void {
    if (!this.isInitialized || !window.google?.accounts?.id) {
      throw new Error("Google Identity Services not initialized");
    }

    // 注册成功回调
    this.onCredentialResponse(options.onSuccess);

    // 按钮配置
    const buttonConfig = {
      type: "standard" as const,
      theme: options.theme || "outline",
      size: options.size || "large",
      text: "signin_with" as const,
      shape: "rectangular" as const,
      logo_alignment: "left" as const,
    };

    // 渲染按钮
    window.google.accounts.id.renderButton(element, buttonConfig);
  }

  // 解析 JWT Token 获取用户信息
  static parseJwtToken(credential: string): GoogleJwtPayload | null {
    try {
      // JWT Token 格式: header.payload.signature
      const parts = credential.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT token format");
      }

      // 解码 payload (base64url)
      const payload = parts[1];
      const decodedPayload = atob(
        payload.replace(/-/g, "+").replace(/_/g, "/")
      );

      return JSON.parse(decodedPayload) as GoogleJwtPayload;
    } catch (error) {
      console.error("Failed to parse JWT token:", error);
      return null;
    }
  }

  // 从 JWT 载荷提取用户信息
  static extractUserInfo(payload: GoogleJwtPayload): GoogleUserInfo {
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name,
      locale: payload.locale,
      verified_email: payload.email_verified,
    };
  }

  // 验证 JWT Token 是否有效
  static isTokenValid(payload: GoogleJwtPayload): boolean {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }

  // 登出
  static signOut(): void {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  // 获取当前配置的客户端ID
  static getClientId(): string {
    return this.clientId;
  }

  // 检查是否已初始化
  static getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

export default GoogleAuthService;
