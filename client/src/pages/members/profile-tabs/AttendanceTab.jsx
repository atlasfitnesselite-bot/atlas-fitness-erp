import api from '../../../lib/api';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AttendanceTab = ({ member }) => {
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("token") || '';
        const res = await api.get(`/api/members/${member.id}/attendance`);
        if (res.data) {
          const data = res.data;
          setAttendance(data || []);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (member?.id) {
      fetchAttendance();
    }
  }, [member?.id]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading attendance history...</div>;
  }

  if (attendance.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No Attendance Records</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            This member has not checked in to the gym yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group by month
  const groupedAttendance = attendance.reduce((acc, record) => {
    const month = format(new Date(record.timestamp), 'MMMM yyyy');
    if (!acc[month]) acc[month] = [];
    acc[month].push(record);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedAttendance).map(([month, records]) => (
        <Card key={month}>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              {month}
              <Badge variant="secondary">{records.length} Check-ins</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {records.map((record) => (
                <div 
                  key={record.id} 
                  className="flex items-center gap-2 p-2 px-3 border border-border/50 bg-muted/20 rounded-md"
                >
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {format(new Date(record.timestamp), "MMM dd")}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {format(new Date(record.timestamp), "hh:mm a")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AttendanceTab;
