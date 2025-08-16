"use client";
import Logo from "@/components/logo.svg"; // Assuming this path is correct
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FloatingChatBot from "@/components/ui/FloatingChatbot"; // Assuming this component exists
import { Input } from "@/components/ui/input"; // <-- ADDED: For the search bar
import NotificationBell from "@/components/ui/NotifcationBell"; // Assuming this component exists
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle"; // Assuming this component exists
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import axios from "axios";
import {
  Bell,
  BookCopy,
  BookXIcon,
  ChartColumnIncreasingIcon,
  DatabaseBackupIcon,
  FileChartLine,
  Logs,
  MonitorCheck,
  Search, // <-- ADDED: For the search icon
  Settings,
  ShieldCheck,
  UserPlus,
  Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation"; // <-- UPDATED: Added useSearchParams
import React, { useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce"; // <-- ADDED: For debouncing

// --- NEW COMPONENT FOR THE DEBOUNCED SEARCH BAR ---
function ClientSearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const clientQuery = searchParams.get('client');

  // Local state to manage the input's value for a responsive UI
  const [inputValue, setInputValue] = useState(clientQuery || "");

  // Debounced callback to update the URL after the user stops typing
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('client', term.trim());
    } else {
      params.delete('client');
    }
    // router.replace updates the URL without adding a new entry to browser history
    router.replace(`${pathname}?${params.toString()}`);
  }, 300); // 300ms delay

  // Effect to sync the input field if the URL is changed directly (e.g., back/forward)
  useEffect(() => {
    setInputValue(clientQuery || "");
  }, [clientQuery]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search by client name to filter data..."
        className="pl-9"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          handleSearch(e.target.value);
        }}
      />
    </div>
  );
}
// --- END OF NEW COMPONENT ---

interface NavLinkItem {
  title: string;
  url: string;
  icon: React.ElementType;
  restricted: boolean;
}

interface CurrentAdminDetails {
  id: number;
  role: string;
  canAccessRestrictedFeatures: boolean;
}

export const allAdminNavLinks: NavLinkItem[] = [
  { title: "Activity Logs", url: "/admin/activity-logs", icon: Logs, restricted: true },
  { title: "Add Users", url: "/admin/signup", icon: UserPlus, restricted: true },
  { title: "Manage Users", url: "/admin/manage-users", icon: Users, restricted: true },
  { title: "Warranty Data Management", url: "/admin/warranty-data", icon: DatabaseBackupIcon, restricted: true },
  { title: "Form Creation", url: "/admin/form_creation", icon: BookXIcon, restricted: false },
  { title: "Warranty Claims", url: "/admin/claims", icon: FileChartLine, restricted: false },
  { title: "Submitted Form", url: "/admin/submitted-forms", icon: BookCopy, restricted: false },
  { title: "Update Claims Status", url: "/admin/update-claim-status", icon: ShieldCheck, restricted: false },
  { title: "Escalation", url: "/admin/escalation", icon: ChartColumnIncreasingIcon, restricted: false },
  { title: "SLA Monitoring", url: "/admin/sla-monitor", icon: MonitorCheck, restricted: false },
  { title: "Service Reporting", url: "/admin/service-reporting", icon: FileChartLine, restricted: false },
  { title: "Feedback", url: "/admin/feedback", icon: BookCopy, restricted: false },
  { title: "Notifications Settings", url: "/admin/notification-settings", icon: Bell, restricted: false },
];

const breadcrumbMapping: Record<string, string> = {
  "admin": "Admin Panel",
  "dashboard": "Dashboard Overview",
  "activity-logs": "Activity Logs",
  "add-users": "Add Users",
  "manage-users": "Manage Users",
  "warranty-data": "Warranty Data Management",
  "existing-claims": "Warranty Claims",
  "form_creation": "Form Creation",
  "submitted-forms": "Submitted Forms",
  "signup": "Add Users",
  "sla-monitor": "SLA Monitoring",
  "service-reporting": "Service Reporting",
  "update-claim-status": "Update Claims Status",
  "escalation": "Escalation",
  "settings": "Settings"
};

