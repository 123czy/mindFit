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
import { useTrack } from "@/lib/analytics/use-track";

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
  const { track } = useTrack();

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
    if (!isAuthenticated || !user) {
      toast.error("请先登录");
      return;
    }
    
    // 注意：如果需要Web3钱包功能，这里可以保留address检查
    // 但根据需求，我们不再使用Web3钱包登录，所以移除address检查

    if (user.id === sellerId) {
      toast.error("不能购买自己的商品");
      return;
    }

    setIsPurchasing(true);

    try {
      track({
        event_name: "submit",
        ap_name: "post_purchase_btn",
        refer: "post_detail",
        action_type: "purchase_submit",
        items: [
          {
            item_type: "product",
            item_value: productId,
            item_meta: {
              price,
              currency,
            },
          },
        ],
      });
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
      track({
        event_name: "submit",
        ap_name: "post_purchase_btn",
        refer: "post_detail",
        action_type: "pay_failed",
        items: [
          {
            item_type: "product",
            item_value: productId,
            item_meta: {
              price,
              currency,
            },
          },
        ],
        extra: { message: (error as Error)?.message },
      });
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
        track({
          event_name: "submit",
          ap_name: "post_purchase_btn",
          refer: "post_detail",
          action_type: "pay_success",
          items: [
            {
              item_type: "product",
              item_value: productId,
              item_meta: {
                price,
                currency,
                tx_hash: txHash,
              },
            },
          ],
        });
        
        setPurchaseId(null);
        setIsPurchasing(false);
        onSuccess?.();
      } catch (error) {
        console.error("[Purchase] Error completing purchase:", error);
        toast.error("购买记录更新失败");
        setIsPurchasing(false);
        track({
          event_name: "submit",
          ap_name: "post_purchase_btn",
          refer: "post_detail",
          action_type: "pay_failed",
          items: [
            {
              item_type: "product",
              item_value: productId,
              item_meta: {
                price,
                currency,
              },
            },
          ],
          extra: { message: (error as Error)?.message },
        });
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
