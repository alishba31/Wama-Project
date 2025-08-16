// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Collapsible } from "@/components/ui/collapsible";

// // Interfaces
// interface FormField {
//   name: string;
//   label: string;
//   type: string;
//   required: boolean;
// }

// interface Attachment {
//   id: number;
//   fileName: string;
//   filePath: string;
//   uploadedAt: string;
// }

// interface FormSubmission {
//   id: number;
//   FormDefinition: {
//     formName: string;
//     description: string;
//     schema: FormField[] | string;
//   };
//   User: {
//     name: string;
//     email: string;
//   };
//   submittedData: { [key: string]: any } | string;
//   status: string;
//   createdAt: string;
//   Attachment: Attachment[];
// }

// export default function SubmittedForms() {
//   const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchSubmissions = async () => {
//       try {
//         const res = await axios.get("/api/form-submissions-get");
//         setFormSubmissions(res.data);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching form submissions", err);
//         setError("Failed to fetch form submissions.");
//         setLoading(false);
//       }
//     };

//     fetchSubmissions();
//   }, []);

//   const handleDelete = async (submissionId: number) => {
//     try {
//       const res = await axios.delete(`/api/form-submissions-get/admin/${submissionId}`);
//       if (res.status === 200) {
//         setFormSubmissions((prev) =>
//           prev.filter((submission) => submission.id !== submissionId)
//         );
//         alert("Form submission deleted successfully.");
//       } else {
//         alert("Failed to delete form submission.");
//       }
//     } catch (err) {
//       console.error("Error deleting form submission", err);
//       alert("Error deleting form submission.");
//     }
//   };

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>{error}</p>;
//   }

//   return (
//     <div className="space-y-6">
//       <h1 className="text-xl font-semibold">Submitted Forms</h1>
//       {formSubmissions.length > 0 ? (
//         formSubmissions.map((submission) => {
//           let parsedSchema: FormField[] = [];
//           let parsedSubmittedData: { [key: string]: any } = {};

//           // Safely parse schema
//           try {
//             parsedSchema =
//               typeof submission.FormDefinition.schema === "string"
//                 ? JSON.parse(submission.FormDefinition.schema)
//                 : submission.FormDefinition.schema || [];
//           } catch (err) {
//             console.error("Error parsing schema for submission:", submission.id, err);
//           }

//           // Safely parse submitted data
//           try {
//             parsedSubmittedData =
//               typeof submission.submittedData === "string"
//                 ? JSON.parse(submission.submittedData)
//                 : submission.submittedData || {};
//           } catch (err) {
//             console.error("Error parsing submitted data for submission:", submission.id, err);
//           }

//           return (
//             <Card key={submission.id}>
//               <CardHeader>
//                 <Collapsible
//                   trigger={<CardTitle>{submission.FormDefinition.formName}</CardTitle>}
//                 >
//                   <CardContent>
//                     <p>
//                       <strong>User:</strong> {submission.User.name || "Unknown"} (
//                       {submission.User.email})
//                     </p>
//                     <p>
//                       <strong>Status:</strong> {submission.status}
//                     </p>
//                     <p>
//                       <strong>Submitted On:</strong>{" "}
//                       {new Date(submission.createdAt).toLocaleString()}
//                     </p>
//                     <div className="mt-4 space-y-4">
//                       <h2 className="text-lg font-medium">Submitted Data</h2>
//                       {parsedSchema.length > 0 ? (
//                         parsedSchema.map((field: FormField) => (
//                           <div key={field.name} className="space-y-1">
//                             <label className="block text-sm font-medium text-gray-700">
//                               {field.label}:
//                             </label>
//                             <div className="border rounded p-2 bg-gray-50">
//                               {parsedSubmittedData[field.name] || "N/A"}
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <p>No schema fields available.</p>
//                       )}
//                     </div>
//                     {submission.Attachment.length > 0 && (
//                       <div className="mt-4">
//                         <h2 className="text-lg font-medium">Attachments</h2>
//                         {submission.Attachment.map((attachment) => (
//                           <div key={attachment.id} className="space-y-1">
//                             <p>
//                               <strong>File Name:</strong> {attachment.fileName}
//                             </p>
//                             <p>
//                               <strong>Uploaded At:</strong>{" "}
//                               {new Date(attachment.uploadedAt).toLocaleString()}
//                             </p>
//                             <a
//                               href={`/api/uploads/${attachment.filePath}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-blue-600 underline"
//                             >
//                               View Attachment
//                             </a>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                     <Button
//                       variant="destructive"
//                       onClick={() => handleDelete(submission.id)}
//                       className="mt-4"
//                     >
//                       Delete Submission
//                     </Button>
//                   </CardContent>
//                 </Collapsible>
//               </CardHeader>
//             </Card>
//           );
//         })
//       ) : (
//         <p>No forms submitted yet.</p>
//       )}
//     </div>
//   );
// }




// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Collapsible } from "@/components/ui/collapsible";

// // Interfaces
// interface FormField {
//   name: string;
//   label: string;
//   type: string;
//   required: boolean;
// }

// interface Attachment {
//   id: number;
//   fileName: string;
//   filePath: string;
//   uploadedAt: string;
// }

