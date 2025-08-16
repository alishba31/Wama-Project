'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MailIcon, UserIcon, LucideKeyRound } from 'lucide-react';
import Link from "next/link";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [roleError, setRoleError] = useState("");
  const router = useRouter();

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setNameError("");
    setRoleError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }
    if (email.trim() === "") {
      setEmailError("Email is required.");
      isValid = false;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError("Password must be at least 6 characters long, contain one capital letter, and one special character.");
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

    if (role.trim() === "") {
      setRoleError("Role is required.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const res = await axios.post("/api/auth/signup", {
        email,
        password,
        name,
        role,
      });
      if (res.status === 201) {
        router.push("/client"); // Redirect to client dashboard
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <Card className="max-w-[450px]">
        <CardHeader>
          <CardTitle>
            <Button size={'icon'} variant={'outline'} asChild>
              <Link href={'/admin/dashboard'}>
                <span>&larr;</span> {/* ArrowLeft can be replaced with a span or SVG */}
              </Link>
            </Button>
            <span> Create New User</span>
          </CardTitle>
          <CardDescription>Create your User Here. Click the button below once you are done.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-y-6">
            <div className="grid gap-2">
              <label>Email Address</label>
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
              <label>Name</label>
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
              {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
            </div>

            <div>
              <label>Password</label>
              <div className="relative flex items-center">
                <LucideKeyRound className="absolute left-2 w-5 h-5 text-primary" />
                <input
                  className="border p-2 pl-10 rounded-md w-full"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            </div>

            <div>
              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border p-2 rounded-md w-full"
              >
                <option value="USER">User</option>
              </select>
              {roleError && <p className="text-red-500 text-sm">{roleError}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-primary hover:bg-white dark:hover:bg-slate-300" variant={'outline'} onClick={handleSubmit}>Submit</Button>
        </CardFooter>
      </Card>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
