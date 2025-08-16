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
//         setUserName(response.data.user?.name || "Admin"); // Default fallback name
//       } catch (error) {
//         console.error("Error fetching user name:", error);
//         setUserName("Admin"); // Fallback to a default name if fetching fails
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
//       <p>Welcome to your Client Center.</p>
//     </div>
//   );
// }


"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TicketStats = {
  total: number;
  admin: {
    completed: number;
    inProgress: number;
    pending: number;
  };
  oem: {
    completed: number;
    inProgress: number;
    pending: number;
  };
};

const COLORS = ["#22c55e", "#009CF5", "#FF0000"]; // green, blue, yellow

export default function Admin() {
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [ticketStats, setTicketStats] = useState<TicketStats>({
    total: 0,
    admin: {
      completed: 0,
      inProgress: 0,
      pending: 0,
    },
    oem: {
      completed: 0,
      inProgress: 0,
      pending: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize lastUpdated when component mounts
    setLastUpdated(new Date().toLocaleString());

    // Fetch the user name from the API
    const fetchUserName = async () => {
      try {
        const response = await axios.get("/api/get-users");
        setUserName(response.data.user?.name || "Admin");
      } catch (error) {
        console.error("Error fetching user name:", error);
        setUserName("Admin");
      }
    };
    fetchUserName();

    // Fetch ticket statistics
    const fetchTicketStats = async () => {
      try {
        const response = await axios.get("/api/client/claim-status");
        const tickets = response.data;

        const adminCompleted = tickets.filter(
          (ticket: any) =>
            ticket.adminStatus === "COMPLETED" ||
            ticket.adminStatus === "CLOSED"
        ).length;

        const adminInProgress = tickets.filter(
          (ticket: any) => ticket.adminStatus === "IN_PROGRESS"
        ).length;

        const adminPending = tickets.filter(
          (ticket: any) => ticket.adminStatus === "PENDING"
        ).length;

        const oemCompleted = tickets.filter(
          (ticket: any) =>
            ticket.oemStatus === "COMPLETED" || ticket.oemStatus === "CLOSED"
        ).length;

        const oemInProgress = tickets.filter(
          (ticket: any) => ticket.oemStatus === "IN_PROGRESS"
        ).length;

        const oemPending = tickets.filter(
          (ticket: any) => ticket.oemStatus === "PENDING"
        ).length;

        setTicketStats({
          total: tickets.length,
          admin: {
            completed: adminCompleted,
            inProgress: adminInProgress,
            pending: adminPending,
          },
          oem: {
            completed: oemCompleted,
            inProgress: oemInProgress,
            pending: oemPending,
          },
        });

        setLastUpdated(new Date().toLocaleString());
      } catch (error) {
        console.error("Error fetching ticket stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTicketStats();

    // Set greeting based on the current time
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  // Prepare data for charts
  const pieDataAdmin = [
    { name: "Completed", value: ticketStats.admin.completed },
    { name: "In Progress", value: ticketStats.admin.inProgress },
    { name: "Pending", value: ticketStats.admin.pending },
  ];

  const pieDataOEM = [
    { name: "Completed", value: ticketStats.oem.completed },
    { name: "In Progress", value: ticketStats.oem.inProgress },
    { name: "Pending", value: ticketStats.oem.pending },
  ];

  const barChartData = [
    {
      status: "Completed",
      Admin: ticketStats.admin.completed,
      OEM: ticketStats.oem.completed,
    },
    {
      status: "In Progress",
      Admin: ticketStats.admin.inProgress,
      OEM: ticketStats.oem.inProgress,
    },
    {
      status: "Pending",
      Admin: ticketStats.admin.pending,
      OEM: ticketStats.oem.pending,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {greeting}, <span className="text-blue-200">{userName}</span>!
            </h1>
            <p className="text-blue-100">Welcome to your Client Dashboard</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-sm font-medium">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </div>

      {loading ? (
        // Loading Skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Total Tickets */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.total}</div>
            </CardContent>
          </Card>

          {/* Pie Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Ticket Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieDataAdmin}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieDataAdmin.map((_, index) => (
                        <Cell
                          key={`cell-admin-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* OEM Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">OEM Ticket Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieDataOEM}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieDataOEM.map((_, index) => (
                        <Cell
                          key={`cell-oem-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Admin vs OEM Ticket Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barChartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Admin" fill="#3b82f6" />
                  <Bar dataKey="OEM" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
