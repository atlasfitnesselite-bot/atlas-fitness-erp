import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calculator, Save, Download, Loader2, IndianRupee, Clock, CalendarDays, FileText } from 'lucide-react'
import api from '../../lib/api';
import { toast } from 'sonner'
import { useAuthStore } from '@/store/useAuthStore'

export default function SalarySlipDialog({ slip, isOpen, onClose, onUpdated }) {
  const { token, hasRole } = useAuthStore()
  const [bonuses, setBonuses] = useState(0)
  const [penalties, setPenalties] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (slip) {
      setBonuses(slip.bonuses || 0)
      setPenalties(slip.otherPenalties || 0)
    }
  }, [slip])

  if (!slip) return null

  const isDraft = slip.status === 'DRAFT'
  const canEdit = isDraft && (hasRole('OWNER') || hasRole('MANAGER'))

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.put(`/api/payroll/slips/${slip.id || slip._id}`, {
        bonuses: Number(bonuses),
        otherPenalties: Number(penalties)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Salary slip updated')
      onUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating slip:', error)
      toast.error(error.response?.data?.message || 'Failed to update slip')
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Calculate live net pay while typing
  const liveGross = (slip.baseSalary || 0) + (slip.standardAllowances || 0) + (slip.overtimePay || 0) + (slip.ptCommission || 0) + Number(bonuses || 0)
  const liveNet = liveGross - (slip.standardDeductions || 0) - (slip.latePenalties || 0) - Number(penalties || 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto printable-slip">
        <DialogHeader>
          <div className="flex justify-between items-center pr-8">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Salary Slip Details
            </DialogTitle>
            <Badge 
              variant="outline" 
              className={
                (slip.status === 'PAID') ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 
                (slip.status === 'PROCESSING') ? 'bg-blue-500/10 text-blue-600 border-blue-200' : 
                'bg-amber-500/10 text-amber-600 border-amber-200'
              }
            >
              {slip.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-8">
          {/* Employee Header */}
          <div className="flex flex-col md:flex-row justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
            <div>
              <h3 className="font-bold text-lg">{slip.employee?.firstName} {slip.employee?.lastName}</h3>
              <p className="text-sm text-muted-foreground">{slip.employee?.designation} • {slip.employee?.department?.name || 'No Dept'}</p>
              <p className="text-xs text-muted-foreground mt-1">ID: {slip.employee?.employeeId}</p>
            </div>
            <div className="text-left md:text-right mt-4 md:mt-0">
              <p className="text-sm font-medium">Salary Month</p>
              <p className="text-lg font-semibold">{new Date(slip.year, slip.month - 1).toLocaleString('default', { month: 'long' })} {slip.year}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Earnings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-emerald-600 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" /> Earnings
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 hover:bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span className="font-medium">₹{slip.baseSalary?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">Standard Allowances</span>
                  <span className="font-medium">₹{slip.standardAllowances?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">Overtime Pay <span className="text-xs">({slip.overtimeHours} hrs)</span></span>
                  <span className="font-medium">₹{slip.overtimePay?.toLocaleString() || 0}</span>
                </div>
                {slip.ptCommission > 0 && (
                  <div className="flex justify-between items-center p-2 hover:bg-muted/30 rounded-lg bg-emerald-50/50">
                    <span className="text-emerald-700 font-medium">PT Commission</span>
                    <span className="font-semibold text-emerald-700">₹{slip.ptCommission?.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                  <Label htmlFor="bonuses" className="text-muted-foreground">Custom Bonuses</Label>
                  {canEdit ? (
                    <div className="relative w-32">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                      <Input 
                        id="bonuses"
                        type="number" 
                        min="0"
                        className="pl-7 h-9"
                        value={bonuses}
                        onChange={(e) => setBonuses(e.target.value)}
                      />
                    </div>
                  ) : (
                    <span className="font-medium text-emerald-600">+ ₹{slip.bonuses?.toLocaleString() || 0}</span>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center p-2 font-semibold text-lg">
                <span>Gross Pay</span>
                <span>₹{canEdit ? liveGross.toLocaleString() : slip.grossPay?.toLocaleString()}</span>
              </div>
            </div>

            {/* Deductions & Attendance */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-rose-600 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" /> Deductions
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 hover:bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Standard Deductions</span>
                    <span className="font-medium text-rose-600">- ₹{slip.standardDeductions?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Late Penalties <span className="text-xs">({slip.lateMinutes} mins)</span></span>
                    <span className="font-medium text-rose-600">- ₹{slip.latePenalties?.toLocaleString() || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                    <Label htmlFor="penalties" className="text-muted-foreground">Custom Penalties</Label>
                    {canEdit ? (
                      <div className="relative w-32">
                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                        <Input 
                          id="penalties"
                          type="number" 
                          min="0"
                          className="pl-7 h-9 border-rose-200 focus-visible:ring-rose-500"
                          value={penalties}
                          onChange={(e) => setPenalties(e.target.value)}
                        />
                      </div>
                    ) : (
                      <span className="font-medium text-rose-600">- ₹{slip.otherPenalties?.toLocaleString() || 0}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-background p-4 rounded-xl border border-border">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <CalendarDays className="w-4 h-4" /> Attendance Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Working Days</p>
                    <p className="font-medium">{slip.workingDays}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Leave Days</p>
                    <p className="font-medium">{slip.leaveDays}</p>
                  </div>
                </div>
              </div>

              <Separator />
              <div className="flex justify-between items-center p-2 font-semibold text-lg text-rose-600">
                <span>Total Deductions</span>
                <span>- ₹{canEdit ? ((slip.standardDeductions || 0) + (slip.latePenalties || 0) + Number(penalties || 0)).toLocaleString() : ((slip.grossPay || 0) - (slip.netPay || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-zinc-900 text-white p-6 rounded-xl flex justify-between items-center shadow-lg">
            <div>
              <p className="text-zinc-400 text-sm font-medium">Net Salary (Take Home)</p>
              <h2 className="text-4xl font-bold mt-1">₹{canEdit ? liveNet.toLocaleString() : slip.netPay?.toLocaleString()}</h2>
            </div>
            <div className="p-4 bg-card/10 rounded-full">
              <Calculator className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex sm:justify-between items-center w-full hide-on-print">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Download className="w-4 h-4" />
            Print PDF
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            {canEdit && (
              <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-neutral-800 gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-slip, .printable-slip * {
            visibility: visible;
          }
          .printable-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            box-shadow: none !important;
          }
          .hide-on-print {
            display: none !important;
          }
        }
      `}} />
    </Dialog>
  )
}
