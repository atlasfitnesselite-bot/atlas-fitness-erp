import api from '../../lib/api';
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle2, MessageSquare, AlertTriangle, Calendar, Settings } from "lucide-react"
import { useAuthStore } from '@/store/useAuthStore'

export default function Notifications() {
  const { token } = useAuthStore()
  const [notifications, setNotifications] = useState([])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications')
      if (res.data) {
        const data = res.data
        setNotifications(data.notifications || data || [])
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAllAsRead = async () => {
    try {
      const res = await api('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data) {
        fetchNotifications()
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  const markAsRead = async (id) => {
    try {
      const res = await api(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data) {
        fetchNotifications()
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) alert(err.response.data.message);
    }
  }

  const getIconForType = (type) => {
    switch(type) {
      case 'ALERT': return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case 'MESSAGE': return <MessageSquare className="h-5 w-5 text-blue-600" />
      case 'CALENDAR': return <Calendar className="h-5 w-5 text-indigo-600" />
      default: return <Bell className="h-5 w-5 text-slate-600" />
    }
  }

  return (
    <div className="space-y-6 p-8 text-foreground bg-background min-h-[calc(100vh-64px)] font-sans -m-4 md:-m-6 lg:-m-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your alerts, messages, and system updates.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={markAllAsRead} variant="outline" className="flex gap-2 bg-card">
            <CheckCircle2 className="h-4 w-4" /> Mark All as Read
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" /> Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? <p className="p-4 text-muted-foreground text-sm">No recent notifications.</p> : notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => !notif.read && markAsRead(notif.id)}
                className={`p-4 flex gap-4 transition-colors hover:bg-background cursor-pointer ${notif.read ? 'bg-card' : 'bg-background/50'}`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.read ? 'bg-slate-100' : 'bg-indigo-100'}`}>
                  {getIconForType(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm font-semibold truncate ${notif.read ? 'text-slate-700' : 'text-foreground'}`}>
                      {notif.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {notif.message}
                  </p>
                </div>
                {!notif.read && (
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-indigo-600"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
