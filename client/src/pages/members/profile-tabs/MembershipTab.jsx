import { useAuthStore } from '@/store/useAuthStore';
import api from '../../../lib/api';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, ShieldAlert, Users, FileText, ArrowRightLeft, Upload } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const MembershipTab = ({ member, refreshMember }) => {
  const [isFreezing, setIsFreezing] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const activeSubscription = member.subscriptions?.find(
    s => s.status === 'ACTIVE' || s.status === 'FROZEN'
  );

  const handleFreeze = async () => {
    if (!activeSubscription) return;
    try {
      setIsFreezing(true);
      const frozenUntil = new Date();
      frozenUntil.setDate(frozenUntil.getDate() + 30); // Default freeze for 30 days
      
      const token = localStorage.getItem("token") || '';
      const response = await api.put(`/api/members/${member.id}/subscriptions/${activeSubscription.id}/freeze`, 
        { frozenUntil: frozenUntil.toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.data) throw new Error("Failed");
      toast.success("Membership frozen successfully for 30 days");
      refreshMember();
    } catch (error) {
      toast.error("Failed to freeze membership");
    } finally {
      setIsFreezing(false);
    }
  };

  const handleTransfer = async () => {
    // In a real app, this would open a dialog to select a target member
    toast.info("Transfer dialog would open here");
  };

  const handleUploadAgreement = async () => {
    if (!activeSubscription) return;
    try {
      const token = localStorage.getItem("token") || '';
      const response = await api.put(`/api/members/${member.id}/subscriptions/${activeSubscription.id}/agreement`, 
        { agreementUrl: "https://example.com/agreement.pdf" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.data) throw new Error("Failed");
      toast.success("Agreement uploaded successfully");
      refreshMember();
    } catch (error) {
      toast.error("Failed to upload agreement");
    }
  };

  if (!member.subscriptions || member.subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No Membership Record</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            This member does not have any active or past memberships on record.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Active Plan */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {activeSubscription?.plan?.name || "Unknown Plan"}
                {activeSubscription?.status === 'ACTIVE' && <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Active</Badge>}
                {activeSubscription?.status === 'FROZEN' && <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Frozen</Badge>}
              </CardTitle>
              <CardDescription className="mt-2">
                Primary Membership Plan
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                ₹{activeSubscription?.plan?.price?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {activeSubscription?.plan?.durationInMonths} Months
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-md">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {activeSubscription?.startDate ? format(new Date(activeSubscription.startDate), "MMM dd, yyyy") : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-md">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Renewal Date</p>
                  <p className="font-medium">
                    {activeSubscription?.endDate ? format(new Date(activeSubscription.endDate), "MMM dd, yyyy") : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {activeSubscription?.isFrozen && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm font-medium text-amber-600">Membership Frozen</p>
                  <p className="text-xs text-amber-600/80 mt-1">
                    Until {activeSubscription.frozenUntil ? format(new Date(activeSubscription.frozenUntil), "MMM dd, yyyy") : 'Unknown'}
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-md">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Digital Agreement</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {activeSubscription?.agreementUrl ? (
                        <span className="text-emerald-500 flex items-center gap-1"><Badge variant="outline" className="text-emerald-500 border-emerald-500/30">Signed</Badge></span>
                      ) : (
                        <span className="text-destructive flex items-center gap-1"><Badge variant="outline" className="text-destructive border-destructive/30">Missing</Badge></span>
                      )}
                    </p>
                    {!activeSubscription?.agreementUrl && (
                      <Button variant="ghost" size="sm" onClick={handleUploadAgreement} className="h-8">
                        <Upload className="h-3 w-3 mr-2" /> Upload
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-border/50">
            <Button 
              variant="outline" 
              className="bg-background"
              onClick={handleFreeze}
              disabled={isFreezing || activeSubscription?.isFrozen || !activeSubscription}
            >
              <ShieldAlert className="h-4 w-4 mr-2 text-amber-500" />
              {activeSubscription?.isFrozen ? 'Currently Frozen' : 'Freeze Membership'}
            </Button>
            <Button 
              variant="outline" 
              className="bg-background"
              onClick={handleTransfer}
              disabled={isTransferring || !activeSubscription}
            >
              <ArrowRightLeft className="h-4 w-4 mr-2 text-blue-500" />
              Transfer Ownership
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Past Subscriptions (If any) */}
      {member.subscriptions?.filter(s => s.status !== 'ACTIVE' && s.status !== 'FROZEN').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Past Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {member.subscriptions
                .filter(s => s.status !== 'ACTIVE' && s.status !== 'FROZEN')
                .map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div>
                    <p className="font-medium">{sub.plan?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sub.startDate), "MMM yyyy")} - {format(new Date(sub.endDate), "MMM yyyy")}
                    </p>
                  </div>
                  <Badge variant="outline">{sub.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MembershipTab;
