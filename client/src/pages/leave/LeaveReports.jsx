import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from '../../lib/api';
import { toast } from 'sonner';

export default function LeaveReports() {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
                        const [balRes, reqRes] = await Promise.all([
          api.get('/api/leave/balances', { headers }),
          api.get('/api/leave/requests', { headers })
        ]);
        setBalances(balRes.data || []);
        setRequests(reqRes.data || []);
      } catch (error) {
        toast.error("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Reports</h1>
          <p className="text-muted-foreground">Generate and export leave-related data and analytics.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export All Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Total Leave Requests
            </CardTitle>
            <CardDescription>Number of leave requests in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '-' : requests.length}</div>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-500" />
              Employees with Balance
            </CardTitle>
            <CardDescription>Number of employees with recorded leave balances.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold">{loading ? '-' : balances.length}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Leave Balances</CardTitle>
              <CardDescription>Current available balance across employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances.length > 0 ? balances.map((bal, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{bal.employeeName || `EMP-?{bal.employeeId}`}</TableCell>
                        <TableCell>{typeof bal.leaveType === 'object' ? bal.leaveType.name : bal.leaveType}</TableCell>
                        <TableCell className="text-right font-medium">{bal.remainingDays}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No balance data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Leave Requests</CardTitle>
              <CardDescription>Detailed overview of leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.length > 0 ? requests.slice(0, 10).map((req, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{req.employeeName || `EMP-?{req.employeeId}`}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {req.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No request data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
