/**
 * 数据迁移脚本 - 将 mock-data 导入到 Supabase
 *
 * 使用方法:
 * 1. 确保已配置 .env.local 中的 Supabase 环境变量
 * 2. 运行: pnpm tsx scripts/seed-database.ts
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/supabase/types";
import {
  mockUsers,
  mockPosts,
  mockProducts,
  mockComments,
} from "../lib/mock-data";

// 从环境变量读取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ 错误: 缺少 Supabase 环境变量");
  console.error("请确保 .env.local 中配置了:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  console.error("  - NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// 生成假的钱包地址
function generateWalletAddress(userId: string): string {
  const hash = userId.padStart(40, "0");
  return `0x${hash}`;
}

// 映射 mock user ID 到 Supabase UUID
const userIdMap = new Map<string, string>();

// 映射 mock post ID 到 Supabase UUID
const postIdMap = new Map<string, string>();

async function seedUsers() {
  console.log("\n📝 导入用户数据...");

  for (const mockUser of mockUsers) {
    const walletAddress = generateWalletAddress(mockUser.id);

    const { data, error } = await supabase
      .from("users")
      .insert({
        wallet_address: walletAddress,
        username: mockUser.username,
        avatar_url: mockUser.avatar,
        bio: mockUser.bio || null,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ 导入用户 ${mockUser.username} 失败:`, error.message);
    } else if (data) {
      userIdMap.set(mockUser.id, data.id);
      console.log(`✅ 用户 ${mockUser.username} (${data.id})`);
    }
  }

  console.log(`✨ 完成! 共导入 ${userIdMap.size} 个用户`);
}

async function seedPosts() {
  console.log("\n📝 导入帖子数据...");

  for (const mockPost of mockPosts) {
    const userId = userIdMap.get(mockPost.userId);
    if (!userId) {
      console.error(`❌ 找不到用户 ID: ${mockPost.userId}`);
      continue;
    }

    const walletAddress = generateWalletAddress(mockPost.userId);

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        wallet_address: walletAddress,
        title: mockPost.title,
        content: mockPost.body,
        images: mockPost.images,
        tags: mockPost.tags,
        is_paid: mockPost.hasPaidContent,
        price: mockPost.hasPaidContent ? 10 : null, // 默认付费价格 10
        paid_content: mockPost.hasPaidContent
          ? "这是付费内容，购买后可见..."
          : null,
        view_count: mockPost.viewCount,
        like_count: mockPost.likeCount,
        comment_count: mockPost.commentCount,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ 导入帖子 ${mockPost.title} 失败:`, error.message);
    } else if (data) {
      postIdMap.set(mockPost.id, data.id);
      console.log(`✅ 帖子 ${mockPost.title.substring(0, 30)}... (${data.id})`);
    }
  }

  console.log(`✨ 完成! 共导入 ${postIdMap.size} 篇帖子`);
}

async function seedProducts() {
  console.log("\n📝 导入商品数据...");

  let importedCount = 0;

  for (const mockProduct of mockProducts) {
    const userId = userIdMap.get(mockProduct.userId);
    if (!userId) {
      console.error(`❌ 找不到用户 ID: ${mockProduct.userId}`);
      continue;
    }

    const walletAddress = generateWalletAddress(mockProduct.userId);

    // 尝试关联到相应用户的第一篇帖子
    const relatedPost = Array.from(postIdMap.entries()).find(
      ([mockPostId, _]) => {
        const post = mockPosts.find((p) => p.id === mockPostId);
        return post?.userId === mockProduct.userId;
      }
    );

    const postId = relatedPost ? relatedPost[1] : null;

    const { data, error } = await supabase
      .from("products")
      .insert({
        user_id: userId,
        wallet_address: walletAddress,
        post_id: postId,
        name: mockProduct.title,
        description: mockProduct.description,
        price: mockProduct.price,
        currency: "mUSDT",
        stock: mockProduct.stockLimit,
        sales_count: mockProduct.stockLimit
          ? mockProduct.stockLimit - mockProduct.stockRemaining
          : 0,
        is_active: true,
        category: mockProduct.contentType,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ 导入商品 ${mockProduct.title} 失败:`, error.message);
    } else if (data) {
      importedCount++;
      console.log(
        `✅ 商品 ${mockProduct.title.substring(0, 30)}... (${data.id})`
      );
    }
  }

  console.log(`✨ 完成! 共导入 ${importedCount} 个商品`);
}

async function seedComments() {
  console.log("\n📝 导入评论数据...");

  let importedCount = 0;

  // 映射评论 ID
  const commentIdMap = new Map<string, string>();

  // 先导入顶层评论
  for (const mockComment of mockComments.filter((c) => !c.parentCommentId)) {
    const postId = postIdMap.get(mockComment.postId);
    const userId = userIdMap.get(mockComment.userId);

    if (!postId || !userId) {
      console.error(
        `❌ 找不到帖子或用户 ID: post=${mockComment.postId}, user=${mockComment.userId}`
      );
      continue;
    }

    const walletAddress = generateWalletAddress(mockComment.userId);

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        wallet_address: walletAddress,
        content: mockComment.content,
        parent_id: null,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ 导入评论失败:`, error.message);
    } else if (data) {
      commentIdMap.set(mockComment.id, data.id);
      importedCount++;
      console.log(`✅ 评论 ${mockComment.content.substring(0, 30)}...`);
    }
  }

  // 再导入回复评论
  for (const mockComment of mockComments.filter((c) => c.parentCommentId)) {
    const postId = postIdMap.get(mockComment.postId);
    const userId = userIdMap.get(mockComment.userId);
    const parentId = commentIdMap.get(mockComment.parentCommentId!);

    if (!postId || !userId || !parentId) {
      console.error(
        `❌ 找不到必要的 ID: post=${mockComment.postId}, user=${mockComment.userId}, parent=${mockComment.parentCommentId}`
      );
      continue;
    }

    const walletAddress = generateWalletAddress(mockComment.userId);

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        wallet_address: walletAddress,
        content: mockComment.content,
        parent_id: parentId,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ 导入回复评论失败:`, error.message);
    } else if (data) {
      importedCount++;
      console.log(`✅ 回复 ${mockComment.content.substring(0, 30)}...`);
    }
  }

  console.log(`✨ 完成! 共导入 ${importedCount} 条评论`);
}

async function main() {
  console.log("🚀 开始导入 Mock 数据到 Supabase...\n");
  console.log(`📍 Supabase URL: ${supabaseUrl}`);

  try {
    // 按顺序导入数据（注意外键依赖关系）
    await seedUsers();
    await seedPosts();
    await seedProducts();
    await seedComments();

    console.log("\n✅ 所有数据导入完成!");
    console.log("\n📊 导入摘要:");
    console.log(`  - 用户: ${userIdMap.size}`);
    console.log(`  - 帖子: ${postIdMap.size}`);
    console.log(`  - 商品: ${mockProducts.length}`);
    console.log(`  - 评论: ${mockComments.length}`);

    console.log("\n💡 提示:");
    console.log("  - 可以在 Supabase Dashboard 的 Table Editor 中查看数据");
    console.log("  - 所有用户的钱包地址都是模拟生成的");
    console.log("  - 需要使用真实钱包登录后才能进行交易操作");
  } catch (error) {
    console.error("\n❌ 导入过程中发生错误:", error);
    process.exit(1);
  }
}

// 运行主函数
main();
