import { useAuthStore } from '@/store/useAuthStore';
import api from '../../../lib/api';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CheckCircle2, Clock, Camera, FileText } from 'lucide-react';

export default function OverviewTab() {
  const token = localStorage.getItem('token') || '';
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/cleaning/checklists?status=COMPLETED');
      setChecklists(res.data);
    } catch (err) {
      toast.error('Failed to load completed checklists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const handleVerify = async (id) => {
    try {
      await api(`/api/cleaning/checklists/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, data: { status: 'VERIFIED' } });
      toast.success('Checklist verified successfully');
      setSelectedChecklist(null);
      fetchChecklists();
    } catch (err) {
      toast.error('Failed to verify checklist');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground p-4">Loading checklists...</p>
        ) : checklists.length === 0 ? (
          <p className="text-muted-foreground p-4 col-span-3 text-center">No checklists waiting for verification.</p>
        ) : (
          checklists.map((checklist) => (
            <Card key={checklist.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedChecklist(checklist)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{checklist.area.name}</CardTitle>
                    <CardDescription>{format(new Date(checklist.date), 'PP')} - {checklist.shift}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Needs Verification
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {checklist.tasks.filter(t => t.isCompleted).length} / {checklist.tasks.length} Tasks Done
                </div>
                {checklist.assignee && (
                  <div className="mt-2 text-sm font-medium">
                    By: {checklist.assignee.firstName} {checklist.assignee.lastName}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedChecklist} onOpenChange={(open) => !open && setSelectedChecklist(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Verify Cleaning Checklist</DialogTitle>
            <DialogDescription>
              {selectedChecklist && `${selectedChecklist.area.name} - ${format(new Date(selectedChecklist.date), 'PP')} (${selectedChecklist.shift} Shift)`}
            </DialogDescription>
          </DialogHeader>

          {selectedChecklist && (
            <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-4">
              {selectedChecklist.tasks.map((task) => (
                <div key={task.id} className="p-4 border rounded-lg bg-background/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${task.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-muted-foreground'}`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-slate-700">{task.taskName}</span>
                    </div>
                    {task.completedAt && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(task.completedAt), 'p')}
                      </span>
                    )}
                  </div>
                  
                  {(task.photoProof || task.remarks) && (
                    <div className="mt-3 ml-9 p-3 bg-card border rounded-md text-sm space-y-2">
                      {task.remarks && (
                        <div className="flex gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-slate-600">{task.remarks}</p>
                        </div>
                      )}
                      {task.photoProof && (
                        <div className="flex gap-2">
                          <Camera className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <a href={task.photoProof} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Photo Proof</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setSelectedChecklist(null)}>Close</Button>
            <Button onClick={() => handleVerify(selectedChecklist.id)}>Verify Checklist</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