// interface FormSubmission {
//   id: number;
//   FormDefinition: {
//     formName: string;
//     description: string;
//     schema: FormField[] | string;
//   };
//   User: {
//     name: string;
//     email: string;
//   };
//   submittedData: { [key: string]: any } | string;
//   createdAt: string;
//   Attachment: Attachment[];
//   TroubleTicket: {
//     escalationLevel: number;
//   };
// }

// export default function SubmittedForms() {
//   const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchSubmissions = async () => {
//       try {
//         const res = await axios.get("/api/form-submissions-get");
//         const allSubmissions: FormSubmission[] = res.data;

//         // Filter submissions where escalation level is 2
//         const filteredSubmissions = allSubmissions.filter(
//           (submission) => submission.TroubleTicket?.escalationLevel === 2
//         );

//         setFormSubmissions(filteredSubmissions);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching form submissions", err);
//         setError("Failed to fetch form submissions.");
//         setLoading(false);
//       }
//     };

//     fetchSubmissions();
//   }, []);

//   // const handleDelete = async (submissionId: number) => {
//   //   try {
//   //     const res = await axios.delete(`/api/form-submissions-get/admin/${submissionId}`);
//   //     if (res.status === 200) {
//   //       setFormSubmissions((prev) =>
//   //         prev.filter((submission) => submission.id !== submissionId)
//   //       );
//   //       alert("Form submission deleted successfully.");
//   //     } else {
//   //       alert("Failed to delete form submission.");
//   //     }
//   //   } catch (err) {
//   //     console.error("Error deleting form submission", err);
//   //     alert("Error deleting form submission.");
//   //   }
//   // };

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>{error}</p>;
//   }

//   return (
//     <div className="space-y-6">
//       <h1 className="text-xl font-semibold">Submitted Forms</h1>
//       {formSubmissions.length > 0 ? (
//         formSubmissions.map((submission) => {
//           let parsedSchema: FormField[] = [];
//           let parsedSubmittedData: { [key: string]: any } = {};

//           // Safely parse schema
//           try {
//             parsedSchema =
//               typeof submission.FormDefinition.schema === "string"
//                 ? JSON.parse(submission.FormDefinition.schema)
//                 : submission.FormDefinition.schema || [];
//           } catch (err) {
//             console.error("Error parsing schema for submission:", submission.id, err);
//           }

//           // Safely parse submitted data
//           try {
//             parsedSubmittedData =
//               typeof submission.submittedData === "string"
//                 ? JSON.parse(submission.submittedData)
//                 : submission.submittedData || {};
//           } catch (err) {
//             console.error("Error parsing submitted data for submission:", submission.id, err);
//           }

//           return (
//             <Card key={submission.id}>
//               <CardHeader>
//                 <Collapsible
//                   trigger={<CardTitle>{submission.FormDefinition.formName}</CardTitle>}
//                 >
//                   <CardContent>
//                     <p>
//                       <strong>User:</strong> {submission.User.name || "Unknown"} (
//                       {submission.User.email})
//                     </p>
//                     <p>
//                       <strong>Submitted On:</strong>{" "}
//                       {new Date(submission.createdAt).toLocaleString()}
//                     </p>
//                     <div className="mt-4 space-y-4">
//                       <h2 className="text-lg font-medium">Submitted Data</h2>
//                       {parsedSchema.length > 0 ? (
//                         parsedSchema.map((field: FormField) => (
//                           <div key={field.name} className="space-y-1">
//                             <label className="block text-sm font-medium text-gray-700">
//                               {field.label}:
//                             </label>
//                             <div className="border rounded p-2 bg-gray-50">
//                               {parsedSubmittedData[field.name] || "N/A"}
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <p>No schema fields available.</p>
//                       )}
//                     </div>
//                     {submission.Attachment.length > 0 && (
//                       <div className="mt-4">
//                         <h2 className="text-lg font-medium">Attachments</h2>
//                         {submission.Attachment.map((attachment) => (
//                           <div key={attachment.id} className="space-y-1">
//                             <p>
//                               <strong>File Name:</strong> {attachment.fileName}
//                             </p>
//                             <p>
//                               <strong>Uploaded At:</strong>{" "}
//                               {new Date(attachment.uploadedAt).toLocaleString()}
//                             </p>
//                             <a
//                               href={`/api/uploads/${attachment.filePath}`}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-blue-600 underline"
//                             >
//                               View Attachment
//                             </a>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                     {/* <Button
//                       variant="destructive"
//                       onClick={() => handleDelete(submission.id)}
//                       className="mt-4"
//                     >
//                       Delete Submission
//                     </Button> */}
//                   </CardContent>
//                 </Collapsible>
//               </CardHeader>
//             </Card>
//           );
//         })
//       ) : (
//         <p>No forms submitted yet.</p>
//       )}
//     </div>
//   );
// }


