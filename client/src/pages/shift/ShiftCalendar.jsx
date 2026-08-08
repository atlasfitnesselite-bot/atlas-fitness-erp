import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const API = (path) => `/api${path}`
const token = () => localStorage.getItem("token")
const authHeaders = () => ({ Authorization: `Bearer ${token()}` })

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

function getDaysInMonth(year, month) {
  const days = []
  const first = new Date(year, month - 1, 1)
  const startDay = first.getDay()
  // Fill leading blanks
  for (let i = 0; i < startDay; i++) days.push(null)
  const total = new Date(year, month, 0).getDate()
  for (let d = 1; d <= total; d++) days.push(d)
  return days
}

export default function ShiftCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [view, setView] = useState("monthly") // monthly | weekly
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(API(`/shifts/calendar?year=${year}&month=${month}`), { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setAssignments(Array.isArray(d) ? d : []))
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false))
  }, [year, month])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const days = getDaysInMonth(year, month)

  // Build a map of day → assignments
  const dayMap = {}
  for (const a of assignments) {
    const start = new Date(a.startDate)
    const end = a.endDate ? new Date(a.endDate) : new Date(year, month - 1, 31)
    const cur = new Date(year, month - 1, 1)
    const last = new Date(year, month, 0)
    while (cur <= last && cur <= end) {
      if (cur >= start) {
        const d = cur.getDate()
        if (!dayMap[d]) dayMap[d] = []
        dayMap[d].push(a)
      }
      cur.setDate(cur.getDate() + 1)
    }
  }

  const today = now.getDate()
  const todayMonth = now.getMonth() + 1
  const todayYear = now.getFullYear()
  const isToday = (d) => d === today && month === todayMonth && year === todayYear

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shift Calendar</h1>
          <p className="text-sm text-muted-foreground">Visual overview of employee shift schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => setView("monthly")} className={`px-3 py-1.5 text-sm transition-colors ${view === "monthly" ? "bg-indigo-600 text-white" : "hover:bg-background"}`}>Monthly</button>
            <button onClick={() => setView("weekly")} className={`px-3 py-1.5 text-sm transition-colors ${view === "weekly" ? "bg-indigo-600 text-white" : "hover:bg-background"}`}>Weekly</button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <h2 className="text-lg font-semibold text-foreground">{MONTHS[month-1]} {year}</h2>
        <Button variant="outline" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map(d => <div key={d} className="h-8 bg-slate-200 rounded animate-pulse" />)}
          {Array(35).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden bg-card">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b bg-background">
            {DAYS.map(d => (
              <div key={d} className="text-xs font-medium text-muted-foreground text-center py-3">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 divide-x divide-y">
            {days.map((day, i) => (
              <div key={i} className={`min-h-[100px] p-1.5 ${!day ? "bg-background" : ""} ${isToday(day) ? "bg-indigo-50 ring-2 ring-inset ring-indigo-400" : ""}`}>
                {day && (
                  <>
                    <span className={`text-xs font-medium ${isToday(day) ? "text-indigo-700" : "text-slate-600"}`}>{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {(dayMap[day] ?? []).slice(0, 3).map((a, j) => {
                        // Check if employee was late on this specific day
                        const currentIsoDate = new Date(year, month - 1, day).toISOString().split('T')[0]
                        const isLate = a.employee?.attendances?.some(att => {
                          const attDate = new Date(att.date).toISOString().split('T')[0]
                          return attDate === currentIsoDate && att.lateMinutes > 0
                        })

                        return (
                          <div key={j} className="text-[10px] rounded px-1 py-0.5 text-white truncate flex items-center justify-between" style={{ backgroundColor: a.shift.color }}>
                            <span>{a.employee.firstName} · {a.shift.name}</span>
                            {isLate && <span title="Late arrival" className="text-amber-300">⚠️</span>}
                          </div>
                        )
                      })}
                      {(dayMap[day] ?? []).length > 3 && (
                        <div className="text-[10px] text-muted-foreground pl-1">+{(dayMap[day] ?? []).length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {[...new Set(assignments.map(a => a.shift?.type))].filter(Boolean).map(type => {
          const color = assignments.find(a => a.shift?.type === type)?.shift?.color ?? "#6366f1"
          return (
            <div key={type} className="flex items-center gap-1.5 text-xs text-slate-600">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              {type}
            </div>
          )
        })}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <div className="h-3 w-3 rounded-full bg-indigo-400" />
          Today
        </div>
      </div>
    </div>
  )
}
