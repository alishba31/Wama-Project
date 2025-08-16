"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { ArrowLeft, BookCopy, FileText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Interfaces
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

export default function SubmittedForms() {
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get("/api/form-submissions-get");
        setFormSubmissions(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching form submissions", err);
        setError("Failed to fetch form submissions.");
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const getFormData = (submission: FormSubmission) => {
    try {
      return typeof submission.submittedData === "string"
        ? JSON.parse(submission.submittedData)
        : submission.submittedData;
    } catch (err) {
      console.error("Error parsing form data", err);
      return {};
    }
  };

  const getSerialNumber = (submission: FormSubmission) => {
    const formData = getFormData(submission);

    try {
      const schema = typeof submission.FormDefinition.schema === "string"
        ? JSON.parse(submission.FormDefinition.schema)
        : submission.FormDefinition.schema;

      if (Array.isArray(schema)) {
        const serialField = schema.find(field =>
          field.label.toLowerCase().includes("serial") ||
          field.name.toLowerCase().includes("serial")
        );
        if (serialField && formData[serialField.name]) {
          return formData[serialField.name];
        }
      }
    } catch (err) {
      console.error("Error parsing schema", err);
    }

    const serialKeys = Object.keys(formData).filter(key =>
      key.toLowerCase().includes("serial") || key.toLowerCase().includes("number")
    );

    if (serialKeys.length > 0) {
      return formData[serialKeys[0]];
    }

    return submission.id;
  };

  const filteredSubmissions = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return formSubmissions.filter(sub => {
      const serial = getSerialNumber(sub)?.toString()?.toLowerCase() || "";
      const name = sub.User?.name?.toLowerCase() || "";
      const email = sub.User?.email?.toLowerCase() || "";
      const formName = sub.FormDefinition.formName?.toLowerCase() || "";
      return (
        serial.includes(query) ||
        name.includes(query) ||
        email.includes(query) ||
        formName.includes(query)
      );
    });
  }, [formSubmissions, searchQuery]);

  const columns: ColumnDef<FormSubmission>[] = [
    {
      accessorKey: "serialNumber",
      header: "Serial No.",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-gray-50">
          {getSerialNumber(row.original)}
        </div>
      ),
    },
    {
      accessorKey: "FormDefinition.formName",
      header: "Form Name",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.FormDefinition.formName}
        </div>
      ),
    },
    {
      accessorKey: "User.name",
      header: "Submitted By",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.User?.name || "Unknown User"}</p>
          <p className="text-sm text-gray-500">{row.original.User?.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Submitted On",
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {new Date(row.original.createdAt).toLocaleString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const submission = row.original;
        return (
          <AlertDialog>
  <AlertDialogTrigger asChild>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setSelectedSubmission(submission)}
      className="hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
    >
      View Details
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">
    <div className="absolute right-4 top-4">
      <AlertDialogCancel className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </AlertDialogCancel>
    </div>
    
    <AlertDialogHeader className="border-b pb-4">
      <AlertDialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
        <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <div>
          {submission.FormDefinition.formName}
          <span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">
            Serial No: {getSerialNumber(submission)}
          </span>
        </div>
      </AlertDialogTitle>
    </AlertDialogHeader>
    
    <div className="py-4">
      <FormSubmissionDetails submission={submission} />
    </div>
    
    <AlertDialogFooter className="border-t pt-4">
      <AlertDialogCancel className="px-6 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        Close
      </AlertDialogCancel>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredSubmissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32" />
        <Card className="shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-6 w-24" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5].map((cell) => (
                      <TableCell key={cell}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-80">
      <div className="flex justify-between items-center mb-6">
      <div className="flex justify-center items-center mb-0">
      <Button size={'icon'} variant={'outline'} asChild>
            <button onClick={() => router.back()} className="flex items-center mr-4">
              <ArrowLeft className="size-5" />
            </button>
            </Button>
        <BookCopy className="w-7 h-7 text-primary mr-2" />
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-50">Submitted Forms</h1></div>
        <div className="text-sm text-gray-500">
          Total: {filteredSubmissions.length}{" "}
          {filteredSubmissions.length === 1 ? "Form Submission" : "Form Submissions"}
        </div>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by serial number, form name, name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredSubmissions.length > 0 ? (
        <Card className="shadow-sm">
          <div className="overflow-x-auto">
            <Table className="max-h-full">
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-500">No forms found for your search.</p>
        </Card>
      )}
    </div>
  );
}

function FormSubmissionDetails({ submission }: { submission: FormSubmission }) {
  let parsedSchema: FormField[] = [];
  let parsedSubmittedData: { [key: string]: any } = {};

  try {
    parsedSchema =
      typeof submission.FormDefinition.schema === "string"
        ? JSON.parse(submission.FormDefinition.schema)
        : submission.FormDefinition.schema || [];
  } catch (err) {
    console.error("Error parsing schema for submission:", submission.id, err);
  }

  try {
    parsedSubmittedData =
      typeof submission.submittedData === "string"
        ? JSON.parse(submission.submittedData)
        : submission.submittedData || {};
  } catch (err) {
    console.error("Error parsing submitted data for submission:", submission.id, err);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {parsedSchema.map((field) => (
        <div key={field.name}>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            {field.label}
          </p>
          <p className="text-base text-gray-900 dark:text-white">
            {parsedSubmittedData[field.name] || "—"}
          </p>
        </div>
      ))}
    </div>
  );
}