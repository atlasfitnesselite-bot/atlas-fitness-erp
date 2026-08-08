import { CustomSelect } from '@/components/ui/custom-select';
import api from '../../lib/api';
import React, { useState, useEffect } from 'react'
import { Save, Settings, Shield, Clock, HelpCircle, Loader2, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'

export default function AttendanceSettings() {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    officeStartTime: '09:00',
    officeEndTime: '17:00',
    graceTime: 15,
    lateThreshold: 30,
    breakDuration: 45,
    minWorkingHours: 4.0,
    maxWorkingHours: 12.0,
    autoLogoutTime: 10,
    deviceName: 'Reception Tablet',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm'
  })

  useEffect(() => {
    fetchSettings()
  }, [token])

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/attendance/settings')
      if (!res.data) throw new Error('Failed to load settings')
      const data = res.data
      setFormData(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Parse integers and floats
      const parsedData = {
        ...formData,
        graceTime: parseInt(formData.graceTime.toString()),
        lateThreshold: parseInt(formData.lateThreshold.toString()),
        breakDuration: parseInt(formData.breakDuration.toString()),
        minWorkingHours: parseFloat(formData.minWorkingHours.toString()),
        maxWorkingHours: parseFloat(formData.maxWorkingHours.toString()),
        autoLogoutTime: parseInt(formData.autoLogoutTime.toString())
      }

      const res = await api('/api/attendance/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        data: payload
      })

      if (!res.data) throw new Error('Failed to save settings')
      toast.success('Attendance configurations updated!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-muted-foreground bg-background -m-4 md:-m-6 lg:-m-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8 text-foreground bg-background font-sans min-h-[calc(100vh-64px)] -m-4 md:-m-6 lg:-m-8">
      {/* Sleek Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link 
            to="/attendance" 
            className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure business thresholds, grace times, shift rules, and kiosk details.</p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        
        {/* Box 1: Shift & Office Timings */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-5 flex flex-col">
          <div className="flex items-center space-x-2 pb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-bold text-slate-700">Shift Configuration</h3>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground tracking-wider">OFFICE START TIME</label>
              <input
                type="time"
                value={formData.officeStartTime}
                onChange={(e) => setFormData({ ...formData, officeStartTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground tracking-wider">OFFICE END TIME</label>
              <input
                type="time"
                value={formData.officeEndTime}
                onChange={(e) => setFormData({ ...formData, officeEndTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground tracking-wider">GRACE TIME (MINS)</label>
              <input
                type="number"
                value={formData.graceTime}
                onChange={(e) => setFormData({ ...formData, graceTime: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground tracking-wider">LATE THRESHOLD (MINS)</label>
              <input
                type="number"
                value={formData.lateThreshold}
                onChange={(e) => setFormData({ ...formData, lateThreshold: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        {/* Box 2: Working & Break Policies */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-5 flex flex-col">
          <div className="flex items-center space-x-2 pb-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-bold text-slate-700">Work & Break Policies</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground tracking-wider">DEFAULT BREAK DURATION (MINS)</label>
            <input
              type="number"
              value={formData.breakDuration}
              onChange={(e) => setFormData({ ...formData, breakDuration: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
              min="0"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground tracking-wider">MIN WORK HOURS (HALF DAY)</label>
              <input
                type="number"
                step="0.5"
                value={formData.minWorkingHours}
                onChange={(e) => setFormData({ ...formData, minWorkingHours: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                min="0"
                max="24"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground tracking-wider">MAX WORK HOURS (LIMIT)</label>
              <input
                type="number"
                step="0.5"
                value={formData.maxWorkingHours}
                onChange={(e) => setFormData({ ...formData, maxWorkingHours: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                min="0"
                max="24"
                required
              />
            </div>
          </div>
        </div>

        {/* Box 3: Device & System Configuration */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-5 flex flex-col">
          <div className="flex items-center space-x-2 pb-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-bold text-slate-700">Kiosk & Device Settings</h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground tracking-wider">ATTENDANCE DEVICE NAME</label>
            <input
              type="text"
              value={formData.deviceName}
              onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground tracking-wider">AUTO LOGOUT TIME (MINS)</label>
              <input
                type="number"
                value={formData.autoLogoutTime}
                onChange={(e) => setFormData({ ...formData, autoLogoutTime: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground tracking-wider">SYSTEM TIMEZONE</label>
              <CustomSelect
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm"
              >
                <option value="UTC">UTC</option>
                <option value="GMT">GMT</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
                <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
              </CustomSelect>
            </div>
          </div>
        </div>

        {/* Box 4: Formatting Details */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-5 flex flex-col">
          <div className="flex items-center space-x-2 pb-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-bold text-slate-700">System Formatting</h3>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground tracking-wider">DATE FORMAT</label>
              <CustomSelect
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </CustomSelect>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground tracking-wider">TIME FORMAT</label>
              <CustomSelect
                value={formData.timeFormat}
                onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm"
              >
                <option value="HH:mm">24-Hour (HH:mm)</option>
                <option value="hh:mm A">12-Hour (hh:mm AM/PM)</option>
              </CustomSelect>
            </div>
          </div>

          <div className="pt-4 mt-auto">
            <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
              Changes applied here will automatically override checking policies across all connected kiosks.
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="md:col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-bold flex items-center space-x-2 transition-all disabled:opacity-50 shadow-md shadow-indigo-600/20 active:scale-[0.98]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
