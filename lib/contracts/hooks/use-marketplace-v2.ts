"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { useAccount, useChainId } from "wagmi";
import { MARKETPLACE_V2_ABI } from "../abis";
import { getContractAddress } from "../addresses";
import { keccak256, encodePacked } from "viem";
import { toast } from "sonner";

// Get work information
export function useGetWork(workId?: `0x${string}`) {
  const chainId = useChainId();
  const contractAddress = getContractAddress("MARKETPLACE_V2", chainId);

  return useReadContract({
    address: contractAddress,
    abi: MARKETPLACE_V2_ABI,
    functionName: "getWork",
    args: workId ? [workId] : undefined,
    query: {
      enabled: !!contractAddress && !!workId,
    },
  });
}

// Get buyer statistics
export function useBuyerStats(address?: `0x${string}`) {
  const chainId = useChainId();
  const contractAddress = getContractAddress("MARKETPLACE_V2", chainId);

  return useReadContract({
    address: contractAddress,
    abi: MARKETPLACE_V2_ABI,
    functionName: "getBuyerStat",
    args: address ? [address] : undefined,
    query: {
      enabled: !!contractAddress && !!address,
    },
  });
}

// Get creator statistics
export function useCreatorStats(address?: `0x${string}`) {
  const chainId = useChainId();
  const contractAddress = getContractAddress("MARKETPLACE_V2", chainId);

  return useReadContract({
    address: contractAddress,
    abi: MARKETPLACE_V2_ABI,
    functionName: "getCreatorStat",
    args: address ? [address] : undefined,
    query: {
      enabled: !!contractAddress && !!address,
    },
  });
}

// Get eligible badge rules for user
export function useEligibleRules(address?: `0x${string}`, target?: 0 | 1) {
  const chainId = useChainId();
  const contractAddress = getContractAddress("MARKETPLACE_V2", chainId);

  return useReadContract({
    address: contractAddress,
    abi: MARKETPLACE_V2_ABI,
    functionName: "getEligibleRules",
    args: address && target !== undefined ? [address, target] : undefined,
    query: {
      enabled: !!contractAddress && !!address && target !== undefined,
    },
  });
}

// List work on marketplace (simplified - no signature required)
export function useListWork() {
  const chainId = useChainId();
  const address = getContractAddress("MARKETPLACE_V2", chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const listWork = async (workId: any, price: bigint) => {
    if (!address) throw new Error("Marketplace not deployed on this network");

    console.log("[v0] Listing work:", { workId, price });

    return writeContract({
      address,
      abi: MARKETPLACE_V2_ABI,
      functionName: "listWork",
      args: [workId, price],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    listWork,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Purchase work
export function usePurchaseWork() {
  const chainId = useChainId();
  const address = getContractAddress("MARKETPLACE_V2", chainId);
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const purchase = async (workId: `0x${string}`) => {
    if (!address) throw new Error("Marketplace not deployed on this network");

    console.log("[v0] Purchasing work:", { workId });

    return writeContract({
      address,
      abi: MARKETPLACE_V2_ABI,
      functionName: "purchase",
      args: [workId],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    purchase,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Watch for work listed events
export function useWatchWorkListed(
  onWorkListed?: (workId: bigint, creator: `0x${string}`) => void
) {
  const chainId = useChainId();
  const address = getContractAddress("MARKETPLACE_V2", chainId);
  const { address: userAddress } = useAccount();

  useWatchContractEvent({
    address,
    abi: MARKETPLACE_V2_ABI,
    eventName: "WorkListed",
    onLogs(logs) {
      logs.forEach((log) => {
        const { workId, creator, price } = log.args;
        console.log("[v0] Work listed:", { workId, creator, price });

        if (creator === userAddress) {
          toast.success("作品上架成功！");
          onWorkListed?.(workId, creator);
        }
      });
    },
  });
}

// Watch for purchase completed events
export function useWatchPurchaseCompleted(
  onPurchase?: (workId: `0x${string}`, buyer: `0x${string}`) => void
) {
  const chainId = useChainId();
  const address = getContractAddress("MARKETPLACE_V2", chainId);
  const { address: userAddress } = useAccount();

  useWatchContractEvent({
    address,
    abi: MARKETPLACE_V2_ABI,
    eventName: "PurchaseCompleted",
    onLogs(logs) {
      logs.forEach((log) => {
        const { workId, buyer, creator, purchaseId, price } = log.args;
        console.log("[v0] Purchase completed:", {
          workId,
          buyer,
          creator,
          purchaseId,
          price,
        });

        if (buyer === userAddress) {
          toast.success("购买成功！");
          onPurchase?.(workId, buyer);
        }
      });
    },
  });
}

// Watch for badge awarded events (from marketplace)
export function useWatchBadgeAwardedFromMarketplace(
  onBadgeAwarded?: (account: `0x${string}`, ruleId: bigint) => void
) {
  const chainId = useChainId();
  const address = getContractAddress("MARKETPLACE_V2", chainId);
  const { address: userAddress } = useAccount();

  useWatchContractEvent({
    address,
    abi: MARKETPLACE_V2_ABI,
    eventName: "BadgeAwarded",
    onLogs(logs) {
      logs.forEach((log) => {
        const { account, ruleId } = log.args;
        console.log("[v0] Badge awarded from marketplace:", {
          account,
          ruleId,
        });

        if (account === userAddress) {
          toast.success("🎉 恭喜获得新徽章！", {
            description: "您的成就已被记录",
          });
          onBadgeAwarded?.(account, ruleId);
        }
      });
    },
  });
}

// Generate work ID
export function generateWorkId(
  creator: `0x${string}`,
  nonce: bigint
): `0x${string}` {
  const timestamp = BigInt(Date.now());
  return keccak256(
    encodePacked(["address", "uint256", "uint256"], [creator, timestamp, nonce])
  );
}
