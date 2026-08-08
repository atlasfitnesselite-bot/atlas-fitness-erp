import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Check, Play, Clock, User, ClipboardList, Activity } from 'lucide-react';

export default function MyTasks() {
  const { token } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Dialogs
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Forms
  const [completionData, setCompletionData] = useState({
    remarks: '',
    photoProof: ''
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      
      const response = await api.get('/api/tasks/my', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [categoryFilter, priorityFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/api/tasks/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Task marked as ${status.replace('_', ' ')}`);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCompleteTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { remarks: completionData.remarks };
      if (completionData.photoProof) payload.photoProof = completionData.photoProof;

      await api.put(`/api/tasks/${selectedTask.id}/complete`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Task completed successfully!');
      setIsCompleteDialogOpen(false);
      setCompletionData({ remarks: '', photoProof: '' });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'URGENT': return 'bg-red-500 hover:bg-red-600';
      case 'HIGH': return 'bg-orange-500 hover:bg-orange-600';
      case 'MEDIUM': return 'bg-blue-500 hover:bg-blue-600';
      case 'LOW': return 'bg-background0 hover:bg-slate-600';
      default: return 'bg-background0 hover:bg-slate-600';
    }
  };

  const TaskCard = ({ task }) => (
    <Card className="hover:shadow-md transition-all duration-200 border-border/50">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold">{task.title}</CardTitle>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground">
                {task.category}
              </Badge>
              <Badge className={`text-[10px] uppercase font-semibold text-white ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 text-sm text-muted-foreground space-y-2">
        {task.description && <p className="line-clamp-2 text-xs">{task.description}</p>}
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
          </span>
          <span className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            {task.assigner ? `${task.assigner.name}` : 'Unassigned'}
          </span>
        </div>
        {task.status === 'COMPLETED' && task.photoProof && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-border">
            <div className="text-xs font-semibold mb-1 flex items-center"><ClipboardList className="h-3 w-3 mr-1" /> Photo Proof</div>
            <img src={task.photoProof} alt="Proof" className="w-full max-h-32 object-cover rounded-md mb-2" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x150?text=Invalid+Image' }} />
            {task.remarks && <p className="text-xs text-muted-foreground italic">"{task.remarks}"</p>}
          </div>
        )}
      </CardContent>
      {task.status !== 'COMPLETED' && (
        <CardFooter className="p-3 bg-muted/20 flex justify-end gap-2 border-t border-border/50">
          {task.status === 'PENDING' && (
            <Button size="sm" variant="outline" className="h-8 text-xs bg-card dark:bg-card" onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}>
              <Play className="h-3 w-3 mr-1 text-blue-500" /> Start Task
            </Button>
          )}
          {task.status === 'IN_PROGRESS' && (
            <Button size="sm" variant="default" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setSelectedTask(task); setIsCompleteDialogOpen(true); }}>
              <Check className="h-3 w-3 mr-1" /> Complete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Tasks</h2>
          <p className="text-muted-foreground text-sm">View and manage tasks assigned to you.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6 bg-card dark:bg-slate-950 p-4 rounded-xl border shadow-sm">
        <div className="space-y-1.5 md:col-span-1">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="GENERAL">General</SelectItem>
              <SelectItem value="CLEANING">Cleaning</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="INVENTORY">Inventory</SelectItem>
              <SelectItem value="KITCHEN">Kitchen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-1">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</Label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All Priorities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div className="flex flex-col h-full bg-background/50 dark:bg-card/20 rounded-xl p-4 border border-slate-100 dark:border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center">
              <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span> To Do
            </h3>
            <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-200">
              {tasks.filter(t => t.status === 'PENDING').length}
            </Badge>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {tasks.filter(t => t.status === 'PENDING').map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasks.filter(t => t.status === 'PENDING').length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                No pending tasks
              </div>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="flex flex-col h-full bg-blue-50/30 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> In Progress
            </h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300">
              {tasks.filter(t => t.status === 'IN_PROGRESS').length}
            </Badge>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {tasks.filter(t => t.status === 'IN_PROGRESS').map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasks.filter(t => t.status === 'IN_PROGRESS').length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-blue-200/50 rounded-lg">
                No tasks in progress
              </div>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="flex flex-col h-full bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Completed
            </h3>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300">
              {tasks.filter(t => t.status === 'COMPLETED').length}
            </Badge>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {tasks.filter(t => t.status === 'COMPLETED').map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasks.filter(t => t.status === 'COMPLETED').length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-emerald-200/50 rounded-lg">
                No completed tasks
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-emerald-600">
              <Check className="h-5 w-5 mr-2" />
              Complete Task
            </DialogTitle>
            <DialogDescription>
              Marking <span className="font-medium text-foreground dark:text-white">"{selectedTask?.title}"</span> as complete.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCompleteTask} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">Completion Notes / Remarks (Optional)</Label>
              <textarea 
                id="remarks" 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={completionData.remarks} 
                onChange={e => setCompletionData({...completionData, remarks: e.target.value})} 
                placeholder="E.g., Replaced 2 filters, took 30 mins..." 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photoProof">Photo Proof URL (Optional)</Label>
              <Input 
                id="photoProof" 
                type="url" 
                placeholder="https://example.com/photo.jpg"
                value={completionData.photoProof}
                onChange={e => setCompletionData({...completionData, photoProof: e.target.value})} 
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Check className="mr-2 h-4 w-4" /> Mark Completed
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
