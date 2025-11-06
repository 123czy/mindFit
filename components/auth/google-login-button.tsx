import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleAuthService } from '@/lib/auth/google-auth-services';
import { useGoogleSignIn } from '@/lib/hooks/use-api-auth';
import type { CredentialResponse, GoogleUserInfo } from '@/types/google-auth';
import { ENV_CONFIG } from '@/lib/constants';

interface GoogleLoginButtonProps {
  onSuccess: (userInfo: GoogleUserInfo, idToken: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  className = '',
  variant = 'outline',
  size = 'lg',
  children
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { mutateAsync: loginByGoogle } = useGoogleSignIn();

  // 初始化 Google Auth
  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        await GoogleAuthService.initialize(ENV_CONFIG.GOOGLE_CLIENT_ID);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        toast.error('Google 登录初始化失败');
        onError?.(error as Error);
      }
    };

    initializeGoogleAuth();
  }, [onError]);

  // 处理 Google 登录成功
  const handleGoogleSuccess = async(response: CredentialResponse) => {
    setIsLoading(true);
    
    try {
      // 解析 JWT Token
      const payload = GoogleAuthService.parseJwtToken(response.credential);
      if (!payload) {
        throw new Error('Failed to parse Google token');
      }

      // 验证 Token 是否有效
      if (!GoogleAuthService.isTokenValid(payload)) {
        throw new Error('Google token has expired');
      }

      // 提取用户信息
      const userInfo = GoogleAuthService.extractUserInfo(payload);

      const res = await loginByGoogle({ id_token: response.credential });
      
      // 调用成功回调
      onSuccess(userInfo, res.access_token);

    } catch (error) {
      console.error('Google login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google 登录失败';
      toast.error(errorMessage);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理 Google 登录错误
  const handleGoogleError = (error: Error) => {
    console.error('Google login error:', error);
    toast.error('Google 登录失败');
    onError?.(error);
    setIsLoading(false);
  };

  // 渲染 Google 按钮
  useEffect(() => {
    if (!isInitialized || !buttonRef.current || disabled) {
      return;
    }

    try {
      GoogleAuthService.renderButton(buttonRef.current, {
        onSuccess: handleGoogleSuccess,
        onError: handleGoogleError,
        theme: 'outline',
        size: 'large',
      });
    } catch (error) {
      console.error('Failed to render Google button:', error);
    //   toast.error('Google 登录按钮渲染失败');
    }
  }, [isInitialized, disabled]);

  // 如果未初始化或禁用，显示备用按钮
  if (!isInitialized || disabled) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        className={`flex items-center gap-2 ${className}`}
        onClick={() => {
          if (!isInitialized) {
            toast.error('Google 登录服务未就绪');
          }
        }}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children || 'Google 登录'}
      </Button>
    );
  }

  return (
    <div className={`h-12 rounded-xl font-medium border-border/60 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow ${className}`}>
      <div ref={buttonRef} className="google-signin-button w-full h-full" />
    </div>
  );
};

export default GoogleLoginButton;
