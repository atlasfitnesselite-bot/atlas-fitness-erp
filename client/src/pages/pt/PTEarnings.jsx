import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import api from "../../lib/api"
import { DollarSign, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PTEarnings() {
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [trainers, setTrainers] = useState([])
  const [selectedTrainerId, setSelectedTrainerId] = useState("")

  const isAdmin = user?.role === 'OWNER' || user?.role === 'MANAGER'

  useEffect(() => {
    if (isAdmin) {
      fetchTrainers()
    } else {
      fetchEarnings()
    }
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin && selectedTrainerId) {
      fetchEarnings(selectedTrainerId)
    }
  }, [selectedTrainerId, isAdmin])

  const fetchTrainers = async () => {
    try {
      const res = await api.get("/api/pt/leaderboard")
      setTrainers(res.data)
      if (res.data.length > 0) {
        setSelectedTrainerId(res.data[0].id)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error("Error fetching trainers", error)
      setLoading(false)
    }
  }

  const fetchEarnings = async (trainerId = null) => {
    setLoading(true)
    try {
      const url = isAdmin && trainerId 
        ? `/api/pt/commission/${trainerId}` 
        : "/api/pt/trainer/commission"
      const res = await api.get(url)
      setData(res.data)
    } catch (error) {
      console.error("Error fetching earnings", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>
  }

  if (!data) {
    return <div className="p-8 text-center text-muted-foreground">Unable to load earnings data.</div>
  }

  const { summary, commissions } = data

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PT Earnings</h1>
          <p className="text-muted-foreground">Track commissions and total earnings.</p>
        </div>
        {isAdmin && (
          <div className="w-64">
            <Select value={selectedTrainerId} onValueChange={setSelectedTrainerId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select Trainer" />
              </SelectTrigger>
              <SelectContent>
                {trainers.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.firstName} {t.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalEarned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime commission earnings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Successfully transferred</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
          <CardDescription>Recent commission transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No commissions logged yet.</div>
          ) : (
            <div className="space-y-4">
              {commissions.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium leading-none">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Session Commission
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-green-600">+${c.amount.toFixed(2)}</p>
                      <p className={`text-xs font-medium uppercase ${c.status === "PAID" ? "text-green-500" : "text-yellow-500"}`}>
                        {c.status}
                      </p>
                    </div>
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
