import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CustomSelect } from '@/components/ui/custom-select';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import api from '../../lib/api';

export default function AuditorReportSection() {
  const [timeframe, setTimeframe] = useState('monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const buildQuery = () => {
    const params = new URLSearchParams({ timeframe });
    if (timeframe === 'custom') {
      params.set('startDate', startDate);
      params.set('endDate', endDate);
    } else {
      params.set('date', date);
    }
    return params.toString();
  };

  const fetchAuditorReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/reports/auditor?${buildQuery()}`);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load CA auditor report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditorReport();
  }, [timeframe, date, startDate, endDate]);

  const handleDownload = async (type) => {
    const endpoint = type === 'pdf' ? '/api/reports/auditor/export/pdf' : '/api/reports/auditor/export/csv';
    const res = await api.get(`${endpoint}?${buildQuery()}`, { responseType: 'blob' });
    const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', `CA_Auditor_GST_Report_${timeframe}.${type}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  };

  const s = report?.summary;

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">CA Auditor &amp; GST Financial Report</CardTitle>
            <CardDescription>
              Taxable Value, CGST/SGST, B2B vs B2C (GSTR-1), Payment Mode Reconciliation &amp; P&amp;L
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <Label className="text-xs">Period</Label>
              <CustomSelect
                className="flex h-9 rounded-md border border-border bg-card px-2 text-sm"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Range</option>
              </CustomSelect>
            </div>
            {timeframe === 'custom' ? (
              <>
                <div>
                  <Label className="text-xs">From</Label>
                  <Input type="date" className="h-9" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">To</Label>
                  <Input type="date" className="h-9" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </>
            ) : (
              <div>
                <Label className="text-xs">Reference Date</Label>
                <Input type="date" className="h-9" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => handleDownload('csv')} className="gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> CA CSV (Excel)
            </Button>
            <Button size="sm" onClick={() => handleDownload('pdf')} className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
              <FileText className="h-4 w-4" /> CA PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading || !s ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading CA Auditor Report...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-xs text-muted-foreground">Total Taxable Revenue</p>
                <p className="text-lg font-bold">₹{s.totalTaxableRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-xs text-muted-foreground">Output GST (CGST + SGST)</p>
                <p className="text-lg font-bold">₹{s.totalGstLiability.toFixed(2)}</p>
                <p className="text-[11px] text-muted-foreground">₹{s.totalCgst.toFixed(2)} + ₹{s.totalSgst.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-xs text-muted-foreground">Actual Collected / Receivable</p>
                <p className="text-lg font-bold text-green-600">₹{s.totalCollected.toFixed(2)}</p>
                <p className="text-[11px] text-amber-600">Due: ₹{s.totalReceivable.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-xs text-muted-foreground">Net Accrual Profit (Excl. GST)</p>
                <p className={`text-lg font-bold ${s.netAccrualProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  ₹{s.netAccrualProfit.toFixed(2)}
                </p>
                <p className="text-[11px] text-muted-foreground">Outflow: ₹{s.totalOutflow.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-md border p-3">
                <h4 className="font-semibold text-sm mb-2">GSTR-1 Summary (B2B vs B2C)</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supply</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Taxable</TableHead>
                      <TableHead>GST</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>B2B (With GSTIN)</TableCell>
                      <TableCell>{report.gstBreakdown.b2b.count}</TableCell>
                      <TableCell>₹{report.gstBreakdown.b2b.taxable.toFixed(2)}</TableCell>
                      <TableCell>₹{(report.gstBreakdown.b2b.cgst + report.gstBreakdown.b2b.sgst).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>B2C (Without GSTIN)</TableCell>
                      <TableCell>{report.gstBreakdown.b2c.count}</TableCell>
                      <TableCell>₹{report.gstBreakdown.b2c.taxable.toFixed(2)}</TableCell>
                      <TableCell>₹{(report.gstBreakdown.b2c.cgst + report.gstBreakdown.b2c.sgst).toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-md border p-3">
                <h4 className="font-semibold text-sm mb-2">Payment Mode Reconciliation</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mode</TableHead>
                      <TableHead>Txns</TableHead>
                      <TableHead>Collected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.paymentModes.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-muted-foreground text-center">No collections in period</TableCell></TableRow>
                    ) : (
                      report.paymentModes.map((pm) => (
                        <TableRow key={pm.mode}>
                          <TableCell><Badge variant="outline">{pm.mode}</Badge></TableCell>
                          <TableCell>{pm.count}</TableCell>
                          <TableCell>₹{pm.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
