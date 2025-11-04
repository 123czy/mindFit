"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import { getUserById } from "@/lib/supabase/api/users"

type User = Database["public"]["Tables"]["users"]["Row"]

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUserProfile = useCallback(async (authUserId: string, supabaseAuthUser: SupabaseUser) => {
    try {
      // 先尝试通过 auth_user_id 查找用户
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", authUserId)
        .single()

      if (existingUser) {
        setUser(existingUser)
        return
      }

      // 如果用户表中没有记录，创建新用户
      const email = supabaseAuthUser.email
      const metadata = supabaseAuthUser.user_metadata || {}
      
      // 从 metadata 中获取登录方式信息
      const wechatUnionId = metadata.wechat_unionid
      const googleId = metadata.google_id || supabaseAuthUser.identities?.find(i => i.provider === 'google')?.id

      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          auth_user_id: authUserId,
          email: email || undefined,
          wechat_unionid: wechatUnionId || undefined,
          google_id: googleId || undefined,
          username: email ? email.split("@")[0] : `user_${authUserId.slice(0, 8)}`,
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating user profile:", createError)
        setUser(null)
      } else {
        setUser(newUser)
      }
    } catch (error) {
      console.error("Error in loadUserProfile:", error)
      setUser(null)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    if (supabaseUser) {
      await loadUserProfile(supabaseUser.id, supabaseUser)
    }
  }, [supabaseUser, loadUserProfile])

  useEffect(() => {
    // 初始化时获取当前session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        await loadUserProfile(session.user.id, session.user)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        await loadUserProfile(session.user.id, session.user)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadUserProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSupabaseUser(null)
    setUser(null)
  }, [])

  const value: AuthContextType = {
    user,
    supabaseUser,
    isLoading,
    isAuthenticated: !!supabaseUser && !!user,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
