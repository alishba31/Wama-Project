// 'use client';
// import { ClientItems } from "@/components/client/ClientItems";
// import Logo from '@/components/logo.svg';
// import { Button } from '@/components/ui/button';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// import LoadingBar from "@/components/ui/loadingbartop";
// import { ThemeToggle } from '@/components/ui/theme-toggle';
// import { toast } from '@/hooks/use-toast'; // Assuming you're using shadcn's toast functionality
// import axios from 'axios'; // Axios for API calls
// import { CircleUser, LayoutDashboard, LogOutIcon, Logs, Settings, ShieldCheckIcon, Users } from "lucide-react";
// import Image from "next/image";
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation'; // Import the router for redirection
// import { ReactNode, useEffect, useState } from "react";

// export const navLinks = [
//     {
//         name: 'Dashboard Overview',
//         href: '/client/dashboard',
//         icon: LayoutDashboard
//     },
//     {
//         name: 'Claim History',
//         href: '/client/claim-history',
//         icon: Logs
//     },
//     {
//         name: 'Claim Status',
//         href: '/client/claim-status',
//         icon: ShieldCheckIcon
//     },
//     {
//         name: 'Submit Claim',
//         href: '/client/submit-claim',
//         icon: Users
//     },
    
// ];

// export default function ClientLayout({children} : {children: ReactNode}) {
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
//                 router.push('/auth/login');
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
//     return (
//         <section className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
//             {isLoading && <LoadingBar progress={progress} />} {/* Loading Bar for Logout */}
//             <div className="hidden border-r bg-muted/40 md:block">
//                 <div className="flex h-full max-h-screen flex-col gap-2">
//                     <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
//                         <Link href="/client" className="flex items-center gap-1 font-semibold">
//                             <Image src={Logo} alt="Logo" className="size-10"/>
//                             <h3 className="text-xl font-semibold tracking-tight"><span className="text-primary">Krypton</span>Solutions</h3>
//                         </Link>
//                     </div>
//                     <div className="flex-1">
//                     <nav className=" grid items-start px-2 font-medium lg:px-4">
//                         <ClientItems handleNavClick={handleNavClick}/>
//                     </nav>
//                 </div>
//                 </div>
//             </div>
//             <div>
//                 <header className='flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6'>
//                 <h1 className="text-lg font-semibold text-gray-700 tracking-wide hidden lg:block dark:text-gray-300">
//                     Client Panel
//                 </h1>
//                     <div className='ml-auto flex items-center gap-x-5'>
//                         <ThemeToggle/>
//                         <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                                 <Button variant='secondary' size='icon' className='rounded-full'>
//                                     <CircleUser className='h-5 w-5'/>
//                                 </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align='end'>
//                                 <DropdownMenuItem>
//                                     <Settings className="w-4 h-4 mr-2" />
//                                     <span>Settings</span>
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem onClick={handleLogout}><LogOutIcon className="w-4 h-4 mr-2" /><span>Logout</span></DropdownMenuItem>
//                             </DropdownMenuContent>
//                         </DropdownMenu>
//                     </div>
//                 </header>
//                 <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
//                     {children}
//                 </main>
//             </div>
//         </section>
//     );
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
import { Logs, Settings, ShieldCheckIcon, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export const navLinks = [
  // { title: "Dashboard Overview", url: "/client/dashboard", icon: LayoutDashboard },
  { title: "Claim History", url: "/client/claim-history", icon: Logs },
  { title: "Claim Status", url: "/client/claim-status", icon: ShieldCheckIcon },
  { title: "Submit Claim", url: "/client/submit-claim", icon: Users },
];

const breadcrumbMapping: Record<string, string> = {
  "client": "Client Panel",
    // "dashboard": "Dashboard Overview",
    "claim-analysis": "Claim History",
    "claim-status": "Claim Status",
    "submit-claim": "Submit Claim",
};

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const path = usePathname();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
              <Link href="/client" className="flex flex-col items-center w-full">
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
                href="/client/settings" 
                className={`flex items-center gap-2 ${path === "/client/settings" ? 'text-primary font-bold' : ''}`}
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
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let completionTimeout: NodeJS.Timeout;

    const startRouteChange = () => {
      setIsLoading(true);
      setProgress(10); // Start with 10% immediately

      // Simulate progressive loading
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const nextProgress = prev + Math.floor(Math.random() * 10) + 5;
          return nextProgress > 90 ? 90 : nextProgress; // Don't go to 100% yet
        });
      }, 200);

      // Complete after 1 second max (or when route changes)
      completionTimeout = setTimeout(() => {
        completeLoading();
      }, 1000);
    };

    const completeLoading = () => {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300); // Small delay after reaching 100%
    };

    startRouteChange();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completionTimeout);
    };
  }, [path]);

  const handleLogout = async () => {
    setIsLoading(true);
    setProgress(30); // Start progress on logout
    
    try {
      const response = await axios.post('/api/auth/logout');
      if (response.status === 200) {
        setProgress(70);
        toast({ 
          title: 'Logout Successful', 
          description: 'You have been logged out.' 
        });
        router.push('/');
      }
    } catch {
      toast({ 
        title: 'Logout Failed', 
        description: 'An error occurred.', 
        variant: 'destructive' 
      });
    } finally {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
    }
  };

  return (
    <SidebarProvider>
      {/* Loading Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <AppSidebar />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
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
                      {isLast ? <BreadcrumbPage>{displayName}</BreadcrumbPage> : <BreadcrumbLink href={href}>{displayName}</BreadcrumbLink>}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-x-5">

            <NotificationBell />
            <ThemeToggle />
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
                        disabled={isLoading}
                      >
                        {isLoading ? "Logging out..." : "Logout"}
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