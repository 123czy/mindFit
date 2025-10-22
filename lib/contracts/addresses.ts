import { sepolia, polygonAmoy, bscTestnet } from "wagmi/chains";

// 合约地址配置
export const CONTRACT_ADDRESSES = {
  // 炒词平台主合约
  CHAOCI_PLATFORM: {
    [sepolia.id]: "0x0000000000000000000000000000000000000000", // 替换为实际部署的合约地址
    [polygonAmoy.id]: "0x0000000000000000000000000000000000000000",
    [bscTestnet.id]: "0x0000000000000000000000000000000000000000",
  },

  // 名片 NFT 合约
  BUSINESS_CARD_NFT: {
    [sepolia.id]: "0x0000000000000000000000000000000000000000",
    [polygonAmoy.id]: "0x0000000000000000000000000000000000000000",
    [bscTestnet.id]: "0x0000000000000000000000000000000000000000",
  },

  // 平台代币合约 (如果有)
  PLATFORM_TOKEN: {
    [sepolia.id]: "0x0000000000000000000000000000000000000000",
    [polygonAmoy.id]: "0x0000000000000000000000000000000000000000",
    [bscTestnet.id]: "0x0000000000000000000000000000000000000000",
  },

  // 添加 SBT 合约地址用于用户账户绑定
  SBT: {
    [sepolia.id]: "0x0000000000000000000000000000000000000000", // 替换为实际部署的 SBT 合约地址
    [polygonAmoy.id]: "0x0000000000000000000000000000000000000000",
    [bscTestnet.id]: "0x0000000000000000000000000000000000000000",
  },

  // 添加市场合约地址用于产品购买
  MARKETPLACE: {
    [sepolia.id]: "0xfe04ed54ed4115009731e25c7479720356c962f7", // 替换为实际部署的市场合约地址
    [polygonAmoy.id]: "0x0000000000000000000000000000000000000000",
    [bscTestnet.id]: "0x0000000000000000000000000000000000000000",
  },

  // 添加测试代币地址用于支付 (MockERC20 - mUSDT)
  TEST_TOKEN: {
    [sepolia.id]: "0x0d08e351b6d82829e53e125b41a033f30ab64077",
    [polygonAmoy.id]: "0x0000000000000000000000000000000000000000",
    [bscTestnet.id]: "0x0000000000000000000000000000000000000000",
  },

  // Identity Token (EIP-4973 Account-bound NFT)
  IDENTITY_TOKEN: {
    [sepolia.id]: "0x147ad4d8f943bb1b46234bc24fd68909196eadf7",
    [polygonAmoy.id]: "0x0000000000000000000000000000000000000000",
    [bscTestnet.id]: "0x0000000000000000000000000000000000000000",
  },

  // Reputation Badge (EIP-5114 Soulbound Badge)
  REPUTATION_BADGE: {
    [sepolia.id]: "0x887b1ad4de371f659b707026f3f956b6afb217a4",
    [polygonAmoy.id]: "0x0000000000000000000000000000000000000000",
    [bscTestnet.id]: "0x0000000000000000000000000000000000000000",
  },

  // Badge Rule Registry
  BADGE_RULE_REGISTRY: {
    [sepolia.id]: "0xb1c68409e6053578478e370619cd9ae40eb71d3f",
    [polygonAmoy.id]: "0x0000000000000000000000000000000000000000",
    [bscTestnet.id]: "0x0000000000000000000000000000000000000000",
  },

  // Marketplace V2 (with reputation integration)
  MARKETPLACE_V2: {
    [sepolia.id]: "0xfe04ed54ed4115009731e25c7479720356c962f7",
    [polygonAmoy.id]: "0x0000000000000000000000000000000000000000",
    [bscTestnet.id]: "0x0000000000000000000000000000000000000000",
  },

  // Reputation Data Feed
  REPUTATION_DATA_FEED: {
    [sepolia.id]: "0x980fa645d44e1d358cefba73e9c3164612bb9951",
    [polygonAmoy.id]: "0x0000000000000000000000000000000000000000",
    [bscTestnet.id]: "0x0000000000000000000000000000000000000000",
  },
} as const;

// 获取指定链上的合约地址
export function getContractAddress(
  contractName: keyof typeof CONTRACT_ADDRESSES,
  chainId: number
): `0x${string}` | undefined {
  const addresses = CONTRACT_ADDRESSES[contractName];
  return addresses[chainId as keyof typeof addresses] as
    | `0x${string}`
    | undefined;
}
