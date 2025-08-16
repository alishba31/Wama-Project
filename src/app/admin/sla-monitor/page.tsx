"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { ArrowLeft, MonitorCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface SLARecord {
  id: number;
  ticketId: number;
  slaStartTime: string;
  slaEndTime: string;
  slaStatus: string;
}

export default function SLAMonitoring() {
  const [slaRecords, setSlaRecords] = useState<SLARecord[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchSLARecords();
  }, []);

  const fetchSLARecords = async () => {
    try {
      const res = await axios.get("/api/admin/sla-records");
      setSlaRecords(res.data);
    } catch (error) {
      console.error("Error fetching SLA records:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.trim().toUpperCase();

    switch (normalizedStatus) {
      case "MET":
        return <Badge className="bg-green-500/10 text-green-500">Met</Badge>;
      case "ACTIVE":
        return <Badge className="bg-blue-500/10 text-blue-500">Active</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-yellow-500/10 text-yellow-500">In Progress</Badge>;
      case "BREACHED":
        return <Badge className="bg-red-500/10 text-red-500">Breached</Badge>;
      default:
        console.warn("Unexpected SLA status:", status);
        return <Badge className="bg-gray-500/10 text-gray-500">Unknown</Badge>;
    }
  };

  // ✅ Define consistent status order
  const SLA_STATUS_ORDER = ["Met", "Breached", "Active"];

  const getSLAMetrics = () => {
    const statusCounts = slaRecords.reduce((acc, record) => {
      const normalizedStatus = record.slaStatus.trim().toUpperCase();
      const readableStatus =
        normalizedStatus === "MET"
          ? "Met"
          : normalizedStatus === "BREACHED"
          ? "Breached"
          : normalizedStatus === "ACTIVE"
          ? "Active"
          : "Unknown";

      acc[readableStatus] = (acc[readableStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return SLA_STATUS_ORDER.map((status) => ({
      name: status,
      value: statusCounts[status] || 0,
    }));
  };

  // ✅ Match COLORS to SLA_STATUS_ORDER: Met → Green, Breached → Red, Active → Blue
  const COLORS = ["#4CAF50", "#F44336", "#2196F3"];

  return (
    <div className="p-6">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
        <div className="flex items-center mb-0">
          <Button size={'icon'} variant={'outline'} asChild>
            <button onClick={() => router.back()} className="flex items-center mr-4">
              <ArrowLeft className="size-5" />
            </button>
            </Button>
            <MonitorCheck className="w-7 h-7 text-primary mr-1" />
            <CardTitle>SLA Monitoring</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {slaRecords.length === 0 ? (
            <p>No SLA records available</p>
          ) : (
            <>
              {/* ✅ Table for SLA Records */}
              <table className="w-full border-collapse border border-gray-300 mb-6">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Ticket ID</th>
                    <th className="border px-4 py-2">Start Time</th>
                    <th className="border px-4 py-2">End Time</th>
                    <th className="border px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {slaRecords.map((sla) => (
                    <tr key={sla.id}>
                      <td className="border px-4 py-2">{sla.ticketId}</td>
                      <td className="border px-4 py-2">{new Date(sla.slaStartTime).toLocaleString()}</td>
                      <td className="border px-4 py-2">{new Date(sla.slaEndTime).toLocaleString()}</td>
                      <td className="border px-4 py-2">{getStatusBadge(sla.slaStatus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ✅ Pie Chart for SLA Metrics */}
              <div className="w-full flex justify-center">
                <ResponsiveContainer width={500} height={350}>
                  <PieChart>
                    <Pie
                      data={getSLAMetrics()}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      label
                    >
                      {getSLAMetrics().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
