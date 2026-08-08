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
import { Plus, Check, Play, Trash2, Clock, User, ClipboardList, Activity } from 'lucide-react';

export default function TaskBoard() {
  const { token, user, hasRole } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assignedToFilter, setAssignedToFilter] = useState('ALL');

  // Dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Forms
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    assignedTo: '',
    dueDate: ''
  });
  
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
      if (assignedToFilter !== 'ALL') params.assignedTo = assignedToFilter;
      
      const response = await api.get('/api/tasks', {
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

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data?.items || []);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [categoryFilter, priorityFilter, assignedToFilter]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      if (!payload.description) delete payload.description;

      await api.post('/api/tasks', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Task created successfully');
      setIsAddDialogOpen(false);
      fetchTasks();
      setFormData({
        title: '', description: '', category: 'GENERAL', priority: 'MEDIUM', assignedTo: '', dueDate: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/api/tasks/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Task marked as ${status.replace('_', ' ')}`);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task status');
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

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Task deleted');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse';
      case 'HIGH': return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50';
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50';
      case 'LOW': return 'bg-background0/10 text-slate-600 border-border dark:border-slate-700';
      default: return 'bg-slate-100 text-foreground dark:bg-slate-800 dark:text-slate-100';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'CLEANING': return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25';
      case 'MAINTENANCE': return 'bg-orange-500/15 text-orange-700 dark:text-orange-400 hover:bg-orange-500/25';
      case 'INVENTORY': return 'bg-violet-500/15 text-violet-700 dark:text-violet-400 hover:bg-violet-500/25';
      case 'KITCHEN': return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 hover:bg-rose-500/25';
      case 'GENERAL': return 'bg-background0/15 text-slate-700 dark:text-muted-foreground hover:bg-background0/25';
      default: return 'bg-background0/15 text-slate-700 dark:text-muted-foreground';
    }
  };

  const canPerformTask = (task) => {
    if (!task.assignee) return true;
    return task.assignee.userId === user?.id;
  };

  const renderTaskCard = (task) => (
    <Card key={task.id} className="mb-4 shadow-sm hover:shadow-md transition-all border-l-4" style={{
      borderLeftColor: task.priority === 'URGENT' ? '#ef4444' : task.priority === 'HIGH' ? '#f59e0b' : task.priority === 'MEDIUM' ? '#3b82f6' : '#94a3b8'
    }}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <Badge className={`${getCategoryColor(task.category)} text-[10px] border-none uppercase font-semibold px-2 py-0.5 rounded-sm mb-2`}>
              {task.category}
            </Badge>
            <CardTitle className="text-[15px] font-semibold leading-tight text-foreground dark:text-slate-100">{task.title}</CardTitle>
          </div>
          <Badge variant="outline" className={`${getPriorityColor(task.priority)} font-medium whitespace-nowrap text-[10px]`}>
            {task.priority}
          </Badge>
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
            {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
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
          {task.status === 'PENDING' && canPerformTask(task) && (
            <Button size="sm" variant="outline" className="h-8 text-xs bg-card dark:bg-card" onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}>
              <Play className="h-3 w-3 mr-1 text-blue-500" /> Start Task
            </Button>
          )}
          {task.status === 'IN_PROGRESS' && canPerformTask(task) && (
            <Button size="sm" variant="default" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setSelectedTask(task); setIsCompleteDialogOpen(true); }}>
              <Check className="h-3 w-3 mr-1" /> Complete
            </Button>
          )}
          {(hasRole('OWNER') || hasRole('MANAGER')) && (
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => handleDeleteTask(task.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">Task Board</h1>
          <p className="text-muted-foreground mt-1">Manage operations, assign duties, and track progress.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new task and assign it to a staff member.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input id="title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Deep clean cardio section" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLEANING">Cleaning</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="INVENTORY">Inventory</SelectItem>
                      <SelectItem value="KITCHEN">Kitchen</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select value={formData.assignedTo} onValueChange={v => setFormData({...formData, assignedTo: v})}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {(Array.isArray(employees) ? employees : []).map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea 
                  id="description" 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Additional details about the task..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center mr-2 text-sm font-medium text-muted-foreground">
          <ClipboardList className="mr-2 h-4 w-4" /> Filters:
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px] sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="CLEANING">Cleaning</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="INVENTORY">Inventory</SelectItem>
            <SelectItem value="KITCHEN">Kitchen</SelectItem>
            <SelectItem value="GENERAL">General</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px] sm:w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
          <SelectTrigger className="w-[150px] sm:w-[180px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Assignees</SelectItem>
            {employees.map(emp => (
              <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden pb-4">
        {/* Pending Column */}
        <div className="flex flex-col bg-background/80 dark:bg-card/40 rounded-xl border p-4 h-full overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-400"></div>
              <h3 className="font-semibold text-slate-700 dark:text-foreground">To Do</h3>
            </div>
            <Badge variant="secondary" className="bg-card dark:bg-slate-800 text-slate-700 dark:text-foreground font-mono">{pendingTasks.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-12 custom-scrollbar">
            {pendingTasks.map(renderTaskCard)}
            {pendingTasks.length === 0 && !loading && (
              <div className="text-center p-8 text-muted-foreground text-sm border-2 border-dashed border-border dark:border-border rounded-xl bg-card/50 dark:bg-card/50">
                No pending tasks
              </div>
            )}
            {loading && <div className="flex justify-center p-4"><Activity className="animate-spin h-5 w-5 text-muted-foreground" /></div>}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="flex flex-col bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30 p-4 h-full overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-400">In Progress</h3>
            </div>
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono">{inProgressTasks.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-12 custom-scrollbar">
            {inProgressTasks.map(renderTaskCard)}
            {inProgressTasks.length === 0 && !loading && (
              <div className="text-center p-8 text-blue-400/60 text-sm border-2 border-dashed border-blue-200 dark:border-blue-900/50 rounded-xl bg-card/50 dark:bg-card/50">
                No active tasks
              </div>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="flex flex-col bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-4 h-full overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-400">Completed</h3>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-mono">{completedTasks.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-12 custom-scrollbar">
            {completedTasks.map(renderTaskCard)}
            {completedTasks.length === 0 && !loading && (
              <div className="text-center p-8 text-emerald-400/60 text-sm border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 rounded-xl bg-card/50 dark:bg-card/50">
                No completed tasks
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Task Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
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