function AppSidebar({ navItems, ...props }: React.ComponentProps<typeof Sidebar> & { navItems: NavLinkItem[] }) {
    const path = usePathname();
    const searchParams = useSearchParams();
    const clientQuery = searchParams.get('client') || '';
  
    // Function to append the client query to a URL
    const getUrlWithClientQuery = (url: string) => {
      if (!clientQuery) return url;
      return `${url}?client=${encodeURIComponent(clientQuery)}`;
    };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={getUrlWithClientQuery("/admin")} className="flex flex-col items-center w-full">
                <div className="flex items-center w-full">
                  <div className="flex items-center gap-2">
                    <Image src={Logo} alt="Logo" className="size-9" />
                    <h3 className="text-xl font-semibold tracking-tight">
                      <span className="text-primary">Krypton</span><span className="text-gray-500 dark:text-gray-300">Solutions</span>
                    </h3>
                  </div>
                </div>
                <Separator className="my-2 w-full" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((link, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton asChild>
                <Link 
                  href={getUrlWithClientQuery(link.url)} 
                  className={cn(
                    path.startsWith(link.url) ? 'bg-muted text-primary font-bold' : 'text-muted-foreground', 
                    'flex items-center gap-4 rounded-lg px-5 py-3 transition-all hover:bg-muted hover:text-primary/80'
                  )}>
                  <link.icon className="w-8 h-8 shrink-0" />
                  <span className="text-mx font-bold truncate">{link.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href={getUrlWithClientQuery("/admin/settings")}
                className={`flex items-center gap-2 ${path === "/admin/settings" ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary/80'}`}
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [isLoadingLogout, setIsLoadingLogout] = useState(false);
  const [routeChangeLoading, setRouteChangeLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdminDetails | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

  useEffect(() => {
    setIsClient(true);
    setIsLoadingAdmin(true);
    axios.get<CurrentAdminDetails>("/api/auth/me")
      .then(response => setCurrentAdmin(response.data))
      .catch(error => {
        console.error("Failed to fetch current admin details:", error);
        if (error.response?.status === 401) {
          toast({ title: "Authentication Required", description: "Please log in to continue.", variant: "destructive" });
          router.push("/auth/login");
        } else {
          toast({ title: "Error", description: "Could not load admin profile.", variant: "destructive" });
        }
      })
      .finally(() => setIsLoadingAdmin(false));
  }, [router]);

  const visibleNavLinks = useMemo(() => {
    if (isLoadingAdmin || !currentAdmin) return [];
    if (currentAdmin.role === 'ADMIN') {
      return currentAdmin.canAccessRestrictedFeatures
        ? allAdminNavLinks
        : allAdminNavLinks.filter(link => !link.restricted);
    }
    return [];
  }, [currentAdmin, isLoadingAdmin]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | undefined;
    let completionTimeout: NodeJS.Timeout | undefined;
    const startRouteChangeAnimation = () => {
      setRouteChangeLoading(true);
      setProgress(10);
      if (progressInterval) clearInterval(progressInterval);
      progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.floor(Math.random() * 10) + 5, 90));
      }, 200);
      if (completionTimeout) clearTimeout(completionTimeout);
      completionTimeout = setTimeout(completeLoadingAnimation, 1000);
    };
    const completeLoadingAnimation = () => {
      if (progressInterval) clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setRouteChangeLoading(false);
        setProgress(0);
      }, 300);
    };
    startRouteChangeAnimation();
    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (completionTimeout) clearTimeout(completionTimeout);
    };
  }, [path]);

  const handleLogout = async () => {
    setIsLoadingLogout(true);
    try {
      const response = await axios.post("/api/auth/logout");
      if (response.status === 200) {
        toast({ title: "Logout Successful", description: "You have been logged out." });
        setCurrentAdmin(null);
        router.push("/");
      } else {
         throw new Error("Logout request failed");
      }
    } catch(err) {
      console.error("Logout error:", err);
      toast({ title: "Logout Failed", description: "An error occurred.", variant: "destructive" });
    } finally {
      setIsLoadingLogout(false);
    }
  };

  if (isLoadingAdmin) {
    return <div className="flex items-center justify-center h-screen w-full"><p>Loading Admin Dashboard...</p></div>;
  }
  if (!currentAdmin && !isLoadingAdmin) {
     return <div className="flex items-center justify-center h-screen w-full"><p>Access Denied or Session Expired. Redirecting...</p></div>;
  }

  return (
    <SidebarProvider>
      {routeChangeLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-[1000]">
          <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
      )}
      <AppSidebar navItems={visibleNavLinks} />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-4 border-b px-4 z-[500]">
          {/* Left section: Burger Menu & Breadcrumbs */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {path.split('/').filter(Boolean).map((segment, index, arr) => {
                  const href = '/' + arr.slice(0, index + 1).join('/');
                  const isLast = index === arr.length - 1;
                  const displayName = breadcrumbMapping[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <React.Fragment key={href}>
                      <BreadcrumbItem>
                        {isLast ? <BreadcrumbPage>{displayName}</BreadcrumbPage> : <BreadcrumbLink asChild><Link href={href}>{displayName}</Link></BreadcrumbLink>}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Center section: Search Bar */}
          <div className="flex-1 flex justify-center px-4">
            {isClient && <ClientSearchInput />}
          </div>

          {/* Right section: Icons & Logout */}
          <div className="flex items-center gap-x-5">
            {isClient && <NotificationBell />}
            {isClient && <ThemeToggle />}
            {isClient && <FloatingChatBot />}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button variant="destructive">Logout</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Logout</DialogTitle>
                  <DialogDescription>Are you sure you want to log out? This will end your session.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={() => { setDialogOpen(false); handleLogout(); }} disabled={isLoadingLogout}>
                    {isLoadingLogout ? "Logging out..." : "Logout"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}