import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, ActivitySquare } from 'lucide-react';

const Measurements = ({ member }) => {
  const measurements = member.measurements || [];
  const fitness = member.fitnessAssessment;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Fitness Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Primary Goal</div>
              <div className="font-semibold text-lg">{fitness?.fitnessGoal || 'Not set'}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div>
                <div className="text-sm font-medium text-muted-foreground">BMR</div>
                <div>{fitness?.bmr ? `${fitness.bmr} kcal` : 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">TDEE</div>
                <div>{fitness?.tdee ? `${fitness.tdee} kcal` : 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivitySquare className="h-5 w-5 text-indigo-500" />
              Body Composition
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Body Fat %</div>
              <div className="font-semibold">{fitness?.bodyFatPercentage ? `${fitness.bodyFatPercentage}%` : 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Muscle Mass</div>
              <div className="font-semibold">{fitness?.muscleMass ? `${fitness.muscleMass} kg` : 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Visceral Fat</div>
              <div className="font-semibold">{fitness?.visceralFat || 'N/A'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Measurement History</CardTitle>
        </CardHeader>
        <CardContent>
          {measurements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No measurements recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Chest</TableHead>
                    <TableHead>Waist</TableHead>
                    <TableHead>Hip</TableHead>
                    <TableHead>Neck</TableHead>
                    <TableHead>Biceps</TableHead>
                    <TableHead>Thigh</TableHead>
                    <TableHead>Calf</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {measurements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">
                        {new Date(m.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{m.chest || '-'}</TableCell>
                      <TableCell>{m.waist || '-'}</TableCell>
                      <TableCell>{m.hip || '-'}</TableCell>
                      <TableCell>{m.neck || '-'}</TableCell>
                      <TableCell>{m.biceps || '-'}</TableCell>
                      <TableCell>{m.thigh || '-'}</TableCell>
                      <TableCell>{m.calf || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Measurements;
