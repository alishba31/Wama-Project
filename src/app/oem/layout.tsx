// 'use client';
// import { AdminItems } from "@/components/admin/AdminItems";
// import Logo from '@/components/logo.svg';
// import { Button } from '@/components/ui/button';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// import LoadingBar from "@/components/ui/loadingbartop";
// import { ThemeToggle } from '@/components/ui/ThemeToggle';
// import { toast } from "@/hooks/use-toast";
// import axios from "axios";
// import { BookCopy, BookXIcon, ChartColumnIncreasingIcon, CircleUser, DatabaseBackupIcon, FileChartLine, LayoutDashboard, LogOutIcon, Logs, Settings, ShieldCheck, UserPlus, Users } from "lucide-react";
// import Image from "next/image";
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation'; // Import the router for redirection
// import { ReactNode, useEffect, useState } from "react";

// export const navLinks = [
//     {
//         name: 'Dashboard Overview',
//         href: '/admin/dashboard',
//         icon: LayoutDashboard
//     },
//     {
//         name: 'Activity Logs',
//         href: '/admin/activity-logs',
//         icon: Logs
//     },
//     {
//         name: 'Warranty Claims',
//         href: '/admin/claims/existing-claims',
//         icon: FileChartLine
//     },
//     {
//         name: 'Manage Users',
//         href: '/admin/manage-users',
//         icon: Users
//     },
//     // {
//     //     name: 'Reports',
//     //     href: '/admin/reports',
//     //     icon: FileText
//     // },
//     {
//         name: 'Update Claims Status',
//         href: '/admin/update-claim-status',
//         icon: ShieldCheck
//     },
//     {
//         name: 'Escalation',
//         href: '/admin/escalation',
//         icon: ChartColumnIncreasingIcon
//     },
//     {
//         name: 'Form Creation',
//         href: '/admin/form_creation',
//         icon: BookXIcon
//     },
//     // {
//     //     name: 'Product Reporting',
//     //     href: '/admin/product-reporting',
//     //     icon: PackageSearch
//     // },
//     {
//         name: 'Submitted Form',
//         href: '/admin/submitted-forms',
//         icon: BookCopy
//     },
//     {
//         name: "Warranty Data Management",
//         href: '/admin/warranty-data',
//         icon: DatabaseBackupIcon
//     },
//     {
//         name: 'SLA Monitoring',
//         href: '/admin/sla-monitor',
//         icon: Logs
//     },
//     {
//         name: 'Add Users',
//         href: '/admin/signup',
//         icon: UserPlus
//     }
// ]
// export default function AdminLayout({children} : {children: ReactNode}){
//     const router = useRouter();  // Initialize the router for redirection
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//     const [progress, setProgress] = useState<number>(0); // Add progress state

//     // Function to handle navigation clicks and start loading bar
//     const handleNavClick = (href: string) => {
//         setIsLoading(true);
//         setProgress(0); // Reset progress
//         router.push(href);
//     };
//     useEffect(() => {
//         if (isLoading) {
//           const interval = setInterval(() => {
//             setProgress((prev) => (prev < 100 ? prev + 20 : 100));
//           }, 500);
//           return () => clearInterval(interval);
//         }
//         // Clear interval if loading completes
//         if (progress >= 100) {
//             setIsLoading(false);
//             setProgress(0); // Reset progress after completion
//         }
//       }, [isLoading, progress]);

//     // Listen for route changes to hide the loading bar when navigation completes
//     useEffect(() => {
//         setIsLoading(true);
//         setProgress(30); // Initial loading progress
    
//         const timeout = setTimeout(() => {
//           setIsLoading(false); // Stop loading after navigation completes
//           setProgress(100);
//         }, 500); // Delay for effect
    
//         // Cleanup
//         return () => clearTimeout(timeout);
//       }, [usePathname()]); // Run when the path changes

//     // Function to handle logout
//     const handleLogout = async () => {
//         setIsLoading(true);
//         try {
//             // Make a request to the logout API
//             const response = await axios.post('/api/auth/logout');
            
//             if (response.status === 200) {
//                 // Optionally, show a success toast
//                 toast({
//                     title: 'Login Successful',
//                     description: 'You have been logged in successfully.',
//                   });

