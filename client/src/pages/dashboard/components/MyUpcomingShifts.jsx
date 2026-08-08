import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, Clock, Loader2 } from "lucide-react"
import { format } from "date-fns"
import api from '../../../lib/api';
import { useAuthStore } from "@/store/useAuthStore"

export default function MyUpcomingShifts() {
  const { user, token } = useAuthStore()
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShifts = async () => {
      if (!user?.employeeId) {
        setLoading(false)
        return
      }
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } }
        const res = await api.get(`/api/employees/${user.employeeId}/shifts`, config)
        setShifts(res.data || [])
      } catch (e) {
        console.error("Failed to fetch shifts", e)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchShifts()
  }, [token, user])

  if (loading) {
    return (
      <Card className="shadow-sm mt-6">
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  // Only render if there are shifts or if we want to show empty state.
  // It's good to show empty state so they know the feature exists.
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Work Schedule</CardTitle>
            <CardDescription>Your upcoming assigned shifts</CardDescription>
          </div>
          <Calendar className="h-5 w-5 text-indigo-500" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          {shifts.length === 0 ? (
             <div className="text-center p-6 text-muted-foreground bg-background rounded-lg border border-dashed">
               <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
               <p className="text-sm">No upcoming shifts assigned.</p>
             </div>
          ) : (
            shifts.slice(0, 5).map((shiftAssign) => (
              <div key={shiftAssign.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow bg-card">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: shiftAssign.shift?.color || '#6366f1' }} />
                    <span className="font-semibold text-foreground text-sm">{shiftAssign.shift?.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {shiftAssign.shift?.startTime} - {shiftAssign.shift?.endTime}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {format(new Date(shiftAssign.startDate), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
