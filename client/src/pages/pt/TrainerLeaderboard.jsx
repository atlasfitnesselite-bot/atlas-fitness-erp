import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'
import api from '../../lib/api';
import { 
  Trophy, Medal, Star, Banknote, Target, TrendingUp, Loader2 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TrainerLeaderboard() {
  const { token, user } = useAuthStore()
  
  const [leaderboard, setLeaderboard] = useState([])
  const [myStats, setMyStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [lbRes, statsRes] = await Promise.all([
        api.get('/api/pt/leaderboard', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/pt/trainer/stats', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null }))
      ])
      
      setLeaderboard(lbRes.data)
      setMyStats(statsRes.data)
    } catch (err) {
      toast.error('Failed to load leaderboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Trainer Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">Monthly performance rankings and commission tracking</p>
      </div>

      {myStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-slate-900 to-black text-white border-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><Target className="w-16 h-16" /></div>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-foreground">My Completed Sessions</p>
              <h3 className="text-4xl font-bold mt-2">{myStats.completedSessions}</h3>
              <p className="text-xs text-emerald-400 mt-2">Current Month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-600 to-rose-900 text-white border-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><Banknote className="w-16 h-16" /></div>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-red-200">Total Commission</p>
              <h3 className="text-4xl font-bold mt-2">₹{myStats.totalEarnings?.toLocaleString()}</h3>
              <p className="text-xs text-red-100 mt-2">All time earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
              <h3 className="text-3xl font-bold mt-2">{myStats.totalClients}</h3>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Performance Score</p>
              <h3 className="text-3xl font-bold mt-2">{myStats.performanceScore?.toFixed(1)}%</h3>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm border-border/50">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-xl">Top Performers</CardTitle>
          <CardDescription>Ranked by completed sessions this month</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Rank</th>
                  <th className="px-6 py-4 font-semibold">Trainer</th>
                  <th className="px-6 py-4 font-semibold text-center">Sessions (Month)</th>
                  <th className="px-6 py-4 font-semibold text-center">Active Clients</th>
                  <th className="px-6 py-4 font-semibold text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaderboard.map((trainer, index) => (
                  <tr key={trainer.id} className={`hover:bg-muted/20 transition-colors ${user?.id === trainer.id ? 'bg-red-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold
                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          index === 1 ? 'bg-slate-200 text-slate-700' : 
                          index === 2 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}
                      ">
                        {index === 0 ? <Trophy className="w-4 h-4" /> : 
                         index === 1 ? <Medal className="w-4 h-4" /> : 
                         index === 2 ? <Medal className="w-4 h-4" /> : `#${index + 1}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground overflow-hidden">
                          {trainer.profilePicture ? (
                            <img src={trainer.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            trainer.firstName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{trainer.firstName} {trainer.lastName}</p>
                          {user?.id === trainer.id && <Badge variant="outline" className="text-[10px] h-4 px-1 mt-1 border-red-200 text-red-600 bg-red-50">YOU</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-lg">
                      {trainer.completedSessionsThisMonth}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary">{trainer.clientCount}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">
                      ₹{trainer.revenueGenerated?.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No sessions completed this month yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
