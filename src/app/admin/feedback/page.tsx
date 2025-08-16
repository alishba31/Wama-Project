// app/admin/feedback/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast"; // Assuming you have this
import { AlertCircle, CalendarDays, MessageSquare, Star, Ticket, UserCircle } from 'lucide-react'; // Icons
import { useEffect, useState } from 'react';

// Define types for the fetched data
interface UserInfo {
  id: number;
  name?: string | null;
  email: string;
}

interface TicketInfo {
  id: number;
  title: string;
}

interface FeedbackEntry {
  id: number;
  comment: string;
  rating: number;
  createdAt: string; // ISO date string
  User: UserInfo;
  TroubleTicket: TicketInfo;
}

const AdminFeedbackPage = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/feedback', {
          credentials: 'include', // If your API uses cookies for auth
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Failed to fetch feedback" }));
          throw new Error(errorData.error || errorData.message || `Server error: ${res.status}`);
        }

        const data: FeedbackEntry[] = await res.json();
        setFeedbackList(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [toast]);

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">({rating}/5)</span>
      </div>
    );
  };

   if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-sm">Something went wrong. Please try again later.</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-6 w-6" />
            User Feedback
          </CardTitle>
          <CardDescription>
            Browse all feedback submitted by users regarding their tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedbackList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No feedback submitted yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <UserCircle className="inline-block mr-1 h-4 w-4" /> User
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <Star className="inline-block mr-1 h-4 w-4" /> Rating
                  </TableHead>
                  <TableHead>
                    <MessageSquare className="inline-block mr-1 h-4 w-4" /> Comment
                  </TableHead>
                  <TableHead className="w-[200px]">
                    <Ticket className="inline-block mr-1 h-4 w-4" /> Ticket
                  </TableHead>
                  <TableHead className="text-right w-[150px]">
                    <CalendarDays className="inline-block mr-1 h-4 w-4" /> Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackList.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      <div className="font-medium">{feedback.User.name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">{feedback.User.email}</div>
                    </TableCell>
                    <TableCell>{renderRatingStars(feedback.rating)}</TableCell>
                    <TableCell className="text-sm">{feedback.comment}</TableCell>
                    <TableCell>
                      <div className="font-medium">ID: {feedback.TroubleTicket.id}</div>
                      <div className="text-xs text-muted-foreground truncate" title={feedback.TroubleTicket.title}>
                        {feedback.TroubleTicket.title}
                      </div>
                      {/* Optional: Link to the ticket
                      <Link href={`/admin/tickets/${feedback.TroubleTicket.id}`} className="text-blue-600 hover:underline text-xs">
                        View Ticket
                      </Link>
                      */}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                      <br />
                      {new Date(feedback.createdAt).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeedbackPage;