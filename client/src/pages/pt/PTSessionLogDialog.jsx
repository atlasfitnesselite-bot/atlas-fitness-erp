import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function PTSessionLogDialog({ clientId, packageId, onSuccess, children }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    duration: 60,
    exercisesCompleted: '',
    intensity: 'MEDIUM',
    clientFeedback: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
            await api.post(
        `/api/pt/sessions/log`, 
        {
          clientId,
          packageId,
          ...formData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Session logged successfully');
      setOpen(false);
      setFormData({
        duration: 60,
        exercisesCompleted: '',
        intensity: 'MEDIUM',
        clientFeedback: ''
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error logging session:', error);
      toast.error(error.response?.data?.message || 'Failed to log session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="default">Log Session</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log PT Session</DialogTitle>
          <DialogDescription>
            Record the details of the completed session here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration (mins)
            </Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="intensity" className="text-right">
              Intensity
            </Label>
            <Select 
              value={formData.intensity} 
              onValueChange={(val) => handleSelectChange(val, 'intensity')}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select intensity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="EXTREME">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="exercisesCompleted" className="text-right pt-2">
              Exercises
            </Label>
            <Textarea
              id="exercisesCompleted"
              name="exercisesCompleted"
              value={formData.exercisesCompleted}
              onChange={handleChange}
              className="col-span-3"
              placeholder="e.g. Squats, Deadlifts..."
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="clientFeedback" className="text-right pt-2">
              Feedback
            </Label>
            <Textarea
              id="clientFeedback"
              name="clientFeedback"
              value={formData.clientFeedback}
              onChange={handleChange}
              className="col-span-3"
              placeholder="How did the client feel?"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging...' : 'Save Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
