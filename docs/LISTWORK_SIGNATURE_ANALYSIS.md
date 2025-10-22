# listWork 函数调用与钱包签名分析

## 📋 函数定义

从 `MARKETPLACE_V2_ABI` 中的定义：

```typescript
{
  type: "function",
  name: "listWork",
  inputs: [
    {
      name: "workId",
      type: "bytes32",      // 32字节的作品ID
      internalType: "bytes32",
    },
    {
      name: "price",
      type: "uint256",      // 价格（wei单位）
      internalType: "uint256",
    },
  ],
  outputs: [],
  stateMutability: "nonpayable",  // 🔑 关键：非payable状态修改函数
}
```

## 🔍 关键分析

### 1. **stateMutability: "nonpayable"**

这是**最关键**的属性，它告诉我们：

| 属性         | 含义                 | 是否需要签名 | Gas 费用 |
| ------------ | -------------------- | ------------ | -------- |
| `view`       | 只读，不修改状态     | ❌ 不需要    | ✅ 免费  |
| `pure`       | 纯函数，不读不写     | ❌ 不需要    | ✅ 免费  |
| `payable`    | 可接收 ETH，修改状态 | ✅ **需要**  | 💰 需要  |
| `nonpayable` | 不接收 ETH，修改状态 | ✅ **需要**  | 💰 需要  |

**结论：** `listWork` 是 `nonpayable` 函数，**一定会触发钱包签名**！

### 2. **为什么需要钱包签名？**

```
区块链状态修改 → 发送交易 → 需要签名 → 钱包弹窗
```

**具体原因：**

1. **修改区块链状态**
   - `listWork` 会在智能合约中创建新的商品列表记录
   - 任何修改区块链状态的操作都需要共识
2. **需要支付 Gas 费**
   - 执行智能合约需要消耗计算资源
   - 用户必须用钱包中的原生代币支付 Gas
3. **身份验证**

   - 证明是你本人在调用合约
   - 防止他人冒充你的身份

4. **不可逆操作**
   - 一旦上链，无法撤销
   - 签名是用户的最后确认

## 🔄 完整调用流程

### 阶段 1: 准备参数（前端）

```typescript
import { generateWorkId } from "@/lib/contracts/hooks/use-marketplace-v2";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";

// 1. 获取用户地址
const { address } = useAccount();

// 2. 生成唯一的 workId（bytes32）
const nonce = BigInt(Date.now());
const workId = generateWorkId(address, nonce);
// 返回: 0x1234...abcd (32字节哈希)

// 3. 转换价格为 wei
const priceInWei = parseUnits("10", 6); // 10 mUSDT
// 返回: 10000000n (bigint)
```

**数据准备：**

```javascript
{
  workId: "0x1234567890abcdef...",  // bytes32
  price: 10000000n                   // uint256 (bigint)
}
```

### 阶段 2: 调用 wagmi hook

```typescript
import { useWriteContract } from "wagmi";

const { writeContract } = useWriteContract();

// 调用合约写入函数
await writeContract({
  address: "0xMarketplaceAddress", // 合约地址
  abi: MARKETPLACE_V2_ABI, // ABI定义
  functionName: "listWork", // 函数名
  args: [workId, priceInWei], // 参数数组
});
```

### 阶段 3: 钱包交互（自动触发）✨

```
1. wagmi 发起交易请求
   ↓
2. 检测到 stateMutability: "nonpayable"
   ↓
3. 🔔 触发钱包弹窗（MetaMask/其他钱包）
   ↓
4. 显示交易详情：
   - 合约地址: 0x...
   - 函数: listWork
   - Gas 估算: 0.0001 ETH
   - 参数预览
   ↓
5. 用户选择：
   ├─ ✅ 确认 → 签名交易
   └─ ❌ 拒绝 → 抛出错误
```

### 阶段 4: 交易签名

**钱包内部流程：**

```javascript
// 1. 构建交易对象
const tx = {
  from: "0xYourAddress",
  to: "0xMarketplaceAddress",
  data: encodeFunctionData({
    abi: MARKETPLACE_V2_ABI,
    functionName: "listWork",
    args: [workId, priceInWei],
  }),
  gas: estimatedGas,
  gasPrice: currentGasPrice,
  nonce: accountNonce,
  chainId: 11155111, // Sepolia
};

// 2. 使用私钥签名（在钱包中，不暴露给网页）
const signature = signTransaction(tx, privateKey);

// 3. 返回签名后的交易
return signedTx;
```

### 阶段 5: 广播交易

```
签名完成
  ↓
发送到区块链网络
  ↓
矿工/验证者打包
  ↓
等待确认（~15秒）
  ↓
交易成功 ✅
```

### 阶段 6: 监听结果

```typescript
import { useWaitForTransactionReceipt } from "wagmi";

const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  hash: txHash, // 交易哈希
});

// isConfirming: true  → 交易确认中
// isSuccess: true     → 交易成功
```

## 📊 时序图

```
用户点击按钮
    ↓
前端准备参数
    ↓
调用 writeContract()
    ↓
═══════════════════════════════════════
│  钱包弹窗（用户交互）                │
│  ┌──────────────────────────────┐   │
│  │ 📱 MetaMask                  │   │
│  │                               │   │
│  │ 交易确认                      │   │
│  │ ─────────────────────────    │   │
│  │ 合约: Marketplace             │   │
│  │ 函数: listWork                │   │
│  │ Gas: 0.0001 ETH              │   │
│  │                               │   │
│  │ [拒绝]  [确认] ← 用户必须选择 │   │
│  └──────────────────────────────┘   │
═══════════════════════════════════════
    ↓ (用户点击确认)
签名交易（私钥加密）
    ↓
发送到区块链
    ↓
等待确认（~15秒）
    ↓
触发 WorkListed 事件
    ↓
前端收到成功通知
    ↓
显示成功消息 ✅
```

