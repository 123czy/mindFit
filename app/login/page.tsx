import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Inspiration Wall */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary to-accent p-12">
        <div className="max-w-md space-y-6 text-white">
          <h1 className="text-4xl font-bold">欢迎来到炒词</h1>
          <p className="text-lg opacity-90">登录后即可管理作品、商品与社区互动</p>
          <div className="space-y-4 pt-6">
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm">
              <h3 className="font-semibold mb-2">🔐 安全可靠</h3>
              <p className="text-sm opacity-80">支持邮箱、第三方账号等多种登录方式</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm">
              <h3 className="font-semibold mb-2">⚡ 快速便捷</h3>
              <p className="text-sm opacity-80">一键登录，即刻开始创作和交易</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm">
              <h3 className="font-semibold mb-2">🌐 多端同步</h3>
              <p className="text-sm opacity-80">在电脑或手机上随时管理你的创作资产</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login */}
      <div className="flex items-center justify-center p-8 bg-background">
        <LoginForm />
      </div>
    </div>
  )
}
