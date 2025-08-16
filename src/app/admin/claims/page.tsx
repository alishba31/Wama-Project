"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Import Label for form elements
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ArrowLeft, CheckCircle, ChevronDown, Clock, ExternalLink, FileChartLine, FileText, Loader, MoreHorizontal, Paperclip, XCircle, File, ClipboardList, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

// Dynamically import jsPDF to avoid SSR issues
const jsPDF = dynamic(() => import('jspdf').then((mod) => mod.default), {
  ssr: false,
});
const autoTable = dynamic(() => import('jspdf-autotable'), {
  ssr: false,
});

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

const allColumns = [
  { value: "id", label: "ID" },
  { value: "title", label: "Title" },
  { value: "adminStatus", label: "Admin Status" },
  { value: "oemStatus", label: "OEM Status" },
  { value: "remarks", label: "Remarks" },
  { value: "escalationLevel", label: "Escalation Level" },
  { value: "lastEscalatedAt", label: "Last Escalated" },
  { value: "userName", label: "User Name" },
  { value: "userEmail", label: "User Email" },
  { value: "createdAt", label: "Created At" },
  { value: "updatedAt", label: "Updated At" }
];

const filterColumns = [
  { value: "id", label: "ID" },
  { value: "title", label: "Title" },
  { value: "adminStatus", label: "Admin Status" },
  { value: "oemStatus", label: "OEM Status" },
  { value: "escalationLevel", label: "Escalation Level" },
  { value: "userName", label: "User Name" },
  { value: "userEmail", label: "User Email" }
];

const statusMappings = {
  "pending": ["pending"],
  "in_progress": ["in progress", "in-progress", "progress", "In"],
  "completed": ["completed", "complete", "done"]
};

const sortOptionsList = [
  { value: "recents", label: "Sort: Newest Created" },
  { value: "oldest", label: "Sort: Oldest Created" },
  { value: "updated_newest", label: "Sort: Newest Updated" },
  { value: "updated_oldest", label: "Sort: Oldest Updated" },
  { value: "id_asc", label: "Sort: ID (Low to High)" },
  { value: "id_desc", label: "Sort: ID (High to Low)" },
  { value: "title_asc", label: "Sort: Title (A-Z)" },
  { value: "title_desc", label: "Sort: Title (Z-A)" },
  { value: "adminStatus_asc", label: "Sort: Admin Status (A-Z)" },
  { value: "adminStatus_desc", label: "Sort: Admin Status (Z-A)" },
  { value: "oemStatus_asc", label: "Sort: OEM Status (A-Z)" },
  { value: "oemStatus_desc", label: "Sort: OEM Status (Z-A)" },
  { value: "escalationLevel_asc", label: "Sort: Escalation (Low to High)" },
  { value: "escalationLevel_desc", label: "Sort: Escalation (High to Low)" },
  { value: "userName_asc", label: "Sort: User Name (A-Z)" },
  { value: "userName_desc", label: "Sort: User Name (Z-A)" },
];

