import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, HeartPulse, Target, UserCheck } from 'lucide-react';

const ProfileOverview = ({ member }) => {
  const age = member.dateOfBirth ? 
    Math.abs(new Date(Date.now() - new Date(member.dateOfBirth).getTime()).getUTCFullYear() - 1970) : 
    'N/A';

  const emergencyContact = member.emergencyContacts && member.emergencyContacts.length > 0 ? member.emergencyContacts[0] : null;
  const primaryTrainer = member.ptPackages && member.ptPackages.length > 0 ? member.ptPackages[0].trainerName : 'None Assigned';
  const goals = member.fitnessAssessment?.goals || 'Not Specified';

  return (
    <div className="space-y-6">
      {/* Highlights Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Primary Goals</p>
              <p className="font-semibold">{goals}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <UserCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Primary Trainer</p>
              <p className="font-semibold">{primaryTrainer}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-full">
              <HeartPulse className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
              {emergencyContact ? (
                 <div>
                   <p className="font-semibold">{emergencyContact.name}</p>
                   <p className="text-sm">{emergencyContact.mobile} ({emergencyContact.relationship})</p>
                 </div>
              ) : (
                <p className="font-semibold text-muted-foreground">None Added</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Gender</div>
            <div>{member.gender || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Age</div>
            <div>{age}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Date of Birth</div>
            <div>{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Blood Group</div>
            <div>{member.bloodGroup || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Nationality</div>
            <div>{member.nationality || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Marital Status</div>
            <div>{member.maritalStatus || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Occupation</div>
            <div>{member.occupation || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Aadhaar Number</div>
            <div>{member.aadhaarNumber || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Passport Number</div>
            <div>{member.passportNumber || 'N/A'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {member.addresses && member.addresses[0] && (
            <div className="sm:col-span-2">
              <div className="text-sm font-medium text-muted-foreground mb-1">Address</div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>
                  {member.addresses[0].addressLine}, {member.addresses[0].city}, 
                  {member.addresses[0].state}, {member.addresses[0].country} - {member.addresses[0].postalCode}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileOverview;
