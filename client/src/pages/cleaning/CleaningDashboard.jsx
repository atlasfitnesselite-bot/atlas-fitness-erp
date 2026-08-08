import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OverviewTab from './tabs/OverviewTab';
import StaffTab from './tabs/StaffTab';
import AreaConfigTab from './tabs/AreaConfigTab';
import { Sparkles, ClipboardCheck, Settings } from 'lucide-react';

export default function CleaningDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cleaning & Hygiene</h2>
        <p className="text-muted-foreground">
          Manage daily cleaning checklists, verify completed tasks, and ensure facility hygiene.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card border w-full justify-start h-auto p-1 overflow-x-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
            <ClipboardCheck className="h-4 w-4" />
            Verification & Overview
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2 py-2">
            <Sparkles className="h-4 w-4" />
            Staff Execution
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2 py-2">
            <Settings className="h-4 w-4" />
            Area Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>
        
        <TabsContent value="staff" className="space-y-4">
          <StaffTab />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <AreaConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
