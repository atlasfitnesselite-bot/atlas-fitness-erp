import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import api from '../../lib/api';
import { toast } from 'sonner';

export default function LeaveCalendar() {
  const [requests, setRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      try {
                        const [reqRes, holRes] = await Promise.all([
          api.get('/api/leave/requests?status=Approved'),
          api.get('/api/leave/holidays')
        ]);
        setRequests(reqRes.data || []);
        setHolidays(holRes.data || []);
      } catch (error) {
        toast.error("Failed to load calendar data");
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-slate-100 min-h-[100px] bg-background/50"></div>);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), i).toLocaleDateString('en-CA'); 
      // 'en-CA' gives YYYY-MM-DD
      
      const dayHolidays = holidays.filter(h => {
        const hDate = new Date(h.date).toLocaleDateString('en-CA');
        return hDate === dateStr;
      });
      
      const dayLeaves = requests.filter(r => {
        const start = new Date(r.startDate).toLocaleDateString('en-CA');
        const end = new Date(r.endDate).toLocaleDateString('en-CA');
        return dateStr >= start && dateStr <= end;
      });

      days.push(
        <div key={i} className="p-2 border border-slate-100 min-h-[100px] relative">
          <span className="font-medium text-slate-700">{i}</span>
          <div className="mt-1 flex flex-col gap-1">
            {dayHolidays.map((h, idx) => (
              <div key={`h-?{idx}`} className="text-xs bg-emerald-100 text-emerald-800 p-1 rounded truncate">
                {h.name}
              </div>
            ))}
            {dayLeaves.map((l, idx) => (
              <div key={`l-?{idx}`} className="text-xs bg-blue-100 text-blue-800 p-1 rounded truncate" title={`${l.employeeName || 'Leave'} - ${l.leaveType}`}>
                {l.employeeName || 'Leave'}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Calendar</h1>
        <p className="text-muted-foreground">Visual overview of upcoming leaves and absences.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>Approved leaves and holidays</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold w-32 text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 bg-background border-b border-border">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2 text-center text-sm font-semibold text-slate-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {renderDays()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