export default function TroubleTickets() {
  const [isClient, setIsClient] = useState(false);
  const [tickets, setTickets] = useState<TroubleTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TroubleTicket[]>([]);
  const [sortOption, setSortOption] = useState("recents"); 
  const [displayedTickets, setDisplayedTickets] = useState<TroubleTicket[]>([]);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TroubleTicket | null>(null);
  const [newAdminStatus, setNewAdminStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [escalationMessage, setEscalationMessage] = useState("");
  const [escalationError, setEscalationError] = useState("");
  const [escalationLoading, setEscalationLoading] = useState(false);
  const [ticketForEscalation, setTicketForEscalation] = useState<TroubleTicket | null>(null);
  const [newEscalationLevel, setNewEscalationLevel] = useState("");
  const [selectedFormSubmission, setSelectedFormSubmission] = useState<FormSubmission | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(allColumns.map(col => col.value));
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<"all" | "selected">("all");
  const [exportInitiator, setExportInitiator] = useState<'pdf' | 'csv' | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const [filterColumn, setFilterColumn] = useState("id");
  const [filterValue, setFilterValue] = useState("");
  const [dateFrom, setDateFrom] = useState(""); // New state for "From" date
  const [dateTo, setDateTo] = useState("");     // New state for "To" date
  
  useEffect(() => {
    setIsClient(true);
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, filterColumn, filterValue, dateFrom, dateTo]); // Added dateFrom and dateTo dependencies

  useEffect(() => {
    let sorted = [...filteredTickets]; 

    switch (sortOption) {
      case "recents":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "updated_newest":
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "updated_oldest":
        sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        break;
      case "id_asc":
        sorted.sort((a, b) => a.id - b.id);
        break;
      case "id_desc":
        sorted.sort((a, b) => b.id - a.id);
        break;
      case "title_asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title_desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "adminStatus_asc":
        sorted.sort((a, b) => a.adminStatus.localeCompare(b.adminStatus));
        break;
      case "adminStatus_desc":
        sorted.sort((a, b) => b.adminStatus.localeCompare(a.adminStatus));
        break;
      case "oemStatus_asc":
        sorted.sort((a, b) => (a.oemStatus || "").localeCompare(b.oemStatus || ""));
        break;
      case "oemStatus_desc":
        sorted.sort((a, b) => (b.oemStatus || "").localeCompare(a.oemStatus || ""));
        break;
      case "escalationLevel_asc":
        sorted.sort((a, b) => a.escalationLevel - b.escalationLevel);
        break;
      case "escalationLevel_desc":
        sorted.sort((a, b) => b.escalationLevel - a.escalationLevel);
        break;
      case "userName_asc":
        sorted.sort((a, b) => (a.User?.name || "").localeCompare(b.User?.name || ""));
        break;
      case "userName_desc":
        sorted.sort((a, b) => (b.User?.name || "").localeCompare(a.User?.name || ""));
        break;
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    setDisplayedTickets(sorted);
  }, [filteredTickets, sortOption]);

  const filterTickets = () => {
    let result = [...tickets];
    
    // Text filter
    if (filterValue.trim()) {
      const searchTerm = filterValue.toLowerCase();
      switch (filterColumn) {
        case "id":
          result = result.filter(ticket => 
            ticket.id.toString().includes(searchTerm)
          );
          break;
        case "title":
          result = result.filter(ticket => 
            ticket.title.toLowerCase().includes(searchTerm)
          );
          break;
        case "adminStatus":
          result = result.filter(ticket => {
            const dbStatus = ticket.adminStatus.toLowerCase();
            if (dbStatus.includes(searchTerm)) return true;
            for (const [dbValue, userTerms] of Object.entries(statusMappings)) {
              if (dbStatus === dbValue && userTerms.some(term => term === searchTerm)) {
                return true;
              }
            }
            return false;
          });
          break;
        case "oemStatus":
          result = result.filter(ticket => {
            if (!ticket.oemStatus) return false;
            const dbStatus = ticket.oemStatus.toLowerCase();
            if (dbStatus.includes(searchTerm)) return true;
            for (const [dbValue, userTerms] of Object.entries(statusMappings)) {
              if (dbStatus === dbValue && userTerms.some(term => term === searchTerm)) {
                return true;
              }
            }
            return false;
          });
          break;
        case "escalationLevel":
          result = result.filter(ticket => 
            ticket.escalationLevel.toString().includes(searchTerm)
          );
          break;
        case "userName":
          result = result.filter(ticket => 
            ticket.User.name.toLowerCase().includes(searchTerm)
          );
          break;
        case "userEmail":
          result = result.filter(ticket => 
            ticket.User.email.toLowerCase().includes(searchTerm)
          );
          break;
        default:
          break;
      }
    }

    // Date filter (on createdAt)
    if (dateFrom) {
        // `dateFrom` is "YYYY-MM-DD". Create date object for start of this day in local timezone.
        const fromDateStart = new Date(`${dateFrom}T00:00:00`);
        result = result.filter(ticket => {
            const ticketDate = new Date(ticket.createdAt); // Assuming ticket.createdAt is ISO string
            return ticketDate >= fromDateStart;
        });
    }

    if (dateTo) {
        // `dateTo` is "YYYY-MM-DD". Create date object for end of this day in local timezone.
        const toDateEnd = new Date(`${dateTo}T23:59:59.999`);
        result = result.filter(ticket => {
            const ticketDate = new Date(ticket.createdAt);
            return ticketDate <= toDateEnd;
        });
    }

    setFilteredTickets(result);
  };

  const clearDateFilters = () => {
    setDateFrom("");
    setDateTo("");
    // filterTickets will be called by useEffect due to state change
  };

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
      await axios.post("/api/admin/update-claim-status", {
        troubleTicketId: selectedTicket.id,
        newStatus: newAdminStatus,
        remarks,
      });
      setSelectedTicket(null);
      setNewAdminStatus("");
      setRemarks("");
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
        setNewEscalationLevel("");
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
    switch (status?.toUpperCase()) { // Added toUpperCase for safety
      case "PENDING":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400">Pending</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400">In Progress</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400">Completed</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400">{status || 'N/A'}</Badge>;
    }
  };

  const getEscalationBadge = (ticket: TroubleTicket) => {
    const level = ticket.escalationLevel;
    switch (level) {
      case 1:
        return (
          <Badge 
            variant="outline" 
            className="bg-yellow-500/10 text-yellow-500 cursor-pointer hover:bg-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400"
            onClick={() => {setTicketForEscalation(ticket); setNewEscalationLevel(ticket.escalationLevel.toString());}}
          >
            Level 1
          </Badge>
        );
      case 2:
        return (
          <Badge 
            variant="outline" 
            className="bg-orange-500/10 text-orange-500 cursor-pointer hover:bg-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400"
            onClick={() => {setTicketForEscalation(ticket); setNewEscalationLevel(ticket.escalationLevel.toString());}}
          >
            Level 2
          </Badge>
        );
      default:
        return (
          <Badge 
            variant="outline" 
            className="bg-gray-500/10 text-gray-500 cursor-pointer hover:bg-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400"
            onClick={() => {setTicketForEscalation(ticket); setNewEscalationLevel("");}}
          >
            None
          </Badge>
        );
    }
  };
  
  const handleExport = (type: 'pdf' | 'csv', scope: 'all' | 'selected') => {
    if (!isClient) return;
    if (scope === "selected" && selectedRows.length === 0) {
      toast({
        description: "Please select at least one ticket to export.",
        variant: "destructive"
      });
      
      return;
    }
    setExportInitiator(type);
    setExportType(scope);
    setShowExportDialog(true);

    // window.location.reload(); // Reload the page to ensure latest data is fetched
  };

  const escapeCSV = (value: any): string => {
    if (value == null) {
      return '';
    }
    const strValue = String(value);
    if (/[",\n\r]/.test(strValue)) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  };

  const confirmExport = async () => {
    if (!isClient || !exportInitiator) return;

    // Optional: Add a loading state for the export button if it's a long process
    // e.g., setExportButtonLoading(true);

    try {
      console.log("confirmExport: Starting");
      const now = new Date();
      const dateTimeString = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      
      const ticketsToExport = exportType === "all" 
          ? displayedTickets 
          : displayedTickets.filter(ticket => selectedRows.includes(ticket.id));

      if (ticketsToExport.length === 0) {
          toast({ description: "No tickets to export.", variant: "destructive" });
          setShowExportDialog(false);
          // if (setExportButtonLoading) setExportButtonLoading(false);
          return;
      }
      
      const headers = allColumns
        .filter(col => selectedColumns.includes(col.value))
        .map(col => col.label);
      
      const dataRows = ticketsToExport.map(ticket => {
        const row: any[] = [];
        if (selectedColumns.includes("id")) row.push(ticket.id);
        if (selectedColumns.includes("title")) row.push(ticket.title);
        if (selectedColumns.includes("adminStatus")) row.push(ticket.adminStatus);
        if (selectedColumns.includes("oemStatus")) row.push(ticket.oemStatus || "N/A");
        if (selectedColumns.includes("remarks")) row.push(ticket.remarks || "N/A");
        if (selectedColumns.includes("escalationLevel")) row.push(ticket.escalationLevel || "None");
        if (selectedColumns.includes("lastEscalatedAt")) row.push(
          ticket.lastEscalatedAt ? new Date(ticket.lastEscalatedAt).toLocaleString() : 'Never'
        );
        if (selectedColumns.includes("userName")) row.push(ticket.User.name);
        if (selectedColumns.includes("userEmail")) row.push(ticket.User.email);
        if (selectedColumns.includes("createdAt")) row.push(new Date(ticket.createdAt).toLocaleString());
        if (selectedColumns.includes("updatedAt")) row.push(new Date(ticket.updatedAt).toLocaleString());
        return row;
      });

      console.log("confirmExport: Data prepared for export");

      if (exportInitiator === 'pdf') {
        console.log("confirmExport: Starting PDF generation");
        const { default: JSPDF } = await import('jspdf'); 
        const { default: autoTableModule } = await import('jspdf-autotable'); 
        
        const doc = new JSPDF();
        doc.setFontSize(16);
        doc.text(`${exportType === "all" ? "Trouble Tickets (Current View)" : "Selected Trouble Tickets"} Report`, 14, 10);
        
        (doc as any).autoTable({ 
          head: [headers],
          body: dataRows,
          startY: 20,
        });
        
        doc.save(`${exportType === "all" ? "trouble_tickets_view" : "selected_trouble_tickets"}_${dateTimeString}.pdf`);
        console.log("confirmExport: PDF saved");
        toast({ description: `PDF Export: ${exportType === "all" ? "Current view" : "Selected"} tickets exported successfully!` });

      } else if (exportInitiator === 'csv') {
        console.log("confirmExport: Starting CSV generation");
        const csvHeaders = headers.map(header => escapeCSV(header)).join(',');
        const csvRows = dataRows.map(row => 
          row.map(cell => escapeCSV(cell)).join(',')
        );
        const csvContent = [csvHeaders, ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) { 
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `${exportType === "all" ? "trouble_tickets_view" : "selected_trouble_tickets"}_${dateTimeString}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log("confirmExport: CSV saved");
        } else {
          console.error("confirmExport: CSV download not supported by browser.");
        }
        toast({ description: `CSV Export: ${exportType === "all" ? "Current view" : "Selected"} tickets exported successfully!` });
      }
      
      console.log("confirmExport: Export process finished, preparing for navigation");

      setShowExportDialog(false);
      if (exportType === "selected") {
        setSelectedRows([]);
      }
      setExportInitiator(null);
      
      // Delay navigation to allow toast and download to process
      setTimeout(() => {
        console.log("confirmExport: Navigating to /admin/claims via window.location.href");
        window.location.href = '/admin/claims'; 
      }, 500); // Increased delay to 500ms, adjust if needed

    } catch (err) {
      console.error("confirmExport: Error during export process:", err);
      toast({
        title: "Export Error",
        description: "An error occurred while exporting. Please check the console for details.",
        variant: "destructive",
      });
      setShowExportDialog(false); // Ensure dialog closes
      setExportInitiator(null); // Reset state
    } finally {
      // if (setExportButtonLoading) setExportButtonLoading(false);
      console.log("confirmExport: Finished execution (or finally block)");
    }
  };

  const toggleRowSelection = (ticketId: number) => {
    setSelectedRows(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId) 
        : [...prev, ticketId]
    );
  };

  const toggleAllRowsSelection = () => {
    if (selectedRows.length === displayedTickets.length && displayedTickets.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(displayedTickets.map(ticket => ticket.id));
    }
  };

  const toggleColumnSelection = (columnValue: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnValue)
        ? prev.filter(col => col !== columnValue)
        : [...prev, columnValue]
    );
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
    } catch (err) { console.error("Error parsing schema", err); }
    try {
      parsedSubmittedData =
        typeof selectedFormSubmission.submittedData === "string"
          ? JSON.parse(selectedFormSubmission.submittedData)
          : selectedFormSubmission.submittedData || {};
    } catch (err) { console.error("Error parsing submitted data", err); }

    return (
      <Dialog open={!!selectedFormSubmission} onOpenChange={() => setSelectedFormSubmission(null)}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">
    <DialogHeader className="border-b pb-4">
      <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        {selectedFormSubmission?.FormDefinition?.formName || 'Warranty Submission'}
      </DialogTitle>
      <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
        Warranty claim details and submission information
      </DialogDescription>
    </DialogHeader>

    {formLoading ? (
      <div className="flex justify-center items-center h-32">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Loader2 className="animate-spin w-5 h-5" />
          <span>Loading form data...</span>
        </div>
      </div>
    ) : formError ? (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{formError}</span>
        </div>
      </div>
    ) : (
      <div className="space-y-6">
        {/* Submission Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted By</p>
            <p className="text-gray-900 dark:text-gray-100">
              {selectedFormSubmission.User.name || "Unknown"} 
              <span className="text-gray-500 dark:text-gray-400 ml-2">({selectedFormSubmission.User.email})</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Submission Date</p>
            <p className="text-gray-900 dark:text-gray-100">
              {new Date(selectedFormSubmission.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Form Data Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Submitted Data</h2>
          </div>
          
          {parsedSchema.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parsedSchema.map((field: FormField) => (
                <div key={field.name} className="space-y-1">
                  <Label htmlFor={`form-data-${field.name}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {field.label}
                  </Label>
                  <div 
                    id={`form-data-${field.name}`} 
                    className="border rounded-md p-3 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200 min-h-10"
                  >
                    {parsedSubmittedData[field.name] || <span className="text-gray-400 dark:text-gray-500">N/A</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md border border-dashed border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-500 dark:text-gray-400">No schema fields available</p>
            </div>
          )}
        </section>

        {/* Attachments Section */}
        {selectedFormSubmission.Attachment.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Attachments</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedFormSubmission.Attachment.map((attachment) => (
                <div 
                  key={attachment.id} 
                  className="border rounded-md p-4 bg-white dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
                      <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {attachment.fileName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Uploaded: {new Date(attachment.uploadedAt).toLocaleString()}
                      </p>
                      <div className="pt-2">
                        <a 
                          href={`/api/uploads/${attachment.filePath}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Attachment
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    )}
  </DialogContent>
</Dialog>
    );
  };

  if (!isClient) {
    return null; 
  }

  return (
    <div className="flex flex-col items-center justify-center max-h-screen p-2 wrap-all">
      <Card className="w-full max-w-7.5xl max-h-screen overflow-y-auto">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <Button size={'icon'} variant={'outline'} asChild>
                <button onClick={() => router.back()} className="flex items-center mr-4">
                  <ArrowLeft className="size-5" />
                </button>
              </Button>
              <FileChartLine className="w-7 h-7 text-primary mr-1" />
              <CardTitle>Trouble Tickets</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                    <FileText className="mr-2 h-4 w-4" />
                    Export
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
                  <DropdownMenuItem 
                    onClick={() => handleExport('pdf', 'all')
                      
                    }
                    className="dark:hover:bg-gray-700"
                  >
                    Export All (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExport('pdf', 'selected')}
                    className="dark:hover:bg-gray-700"
                    disabled={selectedRows.length === 0}
                  >
                    Export Selected ({selectedRows.length}) as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExport('csv', 'all')}
                    className="dark:hover:bg-gray-700"
                  >
                    Export All (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExport('csv', 'selected')}
                    className="dark:hover:bg-gray-700"
                    disabled={selectedRows.length === 0}
                  >
                    Export Selected ({selectedRows.length}) as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Updated Filter Section */}
          <div className="flex flex-wrap gap-4 mb-4 items-end">
            <div className="flex-grow min-w-[180px]">
              <Label htmlFor="filterColumnSelectTrigger" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter By</Label>
              <Select 
                value={filterColumn} 
                onValueChange={setFilterColumn}
              >
                <SelectTrigger id="filterColumnSelectTrigger" className="dark:bg-gray-800 dark:border-gray-700 w-full">
                  <SelectValue placeholder="Select column..." />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {filterColumns.map((column) => (
                    <SelectItem 
                      key={column.value} 
                      value={column.value}
                      className="dark:hover:bg-gray-700"
                    >
                      {column.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-grow min-w-[200px]">
              <Label htmlFor="filterValueInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Term</Label>
              <Input
                id="filterValueInput"
                placeholder={`Filter ${filterColumns.find(c => c.value === filterColumn)?.label.toLowerCase() || 'value'}...`}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 w-full"
              />
            </div>
            
            <div className="flex-grow min-w-[180px]">
              <Label htmlFor="dateFromFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created From
              </Label>
              <Input
                id="dateFromFilter"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 w-full"
              />
            </div>

            <div className="flex-grow min-w-[180px]">
              <Label htmlFor="dateToFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created To
              </Label>
              <Input
                id="dateToFilter"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 w-full"
                min={dateFrom || undefined} // Prevent "To" date before "From" date
              />
            </div>
            
            <div className="shrink-0"> {/* Button takes its own width, doesn't grow/shrink */}
              <Button
                variant="outline"
                onClick={clearDateFilters}
                className="w-full sm:w-auto dark:text-gray-300 dark:border-gray-600 hover:dark:bg-gray-700"
                aria-label="Clear date filters"
              >
                Clear Dates
              </Button>
            </div>

            <div className="flex-grow min-w-[200px]">
              <Label htmlFor="sortOptionSelectTrigger" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</Label>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger id="sortOptionSelectTrigger" className="dark:bg-gray-800 dark:border-gray-700 w-full"> 
                  <SelectValue placeholder="Select sort order..." />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700"> 
                  {sortOptionsList.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="dark:hover:bg-gray-700"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {displayedTickets.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                {tickets.length > 0 ? "No tickets match your current filters." : "No trouble tickets available."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="table-auto w-full border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox
                        checked={displayedTickets.length > 0 && selectedRows.length === displayedTickets.length}
                        onCheckedChange={toggleAllRowsSelection}
                        aria-label="Select all"
                        className="dark:border-gray-600"
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedTickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id} 
                      className="text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                      data-state={selectedRows.includes(ticket.id) ? "selected" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(ticket.id)}
                          onCheckedChange={() => toggleRowSelection(ticket.id)}
                          aria-label="Select row"
                          className="dark:border-gray-600"
                        />
                      </TableCell>
                      <TableCell>{ticket.id}</TableCell>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell 
                        onClick={() => {setSelectedTicket(ticket); setNewAdminStatus(ticket.adminStatus); setRemarks(ticket.remarks || "");}} 
                        className="cursor-pointer"
                      >
                        {getStatusBadge(ticket.adminStatus)}
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.oemStatus)}</TableCell>
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
                          <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                            {ticket.formSubmissionId && (
                              <DropdownMenuItem 
                                onClick={() => handleViewForm(ticket)}
                                className="dark:hover:bg-gray-700"
                              >
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

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-50">Select Columns for Export</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {allColumns.map((column) => (
                <div key={column.value} className="flex items-center space-x-2">
                  <Checkbox id={`column-${column.value}`} checked={selectedColumns.includes(column.value)} onCheckedChange={() => toggleColumnSelection(column.value)}/>
                  <Label htmlFor={`column-${column.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-50">{column.label}</Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowExportDialog(false); setExportInitiator(null); }} className="dark:bg-gray-700 dark:hover:bg-gray-600">Cancel</Button>
            <Button onClick={confirmExport} className="dark:bg-primary dark:hover:bg-primary/90">
                Export {exportInitiator?.toUpperCase()} ({exportType === "all" ? "All" : `Selected ${selectedRows.length}`})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle className="dark:text-gray-50">Update Ticket #{selectedTicket.id}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button className="w-full justify-between" variant="outline">{newAdminStatus ? (<div className="flex items-center">{newAdminStatus === "PENDING" && <Clock className="w-4 h-4 text-blue-500 mr-2" />}{newAdminStatus === "IN_PROGRESS" && <Loader className="w-4 h-4 text-orange-500 mr-2" />}{newAdminStatus === "COMPLETED" && <CheckCircle className="w-4 h-4 text-green-500 mr-2" />}{newAdminStatus === "REJECTED" && <XCircle className="w-4 h-4 text-red-500 mr-2" />}{newAdminStatus.replace("_", " ")}</div>) : "Select Status"}<ChevronDown className="w-4 h-4 ml-2" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] dark:bg-gray-800 dark:border-gray-700">
                  <DropdownMenuItem onClick={() => setNewAdminStatus("PENDING")} className="dark: hover:bg-gray-700"><Clock className="w-5 h-5 text-blue-500 mr-2" />Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNewAdminStatus("IN_PROGRESS")} className="dark: hover:bg-gray-700"><Loader className="w-5 h-5 text-orange-500 mr-2" />In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNewAdminStatus("COMPLETED")} className="dark: hover:bg-gray-700"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Completed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNewAdminStatus("REJECTED")} className="dark: hover:bg-gray-700"><XCircle className="w-5 h-5 text-red-500 mr-2" />Rejected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add remarks"/>
              <Button onClick={async () => { try { await handleSubmit(); toast({title: "Status Updated", description: "The status has been successfully updated.", variant: "default",})} catch (error) { toast({title: "Update Failed", description: error instanceof Error ? error.message : "Failed to update status", variant: "destructive",})}}} className="dark:bg-primary dark:hover:bg-primary/90">Update Status</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {ticketForEscalation && (
        <Dialog open={!!ticketForEscalation} onOpenChange={() => setTicketForEscalation(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle className="dark:text-gray-50">Update Escalation Level for Ticket #{ticketForEscalation.id}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {escalationMessage && (<p className="text-green-500 bg-green-100 border border-green-200 rounded p-2 dark:bg-green-900/30 dark:border-green-800">{escalationMessage}</p>)}
              {escalationError && (<p className="text-red-500 bg-red-100 border border-red-200 rounded p-2 dark:bg-red-900/30 dark:border-red-800">{escalationError}</p>)}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Escalation Level: {ticketForEscalation.escalationLevel || 'None'}</Label>
                <Label htmlFor="escalationLevelSelectTrigger" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Escalation Level</Label>
                <Select value={newEscalationLevel} onValueChange={(value) => setNewEscalationLevel(value)}>
                  <SelectTrigger id="escalationLevelSelectTrigger" className="w-full dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"><SelectValue placeholder="Select Escalation Level" /></SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700"><SelectItem value="0" className="dark:hover:bg-gray-700">None</SelectItem><SelectItem value="1" className="dark:hover:bg-gray-700">Level 1</SelectItem><SelectItem value="2" className="dark:hover:bg-gray-700">Level 2</SelectItem></SelectContent>
                </Select>
              </div>
              <Button onClick={async () => { try { await handleEscalationUpdate(); toast({title: "Success", description: "Escalation level updated successfully!", variant: "default",});} catch (error) { toast({title: "Error", description: escalationError || "Failed to update escalation level", variant: "destructive",});}}} className="w-full bg-primary text-white font-semibold py-2 rounded-lg dark:bg-primary dark:hover:bg-primary/90" disabled={escalationLoading}>{escalationLoading ? "Processing..." : "Update Escalation Level"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {renderFormSubmission()}
    </div>
  );
}



