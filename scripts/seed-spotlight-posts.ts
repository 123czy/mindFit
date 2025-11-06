/**
 * 种子数据脚本：将 spotlight 项目数据迁移到 Supabase
 * 运行方式：pnpm db:seed:spotlight
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// 加载环境变量
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Spotlight 项目数据
const spotlightProjects = [
  {
    title: "AI 创意工作室",
    content: "探索最前沿的 AI 创作工具和技术，让创意变得触手可及",
    image: "/ai-interface-design.jpg",
    authorName: "张艺",
    authorAvatar: "/professional-avatar.png",
    views: 1248,
    likes: 342,
    tags: ["AI工具", "创意设计"],
    badge: "热门",
  },
  {
    title: "数字艺术生成器",
    content: "使用最新的 AI 模型生成独特的数字艺术作品",
    image: "/ai-generated-art-landscape.jpg",
    authorName: "李明",
    authorAvatar: "/artist-avatar.png",
    views: 856,
    likes: 234,
    tags: ["数字艺术", "AI生成"],
    badge: "精选",
  },
  {
    title: "AI 肖像摄影",
    content: "通过 AI 技术创造出色的肖像摄影效果",
    image: "/ai-portrait-photography.jpg",
    authorName: "王芳",
    authorAvatar: "/creative-avatar.jpg",
    views: 723,
    likes: 198,
    tags: ["肖像摄影", "AI艺术"],
    badge: "新作",
  },
  {
    title: "未来城市概念",
    content: "展示未来城市的概念设计和视觉效果",
    image: "/futuristic-cityscape.png",
    authorName: "赵强",
    authorAvatar: "/professional-avatar.png",
    views: 612,
    likes: 156,
    tags: ["概念设计", "未来"],
    badge: "推荐",
  },
  {
    title: "创意工作流程",
    content: "分享高效的创意工作流程和工具使用技巧",
    image: "/content-creation-tools.png",
    authorName: "孙丽",
    authorAvatar: "/artist-avatar.png",
    views: 543,
    likes: 127,
    tags: ["工作流程", "效率"],
    badge: "推荐",
  },
  {
    title: "抽象数字艺术",
    content: "探索抽象艺术与数字技术的完美结合",
    image: "/abstract-digital-composition.png",
    authorName: "陈伟",
    authorAvatar: "/professional-avatar.png",
    views: 489,
    likes: 103,
    tags: ["抽象艺术", "数字"],
    badge: "新作",
  },
];

async function seedSpotlightPosts() {
  console.log("开始迁移 spotlight 项目数据...\n");

  try {
    // 1. 创建或获取用户
    const users = new Map<string, string>(); // name -> user_id

    for (const project of spotlightProjects) {
      if (!users.has(project.authorName)) {
        // 检查用户是否已存在
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("username", project.authorName)
          .single();

        if (existingUser) {
          users.set(project.authorName, existingUser.id);
          console.log(`✓ 用户已存在: ${project.authorName}`);
        } else {
          // 创建新用户
          const walletAddress = `0x${Math.random()
            .toString(16)
            .substring(2, 42)}`;
          const { data: newUser, error: userError } = await supabase
            .from("users")
            .insert({
              username: project.authorName,
              avatar_url: project.authorAvatar,
              wallet_address: walletAddress,
              bio: "创意工作者",
            })
            .select()
            .single();

          if (userError) {
            console.error(`✗ 创建用户失败 ${project.authorName}:`, userError);
            continue;
          }

          users.set(project.authorName, newUser.id);
          console.log(`✓ 创建用户: ${project.authorName}`);
        }
      }
    }

    console.log("\n开始创建帖子...\n");

    // 2. 创建帖子
    for (const project of spotlightProjects) {
      const userId = users.get(project.authorName);
      if (!userId) {
        console.error(`✗ 找不到用户: ${project.authorName}`);
        continue;
      }

      // 检查帖子是否已存在
      const { data: existingPost } = await supabase
        .from("posts")
        .select("id")
        .eq("title", project.title)
        .eq("user_id", userId)
        .single();

      if (existingPost) {
        // 更新现有帖子
        const { error: updateError } = await supabase
          .from("posts")
          .update({
            content: project.content,
            images: [project.image],
            tags: project.tags,
            badge: project.badge,
            view_count: project.views,
            like_count: project.likes,
            comment_count: 0,
          })
          .eq("id", existingPost.id);

        if (updateError) {
          console.error(`✗ 更新帖子失败 ${project.title}:`, updateError);
        } else {
          console.log(`✓ 更新帖子: ${project.title}`);
        }
      } else {
        // 创建新帖子
        const { data: user } = await supabase
          .from("users")
          .select("wallet_address")
          .eq("id", userId)
          .single();

        if (!user) {
          console.error(`✗ 找不到用户钱包地址: ${project.authorName}`);
          continue;
        }

        const { error: insertError } = await supabase.from("posts").insert({
          user_id: userId,
          wallet_address: user.wallet_address,
          title: project.title,
          content: project.content,
          images: [project.image],
          tags: project.tags,
          badge: project.badge,
          view_count: project.views,
          like_count: project.likes,
          comment_count: 0,
        });

        if (insertError) {
          console.error(`✗ 创建帖子失败 ${project.title}:`, insertError);
        } else {
          console.log(`✓ 创建帖子: ${project.title}`);
        }
      }
    }

    console.log("\n✅ Spotlight 项目数据迁移完成！");
  } catch (error) {
    console.error("❌ 迁移失败:", error);
    process.exit(1);
  }
}

seedSpotlightPosts();
