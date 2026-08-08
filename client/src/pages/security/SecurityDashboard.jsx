import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, History, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SecurityDashboard() {
  const { token } = useAuthStore();
  const { toast } = useToast();
  
  const [logins, setLogins] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, [token]);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [loginsRes, auditsRes] = await Promise.all([
        api.get('/api/security/logins', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/security/audits', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setLogins(loginsRes.data);
      setAudits(auditsRes.data);
    } catch (error) {
      toast({
        title: "Error fetching security data",
        description: error.response?.data?.message || "Failed to load logs.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE': return <Badge className="bg-emerald-500">CREATE</Badge>;
      case 'UPDATE': return <Badge className="bg-blue-500">UPDATE</Badge>;
      case 'DELETE': return <Badge variant="destructive">DELETE</Badge>;
      default: return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security & Audits</h1>
          <p className="text-muted-foreground mt-2">
            Monitor login activity and track system changes.
          </p>
        </div>
        <ShieldCheck className="w-12 h-12 text-blue-600 opacity-20" />
      </div>

      <Tabs defaultValue="logins" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="logins" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Login History
          </TabsTrigger>
          <TabsTrigger value="audits" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* Login History Tab */}
        <TabsContent value="logins" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Logins</CardTitle>
              <CardDescription>A record of recent authentication attempts across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading records...</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Device/Browser</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logins.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(log.createdAt), "PP pp")}
                          </TableCell>
                          <TableCell>
                            {log.user ? (
                              <div>
                                <div className="font-medium">{log.user.name || 'User'}</div>
                                <div className="text-xs text-muted-foreground">{log.user.email}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">Unknown</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs" title={log.userAgent}>
                            {log.userAgent}
                          </TableCell>
                          <TableCell>
                            {log.status === 'SUCCESS' ? (
                              <Badge variant="outline" className="text-emerald-600 border-emerald-600">Success</Badge>
                            ) : (
                              <Badge variant="destructive">Failed</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {logins.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No login history found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Trail</CardTitle>
              <CardDescription>An automated log of all modifications made to the database.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading records...</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>User Email</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource (URL)</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {audits.map((audit) => (
                        <TableRow key={audit.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(audit.createdAt), "PP pp")}
                          </TableCell>
                          <TableCell>
                            {audit.user ? audit.user.email : <span className="text-muted-foreground italic">System</span>}
                          </TableCell>
                          <TableCell>{getActionBadge(audit.action)}</TableCell>
                          <TableCell className="font-mono text-xs text-blue-600">{audit.resource}</TableCell>
                          <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground" title={audit.details}>
                            {audit.details}
                          </TableCell>
                        </TableRow>
                      ))}
                      {audits.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No audit logs found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
