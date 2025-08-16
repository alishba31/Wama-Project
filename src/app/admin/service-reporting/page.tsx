"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowLeft, BookCopy, ChevronDown, FileDown, FileText, FileWarning, Search, Ticket as TicketIcon, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// ServiceReport type: Fields are kept as optional/nullable because GET
// might return them for older reports. Export functions will ignore them.
type ServiceReport = {
  id: number;
  title: string;
  reportType: string;
  totalSolvedTickets?: number | null;
  totalUnsolvedTickets?: number | null;
  unsolvedReasons?: string[] | null;
  totalSLAsBreached?: number | null;
  appPerformanceRating?: number | null;
  extraRemarks?: string | null;
  filledBy: string;
  createdAt: string;
};

interface DetailedTroubleTicket {
  id: number;
  title: string;
  adminStatus: string;
  oemStatus: string;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  escalationLevel: number | null;
  lastEscalatedAt: string | null;
  User: {
    name: string;
    email: string;
  };
  formSubmissionId?: number;
}

const ITEMS_PER_PAGE = 10;
const TICKETS_DIALOG_PER_PAGE = 10;
const TICKET_SELECTOR_PAGE_SIZE = 50;

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });
};


export default function ServiceReportingPage() {
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    reportType: "",
    extraRemarks: "",
    filledBy: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [allTicketsForDialog, setAllTicketsForDialog] = useState<DetailedTroubleTicket[]>([]);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<DetailedTroubleTicket | null>(null);
  const [isViewTicketsDialogOpen, setIsViewTicketsDialogOpen] = useState(false);
  const [isTicketDetailModalOpen, setIsTicketDetailModalOpen] = useState(false);
  const [ticketSearchTermForDialog, setTicketSearchTermForDialog] = useState("");
  const [loadingTicketsForDialog, setLoadingTicketsForDialog] = useState(false);
  const [ticketCurrentPageForDialog, setTicketCurrentPageForDialog] = useState(1);

  const [allTicketsForSelector, setAllTicketsForSelector] = useState<DetailedTroubleTicket[]>([]);
  const [selectedTicketForForm, setSelectedTicketForForm] = useState<DetailedTroubleTicket | null>(null);
  const [isTicketSelectorDropdownOpen, setIsTicketSelectorDropdownOpen] = useState(false);
  const [ticketSearchTermForSelector, setTicketSearchTermForSelector] = useState("");
  const [loadingTicketsForSelector, setLoadingTicketsForSelector] = useState(false);


  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/service-reporting");
      const data = await res.json();
      if (res.ok) {
        setReports(data);
      } else {
        toast.error(data.message || "Failed to fetch reports.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching reports.");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchAllTicketsData = async (
    setTicketsState: React.Dispatch<React.SetStateAction<DetailedTroubleTicket[]>>,
    setLoadingState: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setLoadingState(true);
    try {
      const res = await fetch("/api/admin/claims");
      const data = await res.json();
      if (res.ok) {
        const processedData: DetailedTroubleTicket[] = data.map((ticket: any) => ({
          id: ticket.id,
          title: ticket.title || "No Title",
          adminStatus: ticket.adminStatus || "N/A",
          oemStatus: ticket.oemStatus || "N/A",
          remarks: ticket.remarks || null,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt || ticket.createdAt,
          escalationLevel: ticket.escalationLevel === undefined ? null : ticket.escalationLevel,
          lastEscalatedAt: ticket.lastEscalatedAt || null,
          User: ticket.User ? { name: ticket.User.name || "Unknown User", email: ticket.User.email || "no-email" } : { name: "Unknown User", email: "no-email" },
          formSubmissionId: ticket.formSubmissionId,
        }));
        setTicketsState(processedData);
      } else {
        toast.error(data.message || "Failed to fetch tickets.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching tickets.");
      console.error("Error fetching tickets:", error);
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    if (selectedTicketForForm) {
      const ticket = selectedTicketForForm;
      setFormData({
        title: `Report for Ticket #${ticket.id}: ${ticket.title}`,
        reportType: `Follow-up on Ticket #${ticket.id}`,
        extraRemarks: `Associated Ticket ID: ${ticket.id}\nOriginal Ticket Remarks: ${ticket.remarks || 'N/A'}\nAdmin Status: ${ticket.adminStatus}\nOEM Status: ${ticket.oemStatus || 'N/A'}\nEscalation Level: ${ticket.escalationLevel !== null ? `Level ${ticket.escalationLevel}` : 'None'}\nTicket Created: ${formatDate(ticket.createdAt)}\nTicket Last Updated: ${formatDate(ticket.updatedAt)}`,
        filledBy: ticket.User ? `${ticket.User.name} (${ticket.User.email})` : "System",
      });
    }
  }, [selectedTicketForForm]);


  const filteredTicketsForDialogDisplay = useMemo(() => {
    let filtered = allTicketsForDialog;
    if (ticketSearchTermForDialog) {
      filtered = allTicketsForDialog.filter(ticket =>
        ticket.id.toString().includes(ticketSearchTermForDialog) ||
        ticket.title.toLowerCase().includes(ticketSearchTermForDialog.toLowerCase()) ||
        ticket.adminStatus.toLowerCase().includes(ticketSearchTermForDialog.toLowerCase())
      );
    }
    return filtered.slice((ticketCurrentPageForDialog - 1) * TICKETS_DIALOG_PER_PAGE, ticketCurrentPageForDialog * TICKETS_DIALOG_PER_PAGE);
  }, [allTicketsForDialog, ticketSearchTermForDialog, ticketCurrentPageForDialog]);

  const currentTotalFilteredTicketsForDialog = useMemo(() => {
    if (!ticketSearchTermForDialog) return allTicketsForDialog.length;
    return allTicketsForDialog.filter(ticket =>
      ticket.id.toString().includes(ticketSearchTermForDialog) ||
      ticket.title.toLowerCase().includes(ticketSearchTermForDialog.toLowerCase()) ||
      ticket.adminStatus.toLowerCase().includes(ticketSearchTermForDialog.toLowerCase())
    ).length;
  }, [allTicketsForDialog, ticketSearchTermForDialog]);
  
  const totalTicketPagesForDialog = Math.ceil(currentTotalFilteredTicketsForDialog / TICKETS_DIALOG_PER_PAGE);

  const filteredTicketsForSelectorDropdown = useMemo(() => {
    if (!ticketSearchTermForSelector) {
      return allTicketsForSelector.slice(0, TICKET_SELECTOR_PAGE_SIZE);
    }
    const filtered = allTicketsForSelector.filter(ticket => 
      ticket.id.toString().includes(ticketSearchTermForSelector) || 
      ticket.title.toLowerCase().includes(ticketSearchTermForSelector.toLowerCase())
    );
    return filtered.slice(0, TICKET_SELECTOR_PAGE_SIZE);
  }, [ticketSearchTermForSelector, allTicketsForSelector]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const {
      title, reportType, 
      extraRemarks, filledBy,
    } = formData;

    if (!title || !reportType || !filledBy) {
      toast.error("Please fill in Title, Report Type, and Filled By.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/service-reporting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, reportType,
          extraRemarks, filledBy,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Report submitted!");
        setFormData({
          title: "", reportType: "", 
          extraRemarks: "", filledBy: "",
        });
        setSelectedTicketForForm(null);
        setTicketSearchTermForSelector("");
        fetchReports();
      } else {
        toast.error(data.message || "Failed to submit report.");
      }
    } catch (error) {
      toast.error("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  // Updated exportSingleReportToPDF to REMOVE specified fields
  const exportSingleReportToPDF = (report: ServiceReport) => {
    const doc = new jsPDF();
    doc.text(`Service Report: ${report.title}`, 14, 16);
    autoTable(doc, {
      head: [["Field", "Value"]],
      body: [
        ["Title", report.title],
        ["Report Type", report.reportType],
        // ["Total Solved Tickets", String(report.totalSolvedTickets ?? "N/A")], // REMOVED
        // ["Total Unsolved Tickets", String(report.totalUnsolvedTickets ?? "N/A")], // REMOVED
        // ["Unsolved Reasons", report.unsolvedReasons?.join(", ") ?? "N/A"], // REMOVED
        // ["Total SLAs Breached", String(report.totalSLAsBreached ?? "N/A")], // REMOVED
        // ["App Performance Rating", String(report.appPerformanceRating ?? "N/A")], // REMOVED
        ["Extra Remarks", report.extraRemarks ?? "N/A"],
        ["Filled By", report.filledBy],
        ["Created At", formatDate(report.createdAt)],
      ],
      startY: 20,
    });
    doc.save(`${report.title.replace(/\s+/g, "_")}.pdf`);
  };

  // Updated exportSingleReportToExcel to REMOVE specified fields
  const exportSingleReportToExcel = (report: ServiceReport) => {
    const data = [
      {
        Title: report.title,
        "Report Type": report.reportType,
        // "Total Solved Tickets": report.totalSolvedTickets ?? "N/A", // REMOVED
        // "Total Unsolved Tickets": report.totalUnsolvedTickets ?? "N/A", // REMOVED
        // "Unsolved Reasons": report.unsolvedReasons?.join(", ") ?? "N/A", // REMOVED
        // "Total SLAs Breached": report.totalSLAsBreached ?? "N/A", // REMOVED
        // "App Performance Rating": report.appPerformanceRating ?? "N/A", // REMOVED
        "Extra Remarks": report.extraRemarks ?? "N/A",
        "Filled By": report.filledBy,
        "Created At": formatDate(report.createdAt),
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${report.title.replace(/\s+/g, "_")}.xlsx`);
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.filledBy.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const handlePreviousPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const handleTicketIdClickForDialog = (ticket: DetailedTroubleTicket) => {
    setSelectedTicketDetails(ticket);
    setIsTicketDetailModalOpen(true);
  };

  const handleTicketPreviousPageForDialog = () => { if (ticketCurrentPageForDialog > 1) setTicketCurrentPageForDialog(ticketCurrentPageForDialog - 1); };
  const handleTicketNextPageForDialog = () => { if (ticketCurrentPageForDialog < totalTicketPagesForDialog) setTicketCurrentPageForDialog(ticketCurrentPageForDialog + 1); };


  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center mb-0">
        <div className="flex justify-center items-center mb-0">
          <Button size={'icon'} variant={'outline'} asChild>
            <button onClick={() => router.back()} className="flex items-center mr-4">
              <ArrowLeft className="size-5" />
            </button>
          </Button>
          <BookCopy className="w-7 h-7 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-50">Service Reporting</h1>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                View Submitted Reports
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
              <DialogHeader><DialogTitle>Submitted Reports</DialogTitle></DialogHeader>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search reports..." className="pl-9" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}/>
                </div>
                <div className="text-sm text-muted-foreground">Showing {(currentPage - 1) * ITEMS_PER_PAGE + (paginatedReports.length > 0 ? 1 : 0)}-{Math.min(currentPage * ITEMS_PER_PAGE, (currentPage - 1) * ITEMS_PER_PAGE + paginatedReports.length)} of {filteredReports.length} reports</div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredReports.length === 0 ? (
                  <Alert variant="default" className="max-w-md text-center mx-auto"><FileWarning className="w-6 h-6 mx-auto mb-2 text-muted-foreground" /><AlertTitle>{searchTerm ? "No matching reports found" : "No Reports Submitted"}</AlertTitle><AlertDescription>{searchTerm ? "Try a different search term." : "Once added, they'll show up here."}</AlertDescription></Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-0">
                    {paginatedReports.map((report) => (
                      <Card key={report.id} className="transition hover:shadow-md h-full flex flex-col "><CardHeader className="pb-2"><CardTitle className="text-base font-medium line-clamp-2">{report.title}</CardTitle><CardDescription className="line-clamp-1">Submitted by {report.filledBy} on {new Intl.DateTimeFormat("en-GB", {day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",}).format(new Date(report.createdAt))}</CardDescription></CardHeader><CardContent className="pt-0 space-y-2 mt-auto"><div className="flex gap-2"><Button variant="outline" size="sm" className="flex-1 justify-start gap-2" onClick={() => exportSingleReportToPDF(report)}><FileText className="w-4 h-4" /> PDF</Button><Button variant="outline" size="sm" className="flex-1 justify-start gap-2" onClick={() => exportSingleReportToExcel(report)}><FileDown className="w-4 h-4" /> Excel</Button></div></CardContent></Card>
                    ))}
                  </div>
                )}
              </div>
              {totalPages > 1 && (<div className="pt-4 border-t"><Pagination><PaginationContent><PaginationItem><PaginationPrevious onClick={currentPage === 1 ? undefined : handlePreviousPage} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} /></PaginationItem><PaginationItem><span className="text-sm">Page {currentPage} of {totalPages}</span></PaginationItem><PaginationItem><PaginationNext onClick={currentPage === totalPages ? undefined : handleNextPage} aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} /></PaginationItem></PaginationContent></Pagination></div>)}
            </DialogContent>
          </Dialog>

          <Dialog open={isViewTicketsDialogOpen} onOpenChange={(isOpen) => {
              setIsViewTicketsDialogOpen(isOpen);
              if (isOpen && allTicketsForDialog.length === 0) { fetchAllTicketsData(setAllTicketsForDialog, setLoadingTicketsForDialog); }
              if (!isOpen) { setTicketSearchTermForDialog(""); setTicketCurrentPageForDialog(1); }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline"> <TicketIcon className="w-4 h-4 mr-2" /> View All Tickets </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader><DialogTitle>All Tickets</DialogTitle></DialogHeader>
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-full max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search tickets by ID, title, status..." className="pl-9" value={ticketSearchTermForDialog} onChange={(e) => { setTicketSearchTermForDialog(e.target.value); setTicketCurrentPageForDialog(1);}}/></div>
                    <div className="text-sm text-muted-foreground">{loadingTicketsForDialog ? "Loading..." : currentTotalFilteredTicketsForDialog > 0 ? `Showing ${(ticketCurrentPageForDialog - 1) * TICKETS_DIALOG_PER_PAGE + (filteredTicketsForDialogDisplay.length > 0 ? 1: 0)}-${(ticketCurrentPageForDialog - 1) * TICKETS_DIALOG_PER_PAGE + filteredTicketsForDialogDisplay.length} of ${currentTotalFilteredTicketsForDialog} tickets` : (ticketSearchTermForDialog ? "No tickets match your search." : "No tickets available.")}</div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                    {loadingTicketsForDialog && <div className="text-center p-4">Loading tickets...</div>}
                    {!loadingTicketsForDialog && filteredTicketsForDialogDisplay.length === 0 ? (<Alert variant="default" className="max-w-md text-center mx-auto"><FileWarning className="w-6 h-6 mx-auto mb-2 text-muted-foreground" /><AlertTitle>{ticketSearchTermForDialog ? "No matching tickets found" : "No Tickets Available"}</AlertTitle><AlertDescription>{ticketSearchTermForDialog ? "Try a different search term." : "There are no tickets to display currently."}</AlertDescription></Alert>
                    ) : ( <div className="space-y-2">{filteredTicketsForDialogDisplay.map((ticket) => (<Card key={ticket.id} className="p-3 hover:shadow-md transition-shadow"><div className="flex justify-between items-start"><div className="flex-1"><h3 className="font-semibold text-base mb-1"><button onClick={() => handleTicketIdClickForDialog(ticket)} className="text-primary hover:underline focus:outline-none">Ticket #{ticket.id}</button>: <span className="font-normal">{ticket.title}</span></h3><p className="text-xs text-muted-foreground">Admin Status: {ticket.adminStatus}</p><p className="text-xs text-muted-foreground">Last Updated: {formatDate(ticket.updatedAt)}</p></div><Button variant="ghost" size="sm" onClick={() => handleTicketIdClickForDialog(ticket)} className="ml-2 shrink-0">View Details</Button></div></Card>))}</div>)}
                </div>
                {totalTicketPagesForDialog > 1 && !loadingTicketsForDialog && filteredTicketsForDialogDisplay.length > 0 && (<div className="pt-4 border-t"><Pagination><PaginationContent><PaginationItem><PaginationPrevious onClick={ticketCurrentPageForDialog === 1 ? undefined : handleTicketPreviousPageForDialog} aria-disabled={ticketCurrentPageForDialog === 1} className={ticketCurrentPageForDialog === 1 ? "pointer-events-none opacity-50" : ""} /></PaginationItem><PaginationItem><span className="text-sm">Page {ticketCurrentPageForDialog} of {totalTicketPagesForDialog}</span></PaginationItem><PaginationItem><PaginationNext onClick={ticketCurrentPageForDialog === totalTicketPagesForDialog ? undefined : handleTicketNextPageForDialog} aria-disabled={ticketCurrentPageForDialog === totalTicketPagesForDialog} className={ticketCurrentPageForDialog === totalTicketPagesForDialog ? "pointer-events-none opacity-50" : ""} /></PaginationItem></PaginationContent></Pagination></div>)}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">New Report</h3>
            <div className="grid gap-2 w-1/2">
                <label htmlFor="ticketSelectForForm" className="text-sm font-medium sr-only">
                    Select Ticket to Pre-fill Form
                </label>
                <DropdownMenu 
                    open={isTicketSelectorDropdownOpen} 
                    onOpenChange={(isOpen) => {
                        setIsTicketSelectorDropdownOpen(isOpen);
                        if (isOpen && allTicketsForSelector.length === 0) {
                            fetchAllTicketsData(setAllTicketsForSelector, setLoadingTicketsForSelector);
                        }
                    }}
                >
                <DropdownMenuTrigger asChild>
                  <Button className="w-full justify-between" variant="outline">
                    {selectedTicketForForm 
                      ? `Ticket #${selectedTicketForForm.id}: ${selectedTicketForForm.title.substring(0,30)}...`
                      : "Optionally select ticket to pre-fill..."}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-0">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by ID or title..."
                        className="pl-8"
                        value={ticketSearchTermForSelector}
                        onChange={(e) => setTicketSearchTermForSelector(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {ticketSearchTermForSelector && (
                        <X 
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); setTicketSearchTermForSelector(""); }}
                        />
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-60">
                    {loadingTicketsForSelector ? (
                         <div className="p-4 text-center text-sm text-muted-foreground">Loading tickets...</div>
                    ) : filteredTicketsForSelectorDropdown.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No tickets found
                      </div>
                    ) : (
                      filteredTicketsForSelectorDropdown.map(ticket => (
                        <DropdownMenuItem 
                          key={ticket.id} 
                          onClick={() => {
                            setSelectedTicketForForm(ticket);
                            setIsTicketSelectorDropdownOpen(false);
                          }}
                          className="flex flex-col items-start gap-1 p-3"
                        >
                          <div className="flex justify-between w-full">
                            <span className="font-medium">#{ticket.id}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted">{ticket.adminStatus}</span>
                          </div>
                          <div className="text-sm text-muted-foreground truncate w-full">
                            {ticket.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            User: {ticket.User?.name || 'N/A'}
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </ScrollArea>
                  {!loadingTicketsForSelector && filteredTicketsForSelectorDropdown.length > 0 && (
                    <div className="p-2 text-xs text-muted-foreground border-t text-center">
                      Showing {filteredTicketsForSelectorDropdown.length} of {allTicketsForSelector.length} tickets {ticketSearchTermForSelector ? "(filtered)" : "(first 50)"}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedTicketForForm && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-auto py-1 px-2 mt-1"
                    onClick={() => {
                        setSelectedTicketForForm(null);
                        setTicketSearchTermForSelector("");
                        setFormData({ title: "", reportType: "", extraRemarks: "", filledBy: "" });
                    }}>
                    Clear Selected Ticket & Reset Form
                </Button>
              )}
            </div>
          </div>
          
          <Input name="title" placeholder="Report Title" value={formData.title} onChange={handleChange} />
          <Input name="reportType" placeholder="e.g., Monthly SLA Report" value={formData.reportType} onChange={handleChange} />
          <Textarea name="extraRemarks" placeholder="Extra Remarks (optional)" value={formData.extraRemarks} onChange={handleChange} rows={5} />
          <Input name="filledBy" placeholder="Filled By (Name or Email)" value={formData.filledBy} onChange={handleChange} />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </CardContent>
      </Card>

      {selectedTicketDetails && (
        <Dialog open={isTicketDetailModalOpen} onOpenChange={setIsTicketDetailModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Ticket Details: #{selectedTicketDetails.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-4 text-sm">
              <p><strong>Title:</strong> {selectedTicketDetails.title}</p>
              <hr className="my-2"/>
              <p><strong>Last Updated:</strong> {formatDate(selectedTicketDetails.updatedAt)}</p>
              <p><strong>OEM Status:</strong> <span className="font-medium">{selectedTicketDetails.oemStatus}</span></p>
              <p><strong>Admin Status:</strong> {selectedTicketDetails.adminStatus}</p>
              <p><strong>Escalation Level:</strong> {selectedTicketDetails.escalationLevel !== null ? `Level ${selectedTicketDetails.escalationLevel}` : 'None'}</p>
              <p><strong>Submitted By:</strong> {selectedTicketDetails.User?.name} ({selectedTicketDetails.User?.email})</p>
              <p><strong>Created At:</strong> {formatDate(selectedTicketDetails.createdAt)}</p>
              <div>
                <strong>Remarks:</strong>
                <div className="mt-1 p-2 border rounded-md bg-muted/50 max-h-32 overflow-y-auto">
                  {selectedTicketDetails.remarks || "No remarks provided."}
                </div>
              </div>
            </div>
             <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsTicketDetailModalOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}