"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookCopy } from "lucide-react";

interface Field {
  name: string;
  label: string;
  type: "text" | "date" | "textarea" | "dropdown";
  required: boolean;
  options?: string[];
}

interface FormDefinition {
  id: number;
  formName: string;
  description: string;
  schema: Field[] | string;
}

interface FormSubmission {
  id: number;
  formId: number;
  adminStatus: string;
  oemStatus: string;
  createdAt: string;
  submittedData: Record<string, any>;
  FormDefinition: {
    formName: string;
    description: string;
  };
}

export default function SubmitClaims() {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormDefinition | null>(null);
  const [formData, setFormData] = useState<any>({ serial_NO: "" });
  const [file, setFile] = useState<File | null>(null);
  const [formSubmissionId, setFormSubmissionId] = useState<number | null>(null);
  const [troubleTicketId, setTroubleTicketId] = useState<number | null>(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();


  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await axios.get("/api/form-definitions");
        setForms(res.data.forms);
      } catch (error) {
        console.error("Error fetching forms", error);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const res = await axios.get("/api/client/submit-claim");
        setSubmissions(res.data);
      } catch (error) {
        console.error("Error fetching submissions", error);
      }
    };

    fetchForms();
    fetchSubmissions();
  }, []);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev:any) => ({ ...prev, [fieldName]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async () => {
    if (!selectedForm) return;
    setError("");
  
    try {
      // Submit the form first
      const res = await axios.post("/api/client/submit-claim", {
        formId: selectedForm.id,
        submittedData: formData,
      });
  
      const { formSubmission, troubleTicket } = res.data;
      setFormSubmissionId(formSubmission.id);
      setTroubleTicketId(troubleTicket.id);
      setIsFormSubmitted(true);
  
      // Upload file if user selected one
      if (file) {
        const formDataToSubmit = new FormData();
        formDataToSubmit.append("file", file);
        formDataToSubmit.append("formSubmissionId", formSubmission.id.toString());
        formDataToSubmit.append("troubleTicketId", troubleTicket.id.toString());
  
        await axios.post("/api/client/attachments", formDataToSubmit, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
  
      toast({
        title: "Success",
        description: "Form submitted successfully.",
      });
  
      setFormData({ serial_NO: "" });
      setFile(null);
      setError(""); // Clear any previous error
    } catch (error: any) {
      if (error.response) {
        const message = error.response.data.message || "Error submitting form.";
        setError(message); // Show in dialog
      } else {
        console.error("Error submitting form", error);
        toast({
          title: "Error",
          description: "Something went wrong while submitting the form.",
          variant: "destructive",
        });
      }
    }
  };
  
  
  

  // const handleAttachmentSubmit = async () => {
  //   if (!file || !formSubmissionId || !troubleTicketId) {
  //     alert("Please select a file to attach.");
  //     return;
  //   }

  //   const formDataToSubmit = new FormData();
  //   formDataToSubmit.append("file", file);
  //   formDataToSubmit.append("formSubmissionId", formSubmissionId.toString());
  //   formDataToSubmit.append("troubleTicketId", troubleTicketId.toString());

  //   try {
  //     const res = await axios.post("/api/client/attachments", formDataToSubmit, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  //     alert(res.data.message);
  //   } catch (error) {
  //     console.error("Error attaching file", error);
  //     alert("Error attaching file.");
  //   }
  // };

  const handleFormSelection = (form: FormDefinition) => {
    let schema = form.schema;
    if (typeof schema === "string") {
      try {
        schema = JSON.parse(schema);
      } catch (error) {
        console.error("Error parsing form schema", error);
        schema = [];
      }
    }
    setSelectedForm({ ...form, schema: schema as Field[] });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center mb-2">
      <Button size="icon" variant="outline" asChild>
        <button onClick={() => router.back()} className="flex items-center mr-4">
          <ArrowLeft className="size-5" />
        </button>
      </Button>
      <BookCopy className="w-7 h-7 text-primary mr-1" />
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-50"><b><u>Submit Your Claim</u></b></h1>
    </div>
      
      {error && <p className="text-red-500">{error}</p>}

      {/* Form Selection */}
      {/* Available Forms Table */}
      <h2 className="text-xl font-semibold">Available Forms</h2>
      <div className="overflow-x-auto rounded-md border mb-6">
      <table className="w-full text-sm text-left">
      <thead className="bg-gray-100 dark:bg-gray-800 border-b">
      <tr>
        <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Form Name</th>
        <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Description</th>
        <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Action</th>
      </tr>
    </thead>
    <tbody>
      {forms.map((form) => (
        <tr key={form.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
          <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
            {form.formName}
          </td>
          <td className="px-4 py-3 text-gray-800 dark:text-gray-100 max-w-md truncate">
            {form.description}
          </td>
          <td className="px-4 py-3">
          <Dialog onOpenChange={(open) => {
  if (!open) {
    setFormData({ serial_NO: "" });
    setFile(null);
    setFormSubmissionId(null);
    setTroubleTicketId(null);
    setIsFormSubmitted(false);
  }
}}>
  <DialogTrigger asChild>
    <Button
      variant="default"
      onClick={() => handleFormSelection(form)}
    >
      Fill Form
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{form.formName}</DialogTitle>
      <DialogDescription>{form.description}</DialogDescription>
    </DialogHeader>
    {error && (
  <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded p-2 mb-4">
    {error}
  </div>
)}

    <form
      className="space-y-6 mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleFormSubmit();
      }}
    >
      {(() => {
        let parsedSchema: Field[] = [];
        try {
          parsedSchema =
            typeof form.schema === "string"
              ? JSON.parse(form.schema)
              : (form.schema as Field[]);
        } catch (error) {
          console.error("Error parsing form schema:", error);
        }

        return parsedSchema.map((field, index) => (
          <div key={index} className="space-y-2">
            <label className="block text-gray-700 dark:text-gray-50 font-medium">
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <Textarea
                value={formData[field.name] || ""}
                onChange={(e) =>
                  handleFieldChange(field.name, e.target.value)
                }
                required={field.required}
              />
            ) : field.type === "dropdown" && field.options ? (
              <select
                className="border border-gray-300 p-2 rounded-md w-full"
                value={formData[field.name] || ""}
                onChange={(e) =>
                  handleFieldChange(field.name, e.target.value)
                }
                required={field.required}
              >
                <option value="">Select an option</option>
                {field.options.map((option, i) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type={field.type}
                value={formData[field.name] || ""}
                onChange={(e) =>
                  handleFieldChange(field.name, e.target.value)
                }
                required={field.required}
              />
            )}
          </div>
        ));
      })()}
      <div className="space-y-2">
  <label className="block text-gray-700 dark:text-gray-50 font-medium">
    Optional Attachment
  </label>
  <Input
    type="file"
    accept=".pdf,.csv,image/*"
    onChange={handleFileChange}
  />
</div>
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>

    {/* {isFormSubmitted && (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-50">
          Attach Evidence
        </h3>
        <Input
          type="file"
          accept=".pdf,.csv,image/*"
          onChange={handleFileChange}
        />
        <Button
          onClick={handleAttachmentSubmit}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          Upload Attachment
        </Button>
      </div>
    )} */}
  </DialogContent>
</Dialog>

          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


      {/* Submitted Forms */}
      <h2 className="text-xl font-semibold mt-8">Submitted Forms</h2>
<div className="overflow-x-auto rounded-md border">
  <table className="w-full text-sm text-left">
    <thead className="bg-gray-100 dark:bg-gray-800 border-b">
      <tr>
        <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Form Name</th>
        <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Admin Status</th>
        <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">OEM Status</th>
        <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Submitted On</th>
        <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">View Data</th>
      </tr>
    </thead>
    <tbody>
      {submissions.map((submission) => (
        <tr key={submission.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
          <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
            {submission.FormDefinition.formName}
          </td>
          <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
            {submission.adminStatus}
          </td>
          <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
            {submission.oemStatus}
          </td>
          <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
            {new Date(submission.createdAt).toLocaleString()}
          </td>
          <td className="px-4 py-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">View</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Submitted Data</DialogTitle>
                  <DialogDescription>
                    Details of the submitted claim.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 mt-4 text-sm">
                  {submission.submittedData && Object.entries(submission.submittedData).length > 0 ? (
                    Object.entries(submission.submittedData).map(([key, value]) => (
                      <div key={key}>
                        <strong className="text-gray-700 dark:text-gray-200">{key}:</strong>{" "}
                        <span className="text-gray-800 dark:text-gray-100">{String(value)}</span>
                      </div>
                    ))
                  ) : (
                    <p>No data available.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
  );
}


// "use client";

// import { useState, useEffect, ChangeEvent } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Collapsible } from "@/components/ui/collapsible";

// interface Field {
//   name: string;
//   label: string;
//   type: "text" | "date" | "textarea" | "dropdown";
//   required: boolean;
//   options?: string[];
// }

// interface FormDefinition {
//   id: number;
//   formName: string;
//   description: string;
//   schema: Field[] | string;
// }

// interface FormSubmission {
//   id: number;
//   formId: number;
//   adminStatus: string;
//   oemStatus: string;
//   createdAt: string;
//   submittedData: Record<string, any>;
//   FormDefinition: {
//     formName: string;
//     description: string;
//   };
// }

// export default function SubmitClaims() {
//   const [forms, setForms] = useState<FormDefinition[]>([]);
//   const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
//   const [selectedForm, setSelectedForm] = useState<FormDefinition | null>(null);
//   const [formData, setFormData] = useState<any>({ serial_NO: "", escalationFlow: "" });
//   const [file, setFile] = useState<File | null>(null);
//   const [formSubmissionId, setFormSubmissionId] = useState<number | null>(null);
//   const [troubleTicketId, setTroubleTicketId] = useState<number | null>(null);
//   const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");

//   useEffect(() => {
//     const fetchForms = async () => {
//       try {
//         const res = await axios.get("/api/form-definitions");
//         setForms(res.data.forms);
//       } catch (error) {
//         console.error("Error fetching forms", error);
//       }
//     };

//     const fetchSubmissions = async () => {
//       try {
//         const res = await axios.get("/api/client/submit-claim");
//         setSubmissions(res.data);
//       } catch (error) {
//         console.error("Error fetching submissions", error);
//       }
//     };

//     fetchForms();
//     fetchSubmissions();
//   }, []);

//   const handleFieldChange = (fieldName: string, value: any) => {
//     setFormData((prev: any) => ({ ...prev, [fieldName]: value }));
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setFile(e.target.files[0]);
//     }
//   };

//   const handleEscalationFlowChange = (value: string) => {
//     setFormData((prev: any) => ({ ...prev, escalationFlow: value }));
//   };

//   const handleFormSubmit = async () => {
//     if (!selectedForm) return;
//     if (!formData.escalationFlow) {
//       setError("Please select an escalation flow.");
//       return;
//     }

//     setError("");

//     try {
//       const res = await axios.post("/api/client/submit-claim", {
//         formId: selectedForm.id,
//         submittedData: formData,
//         escalationType: formData.escalationFlow, // Send escalationType instead of escalationFlow
//       });
//       const { formSubmission, troubleTicket } = res.data;
//       setFormSubmissionId(formSubmission.id);
//       setTroubleTicketId(troubleTicket.id);
//       setIsFormSubmitted(true);
//       alert(res.data.message);
//     } catch (error: any) {
//       if (error.response) {
//         setError(error.response.data.message);
//       } else {
//         console.error("Error submitting form", error);
//         alert("Error submitting form.");
//       }
//     }
//   };

//   return (
//     <div className="p-8 space-y-8">
//       <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-50">Submit Your Claim</h1>
//       {error && <p className="text-red-500">{error}</p>}

//       <div className="grid gap-4">
//         {forms.map((form) => (
//           <Collapsible
//             key={form.id}
//             trigger={
//               <Button
//                 onClick={() =>
//                   setSelectedForm((prev) => (prev?.id === form.id ? null : form))
//                 }
//                 className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
//               >
//                 {form.formName}
//               </Button>
//             }
//           >
//             {selectedForm?.id === form.id && (
//               <>
//                 <div className="border border-gray-100 p-6 rounded-md shadow">
//                   <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-50">
//                     {form.formName}
//                   </h2>
//                   <p className="mb-6 text-gray-600 dark:text-gray-50">{form.description}</p>
//                   <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
//                     {(() => {
//                       let parsedSchema: Field[] = [];
//                       try {
//                         parsedSchema =
//                           typeof form.schema === "string"
//                             ? JSON.parse(form.schema)
//                             : (form.schema as Field[]);
//                       } catch (error) {
//                         console.error("Error parsing form schema:", error);
//                       }

//                       return parsedSchema.map((field, index) => (
//                         <div key={index} className="space-y-2">
//                           <label className="block text-gray-700 dark:text-gray-50 font-medium">
//                             {field.label}
//                           </label>
//                           {field.type === "textarea" ? (
//                             <Textarea
//                               className="border border-gray-300 p-2 rounded-md w-full"
//                               value={formData[field.name] || ""}
//                               onChange={(e) =>
//                                 handleFieldChange(field.name, e.target.value)
//                               }
//                               required={field.required}
//                             />
//                           ) : field.type === "dropdown" && field.options ? (
//                             <select
//                               className="border border-gray-300 p-2 rounded-md w-full"
//                               value={formData[field.name] || ""}
//                               onChange={(e) =>
//                                 handleFieldChange(field.name, e.target.value)
//                               }
//                               required={field.required}
//                             >
//                               <option value="">Select an option</option>
//                               {field.options.map((option, i) => (
//                                 <option key={i} value={option}>
//                                   {option}
//                                 </option>
//                               ))}
//                             </select>
//                           ) : (
//                             <Input
//                               className="border border-gray-300 p-2 rounded-md w-full"
//                               type={field.type}
//                               value={formData[field.name] || ""}
//                               onChange={(e) =>
//                                 handleFieldChange(field.name, e.target.value)
//                               }
//                               required={field.required}
//                             />
//                           )}
//                         </div>
//                       ));
//                     })()}

//                     {/* Escalation Flow Checkboxes */}
//                     <div className="mt-4">
//                       <label className="block text-gray-700 dark:text-gray-50 font-medium mb-2">
//                         Select Escalation Flow:
//                       </label>
//                       <div className="flex items-center space-x-4">
//                         <label className="flex items-center space-x-2">
//                           <input
//                             type="radio"
//                             name="escalationFlow"
//                             value="OEM-Admin"
//                             checked={formData.escalationFlow === "OEM-Admin"}
//                             onChange={() => handleEscalationFlowChange("OEM-Admin")}
//                           />
//                           <span>OEM → Admin</span>
//                         </label>
//                         <label className="flex items-center space-x-2">
//                           <input
//                             type="radio"
//                             name="escalationFlow"
//                             value="Admin-OEM"
//                             checked={formData.escalationFlow === "Admin-OEM"}
//                             onChange={() => handleEscalationFlowChange("Admin-OEM")}
//                           />
//                           <span>Admin → OEM</span>
//                         </label>
//                       </div>
//                     </div>

//                     <Button
//                       onClick={handleFormSubmit}
//                       className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
//                     >
//                       Submit
//                     </Button>
//                   </form>
//                 </div>
//               </>
//             )}
//           </Collapsible>
//         ))}
//       </div>
//     </div>
//   );
// }