// New Code
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import axios from "axios";
import { ArrowLeft, Logs, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      return typeof submission.submittedData === 'string' 
        ? JSON.parse(submission.submittedData) 
        : submission.submittedData;
    } catch (err) {
      console.error("Error parsing form data", err);
      return {};
    }
  };

  const getSerialNumber = (submission: FormSubmission) => {
    const formData = getFormData(submission);
    
    // First try to find the serial number field from the form schema
    try {
      const schema = typeof submission.FormDefinition.schema === 'string'
        ? JSON.parse(submission.FormDefinition.schema)
        : submission.FormDefinition.schema;
      
      if (Array.isArray(schema)) {
        const serialField = schema.find(field => 
          field.label.toLowerCase().includes('serial') || 
          field.name.toLowerCase().includes('serial')
        );
        
        if (serialField && formData[serialField.name]) {
          return formData[serialField.name];
        }
      }
    } catch (err) {
      console.error("Error parsing schema", err);
    }
    
    // Fallback to looking for common serial number field names
    const serialKeys = Object.keys(formData).filter(key => 
      key.toLowerCase().includes('serial') || 
      key.toLowerCase().includes('number')
    );
    
    if (serialKeys.length > 0) {
      return formData[serialKeys[0]];
    }
    
    // Final fallback to submission ID
    return submission.id;
  };

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
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                View Details
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="absolute right-4 top-4">
                <AlertDialogCancel className="p-2">
                  <X className="h-4 w-4" />
                </AlertDialogCancel>
              </div>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">
                  {submission.FormDefinition.formName} (Serial No: {getSerialNumber(submission)})
                </AlertDialogTitle>
              </AlertDialogHeader>
              <FormSubmissionDetails submission={submission} />
              <AlertDialogFooter>
                <AlertDialogCancel className="mt-4">Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ];

  const table = useReactTable({
    data: formSubmissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
      <div className="flex justify-center items-center mb-0">
      <Button size={'icon'} variant={'outline'} asChild>
            <button onClick={() => router.back()} className="flex items-center mr-4">
              <ArrowLeft className="size-5" />
            </button>
            </Button>
        <Logs className="w-7 h-7 text-primary mr-2" />
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-50">Claim Analysis</h1></div>
        <div className="text-sm text-gray-500">
          Total: {formSubmissions.length} {formSubmissions.length === 1 ? 'Form Submission' : 'Form Submissions'}
        </div>
      </div>
      
      {formSubmissions.length > 0 ? (
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
          <p className="text-gray-500">No forms submitted yet.</p>
        </Card>
      )}
    </div>
  );
}

function FormSubmissionDetails({ submission }: { submission: FormSubmission }) {
  let parsedSchema: FormField[] = [];
  let parsedSubmittedData: { [key: string]: any } = {};

  // Safely parse schema
  try {
    parsedSchema =
      typeof submission.FormDefinition.schema === "string"
        ? JSON.parse(submission.FormDefinition.schema)
        : submission.FormDefinition.schema || [];
  } catch (err) {
    console.error("Error parsing schema for submission:", submission.id, err);
  }

  // Safely parse submitted data
  try {
    parsedSubmittedData =
      typeof submission.submittedData === "string"
        ? JSON.parse(submission.submittedData)
        : submission.submittedData || {};
  } catch (err) {
    console.error("Error parsing submitted data for submission:", submission.id, err);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-gray-600 dark:text-gray-50">Submitted By</Label>
          <Input 
            value={`${submission.User.name || "Unknown"} (${submission.User.email})`} 
            readOnly 
            className="dark:bg-gray-800 bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-600 dark:text-gray-50">Submitted On</Label>
          <Input 
            value={new Date(submission.createdAt).toLocaleString()} 
            readOnly 
            className="bg-gray-50 dark:bg-gray-800"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-50 border-b pb-2">
          Form Data
        </h2>
        {parsedSchema.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedSchema.map((field: FormField) => (
              <div key={field.name} className="space-y-2">
                <Label className="text-gray-600 dark:text-gray-50">{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea 
                    value={parsedSubmittedData[field.name] || "N/A"} 
                    readOnly 
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={!!parsedSubmittedData[field.name]} 
                      disabled
                    />
                    <Label>{field.label}</Label>
                  </div>
                ) : field.type === "select" ? (
                  <Select disabled value={parsedSubmittedData[field.name] || ""}>
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={parsedSubmittedData[field.name] || ""}>
                        {parsedSubmittedData[field.name] || "N/A"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    value={parsedSubmittedData[field.name] || "N/A"} 
                    readOnly 
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No form data available.</p>
        )}
      </div>

      {submission.Attachment.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-50 border-b pb-2">
            Attachments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submission.Attachment.map((attachment) => (
              <div key={attachment.id} className="border rounded p-4 space-y-2 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-1">
                  <Label className="text-gray-600 dark:text-gray-50">File Name</Label>
                  <Input 
                    value={attachment.fileName} 
                    readOnly 
                    className="bg-white dark:bg-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-600 dark:text-gray-50">Uploaded At</Label>
                  <Input 
                    value={new Date(attachment.uploadedAt).toLocaleString()} 
                    readOnly 
                    className="bg-white dark:bg-gray-700"
                  />
                </div>
                <Button asChild variant="outline" className="mt-2">
                  <a
                    href={`/api/uploads/${attachment.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                  >
                    View Attachment
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}