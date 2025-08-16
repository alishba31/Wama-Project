// // app/client/claim-status/page.tsx
// "use client";
// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function ClaimStatus() {
//   const [claims, setClaims] = useState([]);

//   useEffect(() => {
//     axios.get("/api/client/claim-status")
//       .then((res) => setClaims(res.data))
//       .catch((err) => console.error("Failed to load claims", err));
//   }, []);

//   return (
//     <div>
//       <h1>Claim Status</h1>
//       <ul>
//         {claims.map((claim: any) => (
//           <li key={claim.id}>
//             Serial Number: {claim.serialNumber} | Status: {claim.status} | Last Updated: {new Date(claim.updatedAt).toLocaleString()}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


// New Code
// "use client";
// import { Badge } from "@/components/ui/badge"; // ShadCN Badge
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { toast } from "@/hooks/use-toast"; // For toast notifications
// import axios from "axios";
// import { useEffect, useState } from "react";

// export default function ClaimStatus() {
//   const [claims, setClaims] = useState([]);

//   // Fetch the claim status from the API
//   useEffect(() => {
//     axios.get("/api/client/claim-status")
//       .then((res) => setClaims(res.data))
//       .catch((err) => {
//         console.error("Failed to load claims", err);
//         toast({
//           title: "Error",
//           description: "Failed to load claims data.",
//           variant: "destructive",
//         });
//       });
//   }, []);

//   // Function to render the badge based on claim status
//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "PENDING":
//         return <Badge variant="outline" className="bg-red-500/10 text-red-500">Pending</Badge>;
//       case "IN_PROGRESS":
//         return <Badge variant="outline" className="bg-orange-500/10 text-orange-500">In Progress</Badge>;
//       case "COMPLETED":
//         return <Badge variant="outline" className="bg-green-500/10 text-green-500">Completed</Badge>;
//       default:
//         return <Badge variant="outline">Unknown</Badge>;
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center max-h-screen p-4">
//       <Card className="w-full max-w-4xl shadow-lg">
//         <CardHeader className="text-center">
//           <CardTitle className="text-2xl font-semibold">Claim Status</CardTitle>
//           <CardDescription>View the current status of your claims</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {claims.length === 0 ? (
//             <p className="text-gray-600">No claims available.</p>
//           ) : (
//             <Table className="min-w-full">
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Serial Number</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Last Updated</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {claims.map((claim: any) => (
//                   <TableRow key={claim.id}>
//                     <TableCell>{claim.serialNumber}</TableCell>
//                     <TableCell>{getStatusBadge(claim.status)}</TableCell>
//                     <TableCell>{new Date(claim.updatedAt).toLocaleString()}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { ArrowLeft, Logs } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TroubleTicketStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "CLOSED" | string;

interface TroubleTicket {
  id: number;
  title: string;
  formSubmissionId: number;
  adminStatus: TroubleTicketStatus;
  oemStatus: TroubleTicketStatus;
  remarks: string;
  updatedAt: string;
  escalationLevel: number | null;
  lastEscalationLevel: number | null; // Assuming this was meant to be lastEscalationLevel not lastEscalatedAt if it's a number
}

export default function TroubleTickets() {
  const [tickets, setTickets] = useState<TroubleTicket[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchTroubleTickets();
  }, []);

  const fetchTroubleTickets = async () => {
    try {
      const res = await axios.get("/api/client/claim-status");
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to load trouble tickets", err);
      toast({
        title: "Error",
        description: "Failed to load trouble ticket data.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: TroubleTicketStatus) => {
    const statusConfig = {
      PENDING: { bg: "bg-yellow-500/10", text: "text-yellow-600" }, // Adjusted for better visibility
      IN_PROGRESS: { bg: "bg-blue-500/10", text: "text-blue-600" },
      COMPLETED: { bg: "bg-green-500/10", text: "text-green-600" },
      REJECTED: { bg: "bg-red-500/10", text: "text-red-600" },
      CLOSED: { bg: "bg-gray-500/10", text: "text-gray-500" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: "bg-slate-500/10", // Fallback status color
      text: "text-slate-500",
    };

    return (
      <Badge variant="outline" className={`px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
        {status.replace(/_/g, " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    // Added min-h-screen and a subtle background to the page for better context
    <div className="flex flex-col items-center justify-start min-h-screen p-4">
      {/* Adjusted Card width and max-height for better screen utilization */}
      <Card className="w-full max-w-7xl shadow-lg max-h-[calc(100vh-4rem)] flex flex-col">
        <CardHeader className="border-b"> {/* Added border for visual separation */}
          <div className="flex items-center">
            <Button size={'icon'} variant={'outline'} onClick={() => router.back()} className="flex items-center mr-4">
              <ArrowLeft className="size-5" />
            </Button>
            <Logs className="w-7 h-7 text-primary mr-2" />
            <CardTitle className="text-2xl font-semibold">Trouble Tickets</CardTitle>
          </div>
        </CardHeader>
        {/* CardContent will now handle the scrolling of the table body if Card itself doesn't overflow */}
        <CardContent className="flex-grow overflow-y-auto p-0"> {/* p-0 to allow table to use full width */}
          {tickets.length === 0 ? (
            <p className="text-gray-600 text-center py-10">No trouble tickets available.</p>
          ) : (
            <div className="overflow-x-auto"> {/* This div handles horizontal scrolling for the table */}
              <Table className="min-w-full"> {/* Ensure table takes at least full width */}
                <TableHeader className="sticky top-0 z-10 bg-card">
                  {/* Applied sticky, top-0, z-index, and background to the TableHeader */}
                  {/* bg-card ensures it uses the card's background color. Could also be bg-background or bg-muted */}
                  <TableRow>
                    <TableHead className="whitespace-nowrap px-4 py-3">Ticket ID</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-3">Title</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-3">Form ID</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-3">Admin Status</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-3">OEM Status</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-3">Remarks</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-3 text-center">Escalation</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-3 text-center">Last Escalation</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-3 text-right">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium px-4 py-3">{ticket.id}</TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="max-w-xs truncate" title={ticket.title}>
                          {ticket.title}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">{ticket.formSubmissionId}</TableCell>
                      <TableCell className="px-4 py-3">{getStatusBadge(ticket.adminStatus)}</TableCell>
                      <TableCell className="px-4 py-3">{getStatusBadge(ticket.oemStatus)}</TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="max-w-sm truncate" title={ticket.remarks}>
                          {ticket.remarks || "N/A"} {/* Display remarks as text */}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">{ticket.escalationLevel ?? "N/A"}</TableCell>
                      <TableCell className="px-4 py-3 text-center">{ticket.lastEscalationLevel ?? "N/A"}</TableCell>
                      <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                        {new Date(ticket.updatedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}