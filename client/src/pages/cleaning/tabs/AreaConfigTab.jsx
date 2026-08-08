import { useAuthStore } from '@/store/useAuthStore';
import api from '../../../lib/api';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Plus, Trash2, MapPin } from 'lucide-react';

export default function AreaConfigTab() {
  const token = localStorage.getItem('token') || '';
  const [areas, setAreas] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Area State
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaDesc, setNewAreaDesc] = useState('');

  // New Checklist State
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState('MORNING');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [tasks, setTasks] = useState(['']);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [areasRes, empRes] = await Promise.all([
        api.get('/api/cleaning/areas'),
        api.get('/api/employees')
      ]);
      setAreas(areasRes.data);
      setEmployees(empRes.data.filter(e => e.status === 'ACTIVE'));
    } catch (err) {
      toast.error('Failed to load configuration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateArea = async (e) => {
    e.preventDefault();
    if (!newAreaName) return;
    try {
      await api('/api/cleaning/areas', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, data: { name: newAreaName, description: newAreaDesc } });
      toast.success('Area created');
      setNewAreaName('');
      setNewAreaDesc('');
      fetchData();
    } catch (err) {
      toast.error('Failed to create area');
    }
  };

  const handleCreateChecklist = async (e) => {
    e.preventDefault();
    const validTasks = tasks.filter(t => t.trim() !== '');
    if (!selectedArea || !selectedDate || !selectedShift || validTasks.length === 0) {
      toast.error('Please fill required fields and add at least one task');
      return;
    }

    try {
      await api.post('/api/cleaning/checklists', {
        areaId: selectedArea,
        date: selectedDate,
        shift: selectedShift,
        assignedTo: selectedAssignee || undefined,
        tasks: validTasks
      });
      toast.success('Checklist generated successfully');
      setSelectedArea('');
      setTasks(['']);
    } catch (err) {
      toast.error('Failed to generate checklist');
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cleaning Areas</CardTitle>
            <CardDescription>Manage areas that require regular cleaning</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateArea} className="flex gap-2 mb-6">
              <Input 
                placeholder="Area Name (e.g., Cardio Zone)" 
                value={newAreaName} 
                onChange={e => setNewAreaName(e.target.value)} 
                className="flex-1"
              />
              <Button type="submit" disabled={!newAreaName}>Add</Button>
            </form>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {areas.map(area => (
                <div key={area.id} className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">{area.name}</p>
                    <p className="text-xs text-muted-foreground">{area.checklists?.length || 0} recent checklists</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Generate Checklist</CardTitle>
            <CardDescription>Create a new cleaning checklist for an area</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateChecklist} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Area</Label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign To (Optional)</Label>
                  <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {employees.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Shift</Label>
                  <Select value={selectedShift} onValueChange={setSelectedShift}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORNING">Morning</SelectItem>
                      <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                      <SelectItem value="EVENING">Evening</SelectItem>
                      <SelectItem value="NIGHT">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Tasks</Label>
                {tasks.map((task, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      placeholder={`Task ${index + 1}`}
                      value={task}
                      onChange={e => {
                        const newTasks = [...tasks];
                        newTasks[index] = e.target.value;
                        setTasks(newTasks);
                      }}
                      required
                    />
                    {tasks.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setTasks(tasks.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 border-dashed"
                  onClick={() => setTasks([...tasks, ''])}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full">Generate Checklist</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
