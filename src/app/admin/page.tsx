// "use client";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import axios from "axios";
// import html2canvas from "html2canvas";
// import { Download, Loader2 } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import { Area, AreaChart, Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// const COLORS = {
//   COMPLETED: "#22c55e",
//   IN_PROGRESS: "#3b82f6",
//   PENDING: "#ef4444",
//   MET: "#10b981",
//   BREACHED: "#f43f5e",
//   ACTIVE: "#f59e0b",
// };

// interface TicketDataItem {
//   name: string;
//   value: number;
//   percent: string; // Already a string like "0.333" or "0"
//   color: string;
// }

// interface SLADataItem {
//   name: string;
//   value: number;
//   color: string;
// }

// interface TimelineDataItem {
//   date: string;
//   Met: number;
//   Breached: number;
//   Active: number;
// }

// export default function Dashboard() {
//   const [hasMounted, setHasMounted] = useState(false);
//   const [ticketData, setTicketData] = useState<TicketDataItem[]>([]);
//   const [slaData, setSlaData] = useState<SLADataItem[]>([]);
//   const [timelineData, setTimelineData] = useState<TimelineDataItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string>("");
//   const dashboardRef = useRef<HTMLDivElement>(null);
//   const [greeting, setGreeting] = useState("");
//   const [userName, setUserName] = useState("");
//   const [lastUpdated, setLastUpdated] = useState("");

//   useEffect(() => {
//     setHasMounted(true);
//   }, []);

//   useEffect(() => {
//     if (!hasMounted) return; // Ensure this effect only runs after mounting

//     const now = new Date();
//     // Set lastUpdated ensuring it's client-side determined after mount
//     setLastUpdated(now.toLocaleString());

//     const fetchUserData = async () => {
//       try {
//         const response = await axios.get("/api/get-users");
//         setUserName(response.data.user?.name || "Admin");

