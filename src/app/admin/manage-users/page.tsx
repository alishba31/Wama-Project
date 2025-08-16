// New Code
"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ChevronDown, Edit, PlusCircle, Save, Search, Trash2, UserPlus } from "lucide-react"; // Added Trash2 and Search
import Link from "next/link";
import { useEffect, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface User {
  id: number;
  name: string | null;
  email: string;
  role: string;
  canAccessRestrictedFeatures?: boolean;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User> | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("Select Role");
  const [error, setError] = useState("");
  const { toast } = useToast();

  // --- SEARCH FUNCTIONALITY START ---
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  // --- SEARCH FUNCTIONALITY END ---

  useEffect(() => {
    axios.get<User[]>("/api/admin/users")
      .then((response) => {
        setUsers(response.data);
        // setFilteredUsers(response.data); // Initial population, will be handled by the filter useEffect
      })
      .catch((error) => setError(error.response?.data?.message || "Failed to load users"));
  }, []);

  // --- SEARCH FUNCTIONALITY START ---
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    if (lowercasedSearchTerm === "") {
      setFilteredUsers(users);
    } else {
      const newFilteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(lowercasedSearchTerm)) ||
        user.email.toLowerCase().includes(lowercasedSearchTerm)
      );
      setFilteredUsers(newFilteredUsers);
    }
  }, [searchTerm, users]); // Re-filter when searchTerm or the main users list changes
  // --- SEARCH FUNCTIONALITY END ---

  const handleDeleteUser = async (userId: number) => {
    try {
      await axios.delete("/api/admin/delete-user", {
        data: { userId },
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId)); // This will trigger the filter useEffect
      toast({
        description: "User deleted successfully!",
      });
    } catch (error: any) {
      toast({
        description: error.response?.data?.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  };
    
  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setEditFormData({ ...user }); 
    setSelectedRole(user.role);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditFormData(null);
    setSelectedRole("Select Role");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editFormData) {
      const { name, value, type, checked } = e.target;
      setEditFormData({
        ...editFormData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (editFormData && editingUserId) {
      try {
        const payload: any = {
          id: editingUserId,
          name: editFormData.name,
          email: editFormData.email,
          role: selectedRole,
        };
        if (selectedRole === 'ADMIN') {
          payload.canAccessRestrictedFeatures = !!editFormData.canAccessRestrictedFeatures;
        }
        const response = await axios.put('/api/admin/users', payload);
        const updatedUser = response.data as User;
        setUsers(users.map(user => (user.id === editingUserId ? updatedUser : user))); // This will trigger the filter useEffect
        setEditingUserId(null);
        setEditFormData(null);
        setSelectedRole("Select Role");
        toast({ description: "Changes saved successfully!" });
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to update user");
        toast({ description: error.response?.data?.message || "Failed to update user.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="p-8">
      {/* Search Input and Add User Button Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="relative w-full sm:max-w-xs md:max-w-sm lg:max-w-md">
            <Input
                type="text"
                placeholder="Search by Name or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" // Add padding for icon
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href={'/admin/signup'}>
            <PlusCircle className="mr-2 size-4" />
            Add Users
          </Link>
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {/* Conditional Rendering for User List / Empty States */}
      {!error && users.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50 mt-8">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/20">
            <UserPlus className="size-10 text-primary" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">You don't have any Users Created</h2>
          <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
            You currently don't have any Users. Please create some so that you can see them right here!
          </p>
          {/* "Add Users" button is already above, but keeping one here for strong CTA in empty state */}
          <Button asChild>
            <Link href={'/admin/signup'}>
              <PlusCircle className="mr-2 size-4" />
              Add Users
            </Link>
          </Button>
        </div>
      )}

      {!error && users.length > 0 && filteredUsers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50 mt-8">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
                <Search className="size-10 text-primary" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No Users Found</h2>
            <p className="mb-4 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
                No users match your search term "{searchTerm}". Try a different search or clear the filter.
            </p>
            {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                </Button>
            )}
        </div>
      )}

      {!error && filteredUsers.length > 0 && (
        <div className="grid gap-6">
          <ul className="space-y-4">
            {filteredUsers.map((user) => ( // Iterate over filteredUsers
              <li key={user.id} className="flex flex-col sm:flex-row justify-between sm:items-center border p-4 rounded-md">
                {editingUserId === user.id ? (
                  <div className="w-full flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Input
                      name="name"
                      value={editFormData?.name || ""}
                      onChange={handleInputChange}
                      placeholder="Name"
                      className="flex-grow"
                    />
                    <Input
                      name="email"
                      value={editFormData?.email || ""}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="flex-grow"
                    />
                    <div className="flex items-center space-x-2">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={'outline'} className="w-full sm:w-auto">
                            {selectedRole} <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedRole("USER")}>User</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedRole("OEM")}>OEM</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedRole("CLIENT")}>Client</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedRole("ADMIN")}>Admin</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>

                        {selectedRole === 'ADMIN' && (
                        <div className="flex items-center space-x-2 pl-2">
                            <Checkbox
                            id={`restricted-${user.id}`}
                            name="canAccessRestrictedFeatures"
                            checked={!!editFormData?.canAccessRestrictedFeatures}
                            onCheckedChange={(checkedState) => {
                                if (editFormData) {
                                setEditFormData({
                                    ...editFormData,
                                    canAccessRestrictedFeatures: !!checkedState,
                                });
                                }
                            }}
                            />
                            <Label htmlFor={`restricted-${user.id}`} className="text-sm whitespace-nowrap">
                            Full Access
                            </Label>
                        </div>
                        )}
                    </div>
                    <div className="flex space-x-2 justify-end sm:justify-start">
                        <Button
                        variant="default"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={handleSaveEdit}
                        >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                        </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-grow mb-2 sm:mb-0">
                      <p className="font-semibold">Name: {user.name || 'N/A'}, Email Address: {user.email}</p>
                      <p className="text-sm text-muted-foreground">Role: {user.role}</p>
                      {user.role === 'ADMIN' && user.canAccessRestrictedFeatures !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          Full Access: {user.canAccessRestrictedFeatures ? 'Yes' : 'No'}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 sm:space-x-4 self-start sm:self-center">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            disabled={user.role === "ADMIN" && user.canAccessRestrictedFeatures === true}
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The user will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                              Confirm Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}