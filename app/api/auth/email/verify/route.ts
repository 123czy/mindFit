import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// 验证邮箱验证码并登录
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "请输入邮箱和验证码" },
        { status: 400 }
      );
    }

    // 使用 Supabase Auth 的 OTP 验证
    // 注意：Supabase OTP 使用的是 magic link 或 token，不是数字验证码
    // 如果需要自定义验证码，需要：
    // 1. 自己存储验证码到 Redis 或数据库
    // 2. 验证后调用 supabase.auth.signInWithPassword 或创建 session

    // 临时方案：使用 Supabase 的 signInWithOtp，然后用户点击邮件中的链接
    // 更好的方案：自己实现验证码存储和验证

    // TODO: 实际应该：
    // 1. 从 Redis 或数据库查询验证码
    // 2. 验证验证码是否正确且未过期
    // 3. 创建或获取 Supabase 用户
    // 4. 创建 session 并返回 token

    // Mock: 简单验证
    if (code.length !== 6) {
      return NextResponse.json(
        { success: false, error: "验证码格式错误" },
        { status: 400 }
      );
    }

    // 创建或获取用户（使用 Supabase Auth）
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password: "dummy", // 临时方案，实际应该使用验证码
      });

    if (authError) {
      // 如果用户不存在，创建新用户
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password: `temp_${Date.now()}`, // 临时密码，实际应该使用验证码登录
        });

      if (signUpError) {
        return NextResponse.json(
          { success: false, error: signUpError.message || "登录失败" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "登录成功",
        user: signUpData.user,
      });
    }

    return NextResponse.json({
      success: true,
      message: "登录成功",
      user: authData.user,
    });
  } catch (error: any) {
    console.error("Error verifying email code:", error);
    return NextResponse.json(
      { success: false, error: error.message || "验证失败" },
      { status: 500 }
    );
  }
}