//         const currentHour = now.getHours(); // Based on client's `now`
//         if (currentHour < 12) setGreeting("Good Morning");
//         else if (currentHour < 18) setGreeting("Good Afternoon");
//         else setGreeting("Good Evening");
//       } catch {
//         setUserName("Admin");
//         setGreeting("Welcome"); // Default greeting on error
//       }
//     };

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [ticketsRes, slaRes] = await Promise.all([
//           axios.get("/api/tickets/summary"),
//           axios.get("/api/sla/summary"),
//         ]);

//         const {
//           totalTickets,
//           solvedTickets,
//           pendingTickets,
//           inProgressTickets,
//         } = ticketsRes.data;

//         setTicketData([
//           {
//             name: "Completed",
//             value: solvedTickets,
//             percent: totalTickets > 0 ? (solvedTickets / totalTickets).toFixed(3) : "0",
//             color: COLORS.COMPLETED,
//           },
//           {
//             name: "In Progress",
//             value: inProgressTickets,
//             percent: totalTickets > 0 ? (inProgressTickets / totalTickets).toFixed(3) : "0",
//             color: COLORS.IN_PROGRESS,
//           },
//           {
//             name: "Pending",
//             value: pendingTickets,
//             percent: totalTickets > 0 ? (pendingTickets / totalTickets).toFixed(3) : "0",
//             color: COLORS.PENDING,
//           },
//         ]);

//         const { metSLAs, breachedSLAs, activeSLAs, slaTimelineData } = slaRes.data;

//         setSlaData([
//           { name: "Met SLA", value: metSLAs, color: COLORS.MET },
//           { name: "Breached SLA", value: breachedSLAs, color: COLORS.BREACHED },
//           { name: "Active", value: activeSLAs, color: COLORS.ACTIVE },
//         ]);

//         setTimelineData(slaTimelineData.map((item: any) => ({
//           date: item.date,
//           Met: item.met,
//           Breached: item.breached,
//           Active: item.active,
//         })));

//         setLoading(false);
//       } catch (err) {
//         console.error("Failed to load dashboard data:", err);
//         setError("Failed to load dashboard data. Please try again later.");
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//     fetchData();
//   }, [hasMounted]); // Re-run if hasMounted changes (though it only changes once)

//   const handleDownload = async () => {
//     if (dashboardRef.current) {
//       const canvas = await html2canvas(dashboardRef.current);
//       const link = document.createElement("a");
//       link.download = "dashboard-snapshot.png";
//       link.href = canvas.toDataURL();
//       link.click();
//     }
//   };

//   if (!hasMounted) return null; // Crucial: Prevent hydration mismatch by rendering nothing on server/initial client

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-red-500 text-lg">{error}</p>
//       </div>
//     );
//   }

//   // Helper for SLA percentage display
//   const getSlaPercentageText = (slaName: "Met SLA" | "Breached SLA" | "Active") => {
//     const totalSlaValue = slaData.reduce((sum, item) => sum + item.value, 0);
//     if (totalSlaValue === 0) return '0% of total';
//     const specificSlaValue = slaData.find(item => item.name === slaName)?.value || 0;
//     const percentage = Math.round((specificSlaValue / totalSlaValue) * 100);
//     return `${percentage}% of total`;
//   };


//   return (
//     <div className="p-6 space-y-6" ref={dashboardRef}>
//       <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold">
//               {greeting || "Welcome"}, <span className="text-blue-200">{userName || "Admin"}</span>!
//             </h1>
//             <p className="text-blue-100">Welcome to your Admin Dashboard</p>
//           </div>
//           {lastUpdated && ( // Only render if lastUpdated is set
//             <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
//               <p className="text-sm font-medium">Last updated: {lastUpdated}</p>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold"></h1>
//         <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
//           <Download className="w-4 h-4" /> Export Dashboard
//         </Button>
//       </div>

//       {/* Stats Overview Cards - 8 cards in 2 rows */}
//       <div className="space-y-4">
//         {/* First Row */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           {/* Total Tickets */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {ticketData.reduce((sum, item) => sum + item.value, 0)}
//               </div>
//               <p className="text-xs text-muted-foreground">All tickets created</p>
//             </CardContent>
//           </Card>

//           {/* Completed Tickets */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Completed Tickets</CardTitle>
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></svg>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold" style={{ color: COLORS.COMPLETED }}>
//                 {ticketData.find(item => item.name === "Completed")?.value || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 {/* percent is already a string "0.xxx" or "0" */}
//                 {`${(Number(ticketData.find(item => item.name === "Completed")?.percent || "0") * 100).toFixed(1)}% of total`}
//               </p>
//             </CardContent>
//           </Card>

//           {/* SLA Met */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">SLA Met</CardTitle>
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold" style={{ color: COLORS.MET }}>
//                 {slaData.find(item => item.name === "Met SLA")?.value || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 {getSlaPercentageText("Met SLA")}
//               </p>
//             </CardContent>
//           </Card>

//           {/* SLA Breached */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">SLA Breached</CardTitle>
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold" style={{ color: COLORS.BREACHED }}>
//                 {slaData.find(item => item.name === "Breached SLA")?.value || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 {getSlaPercentageText("Breached SLA")}
//               </p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Second Row */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           {/* Pending Tickets */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Pending Tickets</CardTitle>
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold" style={{ color: COLORS.PENDING }}>
//                 {ticketData.find(item => item.name === "Pending")?.value || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 {`${(Number(ticketData.find(item => item.name === "Pending")?.percent || "0") * 100).toFixed(1)}% of total`}
//               </p>
//             </CardContent>
//           </Card>

//           {/* In Progress Tickets */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">In Progress</CardTitle>
//                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold" style={{ color: COLORS.IN_PROGRESS }}>
//                 {ticketData.find(item => item.name === "In Progress")?.value || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                  {`${(Number(ticketData.find(item => item.name === "In Progress")?.percent || "0") * 100).toFixed(1)}% of total`}
//               </p>
//             </CardContent>
//           </Card>

//           {/* Total SLAs */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Total SLAs</CardTitle>
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v4" /><path d="m16.24 7.76 2.83-2.83" /><path d="M18 12h4" /><path d="m16.24 16.24 2.83 2.83" /><path d="M12 18v4" /><path d="m7.76 16.24-2.83 2.83" /><path d="M6 12H2" /><path d="m7.76 7.76-2.83-2.83" /></svg>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {slaData.reduce((sum, item) => sum + item.value, 0)}
//               </div>
//               <p className="text-xs text-muted-foreground">All SLA records</p>
//             </CardContent>
//           </Card>

//           {/* Active SLAs */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium">Active SLAs</CardTitle>
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold" style={{ color: COLORS.ACTIVE }}>
//                 {slaData.find(item => item.name === "Active")?.value || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Currently monitoring
//               </p>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Main Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Ticket Status Pie Chart */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Ticket Status Distribution</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[300px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={ticketData}
//                     dataKey="value"
//                     nameKey="name"
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={80}
//                     label={({ name, percent }) => `${name}: ${(Number(percent) * 100).toFixed(1)}%`}
//                   >
//                     {ticketData.map((entry, index) => (
//                       <Cell key={`cell-ticket-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip
//                     formatter={(value: number, name: string, props: any) => [
//                       value,
//                       `${(Number(props.payload.percent) * 100).toFixed(1)}% of total tickets for ${name}` // Adjusted tooltip
//                     ]}
//                   />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         {/* SLA Status Bar Chart */}
//         <Card>
//           <CardHeader>
//             <CardTitle>SLA Compliance</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-[300px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={slaData}>
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar
//                     dataKey="value"
//                     radius={[4, 4, 0, 0]}
//                   >
//                     {slaData.map((entry, index) => (
//                       <Cell key={`cell-sla-${index}`} fill={entry.color} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* SLA Timeline Area Chart */}
//       <Card>
//         <CardHeader>
//           <CardTitle>SLA Performance Over Time</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-[400px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={timelineData}>
//                 <defs>
//                   <linearGradient id="colorMet" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor={COLORS.MET} stopOpacity={0.8} />
//                     <stop offset="95%" stopColor={COLORS.MET} stopOpacity={0} />
//                   </linearGradient>
//                   <linearGradient id="colorBreached" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor={COLORS.BREACHED} stopOpacity={0.8} />
//                     <stop offset="95%" stopColor={COLORS.BREACHED} stopOpacity={0} />
//                   </linearGradient>
//                   <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor={COLORS.ACTIVE} stopOpacity={0.8} />
//                     <stop offset="95%" stopColor={COLORS.ACTIVE} stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Area type="monotone" dataKey="Met" stackId="1" stroke={COLORS.MET} fillOpacity={1} fill="url(#colorMet)" />
//                 <Area type="monotone" dataKey="Breached" stackId="1" stroke={COLORS.BREACHED} fillOpacity={1} fill="url(#colorBreached)" />
//                 <Area type="monotone" dataKey="Active" stackId="1" stroke={COLORS.ACTIVE} fillOpacity={1} fill="url(#colorActive)" />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import html2canvas from "html2canvas";
import { Download, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation"; // <-- STEP 1: Import useSearchParams
import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = {
  COMPLETED: "#22c55e",
  IN_PROGRESS: "#3b82f6",
  PENDING: "#ef4444",
  MET: "#10b981",
  BREACHED: "#f43f5e",
  ACTIVE: "#f59e0b",
};

interface TicketDataItem {
  name: string;
  value: number;
  percent: string;
  color: string;
}

interface SLADataItem {
  name: string;
  value: number;
  color: string;
}

interface TimelineDataItem {
  date: string;
  Met: number;
  Breached: number;
  Active: number;
}

export default function Dashboard() {
  const searchParams = useSearchParams(); // <-- STEP 1: Get search params
  const clientName = searchParams.get("client"); // Get the value of 'client' from URL

  const [hasMounted, setHasMounted] = useState(false);
  const [ticketData, setTicketData] = useState<TicketDataItem[]>([]);
  const [slaData, setSlaData] = useState<SLADataItem[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const now = new Date();
    setLastUpdated(now.toLocaleString());

    const fetchUserData = async () => {
      try {
        // This fetch doesn't need to be filtered by client
        const response = await axios.get("/api/get-users");
        setUserName(response.data.user?.name || "Admin");
        const currentHour = now.getHours();
        if (currentHour < 12) setGreeting("Good Morning");
        else if (currentHour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
      } catch {
        setUserName("Admin");
        setGreeting("Welcome");
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(""); // Reset error on new fetch

        // <-- STEP 3: Dynamically build API URLs with the client filter
        const ticketsApiUrl = new URL("/api/tickets/summary", window.location.origin);
        const slaApiUrl = new URL("/api/sla/summary", window.location.origin);

        if (clientName) {
          ticketsApiUrl.searchParams.set("client", clientName);
          slaApiUrl.searchParams.set("client", clientName);
        }
        // --- End of dynamic URL building ---

        const [ticketsRes, slaRes] = await Promise.all([
          axios.get(ticketsApiUrl.toString()),
          axios.get(slaApiUrl.toString()),
        ]);

        const {
          totalTickets,
          solvedTickets,
          pendingTickets,
          inProgressTickets,
        } = ticketsRes.data;

        setTicketData([
          { name: "Completed", value: solvedTickets, percent: totalTickets > 0 ? (solvedTickets / totalTickets).toFixed(3) : "0", color: COLORS.COMPLETED },
          { name: "In Progress", value: inProgressTickets, percent: totalTickets > 0 ? (inProgressTickets / totalTickets).toFixed(3) : "0", color: COLORS.IN_PROGRESS },
          { name: "Pending", value: pendingTickets, percent: totalTickets > 0 ? (pendingTickets / totalTickets).toFixed(3) : "0", color: COLORS.PENDING },
        ]);

        const { metSLAs, breachedSLAs, activeSLAs, slaTimelineData } = slaRes.data;

        setSlaData([
          { name: "Met SLA", value: metSLAs, color: COLORS.MET },
          { name: "Breached SLA", value: breachedSLAs, color: COLORS.BREACHED },
          { name: "Active", value: activeSLAs, color: COLORS.ACTIVE },
        ]);

        setTimelineData(slaTimelineData.map((item: any) => ({
          date: item.date, Met: item.met, Breached: item.breached, Active: item.active
        })));

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError(`Failed to load data. ${clientName ? `Could not find data for client "${clientName}".` : "Please try again later."}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchData();
  }, [hasMounted, clientName]); // <-- STEP 2: Add clientName to dependency array

  const handleDownload = async () => {
    if (dashboardRef.current) {
      const canvas = await html2canvas(dashboardRef.current);
      const link = document.createElement("a");
      link.download = `dashboard-snapshot${clientName ? `-${clientName}` : ''}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (!hasMounted) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        <span className="ml-4 text-lg">Loading Dashboard Data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  const getSlaPercentageText = (slaName: "Met SLA" | "Breached SLA" | "Active") => {
    const totalSlaValue = slaData.reduce((sum, item) => sum + item.value, 0);
    if (totalSlaValue === 0) return '0% of total';
    const specificSlaValue = slaData.find(item => item.name === slaName)?.value || 0;
    const percentage = Math.round((specificSlaValue / totalSlaValue) * 100);
    return `${percentage}% of total`;
  };

  return (
    <div className="p-6 space-y-6" ref={dashboardRef}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {greeting || "Welcome"}, <span className="text-blue-200">{userName || "Admin"}</span>!
            </h1>
            {/* <-- STEP 4: Update UI to show filter status --> */}
            <p className="text-blue-100 mt-1">
              {clientName
                ? `Displaying filtered data for client: "${clientName}"`
                : "Welcome to your Admin Dashboard Overview"}
            </p>
          </div>
          {lastUpdated && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-sm font-medium">Last updated: {lastUpdated}</p>
            </div>
          )}
        </div>
      </div>
        {/* ... Rest of your JSX is the same ... */}
        {/* ... (Cards, Charts, etc.) ... */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold"></h1>
        <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Dashboard
        </Button>
      </div>
       <div className="space-y-4">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ticketData.reduce((sum, item) => sum + item.value, 0)}
              </div>
              <p className="text-xs text-muted-foreground">All tickets created</p>
            </CardContent>
          </Card>

          {/* Completed Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Tickets</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: COLORS.COMPLETED }}>
                {ticketData.find(item => item.name === "Completed")?.value || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {/* percent is already a string "0.xxx" or "0" */}
                {`${(Number(ticketData.find(item => item.name === "Completed")?.percent || "0") * 100).toFixed(1)}% of total`}
              </p>
            </CardContent>
          </Card>

          {/* SLA Met */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SLA Met</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: COLORS.MET }}>
                {slaData.find(item => item.name === "Met SLA")?.value || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {getSlaPercentageText("Met SLA")}
              </p>
            </CardContent>
          </Card>

          {/* SLA Breached */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SLA Breached</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: COLORS.BREACHED }}>
                {slaData.find(item => item.name === "Breached SLA")?.value || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {getSlaPercentageText("Breached SLA")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Pending Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Tickets</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: COLORS.PENDING }}>
                {ticketData.find(item => item.name === "Pending")?.value || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {`${(Number(ticketData.find(item => item.name === "Pending")?.percent || "0") * 100).toFixed(1)}% of total`}
              </p>
            </CardContent>
          </Card>

          {/* In Progress Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: COLORS.IN_PROGRESS }}>
                {ticketData.find(item => item.name === "In Progress")?.value || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                 {`${(Number(ticketData.find(item => item.name === "In Progress")?.percent || "0") * 100).toFixed(1)}% of total`}
              </p>
            </CardContent>
          </Card>

          {/* Total SLAs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total SLAs</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v4" /><path d="m16.24 7.76 2.83-2.83" /><path d="M18 12h4" /><path d="m16.24 16.24 2.83 2.83" /><path d="M12 18v4" /><path d="m7.76 16.24-2.83 2.83" /><path d="M6 12H2" /><path d="m7.76 7.76-2.83-2.83" /></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {slaData.reduce((sum, item) => sum + item.value, 0)}
              </div>
              <p className="text-xs text-muted-foreground">All SLA records</p>
            </CardContent>
          </Card>

          {/* Active SLAs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active SLAs</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: COLORS.ACTIVE }}>
                {slaData.find(item => item.name === "Active")?.value || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently monitoring
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(Number(percent) * 100).toFixed(1)}%`}
                  >
                    {ticketData.map((entry, index) => (
                      <Cell key={`cell-ticket-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      value,
                      `${(Number(props.payload.percent) * 100).toFixed(1)}% of total tickets for ${name}` // Adjusted tooltip
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* SLA Status Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>SLA Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slaData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                  >
                    {slaData.map((entry, index) => (
                      <Cell key={`cell-sla-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Timeline Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorMet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.MET} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.MET} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBreached" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.BREACHED} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.BREACHED} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.ACTIVE} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.ACTIVE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Met" stackId="1" stroke={COLORS.MET} fillOpacity={1} fill="url(#colorMet)" />
                <Area type="monotone" dataKey="Breached" stackId="1" stroke={COLORS.BREACHED} fillOpacity={1} fill="url(#colorBreached)" />
                <Area type="monotone" dataKey="Active" stackId="1" stroke={COLORS.ACTIVE} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}