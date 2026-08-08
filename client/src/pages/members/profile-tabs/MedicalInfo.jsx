import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Stethoscope } from 'lucide-react';

const MedicalInfo = ({ member }) => {
  const medical = member.medical;

  if (!medical) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No medical records found for this member. Update their profile to add medical info.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-500" />
            Vitals & Basic Info
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Blood Group</div>
            <div className="font-semibold text-lg">{medical.bloodGroup || member.bloodGroup || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Height (cm)</div>
            <div className="font-semibold">{medical.height || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Weight (kg)</div>
            <div className="font-semibold">{medical.weight || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">BMI</div>
            <div className="font-semibold">{medical.bmi || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Blood Pressure</div>
            <div className="font-semibold">{medical.bloodPressure || 'N/A'}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Conditions & Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {medical.asthma && <Badge variant="destructive">Asthma</Badge>}
              {medical.diabetes && <Badge variant="destructive">Diabetes</Badge>}
              {medical.heartDisease && <Badge variant="destructive">Heart Disease</Badge>}
              {!medical.asthma && !medical.diabetes && !medical.heartDisease && (
                <span className="text-sm text-muted-foreground">No major conditions flagged.</span>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Other Medical Conditions</div>
              <p className="text-sm">{medical.medicalConditions || 'None reported'}</p>
            </div>
            
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Allergies</div>
              <p className="text-sm">{medical.allergies || 'None reported'}</p>
            </div>
            
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Recent Surgery</div>
              <p className="text-sm">{medical.recentSurgery || 'None reported'}</p>
            </div>
            
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Injuries</div>
              <p className="text-sm">{medical.injuries || 'None reported'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medications & Doctor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Current Medications</div>
              <p className="text-sm">{medical.medications || 'None reported'}</p>
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-sm font-medium text-muted-foreground mb-1">Doctor's Name</div>
              <p className="font-medium">{medical.doctorName || 'N/A'}</p>
            </div>
            
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Doctor's Contact</div>
              <p className="text-sm">{medical.doctorContact || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {medical.medicalNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{medical.medicalNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicalInfo;
