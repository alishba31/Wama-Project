// "use client";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import axios from "axios";
// import { useEffect, useState } from "react";

// interface TroubleTicket {
//   id: number;
//   title: string;
//   adminStatus: string;
//   oemStatus: string;
//   remarks: string;
//   createdAt: string;
//   updatedAt: string;
//   escalationLevel: number;
//   lastEscalatedAt: string | null;
//   User: {
//     name: string;
//     email: string;
//   };
//   SLARecord: {
//     slaStatus: string;
//   };
// }

// export default function TroubleTickets() {
//   const [tickets, setTickets] = useState<TroubleTicket[]>([]);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchTickets();
//   }, []);

//   const fetchTickets = async () => {
//     try {
//       const res = await axios.get("/api/admin/claims");
//       const allTickets: TroubleTicket[] = res.data;

//       // Filter tickets with escalationLevel === 2
//       const escalatedTickets = allTickets.filter(ticket => ticket.escalationLevel === 2);

//       setTickets(escalatedTickets);
//     } catch (err: any) {
//       console.error("Failed to load trouble tickets", err);
//       setError(err.response?.data?.message || "Failed to load trouble tickets.");
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "PENDING":
//         return <Badge variant="outline" className="bg-red-500/10 text-red-500">Pending</Badge>;
//       case "IN_PROGRESS":
//         return <Badge variant="outline" className="bg-orange-500/10 text-orange-500">In Progress</Badge>;
//       case "COMPLETED":
//         return <Badge variant="outline" className="bg-green-500/10 text-green-500">Completed</Badge>;
//       default:
//         return <Badge variant="outline" className="bg-gray-500/10 text-gray-500">{status}</Badge>;
//     }
//   };

//   const getEscalationBadge = (level: number) => {
//     if (level > 0) {
//       return <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Escalated (Level {level})</Badge>;
//     }
//     return <Badge variant="outline" className="bg-gray-500/10 text-gray-500">No Escalation</Badge>;
//   };

//   return (
//     <div className="flex flex-col items-center justify-center max-h-screen p-2">
//       <Card className="w-full max-w-4xl">
//         <CardHeader>
//           <CardTitle>Trouble Tickets</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {error && <p className="text-red-500 mb-4">{error}</p>}
//           {tickets.length === 0 ? (
//             <p className="text-gray-600">No trouble tickets available</p>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>ID</TableHead>
//                   <TableHead>Title</TableHead>
//                   <TableHead>Admin Status</TableHead>
//                   <TableHead>OEM Status</TableHead>
//                   <TableHead>Remarks</TableHead>
//                   <TableHead>Escalation Level</TableHead>
//                   <TableHead>Last Escalated At</TableHead>
//                   <TableHead>Submitted By</TableHead>
//                   <TableHead>Created At</TableHead>
//                   <TableHead>Updated At</TableHead>
//                  <TableHead>SLA Status</TableHead>

//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {tickets.map((ticket) => (
//                   <TableRow key={ticket.id}>
//                     <TableCell>{ticket.id}</TableCell>
//                     <TableCell>{ticket.title}</TableCell>
//                     <TableCell>{getStatusBadge(ticket.adminStatus)}</TableCell>
//                     <TableCell>{getStatusBadge(ticket.oemStatus)}</TableCell>
//                     <TableCell>{ticket.remarks ?? "N/A"}</TableCell>
//                     <TableCell>{getEscalationBadge(ticket.escalationLevel)}</TableCell>
//                     <TableCell>
//                       {ticket.lastEscalatedAt
//                         ? new Date(ticket.lastEscalatedAt).toLocaleString()
//                         : "N/A"}
//                     </TableCell>
//                     <TableCell>
//                       {ticket.User.name} ({ticket.User.email})
//                     </TableCell>
//                     <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
//                     <TableCell>{new Date(ticket.updatedAt).toLocaleString()}</TableCell>
//                     <TableCell>{ticket.SLARecord?.slaStatus ?? "N/A"}</TableCell>

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



