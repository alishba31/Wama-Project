// New Code
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { format } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ArrowLeft, CalendarIcon, Logs, MoreHorizontal, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
interface ActivityLog {
  id: number;
  action: string;
  timestamp: string;
  User: {
    name: string;
    email: string;
  };
}

export default function ActivityLogs() {
  const [logs, setLogs] = React.useState<ActivityLog[]>([]);
  const [error, setError] = React.useState("");
  const [selectedLog, setSelectedLog] = React.useState<number | null>(null);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [dateFilter, setDateFilter] = React.useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    fetchLogs();
  }, []);

  React.useEffect(() => {
    if (dateFilter) {
      const formattedDate = formatDateLocal(dateFilter); // Use local date
      table.getColumn("timestamp")?.setFilterValue(formattedDate);
    } else {
      table.getColumn("timestamp")?.setFilterValue("");
    }
  }, [dateFilter]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get("/api/admin/activity-logs");
      setLogs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load activity logs.");
    }
  };

  const handleDeleteLog = async () => {
    if (selectedLog !== null) {
      try {
        await axios.delete(`/api/admin/activity-logs`, {
          data: { id: selectedLog }
        });
        setLogs((prevLogs) => prevLogs.filter((log) => log.id !== selectedLog));
        toast({ description: "Log deleted successfully!" });
      } catch (error) {
        toast({ 
          description: "Failed to delete log.", 
          variant: "destructive" 
        });
      } finally {
        setSelectedLog(null);
      }
    }
  };

  const handleDeleteAllLogs = async () => {
    try {
      await axios.delete("/api/admin/activity-logs", { 
        data: { id: "all" } 
      });
      setLogs([]);
      toast({ description: "All logs deleted successfully!" });
    } catch (error) {
      toast({ 
        description: "Failed to delete all logs.", 
        variant: "destructive" 
      });
    } finally {
      setDeleteAllDialogOpen(false);
    }
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Activity Logs", 14, 10);
    doc.autoTable({
      head: [["Name", "Email", "Action", "Timestamp"]],
      body: logs.map((log) => [
        log.User.name || "Unknown User",
        log.User.email || "Unknown Email",
        log.action,
        new Date(log.timestamp).toLocaleString(),
      ]),
    });
    doc.save("activity_logs.pdf");
    toast({ description: "Activity Logs Exported Successfully!" });
  };

  const columns: ColumnDef<ActivityLog>[] = [
    {
      accessorFn: (row) => row.User?.name || "",
      id: "name",
      header: "Name",
      cell: (info) => info.getValue() || "Unknown User",
    },
    {
      accessorFn: (row) => row.User?.email || "",
      id: "email",
      header: "Email",
      cell: (info) => info.getValue() || "Unknown Email",
    },
    {
      accessorKey: "action",
      header: "Action",
    },
    {
      accessorKey: "timestamp",
      header: () => <div className="text-right">Timestamp</div>,
      cell: ({ row }) => <div className="text-right">{new Date(row.original.timestamp).toLocaleString()}</div>,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const rowDate = new Date(row.getValue(columnId));
        const filterDate = new Date(filterValue);
        return (
          rowDate.getFullYear() === filterDate.getFullYear() &&
          rowDate.getMonth() === filterDate.getMonth() &&
          rowDate.getDate() === filterDate.getDate()
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const log = row.original;
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setSelectedLog(log.id)}
                  className="text-red-500"
                >
                  Delete Log
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog 
              open={selectedLog === log.id}
              onOpenChange={(open) => !open && setSelectedLog(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the activity log.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteLog}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        );
      },
    },
  ];

  const table = useReactTable({
    data: logs,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="p-4 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
      <div className="flex items-center mb-0">
          <Button size={'icon'} variant={'outline'} asChild>
            <button onClick={() => router.back()} className="flex items-center mr-4">
              <ArrowLeft className="size-5" />
            </button>
            </Button>
            <Logs className="w-7 h-7 text-primary mr-1" />
            <CardTitle>Activity Logs</CardTitle>
          </div>
        <div className="flex flex-wrap gap-2">
          <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="bg-red-500 text-white hover:bg-red-600">
                Delete All Logs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all activity logs. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllLogs} className="bg-red-500 hover:bg-red-600">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button 
            variant="outline" 
            className="bg-blue-500 text-white hover:bg-blue-600" 
            onClick={handleExportToPDF}
          >
            Export to PDF
          </Button>
        </div>
      </div>

      <Card className="shadow-black dark:shadow-white border rounded-lg min-h-[400px]">
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <p className="text-sm font-bold">Manage your Activity Logs Here</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Filter by name..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
              <div className="relative w-full">
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal pr-10"
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar
        mode="single"
        selected={dateFilter}
        onSelect={(date) => setDateFilter(date ?? undefined)}
        initialFocus
      />
    </PopoverContent>
  </Popover>
  
  {dateFilter && (
    <button
      type="button"
      onClick={() => setDateFilter(undefined)}
      className="absolute right-3 top-2.5 text-muted-foreground hover:text-red-500"
    >
      <XIcon className="h-4 w-4" />
    </button>
  )}
</div>


            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No logs available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}