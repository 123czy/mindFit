# 合约更新总结 (Contract Update Summary)

## 更新日期 / Update Date

2025-10-20

## 概述 / Overview

根据 `/lib/new` 文件夹中的最新 ABI 文件和 `run-latest.json` 部署配置，完成了合约 ABI 和地址的全面更新。

## 更新的 ABI / Updated ABIs

### 1. IdentityToken (身份代币)

- **合约地址 (Sepolia)**: `0x147ad4d8f943bb1b46234bc24fd68909196eadf7`
- **主要变化**:
  - 添加了标准 ERC721 函数 (approve, getApproved, isApprovedForAll, etc.)
  - 添加了 owner 和 ownership 管理函数
  - 添加了错误类型 (IdentityAlreadyExists, IdentityDoesNotExist, Soulbound)

### 2. ReputationBadge (声誉徽章)

- **合约地址 (Sepolia)**: `0x887b1ad4de371f659b707026f3f956b6afb217a4`
- **主要变化**:
  - `issueBadge` 现在需要 3 个参数: (account, ruleId, metadataURI)
  - `badgesOf` 函数更名为 `badgeIdsOf`，返回类型从 tuple 变为 `uint256[]`
  - 新增 `badgeRule(badgeId)` 函数用于查询徽章对应的规则 ID
  - 添加了标准 ERC721 函数和 Soulbound 相关功能

### 3. BadgeRuleRegistry (徽章规则注册表)

- **合约地址 (Sepolia)**: `0xb1c68409e6053578478e370619cd9ae40eb71d3f`
- **主要变化**:
  - 添加了 `createRule` 函数用于创建新规则
  - 添加了 `setRuleStatus` 和 `updateRule` 函数
  - 新增事件: BadgeRuleCreated, BadgeRuleStatusChanged, BadgeRuleUpdated
  - 添加了错误类型 (RuleAlreadyExists, RuleNotFound)

### 4. Marketplace (市场合约)

- **合约地址 (Sepolia)**: `0xfe04ed54ed4115009731e25c7479720356c962f7`
- **主要变化**:
  - `listWork` 函数签名简化: 从 (workId, listing, signature) 改为 (workId, price)
  - `purchase` 函数现在需要 2 个参数: (workId, purchaseId)
  - `BuyerStat` 和 `CreatorStat` 结构体移除了时间戳字段 (lastPurchaseAt, lastSaleAt)
  - 字段 `totalSpend` 更名为 `totalVolume`
  - 事件 `BadgeIssued` 更名为 `BadgeAwarded`，并移除了 badgeId 参数
  - 新增功能: deactivateWork, 多个配置函数 (setBadgeContract, setBadgeRuleRegistry, etc.)
  - 新增事件: WorkDeactivated

### 5. ReputationDataFeed (声誉数据源)

- **合约地址 (Sepolia)**: `0x980fa645d44e1d358cefba73e9c3164612bb9951`
- **主要变化**:
  - Stat 结构体移除了时间戳字段
  - 字段名统一为 `totalVolume` (之前分别为 totalSpend 和 totalVolume)
  - 新增同步函数: syncBuyerStat, syncCreatorStat
  - 新增配置函数: setMarketplace
  - 新增事件: BuyerStatSynced, CreatorStatSynced, MarketplaceUpdated

### 6. TEST_TOKEN (测试代币 - MockERC20)

- **合约地址 (Sepolia)**: `0x0d08e351b6d82829e53e125b41a033f30ab64077`
- **代币名称**: Mock USDT (mUSDT)

## 更新的 Hooks / Updated Hooks

### use-badges.ts

- 更新 `useUserBadges` 函数名从 `badgesOf` 改为 `badgeIdsOf`
- 新增 `useBadgeRule(badgeId)` hook 用于查询徽章的规则 ID

### use-marketplace-v2.ts

- 移除 `useListWorkSignature` hook (不再需要签名)
- 更新 `useListWork`: 参数简化为 (workId, price)
- 更新 `usePurchaseWork`: 添加 purchaseId 参数
- 更新事件监听器以匹配新的事件结构
- `useWatchBadgeIssuedFromMarketplace` 更名为 `useWatchBadgeAwardedFromMarketplace`

## 更新的组件 / Updated Components

### badge-display.tsx

- 新增 `BadgeCardWithRule` 组件，用于先获取规则 ID 再显示徽章
- 更新数据结构以适配新的 `badgeIdsOf` 返回类型
- 修复了 useBadgeRule 的导入路径

### stats-display.tsx

- 将 `totalSpend` 更改为 `totalVolume` 以匹配新的 ABI

## 测试网配置 / Testnet Configuration

所有合约已部署到 **Sepolia 测试网** (Chain ID: 11155111)

## 文件更新清单 / Updated Files

1. `/lib/contracts/abis.ts` - 所有 ABI 定义已更新
2. `/lib/contracts/addresses.ts` - 所有合约地址已更新
3. `/lib/contracts/hooks/use-badges.ts` - 添加了新的 hook
4. `/lib/contracts/hooks/use-marketplace-v2.ts` - 更新了函数签名
5. `/components/reputation/badge-display.tsx` - 适配新的数据结构
6. `/components/reputation/stats-display.tsx` - 字段名更新

## 重要注意事项 / Important Notes

1. **不兼容的更改**: 新的 ABI 与旧版本不兼容，需要更新所有使用这些合约的代码
2. **签名移除**: Marketplace 的 listWork 不再需要 EIP-712 签名
3. **时间戳移除**: Stat 结构体不再包含时间戳信息
4. **事件名称变更**: 注意 BadgeIssued → BadgeAwarded 的变更

## 下一步 / Next Steps

1. 在 Sepolia 测试网上进行完整的集成测试
2. 更新前端 UI 以适配新的数据结构
3. 更新文档和 API 参考
4. 考虑添加迁移脚本以处理旧数据

## 部署信息 / Deployment Info

- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Deployment File**: `/lib/new/run-latest.json`
- **Commit Hash**: 5b03766
