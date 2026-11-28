import { CustomSelect } from '@/components/ui/custom-select';
import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import api from '../../../lib/api';
import { useAuthStore } from "@/store/useAuthStore"
import { format } from 'date-fns'
import {
  Users, UserPlus, CreditCard, Clock, Activity, AlertCircle, Calendar, MessageSquare, LogIn, LogOut, Check, Fingerprint, IndianRupee, Loader2
} from "lucide-react"
import MyUpcomingShifts from "./MyUpcomingShifts"
import EmployeeSelfServiceWidget from "@/components/EmployeeSelfServiceWidget"
import { Badge } from "@/components/ui/badge"

export default function ReceptionDashboard() {
  const { user, token } = useAuthStore()
  const [activeTab, setActiveTab] = useState('checkin')
  const [receptionStats, setReceptionStats] = useState(null)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [isLoadingClock, setIsLoadingClock] = useState(false)

  // Checkin state
  const [checkinId, setCheckinId] = useState('')

  // Visitor state
  const [visitors, setVisitors] = useState([])
  const [visitorForm, setVisitorForm] = useState({ name: '', phone: '', purpose: '' })

  // Classes state
  const [classes, setClasses] = useState([])
  const [bookingForm, setBookingForm] = useState({ classId: '', memberId: '' })

  // Members / Access Cards
  const [members, setMembers] = useState([])
  const [accessCardForm, setAccessCardForm] = useState({ memberId: '', accessCardId: '' })

  // Billing (Invoices)
  const [invoices, setInvoices] = useState([])

  const config = { headers: { Authorization: `Bearer ${token}` } }

  const fetchData = async () => {
    try {
      const [visRes, clsRes, memRes, invRes, statsRes, clockRes] = await Promise.all([
        api.get('/api/visitors/today', config),
        api.get('/api/classes/today', config),
        api.get('/api/members', config),
        api.get('/api/billing/invoices', config),
        api.get('/api/analytics/reception-dashboard', config),
        api.get('/api/attendance/me/status', config).catch(() => ({ data: { isClockedIn: false } }))
      ])
      setVisitors(visRes.data)
      setClasses(clsRes.data)
      setMembers(memRes.data?.data || memRes.data || [])
      setInvoices(invRes.data?.data || invRes.data || [])
      setReceptionStats(statsRes.data)
      setIsClockedIn(clockRes.data?.isClockedIn || false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load dashboard data')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Actions
  const handleCheckIn = async () => {
    if(!checkinId) return toast.error("Enter Member ID or Mobile")
    try {
      await api.post('/api/kiosk/member-checkin', { identifier: checkinId }, config)
      toast.success("Member checked in successfully")
      setCheckinId('')
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-in failed")
    }
  }

  const handleLogVisitor = async () => {
    if(!visitorForm.name || !visitorForm.phone) return toast.error("Name and Phone are required")
    try {
      await api.post('/api/visitors', visitorForm, config)
      toast.success("Visitor logged")
      setVisitorForm({ name: '', phone: '', purpose: '' })
      fetchData()
    } catch (err) {
      toast.error("Failed to log visitor")
    }
  }

  const handleVisitorCheckout = async (id) => {
    try {
      await api.put(`/api/visitors/${id}/checkout`, {}, config)
      toast.success("Visitor checked out")
      fetchData()
    } catch(err) {
      toast.error("Failed to checkout")
    }
  }

  const handleBookClass = async () => {
    if(!bookingForm.classId || !bookingForm.memberId) return toast.error("Select Class and Member")
    try {
      await api.post('/api/classes/book', bookingForm, config)
      toast.success("Class booked successfully")
      setBookingForm({ classId: '', memberId: '' })
      fetchData()
    } catch(err) {
      toast.error(err.response?.data?.message || "Booking failed")
    }
  }

  const handleIssueAccessCard = async () => {
    if(!accessCardForm.memberId || !accessCardForm.accessCardId) return toast.error("Select Member and enter Card ID")
    try {
      await api.put(`/api/members/${accessCardForm.memberId}/access-card`, { accessCardId: accessCardForm.accessCardId }, config)
      toast.success("Access card assigned")
      setAccessCardForm({ memberId: '', accessCardId: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed")
    }
  }

  const handlePayInvoice = async (invoiceId) => {
    try {
      await api.put(`/api/billing/invoices/${invoiceId}/pay`, { paymentMethod: 'CASH', amount: 0 }, config)
      toast.success("Payment successful")
      fetchData()
    } catch(err) {
      toast.error("Payment failed")
    }
  }

  const handleReceptionClockToggle = async () => {
    setIsLoadingClock(true)
    try {
      if (isClockedIn) {
        await api.post('/api/attendance/me/clock-out', {}, config)
        toast.success("Reception Clock-Out Successful")
        setIsClockedIn(false)
      } else {
        await api.post('/api/attendance/me/clock-in', { location: 'Front Desk' }, config)
        toast.success("Reception Clock-In Successful")
        setIsClockedIn(true)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Clock action failed")
    } finally {
      setIsLoadingClock(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reception Dashboard</h2>
          <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={handleReceptionClockToggle} 
            variant="outline" 
            className={isClockedIn ? "border-red-600 text-red-600 hover:bg-red-50" : "border-indigo-600 text-indigo-600 hover:bg-indigo-50"}
            disabled={isLoadingClock}
          >
            {isLoadingClock ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : isClockedIn ? <LogOut className="h-4 w-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {receptionStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Check-ins Today</CardTitle>
              <div className="p-2 bg-blue-50 rounded-full">
                <Fingerprint className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{receptionStats.memberCheckInsToday || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Today's Visitors</CardTitle>
              <div className="p-2 bg-amber-50 rounded-full">
                <Users className="h-4 w-4 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{receptionStats.visitorsToday || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Upcoming Renewals</CardTitle>
              <div className={`p-2 rounded-full ${receptionStats.upcomingRenewals > 0 ? 'bg-red-50' : 'bg-background'}`}>
                <Calendar className={`h-4 w-4 ${receptionStats.upcomingRenewals > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                {receptionStats.upcomingRenewals || 0}
                {receptionStats.upcomingRenewals > 0 && (
                  <Badge variant="destructive" className="text-[10px]">Action Needed</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Today's Revenue</CardTitle>
              <div className="p-2 bg-emerald-50 rounded-full">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{(receptionStats.todayPayments?.total || 0).toLocaleString('en-IN')}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-card p-4 rounded-lg shadow-sm border">
        <TabsList className="grid w-full grid-cols-5 bg-slate-100">
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="access">Access Cards</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Check-in</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input 
                  placeholder="Enter Member ID or Mobile Number" 
                  value={checkinId} 
                  onChange={e => setCheckinId(e.target.value)} 
                />
                <Button onClick={handleCheckIn}>Check In</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitors" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log New Visitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input placeholder="Visitor Name" value={visitorForm.name} onChange={e => setVisitorForm({...visitorForm, name: e.target.value})} />
                <Input placeholder="Phone Number" value={visitorForm.phone} onChange={e => setVisitorForm({...visitorForm, phone: e.target.value})} />
                <Input placeholder="Purpose" value={visitorForm.purpose} onChange={e => setVisitorForm({...visitorForm, purpose: e.target.value})} />
                <Button onClick={handleLogVisitor}>Log Visit</Button>
              </div>
            </CardContent>
          </Card>

          <h3 className="font-semibold text-lg mt-6">Today's Visitors</h3>
          <div className="grid gap-4">
            {visitors.map(v => (
              <div key={v.id} className="p-4 border rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{v.name} <span className="text-sm font-normal text-muted-foreground">({v.phone})</span></p>
                  <p className="text-sm text-slate-600">In: {format(new Date(v.checkIn), 'HH:mm')} | Purpose: {v.purpose}</p>
                </div>
                {!v.checkOut ? (
                  <Button variant="outline" onClick={() => handleVisitorCheckout(v.id)}>Check Out</Button>
                ) : (
                  <span className="text-sm text-muted-foreground">Out: {format(new Date(v.checkOut), 'HH:mm')}</span>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="classes" className="mt-4 space-y-4">
           <Card>
            <CardHeader>
              <CardTitle>Book Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomSelect 
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                  value={bookingForm.classId}
                  onChange={e => setBookingForm({...bookingForm, classId: e.target.value})}
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.startTime}) - {c._count?.bookings || 0}/{c.capacity}</option>
                  ))}
                </CustomSelect>
                <CustomSelect 
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                  value={bookingForm.memberId}
                  onChange={e => setBookingForm({...bookingForm, memberId: e.target.value})}
                >
                  <option value="">Select Member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.memberId})</option>
                  ))}
                </CustomSelect>
                <Button onClick={handleBookClass}>Confirm Booking</Button>
              </div>
            </CardContent>
          </Card>
          
          <h3 className="font-semibold text-lg mt-6">Today's Classes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(c => (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Time: {c.startTime} - {c.endTime}</p>
                  <p className="text-sm">Capacity: {c._count?.bookings || 0} / {c.capacity}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="access" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issue Access Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomSelect 
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                  value={accessCardForm.memberId}
                  onChange={e => setAccessCardForm({...accessCardForm, memberId: e.target.value})}
                >
                  <option value="">Select Member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.memberId}) {m.accessCardId ? '[Has Card]' : ''}</option>
                  ))}
                </CustomSelect>
                <Input 
                  placeholder="Scan or Enter Access Card ID (RFID)" 
                  value={accessCardForm.accessCardId} 
                  onChange={e => setAccessCardForm({...accessCardForm, accessCardId: e.target.value})} 
                />
                <Button onClick={handleIssueAccessCard}>Assign Card</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4 space-y-4">
          <h3 className="font-semibold text-lg">Pending Invoices</h3>
          <div className="grid gap-4">
            {invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').map(i => (
              <div key={i.id} className="p-4 border rounded flex justify-between items-center bg-card shadow-sm">
                <div>
                  <p className="font-semibold">Invoice #{i.id.slice(0,8).toUpperCase()} - ₹{i.totalAmount}</p>
                  <p className="text-sm text-muted-foreground">Status: {i.status} | Member ID: {i.memberId}</p>
                </div>
                <Button onClick={() => handlePayInvoice(i.id)}>Process Payment (Cash)</Button>
              </div>
            ))}
            {invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').length === 0 && (
              <p className="text-muted-foreground">No pending invoices.</p>
            )}
          </div>
        </TabsContent>

      </Tabs>
      <EmployeeSelfServiceWidget />
      <MyUpcomingShifts />
    </div>
  )
}
