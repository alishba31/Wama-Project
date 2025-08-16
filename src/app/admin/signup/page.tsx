// New Code
'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Label as DropdownLabel } from "@radix-ui/react-dropdown-menu";
import axios from "axios";
import { ArrowLeft, Eye, EyeOff, LucideKeyRound, MailIcon, UserIcon, UserPlus } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const getPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
  return strength;
};

const PasswordStrengthBar = ({ password }: { password: string }) => {
  const strength = getPasswordStrength(password);
  const colors = ['bg-gray-300', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-600'];
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  return (
    <div className="space-y-1 mt-2">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded ${i < strength ? colors[strength] : 'bg-gray-200'}`} />
        ))}
      </div>
      {password.length > 0 && (
        <p className={`text-sm ${strength < 3 ? 'text-red-500' : 'text-green-600'}`}>
          {labels[strength]}
        </p>
      )}
    </div>
  );
};

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Select User Role");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [roleError, setRoleError] = useState("");
  const router = useRouter();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  // This state holds the value that will be submitted for canAccessRestrictedFeatures
  // Initialize to true, matching your DB default.
  const [canAccessRestrictedFeatures, setCanAccessRestrictedFeatures] = useState(true);

  // Effect to manage canAccessRestrictedFeatures based on role
  useEffect(() => {
    if (role === "ADMIN") {
      // When ADMIN is selected, default canAccessRestrictedFeatures to true
      // This makes the checkbox appear checked by default.
      // The user can then uncheck it if they wish.
      setCanAccessRestrictedFeatures(true);
    } else {
      // For OEM, USER, or "Select User Role", the submitted value for
      // canAccessRestrictedFeatures should be true (matching DB default),
      // and the checkbox is not shown for OEM/USER.
      setCanAccessRestrictedFeatures(true);
    }
  }, [role]); // Re-run this effect when the role changes

  const isFormValid = () => {
    return (
      email.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      !/\b(\.[a-z]{2,})\1\b/.test(email) &&
      name.trim() !== "" &&
      password.trim() !== "" &&
      getPasswordStrength(password) === 5 &&
      role !== "Select User Role"
    );
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setNameError("");
    setRoleError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const consecutiveDomainRegex = /\b(\.[a-z]{2,})\1\b/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }
    if (consecutiveDomainRegex.test(email)) {
      setEmailError("Please enter a valid email address without consecutive domains (e.g., '.com.com').");
      isValid = false;
    }
    if (email.trim() === "") {
      setEmailError("Email is required.");
      isValid = false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,25}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError("Password must be 8-25 characters, with uppercase, lowercase, number, and special character.");
      isValid = false;
    }
    if (password.trim() === "") {
      setPasswordError("Password is required.");
      isValid = false;
    }
    if (name.trim() === "") {
      setNameError("Name is required.");
      isValid = false;
    }
    if (role === "Select User Role") {
      setRoleError("Role is required.");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    const payload = {
      email,
      password,
      name,
      role,
      // The canAccessRestrictedFeatures state now correctly holds the value
      // - true by default for ADMIN (can be changed by checkbox)
      // - true for OEM/USER (checkbox hidden)
      canAccessRestrictedFeatures: canAccessRestrictedFeatures,
    };

    try {
      const res = await axios.post("/api/admin/signup", payload);
      if (res.status === 201) {
        setShowSuccessDialog(true); 
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong");
      toast({
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // Renamed to avoid conflict with 'role' state, and to be more explicit
  const handleRoleSelection = (newRoleValue: string) => {
    setRole(newRoleValue);
    // The useEffect will manage setting canAccessRestrictedFeatures appropriately
  };

  const clearRoleSelection = () => {
    setRole("Select User Role");
    // The useEffect will manage setting canAccessRestrictedFeatures appropriately
  };

  return (
    <div className="flex flex-col flex-0 items-center justify-center">
      <Card className="max-w-[600px]">
        <CardHeader>
        <div className="flex items-center mb-0">
          <Button size={'icon'} variant={'outline'} asChild>
            <button onClick={() => router.back()} className="flex items-center mr-4">
              <ArrowLeft className="size-5" />
            </button>
            </Button>
            <UserPlus className="w-7 h-7 text-primary mr-1" />
            <CardTitle>Create New Users</CardTitle>
          </div>
          <CardDescription>Create your User Here. Click the button below once you are done.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-y-6">
            <div className="grid gap-2">
              <DropdownLabel>Email Address</DropdownLabel>
              <div className="relative flex items-center">
                <MailIcon className="absolute left-2 w-5 h-5 text-primary" />
                <input
                  className="border p-2 pl-10 rounded-md w-full"
                  placeholder="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
            </div>

            <div className="grid gap-2">
              <DropdownLabel>Name</DropdownLabel>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-2 w-5 h-5 text-primary" />
                <input
                  className="border p-2 pl-10 rounded-md w-full"
                  placeholder="Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
            </div>

            <div>
              <DropdownLabel>Password</DropdownLabel>
              <div className="relative flex items-center">
                <LucideKeyRound className="absolute left-2 w-5 h-5 text-primary" />
                <input
                  className="border p-2 pl-10 pr-10 rounded-md w-full"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 text-gray-500 hover:text-primary"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Password must be 8-25 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.
              </p>
              <PasswordStrengthBar password={password} />
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            </div>

            <div className="grid gap-2">
              <DropdownLabel>User Role</DropdownLabel>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full border p-2 rounded-md text-left focus:ring-2 focus:ring-primary">
                  <span>{role}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="text-center w-[--radix-dropdown-menu-trigger-width)]">
                  <DropdownMenuItem onClick={clearRoleSelection}>Clear Selection</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleRoleSelection("ADMIN")}>ADMIN</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleSelection("OEM")}>OEM</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleSelection("USER")}>USER</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {roleError && <p className="text-red-500 text-sm">{roleError}</p>}
            </div>

            {/* Conditionally render Checkbox ONLY for ADMIN role */}
            {role === "ADMIN" && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="canAccessRestrictedFeatures"
                  // The checked state is driven by canAccessRestrictedFeatures
                  // useEffect ensures this is true when ADMIN is selected
                  checked={canAccessRestrictedFeatures}
                  onCheckedChange={(checkedState) => {
                    // When ADMIN, allow user to change this specific value
                    setCanAccessRestrictedFeatures(Boolean(checkedState));
                  }}
                />
                <label
                  htmlFor="canAccessRestrictedFeatures"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Can Access Restricted Features
                </label>
              </div>
            )}

          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-primary hover:bg-white dark:hover:bg-slate-300"
            variant="outline"
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            Submit
          </Button>

          <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Success!</AlertDialogTitle>
                <AlertDialogDescription>User successfully registered.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={() => {
                    setShowSuccessDialog(false);
                    router.push("/admin"); 
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}