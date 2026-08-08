import React, { useState, useEffect } from 'react'
import { Calculator, Loader2, Download, Search, Banknote, Wallet, Users, FileText, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'
import api from '../../lib/api';
import SalarySlipDialog from './SalarySlipDialog'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const StatCard = ({ title, value, subtitle, icon: Icon, gradientClass }) => (
  <Card className={`overflow-hidden border-0 shadow-md ${gradientClass}`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
          {subtitle && <p className="text-xs opacity-90 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-card/20 rounded-xl">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function PayrollDashboard() {
  const { token, hasRole } = useAuthStore()
  
  const [slips, setSlips] = useState([])
  const [summary, setSummary] = useState({ totalGross: 0, totalNet: 0, totalEmployees: 0, paidCount: 0, draftCount: 0 })
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [payingId, setPayingId] = useState(null)
  
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [searchQuery, setSearchQuery] = useState('')
  
  const [selectedSlip, setSelectedSlip] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchData = async () => {
    if (!token) return
    try {
      setLoading(true)
      const [summaryRes, slipsRes] = await Promise.all([
        api.get(`/api/payroll/summary?month=${filterMonth}&year=${filterYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/api/payroll/slips?month=${filterMonth}&year=${filterYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      
      setSummary(summaryRes.data || { totalGross: 0, totalNet: 0, totalEmployees: 0, paidCount: 0, draftCount: 0 })
      setSlips(slipsRes.data?.slips || slipsRes.data || [])
    } catch (error) {
      console.error('Error fetching payroll data:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch payroll data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterMonth, filterYear, token])

  const handleGeneratePayroll = async () => {
    try {
      setGenerating(true)
      const { data } = await api.post('/api/payroll/generate', {
        month: filterMonth,
        year: filterYear
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(data.message || 'Payroll generated successfully')
      fetchData()
    } catch (error) {
      console.error('Error generating payroll:', error)
      toast.error(error.response?.data?.message || 'Failed to generate payroll')
    } finally {
      setGenerating(false)
    }
  }

  const handleMarkPaid = async (id) => {
    try {
      setPayingId(id)
      await api.put(`/api/payroll/slips/${id}/pay`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Salary slip marked as paid')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as paid')
    } finally {
      setPayingId(null)
    }
  }

  const filteredSlips = slips.filter(slip => {
    if (!searchQuery) return true;
    const name = `${slip.employee?.firstName || ''} ${slip.employee?.lastName || ''}`.toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  const handleDownloadSlip = (slip) => {
    setSelectedSlip(slip)
    setIsDialogOpen(true)
  }

  const handleBulkExport = () => {
    if (!slips.length) {
      toast.error("No slips to export");
      return;
    }
    
    const csvRows = [];
    csvRows.push([
      'Employee Name', 'Employee ID', 'Designation', 'Month', 'Year', 
      'Basic Salary', 'Allowances', 'Overtime Pay', 'PT Commission', 'Bonuses', 
      'Gross Pay', 'Standard Deductions', 'Late Penalties', 'Other Penalties', 
      'Net Pay', 'Status'
    ]);
    
    slips.forEach(slip => {
      csvRows.push([
        `"?{slip.employee?.firstName || ''} ${slip.employee?.lastName || ''}"`,
        `"?{slip.employee?.employeeId || slip.employee?._id || ''}"`,
        `"?{slip.employee?.designation || ''}"`,
        slip.month,
        slip.year,
        slip.baseSalary || 0,
        slip.standardAllowances || 0,
        slip.overtimePay || 0,
        slip.ptCommission || 0,
        slip.bonuses || 0,
        slip.grossPay || 0,
        slip.standardDeductions || 0,
        slip.latePenalties || 0,
        slip.otherPenalties || 0,
        slip.netPay || 0,
        slip.status || 'DRAFT'
      ]);
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payroll_Report_${filterMonth}_${filterYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]
  const years = [2024, 2025, 2026]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payroll Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage salary slips, generate payroll, and track payments</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="w-full sm:w-[150px]">
            <Select value={filterMonth.toString()} onValueChange={(val) => setFilterMonth(parseInt(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[120px]">
            <Select value={filterYear.toString()} onValueChange={(val) => setFilterYear(parseInt(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(hasRole('OWNER') || hasRole('ADMIN')) && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={handleBulkExport} variant="outline" className="gap-2 w-full sm:w-auto hover:bg-muted">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button onClick={handleGeneratePayroll} disabled={generating} className="gap-2 w-full sm:w-auto bg-black text-white hover:bg-neutral-800">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                Generate Payroll
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Payroll (Gross)" 
          value={`₹${summary.totalGross?.toLocaleString() || 0}`} 
          icon={Banknote} 
          gradientClass="bg-gradient-to-br from-slate-800 to-slate-900 text-white" 
        />
        <StatCard 
          title="Net Payroll" 
          value={`₹${summary.totalNet?.toLocaleString() || 0}`} 
          icon={Wallet} 
          gradientClass="bg-gradient-to-br from-red-600 to-rose-700 text-white" 
        />
        <StatCard 
          title="Employees Processed" 
          value={summary.totalEmployees || 0} 
          icon={Users} 
          gradientClass="bg-gradient-to-br from-zinc-800 to-zinc-900 text-white" 
        />
        <StatCard 
          title="Paid / Draft" 
          value={`${summary.paidCount || 0} / ${summary.draftCount || 0}`} 
          icon={FileText} 
          gradientClass="bg-gradient-to-br from-red-500 to-orange-600 text-white" 
        />
      </div>

      <Card className="rounded-xl overflow-hidden border-border/50 shadow-sm">
        <CardHeader className="pb-4 bg-muted/30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Salary Slips</CardTitle>
              <CardDescription>Generated slips for the selected period</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search employee by name..."
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">Employee Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                      <p>Loading payroll data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSlips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-muted-foreground/50" />
                      <p>No salary slips found for this period.</p>
                      <p className="text-sm">Try generating payroll using the button above.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSlips.map((slip) => (
                  <TableRow key={slip._id || slip.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium pl-6">
                      <div className="flex flex-col">
                        <span>{slip.employee?.firstName} {slip.employee?.lastName}</span>
                        <span className="text-xs text-muted-foreground font-normal">{slip.employee?.designation}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {slip.employee?.employeeId || '-'}
                    </TableCell>
                    <TableCell>₹{slip.grossPay?.toLocaleString() || 0}</TableCell>
                    <TableCell className="font-semibold text-foreground">
                      ₹{slip.netPay?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={
                          (slip.status === 'PAID' || slip.status?.toLowerCase() === 'paid') ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 
                          (slip.status === 'PROCESSING' || slip.status?.toLowerCase() === 'processing') ? 'bg-blue-500/10 text-blue-600 border-blue-200' : 
                          'bg-amber-500/10 text-amber-600 border-amber-200'
                        }
                      >
                        {slip.status?.toUpperCase() || 'DRAFT'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {(!slip.status || slip.status?.toUpperCase() === 'DRAFT') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            onClick={() => handleMarkPaid(slip._id || slip.id)}
                            disabled={payingId === (slip._id || slip.id)}
                          >
                            {payingId === (slip._id || slip.id) ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Mark Paid
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 text-muted-foreground hover:text-foreground" 
                          onClick={() => handleDownloadSlip(slip)}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="sr-only sm:not-sr-only sm:inline-block">View Details</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <SalarySlipDialog 
        slip={selectedSlip} 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onUpdated={fetchData} 
      />
    </div>
  )
}
