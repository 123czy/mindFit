# React Query 缓存策略配置

## 📋 概述

为了避免所有接口都使用相同的缓存时间，我们创建了灵活的缓存策略配置系统。

## 🎯 缓存策略

### 不同查询类型的缓存时间

| 查询类型          | staleTime   | gcTime  | 说明               |
| ----------------- | ----------- | ------- | ------------------ |
| **POSTS**         | 2 分钟      | 5 分钟  | 列表内容变化较频繁 |
| **POST_DETAIL**   | 5 分钟      | 10 分钟 | 单个帖子变化不频繁 |
| **PRODUCTS**      | 5 分钟      | 15 分钟 | 商品信息相对稳定   |
| **USER**          | 10 分钟     | 30 分钟 | 用户信息变化不频繁 |
| **NOTIFICATIONS** | 30 秒       | 2 分钟  | 需要实时性         |
| **COMMENTS**      | 1 分钟      | 5 分钟  | 评论变化较频繁     |
| **STATS**         | 10 分钟     | 30 分钟 | 统计数据变化不频繁 |
| **REALTIME**      | 0（不缓存） | 1 分钟  | 需要频繁更新       |

## 📝 使用方法

### 1. 在 Hook 中使用配置

```tsx
import { useQuery } from "@tanstack/react-query";
import { CACHE_TIMES, QUERY_PRESETS } from "../react-query/config";

export function useMyQuery() {
  return useQuery({
    queryKey: ["my-query"],
    queryFn: async () => {
      // 你的查询逻辑
    },
    // 使用配置中的缓存时间
    staleTime: CACHE_TIMES.POSTS.staleTime,
    gcTime: CACHE_TIMES.POSTS.gcTime,
    // 使用预设的查询配置
    ...QUERY_PRESETS.list,
  });
}
```

### 2. 为特定查询自定义缓存时间

```tsx
export function useCustomQuery() {
  return useQuery({
    queryKey: ["custom-query"],
    queryFn: async () => {
      // 你的查询逻辑
    },
    // 自定义缓存时间
    staleTime: 3 * 60 * 1000, // 3分钟
    gcTime: 6 * 60 * 1000, // 6分钟
    ...QUERY_PRESETS.detail,
  });
}
```

### 3. 选择合适的预设

```tsx
// 列表查询 - 有缓存时不重新获取
...QUERY_PRESETS.list

// 详情查询 - 有缓存时不重新获取
...QUERY_PRESETS.detail

// 实时查询 - 总是重新获取，自动刷新
...QUERY_PRESETS.realtime

// 统计查询 - 长时间缓存
...QUERY_PRESETS.stats
```

## 🔧 添加新的缓存策略

在 `lib/react-query/config.ts` 中添加：

```tsx
export const CACHE_TIMES = {
  // ... 现有配置

  MY_NEW_TYPE: {
    staleTime: 3 * 60 * 1000, // 3分钟缓存
    gcTime: 6 * 60 * 1000, // 6分钟垃圾回收
  },
} as const;
```

然后在你的 Hook 中使用：

```tsx
staleTime: CACHE_TIMES.MY_NEW_TYPE.staleTime,
gcTime: CACHE_TIMES.MY_NEW_TYPE.gcTime,
```

## 📊 缓存时间说明

### staleTime（缓存时间）

- 数据在缓存中被视为"新鲜"的时间
- 在这段时间内，不会重新获取数据
- 即使组件重新挂载，也会使用缓存

### gcTime（垃圾回收时间）

- 数据在缓存中保留的时间
- 超过这个时间，未使用的数据会被清理
- 即使数据过期，也会保留在缓存中直到被清理

## 🎨 预设说明

### list（列表查询）

- `refetchOnMount: false` - 有缓存时不重新获取
- `refetchOnReconnect: true` - 网络重连时重新获取
- 适合：帖子列表、商品列表等

### detail（详情查询）

- `refetchOnMount: false` - 有缓存时不重新获取
- `refetchOnReconnect: true` - 网络重连时重新获取
- 适合：帖子详情、商品详情等

### realtime（实时查询）

- `refetchOnMount: true` - 总是重新获取
- `refetchInterval: 30s` - 每 30 秒自动刷新
- 适合：通知、实时数据等

### stats（统计查询）

- `refetchOnMount: false` - 有缓存时不重新获取
- `refetchOnReconnect: false` - 网络重连时不重新获取
- 适合：统计数据、报表等

## 📚 示例

查看以下文件了解完整示例：

- `lib/hooks/use-posts-optimized.ts` - Posts 列表查询
- `lib/hooks/use-post-detail.ts` - Post 详情查询
- `lib/hooks/use-notifications.ts` - 通知查询（实时）

## ✅ 最佳实践

1. **选择合适的缓存时间**

   - 变化频繁的数据 → 短缓存（30 秒-2 分钟）
   - 变化不频繁的数据 → 长缓存（5-10 分钟）

2. **选择合适的预设**

   - 列表数据 → `QUERY_PRESETS.list`
   - 详情数据 → `QUERY_PRESETS.detail`
   - 实时数据 → `QUERY_PRESETS.realtime`

3. **避免全局默认值**

   - 不要在所有查询中使用相同的缓存时间
   - 根据数据特性选择合适的策略

4. **测试缓存行为**
   - 确保缓存时间符合业务需求
   - 测试从其他页面返回时的缓存效果

---

**最后更新**: 2025-01-04
**维护者**: AI Assistant
