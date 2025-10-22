// 示例 ERC20 代币合约 ABI
export const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// MockERC20 ABI - includes mint function for test token distribution
export const MOCK_ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// 炒词平台合约 ABI (示例)
export const CHAOCI_PLATFORM_ABI = [
  {
    inputs: [
      { name: "contentId", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "metadataURI", type: "string" },
    ],
    name: "createContent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "contentId", type: "uint256" }],
    name: "purchaseContent",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "contentId", type: "uint256" }],
    name: "getContent",
    outputs: [
      {
        components: [
          { name: "creator", type: "address" },
          { name: "price", type: "uint256" },
          { name: "metadataURI", type: "string" },
          { name: "purchaseCount", type: "uint256" },
          { name: "isActive", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "contentId", type: "uint256" },
    ],
    name: "hasPurchased",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "creator", type: "address" }],
    name: "getCreatorEarnings",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawEarnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "contentId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "price", type: "uint256" },
    ],
    name: "ContentCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "contentId", type: "uint256" },
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "price", type: "uint256" },
    ],
    name: "ContentPurchased",
    type: "event",
  },
] as const;

// NFT 名片合约 ABI (示例)
export const BUSINESS_CARD_NFT_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "metadataURI", type: "string" },
    ],
    name: "mint",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// SBT (Soulbound Token) 合约 ABI 用于用户账户绑定
export const SBT_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "username", type: "string" },
      { name: "metadataURI", type: "string" },
    ],
    name: "mint",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "tokenOfOwner",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "hasSBT",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "getUserInfo",
    outputs: [
      {
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "username", type: "string" },
          { name: "metadataURI", type: "string" },
          { name: "mintedAt", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "to", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "username", type: "string" },
    ],
    name: "SBTMinted",
    type: "event",
  },
] as const;

// Marketplace 合约 ABI 用于基于代币的产品购买
export const MARKETPLACE_ABI = [
  {
    inputs: [
      { name: "productId", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "stock", type: "uint256" },
      { name: "metadataURI", type: "string" },
    ],
    name: "createProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "productId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    name: "purchaseProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "productId", type: "uint256" }],
    name: "getProduct",
    outputs: [
      {
        components: [
          { name: "creator", type: "address" },
          { name: "price", type: "uint256" },
          { name: "stock", type: "uint256" },
          { name: "sold", type: "uint256" },
          { name: "metadataURI", type: "string" },
          { name: "isActive", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "productId", type: "uint256" },
    ],
    name: "hasPurchased",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "productId", type: "uint256" },
    ],
    name: "getPurchaseCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "productId", type: "uint256" },
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "totalPrice", type: "uint256" },
    ],
    name: "ProductPurchased",
    type: "event",
  },
] as const;

// IdentityToken ABI - EIP-4973 Account-bound NFT for user identity
export const IDENTITY_TOKEN_ABI = [
  {
    type: "function",
    name: "mintSelf",
    stateMutability: "nonpayable",
    inputs: [{ name: "metadataURI", type: "string", internalType: "string" }],
    outputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "attest",
    stateMutability: "nonpayable",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "metadataURI", type: "string", internalType: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "hasIdentity",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
  },
  {
    type: "function",
    name: "tokenIdOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "string", internalType: "string" }],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "account", type: "address", internalType: "address" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "event",
    anonymous: false,
    name: "IdentityMinted",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "metadataURI",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
  },
] as const;

