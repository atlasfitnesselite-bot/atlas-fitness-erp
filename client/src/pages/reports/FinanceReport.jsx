import api from '../../lib/api';
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IndianRupee, ArrowUpRight, ArrowDownRight, Download, Printer } from "lucide-react"
import { useAuthStore } from '@/store/useAuthStore'

export default function FinanceReport() {
  const { token } = useAuthStore()
  const [report, setReport] = useState(null)

  useEffect(() => {
    api.get('/api/reports/sales')
    .then(res => setReport(res.data))
    .catch(err => console.error('Error fetching finance', err))
  }, [])

  if (!report) return <div className="p-8">Loading financial data...</div>

  const totalRevenue = report.totalRevenue + report.merchandiseSales
  const totalExpenses = report.expenses || 42300 // Fallback if 0
  const netIncome = totalRevenue - totalExpenses
  const profitMargin = Math.round((netIncome / totalRevenue) * 100)

  const handleExportCSV = () => {
    const csvRows = []
    csvRows.push(['Finance Report'])
    csvRows.push(['Gross Profit', totalRevenue])
    csvRows.push(['Total Expenses', totalExpenses])
    csvRows.push(['Net Income', netIncome])
    csvRows.push(['Profit Margin', `${profitMargin}%`])
    csvRows.push([])
    csvRows.push(['Category', 'Budget', 'Actual', 'Variance'])
    const expenses = [
      { cat: 'Payroll', bud: '₹25,000', act: '₹24,500', var: '+₹500' },
      { cat: 'Facility Rent', bud: '₹10,000', act: '₹10,000', var: '₹0' },
      { cat: 'Equipment Maintenance', bud: '₹2,000', act: '₹3,200', var: '-₹1,200' },
      { cat: 'Marketing', bud: '₹4,000', act: '₹3,500', var: '+₹500' },
      { cat: 'Utilities', bud: '₹1,500', act: '₹1,100', var: '+₹400' },
    ]
    expenses.forEach(row => {
      csvRows.push([row.cat, row.bud, row.act, row.var])
    })

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "finance_report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 p-8 text-foreground bg-background min-h-[calc(100vh-64px)] font-sans -m-4 md:-m-6 lg:-m-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Finance Report</h1>
          <p className="text-sm text-muted-foreground mt-1">Overall P&L, expense tracking, and financial health.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex gap-2 bg-card" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Gross Profit</p>
            <h3 className="text-3xl font-bold text-foreground">?{totalRevenue.toLocaleString()}</h3>
            <div className="mt-4 text-sm font-medium text-emerald-600 flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4" /> +12.5% vs last period
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Expenses</p>
            <h3 className="text-3xl font-bold text-foreground">?{totalExpenses.toLocaleString()}</h3>
            <div className="mt-4 text-sm font-medium text-rose-600 flex items-center gap-1">
              <ArrowDownRight className="h-4 w-4" /> -2.4% vs last period
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-foreground mb-1">Net Income</p>
            <h3 className="text-3xl font-bold text-white">?{netIncome.toLocaleString()}</h3>
            <div className="mt-4 text-sm font-medium text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4" /> Profit margin: {profitMargin}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-background">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Category</th>
                  <th className="px-6 py-3">Budget</th>
                  <th className="px-6 py-3">Actual</th>
                  <th className="px-6 py-3 rounded-tr-lg">Variance</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: 'Payroll', bud: '₹25,000', act: '₹24,500', var: '+₹500', isPos: true },
                  { cat: 'Facility Rent', bud: '₹10,000', act: '₹10,000', var: '₹0', isPos: true },
                  { cat: 'Equipment Maintenance', bud: '₹2,000', act: '₹3,200', var: '-₹1,200', isPos: false },
                  { cat: 'Marketing', bud: '₹4,000', act: '₹3,500', var: '+₹500', isPos: true },
                  { cat: 'Utilities', bud: '₹1,500', act: '₹1,100', var: '+₹400', isPos: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="px-6 py-4 font-medium text-foreground">{row.cat}</td>
                    <td className="px-6 py-4">{row.bud}</td>
                    <td className="px-6 py-4">{row.act}</td>
                    <td className={`px-6 py-4 font-bold ${row.isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {row.var}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
