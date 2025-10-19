import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { Empty } from "@/components/ui/empty"

interface WalletTabProps {
  userId: string
}

export function WalletTab({ userId }: WalletTabProps) {
  const balance = 1234.56
  const transactions = [
    { id: "1", type: "income", amount: 29.99, description: "产品销售", date: "2024-01-15" },
    { id: "2", type: "expense", amount: 9.99, description: "购买名片", date: "2024-01-14" },
  ]

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            账户余额
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">¥{balance.toFixed(2)}</div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>交易记录</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <Empty title="暂无交易记录" />
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {tx.type === "income" ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <div className={tx.type === "income" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {tx.type === "income" ? "+" : "-"}¥{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
