"use client";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { MOCK_ERC20_ABI } from "../abis";
import { CONTRACT_ADDRESSES } from "../addresses";
import { formatUnits, parseUnits } from "viem";
import { useEffect, useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook to interact with test token (MockERC20)
 */
export function useTestToken() {
  const { address, isConnected } = useAccount();
  const testTokenAddress = CONTRACT_ADDRESSES.TEST_TOKEN[
    sepolia.id
  ] as `0x${string}`;

  // Read token balance
  const {
    data: balance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useReadContract({
    address: testTokenAddress,
    abi: MOCK_ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read token decimals
  const { data: decimals } = useReadContract({
    address: testTokenAddress,
    abi: MOCK_ERC20_ABI,
    functionName: "decimals",
    query: {
      enabled: true,
    },
  });

  // Read token symbol
  const { data: symbol } = useReadContract({
    address: testTokenAddress,
    abi: MOCK_ERC20_ABI,
    functionName: "symbol",
    query: {
      enabled: true,
    },
  });

  // Write contract for minting
  const {
    writeContract: mint,
    data: mintTxHash,
    isPending: isMinting,
    isError: isMintError,
    error: mintError,
  } = useWriteContract();

  // Wait for mint transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: mintTxHash,
    });

  // Refetch balance after successful mint
  useEffect(() => {
    if (isConfirmed) {
      refetchBalance();
      toast.success("测试代币领取成功！");
    }
  }, [isConfirmed, refetchBalance]);

  // Show error toast
  useEffect(() => {
    if (isMintError && mintError) {
      toast.error(`领取失败: ${mintError.message}`);
    }
  }, [isMintError, mintError]);

  /**
   * Claim test tokens (mint to user)
   * Default amount: 1000 tokens
   */
  const claimTokens = useCallback(
    (amount: string = "1000") => {
      if (!address) {
        toast.error("请先连接钱包");
        return;
      }

      const decimalsValue = (decimals as number) || 6;
      const amountInWei = parseUnits(amount, decimalsValue);

      mint({
        address: testTokenAddress,
        abi: MOCK_ERC20_ABI,
        functionName: "mint",
        args: [address, amountInWei],
      });
    },
    [address, decimals, mint, testTokenAddress]
  );

  // Format balance for display
  const formattedBalance =
    balance && decimals
      ? formatUnits(balance as bigint, decimals as number)
      : "0";

  // Check if user has low balance (less than 10 tokens)
  const hasLowBalance =
    balance && decimals
      ? Number(formatUnits(balance as bigint, decimals as number)) < 10
      : true;

  return {
    // Token info
    symbol: (symbol as string) || "mUSDT",
    decimals: (decimals as number) || 6,

    // Balance
    balance: balance as bigint | undefined,
    formattedBalance,
    isLoadingBalance,
    hasLowBalance,
    refetchBalance,

    // Mint/Claim
    claimTokens,
    isMinting: isMinting || isConfirming,
    isClaimSuccess: isConfirmed,
    claimError: mintError,
  };
}
