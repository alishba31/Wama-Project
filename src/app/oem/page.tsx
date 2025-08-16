// "use client";


// import axios from "axios";
// import { useEffect, useState } from "react";

// export default function Admin() {
//   const [greeting, setGreeting] = useState("");
//   const [userName, setUserName] = useState("");

//   useEffect(() => {
//     // Fetch the user name from the API
//     const fetchUserName = async () => {
//       try {
//         const response = await axios.get("/api/get-users"); // Adjust the endpoint as per your routing setup
//         setUserName(response.data.user?.name || "OEM"); // Default fallback name
//       } catch (error) {
//         console.error("Error fetching user name:", error);
//         setUserName("OEM"); // Fallback to a default name if fetching fails
//       }
//     };

//     fetchUserName();

//     // Set greeting based on the current time
//     const currentHour = new Date().getHours();
//     if (currentHour < 12) {
//       setGreeting("Good Morning");
//     } else if (currentHour < 18) {
//       setGreeting("Good Afternoon");
//     } else {
//       setGreeting("Good Evening");
//     }
//   }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold">
//         {greeting}, {userName}!
//       </h1>
//       <p>Welcome to your OEM Center.</p>
//     </div>
//   );
// }



// New Code
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import html2canvas from "html2canvas";
import { Download, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = {
  COMPLETED: "#22c55e", // green
  IN_PROGRESS: "#3b82f6", // blue
  PENDING: "#ef4444", // red
  MET: "#10b981", // emerald
  BREACHED: "#f43f5e", // rose
  ACTIVE: "#f59e0b", // amber
};

export default function Level2Dashboard() {
  const [ticketData, setTicketData] = useState<any[]>([]);
  const [slaData, setSlaData] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const dashboardRef = useRef(null);
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleString());

    // Fetch user greeting and name
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/get-users");
        setUserName(response.data.user?.name || "Admin");
        
        const currentHour = now.getHours();
        if (currentHour < 12) {
          setGreeting("Good Morning");
        } else if (currentHour < 18) {
          setGreeting("Good Afternoon");
        } else {
          setGreeting("Good Evening");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserName("Admin");
        setGreeting("Welcome");
      }
    };
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [ticketsRes, slaRes] = await Promise.all([
          axios.get("/api/oem/tickets/summary"),
          axios.get("/api/oem/sla/summary"),
        ]);

        // Process ticket data
        const { 
          totalLevel2Tickets, 
          solvedLevel2Tickets, 
          pendingLevel2Tickets, 
          inProgressLevel2Tickets 
        } = ticketsRes.data;

        setTicketData([
          {
            name: "Completed",
            value: solvedLevel2Tickets,
            percent: totalLevel2Tickets > 0 
              ? ((solvedLevel2Tickets / totalLevel2Tickets) * 100).toFixed(1) 
              : "0",
            color: COLORS.COMPLETED,
          },
          {
            name: "In Progress",
            value: inProgressLevel2Tickets,
            percent: totalLevel2Tickets > 0 
              ? ((inProgressLevel2Tickets / totalLevel2Tickets) * 100).toFixed(1) 
              : "0",
            color: COLORS.IN_PROGRESS,
          },
          {
            name: "Pending",
            value: pendingLevel2Tickets,
            percent: totalLevel2Tickets > 0 
              ? ((pendingLevel2Tickets / totalLevel2Tickets) * 100).toFixed(1) 
              : "0",
            color: COLORS.PENDING,
          },
        ]);

        // Process SLA data
        const { metSLAs, breachedSLAs, activeSLAs, slaTimelineData } = slaRes.data;
        
        setSlaData([
          {
            name: "Met SLA",
            value: metSLAs,
            color: COLORS.MET,
          },
          {
            name: "Breached SLA",
            value: breachedSLAs,
            color: COLORS.BREACHED,
          },
          {
            name: "Active",
            value: activeSLAs,
            color: COLORS.ACTIVE,
          },
        ]);

        // Process timeline data
        setTimelineData(slaTimelineData.map((item: any) => ({
          date: item.date,
          Met: item.met,
          Breached: item.breached,
          Active: item.active,
        })));

        setLoading(false);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };
    fetchUserData();
    fetchData();
  }, []);

  const handleDownload = async () => {
    if (dashboardRef.current) {
      const canvas = await html2canvas(dashboardRef.current);
      const link = document.createElement("a");
      link.download = "level2-dashboard.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
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

  return (
    <div className="p-6 space-y-6" ref={dashboardRef}>

       <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {greeting}, <span className="text-blue-200">{userName}</span>!
            </h1>
            <p className="text-blue-100">Welcome to your OEM Dashboard</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-sm font-medium">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold"></h1>
        <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Dashboard
        </Button>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Level 2 Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {ticketData.reduce((sum, item) => sum + item.value, 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">SLA Met</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" style={{ color: COLORS.MET }}>
              {slaData.find(item => item.name === "Met SLA")?.value || 0}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">SLA Breached</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" style={{ color: COLORS.BREACHED }}>
              {slaData.find(item => item.name === "Breached SLA")?.value || 0}
            </p>
          </CardContent>
        </Card>
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
                    label={({ name, percent }) => `${name}: ${percent}%`}
                  >
                    {ticketData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [
                    value, 
                    `${props.payload.percent}% of total`
                  ]} />
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
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  >
                    {slaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
                <Area
                  type="monotone"
                  dataKey="Met"
                  stackId="1"
                  stroke={COLORS.MET}
                  fillOpacity={1}
                  fill="url(#colorMet)"
                />
                <Area
                  type="monotone"
                  dataKey="Breached"
                  stackId="1"
                  stroke={COLORS.BREACHED}
                  fillOpacity={1}
                  fill="url(#colorBreached)"
                />
                <Area
                  type="monotone"
                  dataKey="Active"
                  stackId="1"
                  stroke={COLORS.ACTIVE}
                  fillOpacity={1}
                  fill="url(#colorActive)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}