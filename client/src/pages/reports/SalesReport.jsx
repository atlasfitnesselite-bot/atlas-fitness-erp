import api from '../../lib/api';
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, IndianRupee, CreditCard, Users, Download, Printer } from "lucide-react"
import Chart from "react-apexcharts"
import { useAuthStore } from '@/store/useAuthStore'

export default function SalesReport() {
  const { token } = useAuthStore()
  const [report, setReport] = useState(null)

  useEffect(() => {
    api.get('/api/reports/sales')
    .then(res => setReport(res.data))
    .catch(err => console.error('Error fetching sales', err))
  }, [])

  const chartOptions = {
    chart: { type: 'area', fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
    colors: ['#4f46e5'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: report?.trendMonths || [] },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } }
  }

  if (!report) return <div className="p-8">Loading sales data...</div>

  const total = report.totalRevenue + report.merchandiseSales
  const merchPct = Math.round((report.merchandiseSales / total) * 100) || 0

  const handleExportCSV = () => {
    const csvRows = []
    csvRows.push(['Sales Report'])
    csvRows.push(['Total Revenue', total])
    csvRows.push(['New Memberships', report.newMemberships])
    csvRows.push(['Avg Revenue / User', report.avgRevenuePerUser])
    csvRows.push(['Cafe Sales', report.merchandiseSales])
    csvRows.push([])
    csvRows.push(['Category', 'Value', 'Percentage'])
    const categories = report.categories || []
    categories.forEach(row => {
      csvRows.push([row.name, row.val, row.pct])
    })

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "sales_report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 p-8 text-foreground bg-background min-h-[calc(100vh-64px)] font-sans -m-4 md:-m-6 lg:-m-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales Report</h1>
          <p className="text-sm text-muted-foreground mt-1">Detailed breakdown of revenue streams and membership sales.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex gap-2 bg-card" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-foreground">?{total.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">New Memberships</p>
                <h3 className="text-2xl font-bold text-foreground">{report.newMemberships}</h3>
              </div>
              <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Avg Revenue / User</p>
                <h3 className="text-2xl font-bold text-foreground">?{report.avgRevenuePerUser}</h3>
              </div>
              <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Cafe Sales</p>
                <h3 className="text-2xl font-bold text-foreground">?{report.merchandiseSales.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle>Revenue Trend (Last 7 Months)</CardTitle>
            <CardDescription>Monthly recurring revenue and one-off sales.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Chart options={chartOptions} series={[{ name: 'Revenue', data: report.trendData || [] }]} type="area" height="100%" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(report.categories || []).map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="font-bold">{item.val}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: item.pct }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