//                 // Redirect to login page
//                 router.push('/');
//             }
//         } catch (error) {
//             // Handle errors (e.g., show an error toast)
//             toast({
//                 title: 'Logout Failed',
//                 description: 'An error occurred while logging out.',
//                 variant: 'destructive',
//             });
//         } finally {
//             setIsLoading(false);
//         }
//     };
//     return(
//         <section className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] ">
//             {isLoading && <LoadingBar progress={progress} />} {/* Loading Bar */}
//             <div className="hidden border-r bg-muted/40 md:block">
//                 <div className="flex h-full max-h-screen flex-col gap-2">
//                 <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
//                     <Link href="/admin" className="flex items-center gap-1 font-semibold">
//                     <Image src={Logo} alt="Logo" className="size-10"/>
//                     <h3 className="text-xl font-semibold tracking-tight"><span className="text-primary">Krypton</span>Solutions</h3>
//                     </Link>
//                 </div>
//                 <div className="flex-1">
//                     <nav className=" grid items-start px-2 font-medium lg:px-4">
//                         <AdminItems handleNavClick={handleNavClick}/>
//                     </nav>
//                 </div>
//                 </div>
//             </div>
//             <div>
//                 <header className='flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6'>
//                 <h1 className="text-lg font-semibold text-gray-700 tracking-wide hidden lg:block dark:text-gray-300">
//                     Admin Panel
//                 </h1>
//                 <div className='ml-auto flex items-center gap-x-5'>
//                     <ThemeToggle/>
//                 <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                         <Button variant='secondary' size='icon' className='rounded-full' >
//                         <CircleUser className='h-5 w-5'/>
//                         </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align='end'>
//                         <DropdownMenuItem>
//                         <Settings className="w-4 h-4 mr-2" />
//                         <span>Settings</span>
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={handleLogout}><LogOutIcon className="w-4 h-4 mr-2" /><span>Logout</span></DropdownMenuItem>
//                     </DropdownMenuContent>
//                 </DropdownMenu>
//                 </div>
//                 </header>
//                 <main className='flex flay-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
//                     {children}
//                 </main>
//             </div>
//         </section>
//     )
// }


// New Code
"use client";
import Logo from "@/components/logo.svg";
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
import FloatingChatbot from "@/components/ui/FloatingChatbot";
import NotificationBell from "@/components/ui/NotifcationBell";
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
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Bell, FileChartLine, Logs, MonitorCheck, Settings, ShieldCheck, Users } from "lucide-react"; // Assuming LayoutDashboard was removed
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export const navLinks = [
  // { title: "Dashboard Overview", url: "/oem/dashboard", icon: LayoutDashboard }, // Make sure LayoutDashboard is imported if used
  { title: "Claim Analysis", url: "/oem/claim-analysis", icon: Logs },
  { title: "Monitor Claims", url: "/oem/monitor-claims", icon: FileChartLine },
  { title: "Product Reporting", url: "/oem/product-reporting", icon: Users },
  { title: "Update Claims Status", url: "/oem/update-claim-status", icon: ShieldCheck },
  { title: "SLA Monitoring", url: "/oem/sla-monitor", icon: MonitorCheck },
  { title: "Notifications Settings", url: "/oem/notification-settings", icon: Bell, restricted: false },
];

