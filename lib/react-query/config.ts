/**
 * React Query 缓存策略配置
 *
 * 为不同的查询类型定义不同的缓存时间和垃圾回收时间
 */

// 缓存时间配置（毫秒）
export const CACHE_TIMES = {
  // Posts 相关 - 内容变化较频繁，需要较短的缓存
  POSTS: {
    staleTime: 2 * 60 * 1000, // 2分钟缓存
    gcTime: 5 * 60 * 1000, // 5分钟垃圾回收
  },

  // Post 详情 - 单个帖子变化不频繁，可以缓存更久
  POST_DETAIL: {
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
  },

  // Products 相关 - 商品信息相对稳定
  PRODUCTS: {
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    gcTime: 15 * 60 * 1000, // 15分钟垃圾回收
  },

  // User 信息 - 用户信息变化不频繁
  USER: {
    staleTime: 10 * 60 * 1000, // 10分钟缓存
    gcTime: 30 * 60 * 1000, // 30分钟垃圾回收
  },

  // Notifications - 通知需要实时性，缓存时间短
  NOTIFICATIONS: {
    staleTime: 30 * 1000, // 30秒缓存
    gcTime: 2 * 60 * 1000, // 2分钟垃圾回收
  },

  // Comments - 评论变化较频繁
  COMMENTS: {
    staleTime: 1 * 60 * 1000, // 1分钟缓存
    gcTime: 5 * 60 * 1000, // 5分钟垃圾回收
  },

  // 统计数据 - 统计数据变化不频繁，可以缓存更久
  STATS: {
    staleTime: 10 * 60 * 1000, // 10分钟缓存
    gcTime: 30 * 60 * 1000, // 30分钟垃圾回收
  },

  // 实时数据 - 需要频繁更新，几乎不缓存
  REALTIME: {
    staleTime: 0, // 不缓存
    gcTime: 1 * 60 * 1000, // 1分钟垃圾回收
  },
} as const;

// 通用查询配置
export const DEFAULT_QUERY_OPTIONS = {
  refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
  retry: 1, // 失败时重试1次
} as const;

// 不同类型的查询配置预设
export const QUERY_PRESETS = {
  // 列表查询 - 允许缓存，但不要自动重新获取
  list: {
    ...DEFAULT_QUERY_OPTIONS,
    refetchOnMount: false, // 有缓存时不重新获取
    refetchOnReconnect: true, // 网络重连时重新获取
  },

  // 详情查询 - 允许缓存，返回时使用缓存
  detail: {
    ...DEFAULT_QUERY_OPTIONS,
    refetchOnMount: false, // 有缓存时不重新获取
    refetchOnReconnect: true, // 网络重连时重新获取
  },

  // 实时查询 - 不缓存，频繁更新
  realtime: {
    ...DEFAULT_QUERY_OPTIONS,
    refetchOnMount: true, // 总是重新获取
    refetchOnReconnect: true, // 网络重连时重新获取
    refetchInterval: 30 * 1000, // 每30秒自动刷新
  },

  // 统计查询 - 长时间缓存
  stats: {
    ...DEFAULT_QUERY_OPTIONS,
    refetchOnMount: false, // 有缓存时不重新获取
    refetchOnReconnect: false, // 网络重连时不重新获取
  },
} as const;
