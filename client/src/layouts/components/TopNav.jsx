import api from '../../lib/api';
import { useEffect, useState } from "react"
import { Bell, Menu, Search, Moon, LogOut, Info, AlertTriangle, CheckCircle, AlertCircle, Check } from "lucide-react"
import { useUIStore } from "@/store/useUIStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useSocketStore } from "@/store/useSocketStore"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function TopNav() {
  const { toggleSidebar } = useUIStore()
  const { user, logout, token } = useAuthStore()
  const { socket, connect, disconnect } = useSocketStore()
  const { toast } = useToast()

  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count')
      if (res.data) {
        const data = res.data
        setUnreadCount(data.count || data.unreadCount || 0)
      }
    } catch (err) {
      console.error("Failed to fetch unread count", err)
    }
  }

  const fetchNotifications = async () => {
    setIsNotificationsLoading(true)
    try {
      const res = await api.get('/api/notifications?limit=5')
      if (res.data) {
        const data = res.data
        setNotifications(data.notifications || data.data || data || [])
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err)
    } finally {
      setIsNotificationsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchUnreadCount()
      connect()
    } else {
      disconnect()
    }
  }, [token, connect, disconnect])

  useEffect(() => {
    if (!socket) return

    const handleLiveCheckin = (data) => {
      toast({
        title: `🎯 ${data.name || 'Member'} checked in!`,
        description: data.plan ? `Plan: ${data.plan}` : 'Checked in successfully'
      })
      fetchUnreadCount()
    }

    const handleNewExpense = (data) => {
      toast({
        title: `💸 New Expense: ?${data.amount}`,
        description: data.category || 'Business expense recorded'
      })
      fetchUnreadCount()
    }

    const handleAttendanceUpdate = (data) => {
      toast({
        title: `👤 Staff ${data.type === 'CLOCK_IN' ? 'Clocked In' : 'Clocked Out'}`,
        description: `${data.name || 'Employee'} just ${data.type === 'CLOCK_IN' ? 'clocked in' : 'clocked out'}`
      })
      fetchUnreadCount()
    }

    const handleNewNotification = (data) => {
      toast({
        title: data.title || 'New Notification',
        description: data.message || '',
      })
      fetchUnreadCount()
      // Optional: immediately fetch notifications again to update dropdown if it's open
      fetchNotifications()
    }

    socket.on('live_checkin', handleLiveCheckin)
    socket.on('new_expense', handleNewExpense)
    socket.on('attendance_update', handleAttendanceUpdate)
    socket.on('new_notification', handleNewNotification)

    return () => {
      socket.off('live_checkin', handleLiveCheckin)
      socket.off('new_expense', handleNewExpense)
      socket.off('attendance_update', handleAttendanceUpdate)
      socket.off('new_notification', handleNewNotification)
    }
  }, [socket, toast])

  const handleOpenNotifications = (open) => {
    if (open) {
      fetchNotifications()
    }
  }

  const markAllAsRead = async (e) => {
    e.preventDefault()
    try {
      const res = await api('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data) {
        setUnreadCount(0)
        setNotifications(notifications.map(n => ({ ...n, isRead: true, read: true })))
      }
    } catch (err) {
      console.error("Failed to mark all as read", err)
    }
  }

  const markAsRead = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await api(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data) {
        fetchUnreadCount()
        setNotifications(notifications.map(n => (n.id === id || n._id === id) ? { ...n, isRead: true, read: true } : n))
      }
    } catch (err) {
      console.error("Failed to mark as read", err)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 shadow-sm z-10 flex-shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-muted-foreground flex">
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Breadcrumbs could go here */}
        <div className="hidden lg:flex items-center text-sm text-muted-foreground font-medium">
          Dashboard <span className="mx-2 text-muted-foreground/50">/</span> Overview
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search */}
        <div className="relative hidden md:block w-48 lg:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search... (Cmd+K)"
            className="w-full bg-background pl-9 border-border focus-visible:ring-primary rounded-full h-9"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Moon className="h-5 w-5" />
          </Button>
          
          <DropdownMenu onOpenChange={handleOpenNotifications}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-600 text-[10px]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-red-600 hover:text-red-700 hover:bg-transparent">
                    Mark all as read
                  </Button>
                )}
              </div>
              
              <div className="max-h-[300px] overflow-y-auto">
                {isNotificationsLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notification, i) => {
                      const isUnread = notification.isRead === false || notification.read === false
                      const nId = notification.id || notification._id
                      return (
                        <div key={nId || i} className={`px-4 py-3 flex gap-3 border-b border-slate-50 last:border-0 hover:bg-background transition-colors ${isUnread ? 'bg-background/50' : ''}`}>
                          <div className="mt-0.5 flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${isUnread ? 'font-medium text-foreground' : 'text-slate-700'}`}>
                              {notification.title || notification.message}
                            </p>
                            {notification.title && notification.message && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {formatTime(notification.createdAt || notification.date)}
                            </p>
                          </div>
                          {isUnread && (
                            <div className="flex-shrink-0 flex items-center">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-muted-foreground hover:text-red-600"
                                onClick={(e) => markAsRead(nId, e)}
                                title="Mark as read"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-slate-100">
                <Button variant="ghost" className="w-full text-xs justify-center text-muted-foreground">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} className="object-cover" />
                <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Admin User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'admin@atlasfitness.com'}
                </p>
                <Badge variant="secondary" className="mt-2 w-fit">{user?.roles?.join(', ') || 'Owner'}</Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