// New Code
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ArrowLeft, CheckCircle, ChevronDown, Clock, FileChartLine, Loader, MoreHorizontal, Search, X, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TroubleTicket {
  id: number;
  title: string;
  adminStatus: string;
  oemStatus: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  escalationLevel: number;
  lastEscalatedAt: string | null;
  User: {
    name: string;
    email: string;
  };
  formSubmissionId?: number;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface Attachment {
  id: number;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

interface FormSubmission {
  id: number;
  FormDefinition: {
    formName: string;
    description: string;
    schema: FormField[] | string;
  };
  User: {
    name: string;
    email: string;
  };
  submittedData: { [key: string]: any } | string;
  status: string;
  createdAt: string;
  Attachment: Attachment[];
}

export default function TroubleTickets() {
  const [tickets, setTickets] = useState<TroubleTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TroubleTicket[]>([]);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TroubleTicket | null>(null);
  const [newOemStatus, setNewOemStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [escalationMessage, setEscalationMessage] = useState("");
  const [escalationError, setEscalationError] = useState("");
  const [escalationLoading, setEscalationLoading] = useState(false);
  const [ticketForEscalation, setTicketForEscalation] = useState<TroubleTicket | null>(null);
  const [newEscalationLevel, setNewEscalationLevel] = useState("");
  const [selectedFormSubmission, setSelectedFormSubmission] = useState<FormSubmission | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    // First filter by Level 2
    let result = tickets.filter(ticket => ticket.escalationLevel === 2);
    
    // Then apply search filter if there's a search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(ticket => 
        ticket.id.toString().includes(term) ||
        ticket.User.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredTickets(result);
  }, [searchTerm, tickets]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("/api/admin/claims");
      setTickets(res.data);
    } catch (err: any) {
      console.error("Failed to load trouble tickets", err);
      setError(err.response?.data?.message || "Failed to load trouble tickets.");
    }
  };

  const handleViewForm = async (ticket: TroubleTicket) => {
    if (!ticket.formSubmissionId) return;
    
    setFormLoading(true);
    setFormError("");
    
    try {
      const res = await axios.get(`/api/form-submissions-get?id=${ticket.formSubmissionId}`);
      const submission = res.data.find((s: FormSubmission) => s.id === ticket.formSubmissionId);
      if (submission) {
        setSelectedFormSubmission(submission);
      } else {
        setFormError("Form submission not found");
      }
    } catch (err) {
      console.error("Error fetching form submission", err);
      setFormError("Failed to fetch form submission.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTicket) return;
    try {
      await axios.post("/api/oem/update-claim-status", {
        troubleTicketId: selectedTicket.id,
        newStatus: newOemStatus,
        remarks,
      });
      setSelectedTicket(null);
      fetchTickets();
    } catch (error: any) {
      console.error("Failed to update ticket", error);
    }
  };

  const handleEscalationUpdate = async () => {
    if (!ticketForEscalation) return;
    
    setEscalationLoading(true);
    setEscalationMessage("");
    setEscalationError("");

    if (!newEscalationLevel) {
      setEscalationError("Please select an escalation level.");
      setEscalationLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/escalate-tickets", {
        ticketId: ticketForEscalation.id,
        escalationLevel: parseInt(newEscalationLevel, 10),
      });

      setEscalationMessage(response.data.message || "Escalation level updated successfully.");
      fetchTickets();
      setTimeout(() => {
        setTicketForEscalation(null);
        setEscalationMessage("");
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setEscalationError(`Ticket ID ${ticketForEscalation.id} does not exist.`);
      } else if (err.response && err.response.status === 400) {
        setEscalationError(err.response.data.message || "Invalid request.");
      } else {
        console.error("Error updating escalation level", err);
        setEscalationError("Failed to update escalation level. Please try again.");
      }
    } finally {
      setEscalationLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Pending</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20">In Progress</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Completed</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20">{status}</Badge>;
    }
  };

  const getEscalationBadge = (ticket: TroubleTicket) => {
    const level = ticket.escalationLevel;
    switch (level) {
      case 1:
        return (
          <Badge 
            variant="outline" 
            className="bg-yellow-500/10 text-yellow-500 cursor-pointer hover:bg-yellow-500/20"
            onClick={() => setTicketForEscalation(ticket)}
          >
            Level 1
          </Badge>
        );
      case 2:
        return (
          <Badge 
            variant="outline" 
            className="bg-orange-500/10 text-orange-500 cursor-pointer hover:bg-orange-500/20"
            onClick={() => setTicketForEscalation(ticket)}
          >
            Level 2
          </Badge>
        );
      default:
        return (
          <Badge 
            variant="outline" 
            className="bg-gray-500/10 text-gray-500 cursor-pointer hover:bg-gray-500/20"
            onClick={() => setTicketForEscalation(ticket)}
          >
            None
          </Badge>
        );
    }
  };

  const toggleTicketSelection = (ticketId: number) => {
    setSelectedTickets(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(ticket => ticket.id));
    }
  };

  const exportSelectedTickets = () => {
    if (selectedTickets.length === 0) {
      toast({
        title: "No tickets selected",
        description: "Please select at least one ticket to export",
        variant: "destructive",
      });
      return;
    }

    const selectedData = filteredTickets.filter(ticket => selectedTickets.includes(ticket.id));
    
    // Create CSV content
    const headers = [
      "ID", "Title", "Admin Status", "OEM Status", "Remarks", 
      "Escalation Level", "Last Escalated", "Submitted By", 
      "Created At", "Updated At"
    ].join(",");
    
    const rows = selectedData.map(ticket => [
      ticket.id,
      `"${ticket.title.replace(/"/g, '""')}"`,
      ticket.adminStatus,
      ticket.oemStatus,
      `"${ticket.remarks.replace(/"/g, '""')}"`,
      ticket.escalationLevel,
      ticket.lastEscalatedAt ? new Date(ticket.lastEscalatedAt).toLocaleString() : 'Never',
      `"${ticket.User.name} (${ticket.User.email})"`,
      new Date(ticket.createdAt).toLocaleString(),
      new Date(ticket.updatedAt).toLocaleString()
    ].join(","));

    const csvContent = [headers, ...rows].join("\n");
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Generate filename with current date and time
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
    const filename = `trouble_tickets_${formattedDate}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clear selection after export
    setSelectedTickets([]);
    
    toast({
      title: "Export successful",
      description: `${selectedTickets.length} ticket(s) exported as ${filename}`,
      variant: "default",
    });
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const renderFormSubmission = () => {
    if (!selectedFormSubmission) return null;
    
    let parsedSchema: FormField[] = [];
    let parsedSubmittedData: { [key: string]: any } = {};

    try {
      parsedSchema =
        typeof selectedFormSubmission.FormDefinition.schema === "string"
          ? JSON.parse(selectedFormSubmission.FormDefinition.schema)
          : selectedFormSubmission.FormDefinition.schema || [];
    } catch (err) {
      console.error("Error parsing schema", err);
    }

    try {
      parsedSubmittedData =
        typeof selectedFormSubmission.submittedData === "string"
          ? JSON.parse(selectedFormSubmission.submittedData)
          : selectedFormSubmission.submittedData || {};
    } catch (err) {
      console.error("Error parsing submitted data", err);
    }
    

    return (
      <Dialog open={!!selectedFormSubmission} onOpenChange={() => setSelectedFormSubmission(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFormSubmission.FormDefinition.formName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {formLoading ? (
              <p>Loading form data...</p>
            ) : formError ? (
              <p className="text-red-500">{formError}</p>
            ) : (
              <>
                <p>
                  <strong>User:</strong> {selectedFormSubmission.User.name || "Unknown"} (
                  {selectedFormSubmission.User.email})
                </p>
                <p>
                  <strong>Submitted On:</strong>{" "}
                  {new Date(selectedFormSubmission.createdAt).toLocaleString()}
                </p>
                <div className="mt-4 space-y-4">
                  <h2 className="text-lg font-medium"><b><u>Submitted Data</u></b></h2>
                  {parsedSchema.length > 0 ? (
                    parsedSchema.map((field: FormField) => (
                      <div key={field.name} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-50">
                          {field.label}:
                        </label>
                        <div className="border rounded p-2">
                          {parsedSubmittedData[field.name] || "N/A"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No schema fields available.</p>
                  )}
                </div>
                {selectedFormSubmission.Attachment.length > 0 && (
                  <div className="mt-4">
                    <h2 className="text-lg font-medium">Attachments</h2>
                    {selectedFormSubmission.Attachment.map((attachment) => (
                      <div key={attachment.id} className="space-y-1">
                        <p>
                          <strong>File Name:</strong> {attachment.fileName}
                        </p>
                        <p>
                          <strong>Uploaded At:</strong>{" "}
                          {new Date(attachment.uploadedAt).toLocaleString()}
                        </p>
                        <a
                          href={`/api/uploads/${attachment.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View Attachment
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  

  return (
    <div className="flex flex-col items-center justify-center max-h-screen p-2 wrap-all">
      <Card className="w-full max-w-7.5xl max-h-screen overflow-y-auto">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <Button size={'icon'} variant={'outline'} asChild>
                <button onClick={() => router.back()} className="flex items-center mr-4">
                  <ArrowLeft className="size-5" />
                </button>
              </Button>
              <FileChartLine className="w-7 h-7 text-primary mr-1" />
              <CardTitle>Monitor Claims</CardTitle>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID or email..."
                  className="pl-10 pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <X 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                    onClick={clearSearch}
                  />
                )}
              </div>
              {selectedTickets.length > 0 && (
                <Button 
                  onClick={exportSelectedTickets}
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Export Selected ({selectedTickets.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/20">
                <FileChartLine className="size-10 text-primary" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">
                {searchTerm ? "No matching tickets found" : "No Level 2 trouble tickets available"}
              </h2>
              <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
                {searchTerm ? (
                  `No tickets found matching "${searchTerm}". Try a different search term.`
                ) : (
                  "There are currently no Level 2 tickets that have been escalated to OEM."
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
              <Table className="table-auto w-full border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox
                        checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Admin Status</TableHead>
                    <TableHead>OEM Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Escalation Level</TableHead>
                    <TableHead>Last Escalated</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                    <TableHead>Form</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="text-sm">
                      <TableCell>
                        <Checkbox
                          checked={selectedTickets.includes(ticket.id)}
                          onCheckedChange={() => toggleTicketSelection(ticket.id)}
                          aria-label={`Select ticket ${ticket.id}`}
                        />
                      </TableCell>
                      <TableCell>{ticket.id}</TableCell>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>{getStatusBadge(ticket.adminStatus)}</TableCell>
                      <TableCell onClick={() => setSelectedTicket(ticket)} className="cursor-pointer">
                        {getStatusBadge(ticket.oemStatus)}
                      </TableCell>
                      <TableCell>{ticket.remarks}</TableCell>
                      <TableCell>{getEscalationBadge(ticket)}</TableCell>
                      <TableCell>
                        {ticket.lastEscalatedAt ? new Date(ticket.lastEscalatedAt).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>{ticket.User.name} ({ticket.User.email})</TableCell>
                      <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{new Date(ticket.updatedAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {ticket.formSubmissionId && (
                              <DropdownMenuItem onClick={() => handleViewForm(ticket)}>
                                View Form
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Ticket #{selectedTicket.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full justify-between" variant="outline">
                        {newOemStatus ? (
                          <div className="flex items-center">
                            {newOemStatus === "PENDING" && <Clock className="w-4 h-4 text-blue-500 mr-2" />}
                            {newOemStatus === "IN_PROGRESS" && <Loader className="w-4 h-4 text-orange-500 mr-2" />}
                            {newOemStatus === "COMPLETED" && <CheckCircle className="w-4 h-4 text-green-500 mr-2" />}
                            {newOemStatus === "REJECTED" && <XCircle className="w-4 h-4 text-red-500 mr-2" />}
                            {newOemStatus}
                          </div>
                        ) : "Select Status"}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => setNewOemStatus("PENDING")} className="dark: hover:bg-gray-700">
                        <Clock className="w-5 h-5 text-blue-500 mr-2" />
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNewOemStatus("IN_PROGRESS")} className="dark: hover:bg-gray-700">
                        <Loader className="w-5 h-5 text-orange-500 mr-2" />
                        In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNewOemStatus("COMPLETED")} className="dark: hover:bg-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        Completed
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setNewOemStatus("REJECTED")} className="dark: hover:bg-gray-700">
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                        Rejected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add remarks" />
              <Button 
                onClick={async () => {
                  try {
                    await handleSubmit()
                    toast({
                      title: "Status Updated",
                      description: "The status has been successfully updated.",
                      variant: "default",
                    })
                  } catch (error) {
                    toast({
                      title: "Update Failed",
                      description: error instanceof Error ? error.message : "Failed to update status",
                      variant: "destructive",
                    })
                  }
                }}
              >
                Update Status
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {ticketForEscalation && (
        <Dialog open={!!ticketForEscalation} onOpenChange={() => setTicketForEscalation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Escalation Level for Ticket #{ticketForEscalation.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {escalationMessage && (
                <p className="text-green-500 bg-green-100 border border-green-200 rounded p-2">
                  {escalationMessage}
                </p>
              )}
              {escalationError && (
                <p className="text-red-500 bg-red-100 border border-red-200 rounded p-2">
                  {escalationError}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Escalation Level: {ticketForEscalation.escalationLevel || 'None'}
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Escalation Level
                </label>
                <select
                  value={newEscalationLevel}
                  onChange={(e) => setNewEscalationLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Escalation Level</option>
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                </select>
              </div>

              <Button
                onClick={async () => {
                  try {
                    await handleEscalationUpdate();
                    toast({
                      title: "Success",
                      description: "Escalation level updated successfully!",
                      variant: "default",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to update escalation level",
                      variant: "destructive",
                    });
                  }
                }}
                className="w-full bg-primary text-white font-semibold py-2 rounded-lg"
                disabled={escalationLoading}
              >
                {escalationLoading ? "Processing..." : "Update Escalation Level"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {renderFormSubmission()}
    </div>
  );
}