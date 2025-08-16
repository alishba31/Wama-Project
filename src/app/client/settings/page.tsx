"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios'; // Import axios
import { Loader2, Shield, User } from 'lucide-react'; // Added Loader2
import { useEffect, useState } from 'react'; // Added useEffect

const SettingsPage = () => {
  const { toast } = useToast();

  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  // Profile settings state
  const [profile, setProfile] = useState({
    name: "", // Initialize with empty string, will be fetched
    email: "", // Initialize with empty string, will be fetched
  });

  // Password fields state
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    general: ""
  });

  // Fetch initial profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await axios.get('/api/auth/user-profile'); // Adjust API endpoint if different
        if (response.data) {
          setProfile({
            name: response.data.name || "",
            email: response.data.email || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast({
          title: "Error",
          description: "Could not load your profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfileData();
  }, [toast]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFields(prev => ({ ...prev, [name]: value }));
    setPasswordErrors(prev => ({ ...prev, [name]: "", general: "" })); // Clear specific error
  };

  const saveProfile = async () => {
    setIsProfileSaving(true);
    try {
      await axios.patch('/api/auth/user-profile', { name: profile.name });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordErrors({ currentPassword: "", newPassword: "", confirmPassword: "", general: "" });
    setIsPasswordChanging(true);

    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: "New passwords do not match." }));
      setIsPasswordChanging(false);
      return;
    }
    if (passwordFields.newPassword.length < 8) {
        setPasswordErrors(prev => ({ ...prev, newPassword: "New password must be at least 8 characters." }));
        setIsPasswordChanging(false);
        return;
    }


    try {
      await axios.patch('/api/auth/user-password', {
        currentPassword: passwordFields.currentPassword,
        newPassword: passwordFields.newPassword,
        confirmPassword: passwordFields.confirmPassword,
      });
      toast({
        title: "Success",
        description: "Password changed successfully!",
      });
      setPasswordFields({ currentPassword: "", newPassword: "", confirmPassword: "" }); // Clear fields
    } catch (err: any) {
      const backendError = err.response?.data?.details || err.response?.data?.message || "Failed to change password.";
      toast({
        title: "Error",
        description: backendError,
        variant: "destructive",
      });
      // Set specific errors if possible, otherwise general error
      if (backendError.toLowerCase().includes('current password')) {
        setPasswordErrors(prev => ({ ...prev, currentPassword: backendError }));
      } else if (backendError.toLowerCase().includes('new password')) {
         setPasswordErrors(prev => ({ ...prev, newPassword: backendError }));
      } else {
        setPasswordErrors(prev => ({ ...prev, general: backendError }));
      }
    } finally {
      setIsPasswordChanging(false);
    }
  };
  
  const resetPasswordFields = () => {
    setPasswordFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordErrors({ currentPassword: "", newPassword: "", confirmPassword: "", general: "" });
  };
  
  // Placeholder for generic security settings
  const saveOtherSecuritySettings = () => {
     toast({
      title: "Info",
      description: `Other security settings save not yet implemented.`,
    });
  }

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex-col md:flex max-w-6xl mx-auto p-6"> {/* Removed 'hidden' class */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-auto">
        <TabsList className="w-full overflow-x-auto">
          <div className="flex space-x-2 p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </div>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  disabled={isProfileSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  disabled // Email is usually not changeable from profile settings directly
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={saveProfile} disabled={isProfileSaving}>
                  {isProfileSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Change Section */}
              <div className="rounded-md border p-4 space-y-4">
                <h3 className="font-medium">Change Password</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      placeholder="Enter your current password"
                      value={passwordFields.currentPassword}
                      onChange={handlePasswordFieldChange}
                      disabled={isPasswordChanging}
                    />
                    {passwordErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="Enter your new password"
                      value={passwordFields.newPassword}
                      onChange={handlePasswordFieldChange}
                      disabled={isPasswordChanging}
                    />
                     <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters, with uppercase, lowercase, number, and special character.
                    </p>
                    {passwordErrors.newPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      value={passwordFields.confirmPassword}
                      onChange={handlePasswordFieldChange}
                      disabled={isPasswordChanging}
                    />
                    {passwordErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>}
                  </div>
                </div>
                 {passwordErrors.general && <p className="text-sm text-red-500 mt-2 text-center">{passwordErrors.general}</p>}
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    className="mr-2"
                    onClick={resetPasswordFields}
                    disabled={isPasswordChanging}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleChangePassword} disabled={isPasswordChanging}>
                    {isPasswordChanging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Change Password
                  </Button>
                </div>
              </div>

              {/* This button might be for other security settings like 2FA in the future */}
              <div className="flex justify-end">
                <Button onClick={saveOtherSecuritySettings}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;