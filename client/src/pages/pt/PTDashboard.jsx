import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, IndianRupee, Activity, Award, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

import { useAuthStore } from "@/store/useAuthStore"

export default function PTDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/pt/trainer/dashboard');
      setDashboardData(res.data.data || res.data);
    } catch (error) {
      console.error('Error fetching PT dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Activity className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  const { metrics, leaderboard } = dashboardData || {};

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trainer Dashboard</h1>
        <p className="text-muted-foreground mt-2">Your monthly performance and metrics.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Sessions</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.completedSessions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.activeClients || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently assigned</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">?{metrics?.monthlyRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Generated for gym</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/30 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Your Commission</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">?{metrics?.monthlyCommission?.toLocaleString() || 0}</div>
            <p className="text-xs text-primary/80 mt-1">Estimated payout</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="bg-muted/30 pb-4 border-b">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <CardTitle>Trainer Leaderboard</CardTitle>
            </div>
            <CardDescription>Top performers this month</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {leaderboard && leaderboard.map((trainer, index) => (
                <div key={trainer.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 text-center font-bold text-muted-foreground">
                      #{trainer.rank || index + 1}
                    </div>
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={trainer.avatar} />
                      <AvatarFallback className={index === 0 ? 'bg-yellow-500/20 text-yellow-700' : ''}>
                        {trainer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{trainer.name}</p>
                      <p className="text-xs text-muted-foreground">{trainer.sessions} sessions</p>
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30">
                      Top
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions or Next Sessions */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Schedule integration coming soon.</p>
              <p className="text-sm mt-2">Manage your schedule in the Calendar tab.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