// ReputationBadge ABI - EIP-5114 Soulbound Badge for achievements
export const REPUTATION_BADGE_ABI = [
  {
    type: "function",
    name: "issueBadge",
    stateMutability: "nonpayable",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "ruleId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "badgeId", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "issueBatch",
    stateMutability: "nonpayable",
    inputs: [
      { name: "ruleId", type: "uint256", internalType: "uint256" },
      { name: "accounts", type: "address[]", internalType: "address[]" },
    ],
    outputs: [
      { name: "badgeIds", type: "uint256[]", internalType: "uint256[]" },
    ],
  },
  {
    type: "function",
    name: "hasBadge",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "ruleId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
  },
  {
    type: "function",
    name: "badgesOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [
      { name: "ruleIds", type: "uint256[]", internalType: "uint256[]" },
      { name: "badgeIds", type: "uint256[]", internalType: "uint256[]" },
    ],
  },
  {
    type: "function",
    name: "badgeURI",
    stateMutability: "view",
    inputs: [{ name: "badgeId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "string", internalType: "string" }],
  },
  {
    type: "function",
    name: "ruleIdOf",
    stateMutability: "view",
    inputs: [{ name: "badgeId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "ruleId", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [{ name: "ruleId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "event",
    anonymous: false,
    name: "BadgeMinted",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "ruleId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "badgeId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "metadataURI",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
  },
] as const;

// BadgeRuleRegistry ABI - Manages badge rules and conditions
export const BADGE_RULE_REGISTRY_ABI = [
  {
    type: "function",
    name: "getRule",
    inputs: [{ name: "ruleId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct BadgeRuleRegistry.BadgeRule",
        components: [
          { name: "ruleId", type: "uint256", internalType: "uint256" },
          {
            name: "trigger",
            type: "uint8",
            internalType: "enum BadgeRuleRegistry.TriggerType",
          },
          {
            name: "target",
            type: "uint8",
            internalType: "enum BadgeRuleRegistry.BadgeTarget",
          },
          { name: "threshold", type: "uint256", internalType: "uint256" },
          { name: "metadataURI", type: "string", internalType: "string" },
          { name: "enabled", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ruleCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ruleExists",
    inputs: [{ name: "ruleId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ruleIdAt",
    inputs: [{ name: "index", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const;

// Marketplace ABI - Updated with reputation system integration
export const MARKETPLACE_V2_ABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "contract IMintableERC20",
      },
      {
        name: "identityToken_",
        type: "address",
        internalType: "contract IdentityToken",
      },
      {
        name: "reputationBadge_",
        type: "address",
        internalType: "contract ReputationBadge",
      },
      {
        name: "badgeRuleRegistry_",
        type: "address",
        internalType: "contract BadgeRuleRegistry",
      },
      {
        name: "dataFeed_",
        type: "address",
        internalType: "contract ReputationDataFeed",
      },
      {
        name: "identityURI",
        type: "string",
        internalType: "string",
      },
      {
        name: "welcomeAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "badgeRuleRegistry",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract BadgeRuleRegistry",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "buyerWelcomeAmount",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creatorAt",
    inputs: [
      {
        name: "index",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creatorRegistryLength",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "dataFeed",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ReputationDataFeed",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deactivateWork",
    inputs: [
      {
        name: "workId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getBuyerStat",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Marketplace.BuyerStat",
        components: [
          {
            name: "totalPurchases",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalVolume",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCreatorStat",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Marketplace.CreatorStat",
        components: [
          {
            name: "totalSales",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalVolume",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEligibleRules",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "target",
        type: "uint8",
        internalType: "enum BadgeRuleRegistry.BadgeTarget",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getWork",
    inputs: [
      {
        name: "workId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Marketplace.Listing",
        components: [
          {
            name: "creator",
            type: "address",
            internalType: "address",
          },
          {
            name: "price",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "active",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "sold",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "identityMetadataURI",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "identityToken",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IdentityToken",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "listWork",
    inputs: [
      {
        name: "workId",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "price",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "purchase",
    inputs: [
      {
        name: "workId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "reputationBadge",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ReputationBadge",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setBadgeContract",
    inputs: [
      {
        name: "newBadge",
        type: "address",
        internalType: "contract ReputationBadge",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setBadgeRuleRegistry",
    inputs: [
      {
        name: "newRegistry",
        type: "address",
        internalType: "contract BadgeRuleRegistry",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setBuyerWelcomeAmount",
    inputs: [
      {
        name: "newAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setDataFeed",
    inputs: [
      {
        name: "newFeed",
        type: "address",
        internalType: "contract ReputationDataFeed",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setIdentityMetadataURI",
    inputs: [
      {
        name: "newURI",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "settlementToken",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IMintableERC20",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "BadgeAwarded",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "ruleId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PurchaseCompleted",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "creator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "workId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "price",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WorkDeactivated",
    inputs: [
      {
        name: "workId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "caller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WorkListed",
    inputs: [
      {
        name: "workId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "creator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "price",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;

// ReputationDataFeed ABI - Aggregated statistics
export const REPUTATION_DATA_FEED_ABI = [
  {
    type: "function",
    name: "getBuyerStat",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct ReputationDataFeed.BuyerStat",
        components: [
          { name: "totalPurchases", type: "uint256", internalType: "uint256" },
          { name: "totalSpend", type: "uint256", internalType: "uint256" },
          { name: "lastPurchaseAt", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getCreatorStat",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct ReputationDataFeed.CreatorStat",
        components: [
          { name: "totalSales", type: "uint256", internalType: "uint256" },
          { name: "totalVolume", type: "uint256", internalType: "uint256" },
          { name: "lastSaleAt", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
  },
] as const;
