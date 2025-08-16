"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AlertCircle, ArrowLeft, ChevronDown, FileText, ListChecks, Search, Users2Icon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// --- Interfaces ---
interface AvailableTicket {
  id: number;
  title: string;
  createdAt: string;
  adminStatus: string;
  oemStatus: string;
  formType: string;
  description: string;
}

interface Report {
  id: number;
  productName: string;
  productCategory: string;
  modelNumber: string;
  manufacturerName: string;
  ticketId: number;
  ticketDate: string;
  adminStatus: string;
  oemStatus: string;
  ticketType: string;
  claimDescription: string;
  causeOfFailure: string;
  adminComments?: string;
  oemComments?: string;
}

// --- Constants ---
const ITEMS_PER_PAGE = 5;
const TICKET_SELECTOR_PAGE_SIZE = 50;

const initialFormData = {
  productName: "", productCategory: "", modelNumber: "", manufacturerName: "",
  ticketId: "", ticketDate: "", adminStatus: "", oemStatus: "",
  ticketType: "", claimDescription: "", causeOfFailure: "",
  adminComments: "", oemComments: "",
};

// --- Utility: JSON Description Parser & Formatter ---
interface ParsedDescriptionItem {
  type: 'paragraph' | 'heading' | 'listItem' | 'raw';
  content: string;
  level?: number;
}

const parseAndFormatJsonDescription = (jsonString: string | undefined | null): ParsedDescriptionItem[] => {
  if (!jsonString) return [{ type: 'paragraph', content: "No description provided." }];
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed === 'string') return [{ type: 'paragraph', content: parsed }];
    if (Array.isArray(parsed)) {
      return parsed.map(item => {
        if (typeof item === 'string') return { type: 'listItem', content: item } as ParsedDescriptionItem;
        if (typeof item === 'object' && item !== null) {
          if (item.type === 'heading' && item.text) return { type: 'heading', content: item.text, level: item.level || 2 } as ParsedDescriptionItem;
          if (item.type === 'paragraph' && item.text) return { type: 'paragraph', content: item.text } as ParsedDescriptionItem;
          if (item.label && item.value) return { type: 'listItem', content: `${item.label}: ${item.value}` } as ParsedDescriptionItem;
          if (item.text) return { type: 'listItem', content: item.text } as ParsedDescriptionItem;
          return { type: 'raw', content: JSON.stringify(item, null, 2) } as ParsedDescriptionItem;
        }
        return { type: 'raw', content: String(item) } as ParsedDescriptionItem;
      });
    }
    if (typeof parsed === 'object' && parsed !== null) {
      const items: ParsedDescriptionItem[] = [];
      for (const key in parsed) {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) {
          const value = parsed[key];
          const readableKey = key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
          items.push({ type: 'paragraph', content: `${readableKey}: ${value}` });
        }
      }
      return items.length > 0 ? items : [{ type: 'paragraph', content: "Description object is empty." }];
    }
    return [{ type: 'raw', content: String(parsed) }];
  } catch (e) {
    return [{ type: 'paragraph', content: jsonString }];
  }
};

const parsedDescriptionToPlainText = (parsedItems: ParsedDescriptionItem[]): string => {
  return parsedItems.map(item => {
    switch (item.type) {
      case 'heading': return `${'#'.repeat(item.level || 2)} ${item.content}`;
      case 'listItem': return `- ${item.content}`;
      default: return item.content;
    }
  }).join("\n\n");
};

