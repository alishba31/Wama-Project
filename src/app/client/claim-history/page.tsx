"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { useEffect, useState } from "react";

interface Feedback {
  id: number;
  comment: string;
  rating: number;
}

interface TroubleTicket {
  id: number;
  title: string;
  description: string;
  adminStatus: string;
  oemStatus: string;
  feedbacks: Feedback[]; // Always ensure this is an array
  createdAt: string;
  updatedAt: string;
}

export default function ClaimHistory() {
  const [troubleTickets, setTroubleTickets] = useState<TroubleTicket[]>([]);
  const [feedbackData, setFeedbackData] = useState<Record<number, { comment: string; rating: number }>>({});

  useEffect(() => {
    fetchTroubleTickets();
  }, []);

  const fetchTroubleTickets = async () => {
    try {
      const res = await axios.get("/api/client/claim-history");
      const data = res.data.map((ticket: TroubleTicket) => ({
        ...ticket,
        feedbacks: ticket.Feedback || [], // Map feedbacks properly
      }));
      setTroubleTickets(data);
    } catch (err) {
      console.error("Failed to load trouble ticket history", err);
      toast({
        title: "Error",
        description: "Failed to load trouble ticket history.",
        variant: "destructive",
      });
    }
  };
  

  const handleFeedbackChange = (ticketId: number, field: "comment" | "rating", value: string | number) => {
    setFeedbackData((prev) => ({
      ...prev,
      [ticketId]: {
        ...prev[ticketId],
        [field]: value,
      },
    }));
  };

  const handleFeedbackSubmit = async (ticketId: number) => {
    const feedback = feedbackData[ticketId];
    if (!feedback || !feedback.comment || feedback.rating < 1 || feedback.rating > 5) {
      toast({
        title: "Error",
        description: "Please provide a valid comment and a rating between 1 and 5.",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post("/api/client/submit-feedback", {
        troubleTicketId: ticketId,
        comment: feedback.comment,
        rating: feedback.rating,
      });

      toast({
        title: "Success",
        description: "Your feedback has been submitted successfully.",
        variant: "default",
      });

      setFeedbackData((prev) => ({ ...prev, [ticketId]: { comment: "", rating: 0 } }));
      await fetchTroubleTickets(); // Re-fetch to update the UI
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error submitting feedback",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
      IN_PROGRESS: { bg: "bg-blue-500/10", text: "text-blue-500" },
      COMPLETED: { bg: "bg-green-500/10", text: "text-green-500" },
      REJECTED: { bg: "bg-red-500/10", text: "text-red-500" },
    };

    const config = statusConfig[status.toUpperCase()] || {
      bg: "bg-gray-500/10",
      text: "text-gray-500",
    };

    return (
      <Badge variant="outline" className={`${config.bg} ${config.text}`}>
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center max-h-screen p-6">
      <Card className="w-full max-w-4xl shadow-lg max-h-screen overflow-y-auto">
        <CardHeader>
          <CardTitle>Trouble Ticket History</CardTitle>
          <CardDescription>View your trouble tickets and provide feedback</CardDescription>
        </CardHeader>
        <CardContent>
          {troubleTickets.length === 0 ? (
            <p className="text-gray-600">No trouble tickets available</p>
          ) : (
            <ul className="space-y-4">
              {troubleTickets.map((ticket) => (
                <li key={ticket.id} className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="font-medium">Title: {ticket.title}</p>
                      <p className="text-sm text-gray-600">Description: {ticket.description}</p>
                      <div className="flex items-center gap-2">
                        Admin Status: {getStatusBadge(ticket.adminStatus)}
                      </div>
                      <div className="flex items-center gap-2">
                        OEM Status: {getStatusBadge(ticket.oemStatus)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Last Updated: {new Date(ticket.updatedAt).toLocaleString()}
                      </p>
                      {ticket.feedbacks?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Previous Feedback:</p>
                          <p className="text-sm text-gray-600">{ticket.feedbacks[0].comment}</p>
                          <p className="text-sm text-gray-600">Rating: {ticket.feedbacks[0].rating}/5</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {((ticket.adminStatus === "COMPLETED" || ticket.oemStatus === "COMPLETED") &&
                    ticket.feedbacks?.length === 0) && (
                    <div className="mt-4 space-y-3">
                      <Textarea
                        placeholder="Share your experience with this ticket..."
                        value={feedbackData[ticket.id]?.comment || ""}
                        onChange={(e) => handleFeedbackChange(ticket.id, "comment", e.target.value)}
                        className="w-full resize-none"
                      />
                      <div className="flex gap-4 items-center">
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          placeholder="Rating (1-5)"
                          value={feedbackData[ticket.id]?.rating || ""}
                          onChange={(e) => handleFeedbackChange(ticket.id, "rating", Number(e.target.value))}
                          className="w-32"
                        />
                        <Button
                          onClick={() => handleFeedbackSubmit(ticket.id)}
                          className="ml-auto"
                        >
                          Submit Feedback
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