## 🚨 为什么可能不弹出签名窗口？

### 1. **参数类型错误** ❌

```typescript
// ❌ 错误：传入字符串
await listWork("some-uuid", 1000);
// workId 必须是 bytes32 (0x...)
// price 必须是 bigint

// ✅ 正确
await listWork(
  "0x1234567890abcdef...", // bytes32
  10000000n // bigint
);
```

**问题：** 类型错误会在 `writeContract` 内部验证阶段就失败，根本不会发送请求到钱包。

### 2. **钱包未连接** ❌

```typescript
const { isConnected } = useAccount();

if (!isConnected) {
  // 钱包未连接，无法签名
  toast.error("请先连接钱包");
  return;
}
```

### 3. **合约地址错误** ❌

```typescript
const address = getContractAddress("MARKETPLACE_V2", chainId);

if (!address) {
  // 合约在当前网络未部署
  toast.error("合约未部署");
  return;
}
```

### 4. **ABI 不匹配** ❌

```typescript
// ❌ 使用了错误的 ABI
abi: MARKETPLACE_ABI; // 旧版本

// ✅ 使用正确的 ABI
abi: MARKETPLACE_V2_ABI;
```

## ✅ 确保签名弹出的检查清单

```typescript
async function listWork() {
  // ✅ 1. 检查钱包连接
  if (!isConnected || !address) {
    throw new Error("钱包未连接");
  }

  // ✅ 2. 检查合约地址
  const contractAddress = getContractAddress("MARKETPLACE_V2", chainId);
  if (!contractAddress) {
    throw new Error("合约未部署");
  }

  // ✅ 3. 验证参数类型
  if (typeof workId !== "string" || !workId.startsWith("0x")) {
    throw new Error("workId 必须是 bytes32");
  }
  if (typeof price !== "bigint") {
    throw new Error("price 必须是 bigint");
  }

  // ✅ 4. 调用合约（现在一定会弹出签名）
  await writeContract({
    address: contractAddress,
    abi: MARKETPLACE_V2_ABI,
    functionName: "listWork",
    args: [workId, price],
  });

  // 🔔 钱包签名窗口弹出！
}
```

## 📝 实际代码示例

### ✅ 完整的正确实现

```typescript
import {
  useListWork,
  generateWorkId,
} from "@/lib/contracts/hooks/use-marketplace-v2";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { toast } from "sonner";

export function CreateProduct() {
  const { address, isConnected } = useAccount();
  const { listWork, isPending, isConfirming, isSuccess } = useListWork();

  const handleSubmit = async () => {
    // 1. 验证钱包
    if (!isConnected || !address) {
      toast.error("请先连接钱包");
      return;
    }

    try {
      // 2. 生成 workId (bytes32)
      const nonce = BigInt(Date.now());
      const workId = generateWorkId(address, nonce);

      // 3. 转换价格 (uint256)
      const priceInWei = parseUnits("10", 6); // 10 mUSDT

      console.log("调用参数:", {
        workId, // 0x1234...
        workIdType: typeof workId, // "string"
        price: priceInWei, // 10000000n
        priceType: typeof priceInWei, // "bigint"
      });

      // 4. 调用合约
      toast.info("准备交易...");

      await listWork(
        workId as `0x${string}`, // bytes32
        priceInWei // uint256 (bigint)
      );

      // 🔔 此时钱包签名窗口会弹出！

      toast.success("等待确认...");
    } catch (error: any) {
      if (error.message.includes("User rejected")) {
        toast.error("您取消了签名");
      } else {
        toast.error(`失败: ${error.message}`);
      }
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={isPending || isConfirming || !isConnected}
    >
      {isPending ? "签名中..." : isConfirming ? "确认中..." : "创建商品"}
    </button>
  );
}
```

## 🎯 总结

### listWork 调用**一定会触发钱包签名**，因为：

1. ✅ `stateMutability: "nonpayable"` - 修改区块链状态
2. ✅ 需要支付 Gas 费用
3. ✅ 需要用户授权和身份验证
4. ✅ 操作不可逆，需要用户确认

### 签名不弹出的唯一原因：

1. ❌ **参数类型错误** - 在 wagmi 内部验证就失败了
2. ❌ **钱包未连接** - 没有钱包可以弹窗
3. ❌ **合约地址错误** - 找不到合约
4. ❌ **ABI 错误** - 函数签名不匹配

### 正确的调用模式：

```typescript
// 参数必须是正确的类型
workId: "0x..." (string, bytes32 格式)
price: 10000000n (bigint, uint256)

// 完整检查
✅ 钱包已连接
✅ 合约地址存在
✅ 参数类型正确
✅ ABI 匹配

→ 一定会弹出钱包签名窗口 ✨
```

## 🔗 相关事件

签名成功后，合约会触发 `WorkListed` 事件：

```typescript
{
  type: "event",
  name: "WorkListed",
  inputs: [
    { name: "workId", type: "bytes32", indexed: true },
    { name: "creator", type: "address", indexed: true },
    { name: "price", type: "uint256", indexed: false },
  ],
}
```

可以监听这个事件来确认上架成功：

```typescript
import { useWatchWorkListed } from "@/lib/contracts/hooks/use-marketplace-v2";

useWatchWorkListed((workId, creator) => {
  toast.success(`商品 ${workId} 上架成功！`);
});
```
