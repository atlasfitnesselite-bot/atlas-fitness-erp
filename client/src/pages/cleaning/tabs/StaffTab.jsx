import { useAuthStore } from '@/store/useAuthStore';
import api from '../../../lib/api';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Upload, MessageSquare } from 'lucide-react';

export default function StaffTab() {
  const token = localStorage.getItem('token') || '';
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      // Fetch today's checklists that are either PENDING or IN_PROGRESS
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get(`/api/cleaning/checklists?date=${today}`);
      const activeChecklists = res.data.filter(c => c.status !== 'VERIFIED');
      setChecklists(activeChecklists);
    } catch (err) {
      toast.error('Failed to load checklists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const handleTaskUpdate = async (taskId, checklistId, updates) => {
    try {
      await api(`/api/cleaning/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, data: updates });
      
      // Optimiztic update
      setChecklists(prev => prev.map(c => {
        if (c.id === checklistId) {
          return {
            ...c,
            tasks: c.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
          };
        }
        return c;
      }));
    } catch (err) {
      toast.error('Failed to update task');
      fetchChecklists(); // Revert on failure
    }
  };

  const handleSubmit = async (checklistId) => {
    try {
      await api(`/api/cleaning/checklists/${checklistId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, data: { status: 'COMPLETED' } });
      toast.success('Checklist submitted for verification');
      fetchChecklists();
    } catch (err) {
      toast.error('Failed to submit checklist');
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <p className="text-muted-foreground p-4">Loading your checklists...</p>
      ) : checklists.length === 0 ? (
        <div className="text-center p-12 border rounded-xl bg-background">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
          <p className="text-muted-foreground">No pending cleaning checklists for today.</p>
        </div>
      ) : (
        checklists.map((checklist) => {
          const allCompleted = checklist.tasks.every(t => t.isCompleted);

          return (
            <Card key={checklist.id} className="overflow-hidden">
              <CardHeader className="bg-background border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{checklist.area.name}</CardTitle>
                    <CardDescription>{checklist.shift} Shift • {format(new Date(checklist.date), 'PP')}</CardDescription>
                  </div>
                  <Badge variant={checklist.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {checklist.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {checklist.tasks.map(task => (
                    <div key={task.id} className={`p-4 transition-colors ${task.isCompleted ? 'bg-emerald-50/30' : 'hover:bg-background'}`}>
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={task.isCompleted} 
                          onCheckedChange={(checked) => handleTaskUpdate(task.id, checklist.id, { isCompleted: checked })}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-3">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {task.taskName}
                          </label>
                          
                          {task.isCompleted && (
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <MessageSquare className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                                <Input 
                                  placeholder="Add remarks..." 
                                  className="pl-9 h-9"
                                  defaultValue={task.remarks || ''}
                                  onBlur={(e) => {
                                    if(e.target.value !== task.remarks) {
                                      handleTaskUpdate(task.id, checklist.id, { remarks: e.target.value });
                                    }
                                  }}
                                />
                              </div>
                              <div className="relative w-1/3 flex items-center">
                                <Upload className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                                <Input 
                                  type="file"
                                  accept="image/*"
                                  className="pl-9 h-9 text-xs py-1"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const url = URL.createObjectURL(e.target.files[0]);
                                      handleTaskUpdate(task.id, checklist.id, { photoProof: url });
                                    }
                                  }}
                                />
                                {task.photoProof && (
                                  <a href={task.photoProof} target="_blank" rel="noreferrer" className="ml-2 text-xs text-blue-500 whitespace-nowrap">View</a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-background border-t flex justify-end">
                  <Button 
                    onClick={() => handleSubmit(checklist.id)} 
                    disabled={!allCompleted || checklist.status === 'COMPLETED'}
                  >
                    {checklist.status === 'COMPLETED' ? 'Submitted' : 'Submit for Verification'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
