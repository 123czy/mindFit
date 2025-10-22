# 钱包签名弹窗不出现的调试指南

## 问题描述

在 `product-edit-modal.tsx` 中调用 `listWork` 方法时，钱包签名弹窗没有出现。

## 根本原因分析

### 1. **参数类型错误** ❌

```typescript
// ❌ 错误的调用方式
await listWork(savedProduct.id, parseEther(price.toString(8)));
```

**问题分析：**

- `listWork` 函数签名：

  ```typescript
  const listWork = async (workId: bigint, price: bigint) => { ... }
  ```

- 实际传入的参数：
  - `savedProduct.id` → `string` 类型（如 `"p1234567890"` 或 UUID）
  - `parseEther(price.toString(8))` → `toString(8)` 生成**八进制字符串**

**类型不匹配导致：**

- `writeContract` 在参数验证阶段就失败了
- 没有触发钱包签名流程
- 没有抛出明确的错误信息

### 2. **价格转换错误** ❌

```typescript
// ❌ 错误
parseEther(price.toString(8)); // toString(8) 是八进制表示

// ✅ 正确（mUSDT 使用 6 decimals）
parseUnits(price, 6);
```

### 3. **缺少前置检查** ⚠️

原代码没有检查：

- ✗ 钱包是否连接
- ✗ 合约地址是否存在
- ✗ 参数是否有效

### 4. **错误处理不当** ⚠️

```typescript
// ❌ 错误捕获太宽泛
try {
  await listWork(...)
} catch (error) {
  toast.error("商品上链失败")  // 没有具体错误信息
}
```

## 正确的实现方式

### 1. **生成正确的 workId**

```typescript
import { generateWorkId } from "@/lib/contracts/hooks/use-marketplace-v2";
import { useAccount } from "wagmi";

const { address } = useAccount();

// 使用 generateWorkId 生成唯一的链上 ID
const nonce = BigInt(Date.now());
const workId = generateWorkId(address, nonce); // 返回 bigint
```

### 2. **正确转换价格**

```typescript
import { parseUnits } from "viem";

// mUSDT 使用 6 decimals
const priceInWei = parseUnits(price, 6);
```

### 3. **添加完整的验证流程**

```typescript
const handleSave = async () => {
  // 1. 验证钱包连接
  if (!isConnected || !address) {
    toast.error("请先连接钱包");
    return;
  }

  // 2. 验证表单数据
  if (!title || !price) {
    toast.error("请填写完整信息");
    return;
  }

  // 3. 验证价格有效性
  const priceValue = Number.parseFloat(price);
  if (isNaN(priceValue) || priceValue < 0) {
    toast.error("请输入有效价格");
    return;
  }

  try {
    // 4. 生成 workId
    const nonce = BigInt(Date.now());
    const workId = generateWorkId(address, nonce);

    // 5. 转换价格
    const priceInWei = parseUnits(price, 6);

    // 6. 调用合约（现在会弹出签名）
    await listWork(BigInt(workId), priceInWei);

    toast.success("正在等待交易确认...");
  } catch (error: any) {
    // 7. 详细的错误处理
    if (error?.message?.includes("User rejected")) {
      toast.error("您取消了交易签名");
    } else if (error?.message?.includes("insufficient funds")) {
      toast.error("余额不足");
    } else {
      toast.error(`上链失败: ${error?.message}`);
    }
  }
};
```

### 4. **添加加载状态**

```typescript
const { listWork, isPending, isConfirming } = useListWork()

<Button
  onClick={handleSave}
  disabled={isPending || isConfirming || !isConnected}
>
  {isPending ? "签名中..." : isConfirming ? "确认中..." : "保存"}
</Button>
```

## 调试检查清单

当钱包签名不弹出时，按以下顺序检查：

### ✅ 1. 钱包连接状态

```typescript
const { address, isConnected } = useAccount();
console.log("钱包状态:", { address, isConnected });
```

### ✅ 2. 合约地址

```typescript
const chainId = useChainId();
const contractAddress = getContractAddress("MARKETPLACE_V2", chainId);
console.log("合约地址:", { chainId, contractAddress });
```

### ✅ 3. 函数参数类型

```typescript
console.log("参数类型:", {
  workId: typeof workId, // 应该是 "bigint"
  price: typeof priceInWei, // 应该是 "bigint"
  workIdValue: workId,
  priceValue: priceInWei.toString(),
});
```

### ✅ 4. WriteContract 调用

```typescript
const { writeContract } = useWriteContract();

// 查看 writeContract 的状态
console.log("writeContract 状态:", {
  isPending,
  isError,
  error,
});
```

### ✅ 5. 错误信息

```typescript
try {
  await listWork(workId, price);
} catch (error) {
  console.error("详细错误:", {
    message: error?.message,
    stack: error?.stack,
    fullError: error,
  });
}
```

## 常见错误及解决方案

| 错误现象   | 原因         | 解决方案                |
| ---------- | ------------ | ----------------------- |
| 签名不弹出 | 参数类型错误 | 确保使用 `bigint` 类型  |
| 签名不弹出 | 钱包未连接   | 添加 `isConnected` 检查 |
| 签名不弹出 | 合约地址错误 | 检查网络和合约部署      |
| 余额不足   | Gas 费不够   | 提示用户充值测试币      |
| 用户拒绝   | 主动取消     | 捕获并友好提示          |

## 最佳实践

### 1. **类型安全**

```typescript
// ✅ 使用 bigint
const workId: bigint = generateWorkId(...)
const price: bigint = parseUnits(...)

// ❌ 避免字符串
const workId: string = `p${Date.now()}`  // 错误
```

### 2. **错误边界**

```typescript
// ✅ 完整的错误处理
try {
  await listWork(workId, price);
} catch (error: any) {
  console.error(error);

  // 用户友好的错误提示
  if (error.message.includes("rejected")) {
    toast.error("您取消了签名");
  } else {
    toast.error(`失败: ${error.message}`);
  }
}
```

### 3. **用户反馈**

```typescript
// ✅ 多阶段提示
toast.success("准备交易..."); // 开始
toast.info("请在钱包中签名"); // 等待签名
toast.success("交易已发送"); // 已签名
toast.success("交易确认中..."); // 等待确认
toast.success("交易成功！"); // 完成
```

### 4. **状态管理**

```typescript
const {
  listWork,
  isPending, // 签名中
  isConfirming, // 交易确认中
  isSuccess, // 成功
  error, // 错误
} = useListWork();

// 根据状态更新 UI
```

## 参考资料

- [Wagmi useWriteContract](https://wagmi.sh/react/api/hooks/useWriteContract)
- [Viem parseUnits](https://viem.sh/docs/utilities/parseUnits.html)
- [Ethers BigNumber](https://docs.ethers.org/v5/api/utils/bignumber/)

## 总结

钱包签名不弹出的核心原因通常是：

1. **参数类型不匹配** - 最常见
2. **钱包未连接** - 最基础
3. **合约地址错误** - 网络问题
4. **逻辑错误** - 代码问题

解决思路：

1. 先检查钱包连接
2. 再检查参数类型
3. 添加详细日志
4. 完善错误处理
