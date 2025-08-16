"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ArrowLeft, CheckCircle, ChevronDown, Clock, Loader, Search, ShieldCheck, X, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface TroubleTicket {
  id: number;
  title: string;
  adminStatus: string;
  remarks: string;
  createdAt: string;
}

export default function UpdateTTStatus() {
  const [tickets, setTickets] = useState<TroubleTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<TroubleTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState({ text: "", isError: false });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("/api/admin/claims");
        setTickets(res.data);
        setFilteredTickets(res.data.slice(0, 50)); // Initial load with first 50 tickets
      } catch (error) {
        console.error("Failed to load tickets", error);
        setMessage({ text: "Failed to load tickets", isError: true });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = tickets.filter(ticket => 
        ticket.id.toString().includes(searchTerm) || 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTickets(filtered.slice(0, 50)); // Limit to 50 results
    } else {
      setFilteredTickets(tickets.slice(0, 50)); // Default to first 50 tickets
    }
  }, [searchTerm, tickets]);

  const selectedTicket = useMemo(() => 
    tickets.find(ticket => ticket.id === selectedTicketId),
    [selectedTicketId, tickets]
  );

  useEffect(() => {
    if (selectedTicket) {
      setNewStatus(selectedTicket.adminStatus);
      setRemarks(selectedTicket.remarks || "");
    }
  }, [selectedTicket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId) {
      setMessage({ text: "Please select a ticket", isError: true });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("/api/admin/update-claim-status", {
        troubleTicketId: selectedTicketId,
        newStatus,
        remarks,
      });
      
      setMessage({ text: res.data.message, isError: false });
      toast({
        title: "Status Updated",
        description: `Ticket #${selectedTicketId} has been updated to ${newStatus}`,
        variant: "default",
      });
      
      // Refresh tickets list
      const updatedTickets = await axios.get("/api/admin/claims");
      setTickets(updatedTickets.data);
    } catch (error: any) {
      console.error("Update failed", error);
      const errorMessage = error.response?.data?.message || "Failed to update ticket status";
      setMessage({ text: errorMessage, isError: true });
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Pending</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500">In Progress</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500">Completed</Badge>;
         case "REJECTED":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex flex-col items-center justify-center max-h-screen p-6">
      <Card className="w-full max-w-prose shadow-lg">
        <CardHeader>
        <div className="flex items-center mb-0">
          <Button size={'icon'} variant={'outline'} asChild>
            <button onClick={() => router.back()} className="flex items-center mr-4">
              <ArrowLeft className="size-5" />
            </button>
            </Button>
            <ShieldCheck className="w-7 h-7 text-primary mr-1" />
            <CardTitle>Update Claim Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="ticketSelect" className="text-sm font-medium">
                Select Trouble Ticket
              </label>
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full justify-between" variant="outline">
                    {selectedTicket 
                      ? `#${selectedTicket.id}: ${selectedTicket.title}`
                      : "Search for a ticket..."}
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {searchTerm && (
                        <X 
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer"
                          onClick={() => setSearchTerm("")}
                        />
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-60">
                    {filteredTickets.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No tickets found
                      </div>
                    ) : (
                      filteredTickets.map(ticket => (
                        <DropdownMenuItem 
                          key={ticket.id} 
                          onClick={() => {
                            setSelectedTicketId(ticket.id);
                            setIsDropdownOpen(false);
                          }}
                          className="flex flex-col items-start gap-1 p-3"
                        >
                          <div className="flex justify-between w-full">
                            <span className="font-medium">#{ticket.id}</span>
                            {getStatusBadge(ticket.adminStatus)}
                          </div>
                          <div className="text-sm text-muted-foreground truncate w-full">
                            {ticket.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created: {formatDate(ticket.createdAt)}
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </ScrollArea>
                  {filteredTickets.length > 0 && (
                    <div className="p-2 text-xs text-muted-foreground border-t text-center">
                      Showing {filteredTickets.length} of {tickets.length} tickets
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {selectedTicket && (
              <>
                <div className="grid gap-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Update Status
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full justify-between" variant="outline">
                        {newStatus ? (
                          <div className="flex items-center">
                            {newStatus === "PENDING" && <Clock className="w-4 h-4 text-blue-500 mr-2" />}
                            {newStatus === "IN_PROGRESS" && <Loader className="w-4 h-4 text-orange-500 mr-2" />}
                            {newStatus === "COMPLETED" && <CheckCircle className="w-4 h-4 text-green-500 mr-2" />}
                                {newStatus === "REJECTED" && <XCircle className="w-4 h-4 text-red-500 mr-2" />}
                            {newStatus}
                          </div>
                        ) : "Select Status"}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => setNewStatus("PENDING")}>
                        <Clock className="w-5 h-5 text-blue-500 mr-2" />
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNewStatus("IN_PROGRESS")}>
                        <Loader className="w-5 h-5 text-orange-500 mr-2" />
                        In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNewStatus("COMPLETED")}>
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        Completed
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setNewStatus("REJECTED")}>
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                        Rejected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="remarks" className="text-sm font-medium">
                    Remarks
                  </label>
                  <Textarea
                    id="remarks"
                    placeholder="Add any remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !selectedTicket}>
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : "Update Status"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          {message.text && (
            <p className={`text-sm ${message.isError ? "text-red-500" : "text-green-500"}`}>
              {message.text}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}