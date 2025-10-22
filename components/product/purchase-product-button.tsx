"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { createPurchase, completePurchase } from "@/lib/supabase/api";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MOCK_ERC20_ABI } from "@/lib/contracts/abis";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import { sepolia } from "wagmi/chains";
import { parseUnits } from "viem";
import { ShoppingCart } from "lucide-react";

interface PurchaseProductButtonProps {
  productId: string;
  productName: string;
  price: number;
  currency: string;
  sellerId: string;
  sellerWallet: string;
  className?: string;
  onSuccess?: () => void;
}

export function PurchaseProductButton({
  productId,
  productName,
  price,
  currency,
  sellerId,
  sellerWallet,
  className,
  onSuccess,
}: PurchaseProductButtonProps) {
  const { address } = useAccount();
  const { user, isAuthenticated } = useCurrentUser();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

  const testTokenAddress = CONTRACT_ADDRESSES.TEST_TOKEN[sepolia.id] as `0x${string}`;

  const {
    writeContract: transfer,
    data: txHash,
    isPending: isTransferring,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const handlePurchase = async () => {
    if (!isAuthenticated || !user || !address) {
      toast.error("请先连接钱包");
      return;
    }

    if (user.id === sellerId) {
      toast.error("不能购买自己的商品");
      return;
    }

    setIsPurchasing(true);

    try {
      // Step 1: Create purchase record in database
      console.log("[Purchase] Creating purchase record...");
      const { data: purchase, error: dbError } = await createPurchase({
        buyerId: user.id,
        buyerWallet: address,
        productId,
        sellerId,
        sellerWallet,
        amount: price,
        currency,
      });

      if (dbError || !purchase) {
        throw new Error("Failed to create purchase record");
      }

      setPurchaseId(purchase.id);
      console.log("[Purchase] Purchase record created:", purchase);

      // Step 2: Execute blockchain transaction
      toast.info("请确认钱包交易...");
      console.log("[Purchase] Initiating blockchain transfer...");

      const amountInWei = parseUnits(price.toString(), 6); // mUSDT has 6 decimals

      transfer({
        address: testTokenAddress,
        abi: MOCK_ERC20_ABI,
        functionName: "transfer",
        args: [sellerWallet as `0x${string}`, amountInWei],
      });
    } catch (error) {
      console.error("[Purchase] Error:", error);
      toast.error("购买失败，请重试");
      setIsPurchasing(false);
    }
  };

  // Handle transaction confirmation
  if (isConfirmed && purchaseId) {
    (async () => {
      try {
        console.log("[Purchase] Transaction confirmed, updating purchase...");
        await completePurchase(purchaseId, txHash);
        
        toast.success(`成功购买 ${productName}！`);
        console.log("[Purchase] Purchase completed successfully");
        
        setPurchaseId(null);
        setIsPurchasing(false);
        onSuccess?.();
      } catch (error) {
        console.error("[Purchase] Error completing purchase:", error);
        toast.error("购买记录更新失败");
        setIsPurchasing(false);
      }
    })();
  }

  const isLoading = isPurchasing || isTransferring || isConfirming;

  return (
    <Button
      onClick={handlePurchase}
      disabled={isLoading || !isAuthenticated}
      className={className}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {isLoading
        ? isTransferring
          ? "等待确认..."
          : isConfirming
          ? "交易确认中..."
          : "处理中..."
        : `购买 ${price} ${currency}`}
    </Button>
  );
}