const breadcrumbMapping: Record<string, string> = {
  "oem": "OEM Panel",
  // "dashboard": "Dashboard Overview",
  "claim-analysis": "Claim Analysis",
  "monitor-claims": "Monitor Claims",
  "product-reporting": "Product Reporting",
  "sla-monitor": "SLA Monitoring",
  "update-claim-status": "Update Claims Status",
};

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const path = usePathname();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
              <Link href="/oem" className="flex flex-col items-center w-full">
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
          {navLinks.map((link, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton asChild>
              <Link
                href={link.url}
                className={cn(
                  path.startsWith(link.url) ? 'bg-muted text-primary font-bold' : 'text-muted-foreground',
                  'flex items-center gap-4 rounded-lg px-5 py-3 transition-all hover:bg-muted hover:text-primary/80'
                )}
              >
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
                href="/oem/settings"
                className={`flex items-center gap-2 ${path === "/oem/settings" ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary/80'}`} // Corrected template literal and added hover style for non-active
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

export default function OemLayout({ children }: { children: React.ReactNode }) { // Renamed for clarity if this is an OEM layout
  const router = useRouter();
  const path = usePathname();
  const [isLoading, setIsLoading] = useState(false); // Used for both route changes and logout
  const [progress, setProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); // To defer client-side only components

  useEffect(() => {
    setIsClient(true); // Set to true after the initial server render and client mount
  }, []);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | undefined;
    let completionTimeout: NodeJS.Timeout | undefined;

    const startRouteChange = () => {
      setIsLoading(true);
      setProgress(10);

      progressInterval = setInterval(() => {
        setProgress(prev => {
          const nextProgress = prev + Math.floor(Math.random() * 10) + 5;
          return nextProgress > 90 ? 90 : nextProgress;
        });
      }, 200);

      completionTimeout = setTimeout(() => {
        completeLoading();
      }, 1000);
    };

    const completeLoading = () => {
      if (progressInterval) clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    };

    // Start loading on path change, including initial load
    // (The effect runs after mount, path is available)
    startRouteChange();

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (completionTimeout) clearTimeout(completionTimeout);
      // Ensure loading state is reset if component unmounts during loading
      if (isLoading) { // Check current isLoading state
        setIsLoading(false);
        setProgress(0);
      }
    };
  }, [path]); // Re-run effect when path changes

  const handleLogout = async () => {
    setIsLoading(true); // This will trigger the progress bar via the useEffect listening to path (after router.push)
                       // or you can manage progress separately for logout if desired.
                       // For simplicity, current setup shows progress bar during logout then during navigation.
    setProgress(30); // Optionally set an initial progress for the logout action itself

    try {
      const response = await axios.post('/api/auth/logout');
      if (response.status === 200) {
        setProgress(70);
        toast({
          title: 'Logout Successful',
          description: 'You have been logged out.'
        });
        router.push('/'); // This navigation will trigger the path useEffect and its progress bar
      } else {
        // Handle non-200 success statuses if your API returns them
        toast({
          title: 'Logout Potentially Incomplete',
          description: `Server responded with status: ${response.status}`,
          variant: 'default'
        });
        // Still attempt to navigate or clear local session state
        router.push('/');
      }
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'An error occurred while trying to log out.',
        variant: 'destructive'
      });
      // Even on error, you might want to clear client-side session and redirect
      // For example: clearAuthToken(); router.push('/');
      // For now, we just show the toast. The progress bar might get stuck if setIsLoading(false) isn't called.
      // The finally block handles resetting isLoading.
    } finally {
      // The progress bar for navigation (router.push) will complete via the path useEffect.
      // If router.push doesn't happen due to an error before it,
      // we might need to ensure setIsLoading(false) here.
      // However, the path useEffect's cleanup or next run should handle it.
      // To be safe, if not navigating:
      // if (!router.asPath.startsWith('/')) { // or some other check if navigation didn't occur
      //    setIsLoading(false);
      //    setProgress(0);
      // }
      // For now, relying on path useEffect for completion.
      // If logout action itself needs a separate loading indicator beyond the page transition one:
      // setProgress(100); // Mark logout action progress complete
      // setTimeout(() => {
      //   setIsLoading(false); // Reset general loading
      //   setProgress(0);
      // }, 300);
      // Current setup: The router.push('/') will trigger the main progress bar.
      // The `isLoading` state set here will be reset by the path useEffect.
    }
  };

  return (
    <SidebarProvider>
      {/* Loading Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-[100]"> {/* Ensure high z-index */}
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }} // Corrected template literal
          />
        </div>
      )}
      <AppSidebar />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4 z-50"> {/* z-index for header */}
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
                      {isLast ? (
                        <BreadcrumbPage>{displayName}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={href}>{displayName}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-x-5">
            {isClient && <NotificationBell />}
            {isClient && <FloatingChatbot />}
            {isClient && <ThemeToggle />}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">Logout</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Logout</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to log out? This will end your session.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDialogOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoading} // This button will be disabled during page transitions too
                  >
                    {isLoading ? "Processing..." : "Logout"}
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