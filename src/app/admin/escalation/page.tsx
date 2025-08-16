// New Code
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ArrowLeft, ChartColumnIncreasingIcon, ChevronDown, Loader, Search, X } from "lucide-react";
import router from "next/router";
import { useEffect, useState } from "react";

interface Ticket {
  id: number;
  title: string;
  escalationLevel: number;
  adminStatus: string;
  createdAt: string;
}

export default function AdminEscalationPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [escalationLevel, setEscalationLevel] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/admin/claims");
        setTickets(res.data);
        setFilteredTickets(res.data.slice(0, 50)); // Initial load with first 50 tickets
      } catch (error) {
        console.error("Failed to load tickets", error);
        toast({
          title: "Error",
          description: "Failed to load tickets",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
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

  const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId);

  const handleEscalationUpdate = async () => {
    if (!selectedTicketId || !escalationLevel) {
      toast({
        title: "Error",
        description: "Please select a ticket and escalation level",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/escalate-tickets", {
        ticketId: selectedTicketId,
        escalationLevel: parseInt(escalationLevel, 10),
      });

      toast({
        title: "Success",
        description: response.data.message || "Escalation level updated successfully",
        variant: "default",
      });

      // Refresh tickets list
      const updatedTickets = await axios.get("/api/admin/claims");
      setTickets(updatedTickets.data);
      setSelectedTicketId(null);
      setEscalationLevel("");
    } catch (err: any) {
      let errorMessage = "Failed to update escalation level";
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = `Ticket ID ${selectedTicketId} does not exist`;
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.message || "Invalid request";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEscalationBadge = (level: number) => {
    switch (level) {
      case 1:
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Level 1</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500">Level 2</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500">None</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500">Pending</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500">In Progress</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex items-start justify-center max-h-screen p-4">
      <Card className="w-full max-w-prose shadow-lg">
        <CardHeader className="text-center">
        <div className="flex items-center mb-0">
          <Button size={'icon'} variant={'outline'} asChild>
            <button onClick={() => router.back()} className="flex items-center mr-4">
              <ArrowLeft className="size-5" />
            </button>
            </Button>
            <ChartColumnIncreasingIcon className="w-7 h-7 text-primary mr-1" />
            <CardTitle>Escalation Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">
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
                          <div className="flex gap-2">
                            {getStatusBadge(ticket.adminStatus)}
                            {getEscalationBadge(ticket.escalationLevel)}
                          </div>
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
                <label className="text-sm font-medium">
                  Current Escalation Level
                </label>
                <div className="px-3 py-2 border rounded-lg">
                  {getEscalationBadge(selectedTicket.escalationLevel)}
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  New Escalation Level
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full justify-between" variant="outline">
                      {escalationLevel === "1" ? "Level 1" :
                       escalationLevel === "2" ? "Level 2" :
                       "Select Escalation Level"}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => setEscalationLevel("1")}>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 mr-2">Level 1</Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEscalationLevel("2")}>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-500 mr-2">Level 2</Badge>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}

          <Button
            onClick={handleEscalationUpdate}
            className="w-full"
            disabled={loading || !selectedTicket || !escalationLevel}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : "Update Escalation Level"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}