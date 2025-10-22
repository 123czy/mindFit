"use client";

import { useTestToken } from "@/lib/contracts/hooks/use-test-token";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount } from "wagmi";
import { Coins, Loader2 } from "lucide-react";

/**
 * Test Token Faucet Component
 * Allows users to claim test tokens for development/testing
 */
export function TestTokenFaucet() {
  const { address, isConnected } = useAccount();
  const {
    symbol,
    formattedBalance,
    isLoadingBalance,
    hasLowBalance,
    claimTokens,
    isMinting,
  } = useTestToken();

  if (!isConnected || !address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            测试代币水龙头
          </CardTitle>
          <CardDescription>
            请先连接钱包以领取测试代币
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          测试代币水龙头
        </CardTitle>
        <CardDescription>
          免费领取测试代币用于体验平台功能
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">当前余额</p>
          <p className="text-2xl font-bold font-mono">
            {isLoadingBalance ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                加载中...
              </span>
            ) : (
              <>
                {parseFloat(formattedBalance).toFixed(2)}{" "}
                <span className="text-lg text-muted-foreground">{symbol}</span>
              </>
            )}
          </p>
        </div>

        {/* Claim Button */}
        <div className="space-y-2">
          <Button
            onClick={() => claimTokens("1000")}
            disabled={isMinting || !hasLowBalance}
            className="w-full"
            size="lg"
          >
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : hasLowBalance ? (
              <>
                <Coins className="mr-2 h-4 w-4" />
                领取 1000 {symbol}
              </>
            ) : (
              "余额充足"
            )}
          </Button>
          
          {!hasLowBalance && (
            <p className="text-xs text-center text-muted-foreground">
              当前余额充足，无需领取更多代币
            </p>
          )}
          
          {hasLowBalance && !isMinting && (
            <p className="text-xs text-center text-muted-foreground">
              每次可领取 1000 {symbol}，用于体验平台功能
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
            💡 <strong>提示：</strong>这是测试代币，仅用于 Sepolia 测试网体验平台功能，不具有任何实际价值。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

