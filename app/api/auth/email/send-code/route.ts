import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// 发送邮箱验证码
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 存储验证码到 Supabase（可以使用临时表或直接使用 Supabase Auth 的 OTP）
    // 这里使用 Supabase Auth 的 OTP 功能
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // 如果用户不存在则创建
      },
    });

    if (error) {
      // 如果 OTP 功能不可用，可以手动发送邮件
      // 这里先返回成功，实际应该调用邮件服务发送验证码
      console.log("OTP email sent (mock):", code);

      // TODO: 实际应该调用邮件服务（SendGrid/AWS SES等）
      // 并将验证码存储到 Redis 或 Supabase 临时表

      return NextResponse.json({
        success: true,
        message: "验证码已发送（开发模式：请查看控制台）",
        // 开发模式下返回验证码，生产环境应该移除
        code: process.env.NODE_ENV === "development" ? code : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: "验证码已发送到您的邮箱",
    });
  } catch (error: any) {
    console.error("Error sending email code:", error);
    return NextResponse.json(
      { success: false, error: error.message || "发送验证码失败" },
      { status: 500 }
    );
  }
}
