"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast"; // Assuming this is a custom hook correctly defined
import { Info, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

type Role = "ADMIN" | "OEM" | "USER" | null;

const initialSettingsState = {
  ticketEscalation: false,
  slaBreach: false,
  newTicketCreated: false,
  ticketStatusChange: false,
};

const NotificationSettings = () => {
  const [settings, setSettings] = useState(initialSettingsState);
  const [userRole, setUserRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();

  const handleChange = (name: keyof typeof initialSettingsState, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);
  };

  const fetchSettings = async () => {
    setLoading(true); // Ensure loading is true at the start of fetch
    try {
      const res = await fetch('/api/notification-setting', {
        credentials: 'include', // Important for sending cookies
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})); // Try to parse error
        throw new Error(errorData.error || `Failed to load settings (status: ${res.status})`);
      }

      const data = await res.json();

      // The backend returns { settings: {actual_settings_object}, role: "..." }
      // We need to use data.settings to update the local settings state.
      if (data.settings) {
        setSettings({
          ticketEscalation: data.settings.ticketEscalation,
          slaBreach: data.settings.slaBreach,
          newTicketCreated: data.settings.newTicketCreated,
          ticketStatusChange: data.settings.ticketStatusChange,
        });
      } else {
        // This case should ideally not happen if backend always returns 'settings'
        // or if it returns defaults. Fallback to initial state or log warning.
        console.warn("Fetched data did not contain 'settings' object as expected. Using defaults.");
        setSettings(initialSettingsState); // Or handle as an error
      }

      setUserRole(data.role);
      setIsDirty(false); // Reset dirty state after fetching
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred while loading settings',
        variant: "destructive",
      });
      // Optionally, set settings to a default state on error
      setSettings(initialSettingsState);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setLoading(true); // Optionally show loading state during save
    try {
      const response = await fetch('/api/notification-setting', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for sending cookies
        body: JSON.stringify(settings), // Send the current 'settings' state
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update settings (status: ${response.status})`);
      }

      // const updatedSettings = await response.json(); // Backend returns the updated settings
      // Optionally, update state with response if backend modifies/confirms values:
      // setSettings(updatedSettings); // Assuming 'updatedSettings' has the same structure

      toast({
        title: "Success",
        description: "Settings updated successfully!",
      });
      setIsDirty(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An error occurred while updating settings',
        variant: "destructive",
      });
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 max-w-2xl mx-auto p-6">
        <Skeleton className="h-10 w-[250px]" /> {/* Adjusted width for "Notification Preferences" */}
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4 p-4"> {/* Added padding like other items */}
                <Skeleton className="h-6 w-10" /> {/* Skeleton for Switch */}
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[250px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-end pt-2">
            <Skeleton className="h-10 w-[150px]" /> {/* Skeleton for Save Button */}
        </div>
      </div>
    );
  }

  // Helper to avoid repeating common props for switch items
  const renderSettingItem = (
    id: keyof typeof initialSettingsState,
    label: string,
    description: string
  ) => (
    <div className="flex items-center space-x-4 rounded-md border p-4">
      <Switch
        id={id}
        checked={settings[id]}
        onCheckedChange={(checked) => handleChange(id, checked)}
        aria-label={label}
      />
      <Label htmlFor={id} className="flex flex-col space-y-1 flex-1 cursor-pointer">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {description}
        </span>
      </Label>
    </div>
  );

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
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {(userRole === "ADMIN" || userRole === "OEM") &&
              renderSettingItem(
                "ticketEscalation",
                "Ticket Escalation Alerts",
                "Receive notifications when tickets are escalated"
              )}

            {(userRole === "ADMIN" || userRole === "OEM") &&
              renderSettingItem(
                "slaBreach",
                "SLA Breach Alerts",
                "Get notified when SLA thresholds are breached"
              )}

            {userRole === "ADMIN" &&
              renderSettingItem(
                "newTicketCreated",
                "New Ticket Alerts",
                "Notify me when new tickets are created"
              )}

            {(userRole === "ADMIN" || userRole === "USER") &&
              renderSettingItem(
                "ticketStatusChange",
                "Status Change Alerts",
                "Receive updates when ticket status changes"
              )}
            
            {/* Fallback message if no settings are applicable for the role */}
            {userRole && !["ADMIN", "OEM", "USER"].includes(userRole) && (
                 <p className="text-sm text-muted-foreground">No notification settings applicable for your role.</p>
            )}
            {userRole && !(
                (userRole === "ADMIN" || userRole === "OEM") ||
                (userRole === "ADMIN") ||
                (userRole === "ADMIN" || userRole === "USER")
            ) && settings && Object.values(settings).every(v => !v) && ( /* Check if any setting is visible */
                 <p className="text-sm text-muted-foreground p-4 border rounded-md">
                    You have no specific notification options available based on your current role, or all are currently disabled.
                 </p>
            )}


            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={!isDirty || loading}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default NotificationSettings;