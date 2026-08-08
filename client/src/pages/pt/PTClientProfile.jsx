import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, User, Calendar, Target, Award, Clock } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/api';
import { toast } from 'sonner';
import PTSessionLogDialog from './PTSessionLogDialog';
import TransformationTimeline from './TransformationTimeline';

export default function PTClientProfile() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    setLoading(true);
    try {
            // Adjusted the endpoint to reflect standard REST params, modify if different.
      const res = await api.get(`/api/pt/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClient(res.data.data || res.data);
    } catch (error) {
      console.error('Error fetching PT client profile:', error);
      toast.error('Failed to load client profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Activity className="animate-spin text-primary h-8 w-8" /></div>;
  }

  if (!client) {
    return <div className="p-8 text-center text-muted-foreground">Client not found.</div>;
  }

  const activePackage = client.activePackage;
  const sessionsPercentage = activePackage 
    ? (activePackage.sessionsCompleted / activePackage.totalSessions) * 100 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary border-4 border-primary/20">
            {client.avatarUrl ? (
              <img src={client.avatarUrl} alt={client.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              <User size={40} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1"><Target size={16} /> Goal: {client.goal || 'General Fitness'}</span>
              <span className="flex items-center gap-1"><Calendar size={16} /> Joined {format(new Date(client.joinDate || Date.now()), 'MMM yyyy')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 min-w-[250px]">
          {activePackage ? (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Package</p>
                  <p className="font-semibold">{activePackage.name}</p>
                </div>
                <Badge variant={activePackage.remainingSessions <= 2 ? 'destructive' : 'default'}>
                  {activePackage.remainingSessions} Left
                </Badge>
              </div>
              <Progress value={sessionsPercentage} className="h-2" />
              <p className="text-xs text-right text-muted-foreground">
                {activePackage.sessionsCompleted} of {activePackage.totalSessions} sessions completed
              </p>
            </div>
          ) : (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md border border-destructive/20 text-sm font-medium text-center">
              No Active PT Package
            </div>
          )}
          
          {activePackage && (
             <PTSessionLogDialog 
               clientId={client.id} 
               packageId={activePackage.id}
               onSuccess={fetchClientData}
             />
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress Graph</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Award size={16} className="text-primary" /> Current Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-2xl font-bold">{client.currentWeight || '--'} kg</p>
                    <p className="text-xs text-muted-foreground">Weight</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{client.currentBodyFat || '--'}%</p>
                    <p className="text-xs text-muted-foreground">Body Fat</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Medical Notes & Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{client.medicalNotes || 'No medical issues reported. Cleared for all activities.'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Body Composition Progress</CardTitle>
              <CardDescription>Track weight and body fat percentage over time</CardDescription>
            </CardHeader>
            <CardContent>
              {client.progressData && client.progressData.length > 0 ? (
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={client.progressData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(val) => format(new Date(val), 'MMM d')}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis yAxisId="left" stroke="hsl(var(--primary))" />
                      <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        labelFormatter={(val) => format(new Date(val), 'MMM d, yyyy')}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="weight" 
                        name="Weight (kg)" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="bodyFat" 
                        name="Body Fat %" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                  No progress data recorded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <TransformationTimeline photos={client.progressPhotos || []} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>Recent completed sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {client.sessionHistory && client.sessionHistory.length > 0 ? (
                <div className="space-y-4">
                  {client.sessionHistory.map((session, idx) => (
                    <div key={idx} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center bg-primary/10 rounded-md p-3 min-w-[80px]">
                        <span className="text-sm font-bold text-primary">{format(new Date(session.date), 'MMM d')}</span>
                        <span className="text-xs text-primary/80">{format(new Date(session.date), 'yyyy')}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold">{session.exercisesCompleted || 'General Workout'}</h4>
                          <Badge variant="outline" className="flex gap-1 items-center">
                            <Clock size={12} /> {session.duration} min
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          <span className="font-medium text-foreground">Intensity:</span> {session.intensity}
                        </p>
                        {session.clientFeedback && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium text-foreground">Feedback:</span> {session.clientFeedback}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No session history found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