// --- Component ---
export default function ProductSpecificReporting() {
  const [reports, setReports] = useState<Report[]>([]);
  const [formData, setFormData] = useState<any>(initialFormData);
  const [parsedClaimDescriptionForDisplay, setParsedClaimDescriptionForDisplay] = useState<ParsedDescriptionItem[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const [allTicketsForSelector, setAllTicketsForSelector] = useState<AvailableTicket[]>([]);
  const [selectedTicketForForm, setSelectedTicketForForm] = useState<AvailableTicket | null>(null);
  const [isTicketSelectorDropdownOpen, setIsTicketSelectorDropdownOpen] = useState(false);
  const [ticketSearchTermForSelector, setTicketSearchTermForSelector] = useState("");
  const [loadingTicketsForSelector, setLoadingTicketsForSelector] = useState(false);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get("/api/oem/product-specific-reports");
      setReports(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load reports.");
    }
  };

  const fetchAvailableTicketsForSelector = async () => {
    if (allTicketsForSelector.length > 0 && !ticketSearchTermForSelector && !loadingTicketsForSelector) return;
    setLoadingTicketsForSelector(true);
    try {
      const response = await axios.get<AvailableTicket[]>("/api/oem/available-tickets");
      setAllTicketsForSelector(response.data);
    } catch (error: any) {
      toast.error("Failed to load available tickets.");
    } finally {
      setLoadingTicketsForSelector(false);
    }
  };
  
  useEffect(() => {
    if (selectedTicketForForm) {
      const ticket = selectedTicketForForm;
      const parsedDesc = parseAndFormatJsonDescription(ticket.description);
      setParsedClaimDescriptionForDisplay(parsedDesc);

      setFormData((prev: any) => ({
        ...initialFormData, // Reset product-specific fields first
        productName: prev.productName, // Keep manually entered product name if any
        modelNumber: prev.modelNumber, // Keep manually entered model number
        productCategory: prev.productCategory,
        manufacturerName: prev.manufacturerName,
        ticketId: ticket.id.toString(),
        ticketDate: ticket.createdAt ? new Date(ticket.createdAt).toISOString().split('T')[0] : "",
        adminStatus: ticket.adminStatus || "",
        oemStatus: ticket.oemStatus || "",
        ticketType: ticket.formType || "",
        claimDescription: parsedDescriptionToPlainText(parsedDesc), 
      }));
    } else {
      // If no ticket is selected, or selection is cleared,
      // we might want to clear auto-filled fields but keep manual product details
      setFormData(prev => ({
        ...prev, // Keep existing manually entered data
        ticketId: "", 
        ticketDate: "",
        adminStatus: "",
        oemStatus: "",
        ticketType: "",
        claimDescription: "",
      }));
      setParsedClaimDescriptionForDisplay([]);
    }
  }, [selectedTicketForForm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (name === "claimDescription" && !selectedTicketForForm) { // Only update rich display if user is typing and no ticket selected
        setParsedClaimDescriptionForDisplay(parseAndFormatJsonDescription(value));
    }
  };
  
  const handleClearSelectedTicketAndResetForm = () => {
    setSelectedTicketForForm(null); // This will trigger the useEffect above to clear ticket-related fields
    setTicketSearchTermForSelector("");
    // Keep manually entered product fields, clear others by resetting to a version of initialFormData
    setFormData(prev => ({
        ...initialFormData,
        productName: prev.productName,
        modelNumber: prev.modelNumber,
        productCategory: prev.productCategory,
        manufacturerName: prev.manufacturerName,
        causeOfFailure: prev.causeOfFailure, // Keep manual report details too
        adminComments: prev.adminComments,
        oemComments: prev.oemComments,
    }));
    setParsedClaimDescriptionForDisplay([]);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!formData.ticketId) {
      toast.error("Please select an Associated Ticket ID from the dropdown."); return;
    }
    const requiredReportFields: (keyof typeof initialFormData)[] = ["productName", "modelNumber", "causeOfFailure"];
    for (const field of requiredReportFields) {
        if (!formData[field]) {
            toast.error(`Please fill in the '${field.replace(/([A-Z])/g, ' $1').trim()}' field for this report.`); return;
        }
    }
    
    const payload = { 
        productName: formData.productName,
        productCategory: formData.productCategory,
        modelNumber: formData.modelNumber,
        manufacturerName: formData.manufacturerName,
        ticketId: parseInt(formData.ticketId, 10),
        ticketDate: formData.ticketDate,
        adminStatus: formData.adminStatus,
        oemStatus: formData.oemStatus,
        ticketType: formData.ticketType,
        claimDescription: formData.claimDescription,
        causeOfFailure: formData.causeOfFailure,
        adminComments: formData.adminComments,
        oemComments: formData.oemComments,
     };

    try {
      const response = await axios.post("/api/oem/product-specific-reports", payload);
      setReports(prev => [response.data.newReport, ...prev]);
      const keptProductName = formData.productName; // Example if you want to keep some fields for next report
      handleClearSelectedTicketAndResetForm();
      // If you want to auto-fill product name for next report of same product
      // setFormData(prev => ({...prev, productName: keptProductName})); 
      toast.success("Product report created successfully!");
      fetchAvailableTicketsForSelector(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create report.");
    }
  };

  const handleDownloadPDF = (report: Report) => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setTextColor(40);
    doc.text("Product-Specific Report", 14, 22);

    autoTable(doc, {
      startY: 30, head: [['Field', 'Value']],
      body: [
        ['Report ID', `#${report.id}`],
        ['Product Name', report.productName],
        ['Category', report.productCategory || 'N/A'],
        ['Model Number', report.modelNumber],
        ['Manufacturer', report.manufacturerName || 'N/A'],
        ['Ticket ID', `#${report.ticketId}`],
        ['Ticket Date', report.ticketDate ? new Date(report.ticketDate).toLocaleDateString() : 'N/A'],
        ['Ticket Type', report.ticketType || 'N/A'],
        ['Admin Status', report.adminStatus || 'N/A'],
        ['OEM Status', report.oemStatus || 'N/A'],
      ],
      theme: 'striped', styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [22, 160, 133], textColor: 255, fontSize: 10, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    let currentY = (doc as any).lastAutoTable.finalY + 10;
    const drawSection = (title: string, content: string | undefined | null, isJsonContent = false) => {
        if (content === undefined || content === null || (typeof content === 'string' && content.trim() === "")) return;
        doc.setFontSize(12); doc.setTextColor(50,50,50); doc.text(title, 14, currentY); currentY += 7;
        doc.setFontSize(9); doc.setTextColor(70,70,70);
        const itemsToRender = isJsonContent ? parseAndFormatJsonDescription(content) : [{type: 'paragraph', content: content} as ParsedDescriptionItem];
        itemsToRender.forEach(item => {
            let textContent = item.content;
            if (item.type === 'heading') { doc.setFontSize(item.level === 1 ? 11 : (item.level === 2 ? 10 : 9)); doc.setFont('helvetica', 'bold'); textContent = `${item.content}`; }
            else if (item.type === 'listItem') { textContent = `• ${item.content}`; }
            const splitText = doc.splitTextToSize(textContent, doc.internal.pageSize.getWidth() - 28);
            doc.text(splitText, 14, currentY); currentY += (splitText.length * 4.5) + 2;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
        });
        currentY += 4;
    };
    drawSection("Claim Description", report.claimDescription, true);
    drawSection("Cause of Failure", report.causeOfFailure);
    drawSection("Admin Comments", report.adminComments);
    drawSection("OEM Comments", report.oemComments);
    doc.save(`${report.productName.replace(/\s+/g, "_")}_Report_${report.id}.pdf`);
  };

  const handleDownloadExcel = (report: Report) => {
    const plainTextClaimDesc = parsedDescriptionToPlainText(parseAndFormatJsonDescription(report.claimDescription));
    const excelData = [{
        "Report ID": report.id, "Product Name": report.productName,
        "Product Category": report.productCategory || 'N/A',
        "Model Number": report.modelNumber,
        "Manufacturer Name": report.manufacturerName || 'N/A',
        "Ticket ID": report.ticketId,
        "Ticket Date": report.ticketDate ? new Date(report.ticketDate).toLocaleDateString() : 'N/A',
        "Admin Status": report.adminStatus || 'N/A', "OEM Status": report.oemStatus || 'N/A',
        "Ticket Type": report.ticketType || 'N/A', "Claim Description": plainTextClaimDesc,
        "Cause of Failure": report.causeOfFailure,
        "Admin Comments": report.adminComments || 'N/A', "OEM Comments": report.oemComments || 'N/A',
    }];
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${report.productName.replace(/\s+/g, "_")}_Report_${report.id}.xlsx`);
  };

  const filteredReports = reports.filter(r => r.productName.toLowerCase().includes(searchTerm.toLowerCase()) || r.modelNumber.toLowerCase().includes(searchTerm.toLowerCase()) || r.ticketId.toString().includes(searchTerm));
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = filteredReports.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const filteredTicketsForSelectorDropdown = useMemo(() => {
    if (!ticketSearchTermForSelector) return allTicketsForSelector.slice(0, TICKET_SELECTOR_PAGE_SIZE);
    const term = ticketSearchTermForSelector.toLowerCase();
    return allTicketsForSelector.filter(t => t.id.toString().includes(term) || t.title.toLowerCase().includes(term)).slice(0, TICKET_SELECTOR_PAGE_SIZE);
  }, [ticketSearchTermForSelector, allTicketsForSelector]);

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="outline" onClick={() => router.back()} aria-label="Go back"><ArrowLeft className="size-5" /></Button>
          <Users2Icon className="size-7 text-primary" /><h1 className="text-2xl font-semibold">Product Reporting</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <ListChecks className="mr-2 size-4"/>
              View Generated Reports
              </Button>
              </DialogTrigger>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl">Generated Product Reports</DialogTitle>
              </DialogHeader>
            <div className="flex items-center justify-between gap-4 my-4">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input placeholder="Search by product, model, ticket ID..." className="pl-9" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
              </div>
              <p className="text-sm text-muted-foreground whitespace-nowrap">{filteredReports.length > 0 ? `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)} of ${filteredReports.length}`: "0 reports"}</p>
            </div>
            <ScrollArea className="flex-1 -mx-6 px-6">
              {filteredReports.length === 0 ? ( <div className="flex flex-col items-center justify-center h-full py-12 text-center"><FileText className="size-12 text-muted-foreground/50 mb-3"/><p className="text-muted-foreground">{searchTerm ? "No reports match." : "No reports generated."}</p></div>
              ) : ( <div className="space-y-3">{paginatedReports.map((report) => ( <Card key={report.id} className="shadow-sm transition-shadow hover:shadow-md"><CardContent className="p-4 flex items-start justify-between gap-4"> <div className="flex-grow"> <h3 className="font-medium">{report.productName}</h3> <p className="text-xs text-muted-foreground">Model: {report.modelNumber} | Ticket: #{report.ticketId}</p> <p className="text-xs mt-1 text-muted-foreground"><span className="font-medium ">Status:</span> {report.adminStatus} / {report.oemStatus}</p> </div> <div className="flex gap-2 shrink-0"><Button variant="ghost" size="sm" onClick={() => handleDownloadPDF(report)}>PDF</Button><Button variant="ghost" size="sm" onClick={() => handleDownloadExcel(report)}>Excel</Button></div> </CardContent></Card>))}</div>)}
            </ScrollArea>
            {totalPages > 1 && ( <div className="pt-4 border-t mt-auto"><Pagination><PaginationContent><PaginationItem><PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p-1))} aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} /></PaginationItem><PaginationItem><span className="text-sm font-medium">Page {currentPage} of {totalPages}</span></PaginationItem><PaginationItem><PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} /></PaginationItem></PaginationContent></Pagination></div>)}
          </DialogContent>
        </Dialog>
      </header>

      <main>
        <Card className="w-full max-w-3xl mx-auto shadow-lg border-b">
          <CardHeader className="border-b p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-lg font-semibold">Create New Product Report</CardTitle>
              <DropdownMenu open={isTicketSelectorDropdownOpen} onOpenChange={(isOpen) => { setIsTicketSelectorDropdownOpen(isOpen); if (isOpen) { fetchAvailableTicketsForSelector(); }}}>
                  <DropdownMenuTrigger asChild><Button className="w-full sm:w-auto justify-between min-w-[240px]" variant="outline">{selectedTicketForForm ? `Ticket #${selectedTicketForForm.id}` : "Select Associated Ticket*"}<ChevronDown className="size-4 ml-2 opacity-70" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-0">
                    <div className="p-2 border-b"><div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input placeholder="Search ID or title..." className="pl-8 h-9 text-sm" value={ticketSearchTermForSelector} onChange={(e) => setTicketSearchTermForSelector(e.target.value)} onClick={(e) => e.stopPropagation()}/>{ticketSearchTermForSelector && (<X className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground cursor-pointer hover:text-destructive" onClick={(e) => { e.stopPropagation(); setTicketSearchTermForSelector(""); }}/>)}</div></div>
                    <ScrollArea className="h-[200px]">
                      {loadingTicketsForSelector ? (<div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                      ) : filteredTicketsForSelectorDropdown.length === 0 ? (<div className="p-4 text-center text-sm text-muted-foreground">{ticketSearchTermForSelector ? "No match" : "No tickets"}</div>
                      ) : ( filteredTicketsForSelectorDropdown.map(ticket => ( <DropdownMenuItem key={ticket.id} onClick={() => { setSelectedTicketForForm(ticket); setIsTicketSelectorDropdownOpen(false); setError(""); setSuccess(""); }} className="flex flex-col items-start gap-0.5 p-2.5 cursor-pointer text-xs"> <div className="flex justify-between w-full items-center"><span className="font-medium text-sm">#{ticket.id}: {ticket.title.substring(0,30)}{ticket.title.length > 30 ? '...' : ''}</span><span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium">{ticket.adminStatus}</span></div> <p className="text-muted-foreground text-[11px]">OEM: {ticket.oemStatus}</p> </DropdownMenuItem>)))}
                    </ScrollArea>
                    {!loadingTicketsForSelector && allTicketsForSelector.length > 0 && ( <DropdownMenuLabel className="p-2 text-[10px] text-muted-foreground border-t text-center font-normal">Showing {filteredTicketsForSelectorDropdown.length}{ticketSearchTermForSelector && allTicketsForSelector.length > 0 ? ` of ${allTicketsForSelector.filter(t=>t.id.toString().includes(ticketSearchTermForSelector) || t.title.toLowerCase().includes(ticketSearchTermForSelector.toLowerCase())).length} (filtered)` : ` of ${allTicketsForSelector.length} total`}{!ticketSearchTermForSelector && allTicketsForSelector.length > TICKET_SELECTOR_PAGE_SIZE ? ` (top ${TICKET_SELECTOR_PAGE_SIZE})` : ""}</DropdownMenuLabel>)}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {selectedTicketForForm && (<button className="text-xs mt-2 text-destructive hover:underline px-4 pb-2 text-left block" onClick={handleClearSelectedTicketAndResetForm}>Clear selection & reset ticket fields</button>)}
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert variant="default" className="mb-4 bg-green-50 border-green-200 text-green-700"><ListChecks className="h-4 w-4 text-green-600" /><AlertTitle>Success</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

            <form onSubmit={handleSubmit} className="space-y-8">
              <section>
                <h3 className="text-base font-medium mb-3"><b><u>Product Details (for this report)</u></b></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                  {(["productName", "modelNumber", "productCategory", "manufacturerName"] as const).map(field => {
                      const isRequired = ["productName", "modelNumber"].includes(field);
                      const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      return (
                        <div key={field}>
                            <label htmlFor={field} className="block text-xs font-medium mb-1">
                            {label} {isRequired && <span className="text-destructive">*</span>}
                            </label>
                            <Input id={field} name={field} type="text" placeholder={`Enter ${label.toLowerCase()}`} value={formData[field] || ""} onChange={handleInputChange} required={isRequired} className="text-sm"/>
                        </div>
                      );
                  })}
                </div>
              </section>
              <Separator className="my-6"/>

              <section>
                <h3 className="text-base font-medium mb-3"><b><u>Associated Ticket Information</u></b></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                    <div><label htmlFor="ticketIdDisplay" className="block text-xs font-medium mb-1">Selected Ticket ID <span className="text-destructive">*</span></label><Input id="ticketIdDisplay" value={formData.ticketId || "N/A (Select a ticket)"} readOnly disabled className="text-sm cursor-not-allowed"/></div>
                    <div><label htmlFor="ticketDate" className="block text-xs font-medium mb-1">Ticket Date</label><Input id="ticketDate" name="ticketDate" type="date" value={formData.ticketDate || ""} readOnly className="text-sm cursor-not-allowed"/></div>
                    <div><label htmlFor="ticketType" className="block text-xs font-medium mb-1">Ticket Type</label><Input id="ticketType" name="ticketType" value={formData.ticketType || ""} readOnly className="text-sm cursor-not-allowed"/></div>
                    <div><label htmlFor="adminStatus" className="block text-xs font-medium mb-1">Admin Status</label><Input id="adminStatus" name="adminStatus" value={formData.adminStatus || ""} readOnly className="text-sm cursor-not-allowed"/></div>
                    <div className="md:col-span-2"><label htmlFor="oemStatus" className="block text-xs font-medium mb-1">OEM Status</label><Input id="oemStatus" name="oemStatus" value={formData.oemStatus || ""} readOnly className="text-sm cursor-not-allowed"/></div>
                </div>
                <div className="mt-4">
                    <label className="block text-xs font-medium mb-1">Claim Description (from ticket)</label>
                    {selectedTicketForForm && parsedClaimDescriptionForDisplay.length > 0 ? (
                        <div className="p-3 border rounded-md text-xs space-y-1.5 max-h-40 overflow-y-auto prose prose-sm prose-slate max-w-none">
                            {parsedClaimDescriptionForDisplay.map((item, index) => (
                                <Fragment key={index}>
                                {item.type === 'heading' && <p className={`font-semibold ${item.level === 1 ? 'text-sm' : 'text-xs'}`}>{item.content}</p>}
                                {item.type === 'paragraph' && <p>{item.content}</p>}
                                {item.type === 'listItem' && <li className="ml-4">{item.content}</li>}
                                {item.type === 'raw' && <pre className="text-xs bg-slate-100 p-1 rounded overflow-x-auto">{item.content}</pre>}
                                </Fragment>
                            ))}
                        </div>
                    ) : ( <Textarea id="claimDescription" name="claimDescription" placeholder="Description from ticket (auto-filled) or enter if creating report without prior ticket data." value={formData.claimDescription || ""} onChange={handleInputChange} rows={3} className="text-sm" readOnly={!!selectedTicketForForm && parsedClaimDescriptionForDisplay.length > 0} /> )}
                </div>
              </section>
              <Separator className="my-6"/>

              <section>
                <h3 className="text-base font-medium mb-3">Report Analysis & Comments</h3>
                <div className="space-y-4">
                  <div><label htmlFor="causeOfFailure" className="block text-xs font-medium mb-1">Cause of Failure Analysis <span className="text-destructive">*</span></label><Textarea id="causeOfFailure" name="causeOfFailure" placeholder="Detailed analysis of the failure for this report..." value={formData.causeOfFailure || ""} onChange={handleInputChange} required rows={4} className="text-sm"/></div>
                  <div><label htmlFor="adminComments" className="block text-xs font-medium mb-1">Admin Comments (Optional)</label><Textarea id="adminComments" name="adminComments" placeholder="Internal admin notes for this report..." value={formData.adminComments || ""} onChange={handleInputChange} rows={3} className="text-sm"/></div>
                  <div><label htmlFor="oemComments" className="block text-xs font-medium mb-1">OEM Comments (Optional)</label><Textarea id="oemComments" name="oemComments" placeholder="Specific comments for the OEM related to this report..." value={formData.oemComments || ""} onChange={handleInputChange} rows={3} className="text-sm"/></div>
                </div>
              </section>

              <Button type="submit" size="lg" className="w-full font-medium">Create This Product Report</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}