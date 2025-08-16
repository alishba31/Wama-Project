"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast"; // Ensure this path is correct
import { Info, Save } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

// Define a type for user roles for better type safety
type UserRole = 'USER' | 'ADMIN' | 'OEM' | null;

// Default settings values to ensure settings object always has all keys
const defaultSettingsValues = {
  ticketEscalation: false,
  slaBreach: false,
  newTicketCreated: false,
  ticketStatusChange: false,
};

const NotificationSettings = () => {
  const [settings, setSettings] = useState(defaultSettingsValues);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();

  const handleChange = (name: keyof typeof defaultSettingsValues, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);
  };

  const fetchSettings = useCallback(async () => {
    setLoading(true); 
    setIsDirty(false); 
    try {
      const res = await fetch('/api/notification-setting', {
        credentials: 'include', 
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to load settings and parse error message' }));
        throw new Error(errorData.error || `Failed to load settings. Status: ${res.status}`);
      }

      const data = await res.json();
      setSettings(data.settings || defaultSettingsValues);
      setUserRole(data.role as UserRole);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred while loading settings.',
        variant: "destructive",
      });
      setSettings(defaultSettingsValues); // Reset to defaults on error
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // toast is typically stable, include if it's not

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Disable button and show loading indicator during submission
    try {
      const response = await fetch('/api/notification-setting', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(settings), 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update settings and parse error message' }));
        throw new Error(errorData.error || `Failed to update settings. Status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Settings updated successfully!",
      });
      setIsDirty(false);
      // Optionally re-fetch settings to ensure UI is in sync with DB,
      // especially if other parts of the app might change these settings.
      // For this component, local state update is usually sufficient.
      // await fetchSettings(); 
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred while updating settings.',
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Re-enable button
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (loading && !isDirty) { // Show skeleton only on initial load, not during save operation's loading state if not dirty
    return (
      <div className="flex flex-col space-y-4 max-w-2xl mx-auto p-6">
        <Skeleton className="h-10 w-[250px]" /> {/* Title skeleton */}
        {[...Array(4)].map((_, i) => ( 
          <Card key={i}>
            <CardContent className="pt-6"> {/* Original had pt-6 here, so keeping it */}
              <div className="flex items-center space-x-4"> {/* Original had p-4 here, changed to match visual */}
                <Skeleton className="h-6 w-10" /> {/* Switch skeleton (more rectangular) */}
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" /> {/* Title skeleton */}
                  <Skeleton className="h-3 w-[250px]" /> {/* Description skeleton */}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <Skeleton className="h-10 w-[140px] ml-auto" /> {/* "Save Changes" button skeleton */}
      </div>
    );
  }
  
  const showTicketEscalation = userRole === 'ADMIN' || userRole === 'OEM';
  const showSlaBreach = userRole === 'ADMIN' || userRole === 'OEM';
  const showNewTicketCreated = userRole === 'ADMIN';
  const showTicketStatusChange = userRole === 'ADMIN' || userRole === 'USER';

  const noSettingsToShow = !showTicketEscalation && !showSlaBreach && !showNewTicketCreated && !showTicketStatusChange;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CardTitle>Notification Preferences</CardTitle>
            <Info className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            Manage how you receive notifications about ticket activities.
            {/* For debugging: <span className="ml-2 text-xs">(Role: {userRole || 'Loading...'})</span> */}
          </CardDescription>
        </CardHeader>
        
        {noSettingsToShow && !loading && (
            <CardContent>
                <p className="text-muted-foreground">No notification settings available for your role, or user information could not be loaded.</p>
            </CardContent>
        )}

        {(!noSettingsToShow || (loading && isDirty) ) && ( // Show form if there are settings or if loading during a save operation
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {showTicketEscalation && (
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <Switch
                    id="ticketEscalation"
                    checked={settings.ticketEscalation}
                    onCheckedChange={(checked) => handleChange("ticketEscalation", checked)}
                    aria-label="Ticket Escalation Alerts"
                    disabled={loading}
                  />
                  <Label htmlFor="ticketEscalation" className={`flex flex-col space-y-1 flex-1 ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <span className="font-medium">Ticket Escalation Alerts</span>
                    <span className="text-sm text-muted-foreground">
                      Receive notifications when tickets are escalated.
                    </span>
                  </Label>
                </div>
              )}

              {showSlaBreach && (
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <Switch
                    id="slaBreach"
                    checked={settings.slaBreach}
                    onCheckedChange={(checked) => handleChange("slaBreach", checked)}
                    aria-label="SLA Breach Alerts"
                    disabled={loading}
                  />
                  <Label htmlFor="slaBreach" className={`flex flex-col space-y-1 flex-1 ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <span className="font-medium">SLA Breach Alerts</span>
                    <span className="text-sm text-muted-foreground">
                      Get notified when SLA thresholds are breached.
                    </span>
                  </Label>
                </div>
              )}

              {showNewTicketCreated && (
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <Switch
                    id="newTicketCreated"
                    checked={settings.newTicketCreated}
                    onCheckedChange={(checked) => handleChange("newTicketCreated", checked)}
                    aria-label="New Ticket Alerts"
                    disabled={loading}
                  />
                  <Label htmlFor="newTicketCreated" className={`flex flex-col space-y-1 flex-1 ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <span className="font-medium">New Ticket Alerts</span>
                    <span className="text-sm text-muted-foreground">
                      Notify me when new tickets are created.
                    </span>
                  </Label>
                </div>
              )}

              {showTicketStatusChange && (
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <Switch
                    id="ticketStatusChange"
                    checked={settings.ticketStatusChange}
                    onCheckedChange={(checked) => handleChange("ticketStatusChange", checked)}
                    aria-label="Status Change Alerts"
                    disabled={loading}
                  />
                  <Label htmlFor="ticketStatusChange" className={`flex flex-col space-y-1 flex-1 ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <span className="font-medium">Status Change Alerts</span>
                    <span className="text-sm text-muted-foreground">
                      Receive updates when ticket status changes.
                    </span>
                  </Label>
                </div>
              )}
              
              { !noSettingsToShow && (
                 <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={!isDirty || loading}>
                      {loading && isDirty ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                    </Button>
                </div>
              )}
            </CardContent>
          </form>
        )}
      </Card>
    </div>
  );
};

export default NotificationSettings;