"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input} from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { CheckCircle, ChevronDown, Clock, Loader, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";

export default function UpdateTTStatus() {
  const [troubleTicketId, setTroubleTicketId] = useState<number | string>("");
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/oem/update-claim-status", {
        troubleTicketId,
        newStatus,
        remarks,
      });
      setMessage(res.data.message);
      setTroubleTicketId("");
      setNewStatus("");
      setRemarks("");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to update trouble ticket status");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-h-screen p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex justify-center items-center mb-4">
            <ShieldCheck className="w-7 h-7 text-primary mr-2" />
            <CardTitle>Update Trouble Ticket Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="troubleTicketId" className="text-sm font-medium">
                Trouble Ticket ID
              </label>
              <Input
                id="troubleTicketId"
                type="text"
                placeholder="Enter Trouble Ticket ID"
                value={troubleTicketId}
                onChange={(e) => setTroubleTicketId(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Trouble Ticket Status
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full justify-between" variant={"outline"}>
                    {newStatus ? newStatus : "Select Status"}
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
                Remarks (Optional)
              </label>
              <Textarea
                id="remarks"
                placeholder="Add any remarks (optional)"
                value={remarks}
                onChange={(e:any) => setRemarks(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              Update Status
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          {message && (
            <p className={`text-sm ${message.includes("Failed") ? "text-red-500" : "text-green-500"}`}>
              {message}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
