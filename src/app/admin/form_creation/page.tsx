// New Code
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ArrowLeft, BookCopy, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Field {
  name: string; // Key for the field
  label: string; // User-friendly label for the field
  type: "text" | "date" | "textarea" | "dropdown"; // Field type
  required: boolean; // If the field is mandatory
  options?: string[]; // For dropdown options
}

interface Form {
  id: number;
  formName: string;
  description: string;
  schema: Field[] | string; // Schema can be a parsed object or JSON string
}

// Predefined fields for critical keys
const predefinedFields = [
  { label: "Serial Number", key: "serial_NO" },
  // Add other predefined fields here if necessary
  // { label: "Product ID", key: "product_id" },
];

const AUTO_GENERATED_KEY_VALUE = "_auto_generated_key_";

export default function CreateForm() {
  const [formName, setFormName] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Field[]>([
    { name: "", label: "", type: "text", required: false, options: [] },
  ]);
  const [forms, setForms] = useState<Form[]>([]);
  const [editingFormId, setEditingFormId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("create");
  const router = useRouter();

  useEffect(() => {
    fetchForms();
  }, []);

  // Fetch all existing forms
  const fetchForms = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/form-definitions");
      setForms(res.data.forms);
    } catch (error) {
      console.error("Error fetching forms", error);
      toast({
        variant: "destructive",
        title: "Failed to load forms",
        description: "Could not retrieve existing form definitions.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate a key based on the label
  const generateKeyFromLabel = (label: string): string =>
    label
      .toLowerCase()
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/[^\w_]/g, ""); // Remove special characters except underscore

  // Handle field changes dynamically
  const handleFieldChange = <K extends keyof Field>(
    index: number,
    key: K,
    value: Field[K]
  ) => {
    const updatedFields = [...fields];
    const currentField = { ...updatedFields[index] };
    currentField[key] = value;

    if (key === "type") {
        if (value === "dropdown" && !currentField.options) {
            currentField.options = [""]; // Initialize with one empty option
        } else if (value !== "dropdown") {
            delete currentField.options;
        }
    }

    if (key === "label") {
      const isCurrentKeyPredefined = predefinedFields.some(pf => pf.key === updatedFields[index].name);
      if (!isCurrentKeyPredefined) {
        currentField.name = generateKeyFromLabel(value as string);
      }
    }
    
    updatedFields[index] = currentField;
    setFields(updatedFields);
  };


  // Add a new dropdown option
  const handleAddOption = (index: number) => {
    const updatedFields = [...fields];
    if (!updatedFields[index].options) {
      updatedFields[index].options = [];
    }
    updatedFields[index].options!.push("");
    setFields(updatedFields);
  };

  // Update a specific dropdown option
  const handleOptionChange = (fieldIndex: number, optionIndex: number, value: string) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options![optionIndex] = value;
    setFields(updatedFields);
  };

  // Remove a specific dropdown option
  const handleRemoveOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...fields];
    updatedFields[fieldIndex].options!.splice(optionIndex, 1);
    setFields(updatedFields);
  };

  // Add a new field to the schema
  const addField = () => {
    setFields([...fields, { name: "", label: "", type: "text", required: false, options: [] }]);
  };

  // Remove a specific field
  const removeField = (index: number) => {
    if (fields.length === 1 && index === 0) {
      toast({
        variant: "default",
        title: "Cannot Remove Last Field",
        description: "A form must have at least one field. You can modify this field instead.",
      });
      return;
    }
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
  };

  // Create or update a form definition
  const handleCreateForm = async () => {
    if (!formName.trim()) {
      toast({
        variant: "destructive",
        title: "Form Name Required",
        description: "Please provide a name for the form.",
      });
      return;
    }
    if (fields.some(f => !f.label.trim() || !f.name.trim())) {
        toast({
          variant: "destructive",
          title: "Invalid Field Configuration",
          description: "All fields must have a non-empty label. This label is used to auto-generate a key if a predefined key is not selected.",
        });
        return;
      }
      if (fields.length === 0) {
        toast({
          variant: "destructive",
          title: "No Fields Added",
          description: "Please add at least one field to the form.",
        });
        return;
      }
  
    setLoading(true);
    try {
      const formSchema = fields.map((field) => ({
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.type === "dropdown" ? (field.options || []).filter(opt => opt.trim() !== "") : undefined,
      }));
  
      if (editingFormId) {
        await axios.put(`/api/form-definitions/${editingFormId}`, {
          formName,
          description,
          schema: formSchema,
        });
        toast({
          title: "Form Updated Successfully",
          description: `Form "${formName}" has been updated.`,
        });
      } else {
        await axios.post("/api/form-definitions", {
          formName,
          description,
          schema: formSchema,
        });
        toast({
          title: "Form Created Successfully",
          description: `Form "${formName}" has been created.`,
        });
      }
  
      resetForm(); 
      fetchForms(); 
      setActiveTab("create"); 
    } catch (error) {
      console.error("Error saving form", error);
      const errorMessage = (error as any).response?.data?.error || "Something went wrong. Please try again.";
      toast({
        variant: "destructive",
        title: "Error Saving Form",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle editing an existing form
  const handleEditForm = (form: Form) => {
    setEditingFormId(form.id);
    setFormName(form.formName);
    setDescription(form.description);

    const parsedSchema = typeof form.schema === "string" ? JSON.parse(form.schema) : form.schema;
    const fieldsWithEnsuredOptions = parsedSchema.map((field: Field) => ({
        ...field,
        options: field.type === 'dropdown' ? (field.options || []) : undefined,
        // Ensure name is not null/undefined, default to "" if it is, which will trigger auto-gen or allow user to set
        name: field.name || (field.label ? generateKeyFromLabel(field.label) : ""), 
    }));
    setFields(fieldsWithEnsuredOptions.length > 0 ? fieldsWithEnsuredOptions : [{ name: "", label: "", type: "text", required: false, options: [] }]);
    setActiveTab("create");
  };

  // Reset the form to its initial state
  const resetForm = () => {
    setEditingFormId(null);
    setFormName("");
    setDescription("");
    setFields([{ name: "", label: "", type: "text", required: false, options: [] }]);
  };
  
  return (
    <div className="container mx-auto py-6 px-2 md:px-6 lg:px-8 space-y-6">
      <div className="flex items-center">
        <Button size="icon" variant="outline" asChild>
          <button onClick={() => router.back()} className="flex items-center mr-3">
            <ArrowLeft className="size-5" />
          </button>
        </Button>
        <BookCopy className="w-7 h-7 text-primary mr-2" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-50">
          Warranty Form Management
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px] mb-4">
          <TabsTrigger value="create">
            {editingFormId ? "Edit Form" : "Create Form"}
          </TabsTrigger>
          <TabsTrigger value="existing">Existing Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingFormId ? `Editing: ${formName}` : "Create a New Form"}
              </CardTitle>
              <CardDescription>
                {editingFormId
                  ? "Modify the details of this form definition."
                  : "Fill in the details to create a new warranty form definition."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="formName">Form Name <span className="text-destructive">*</span></Label>
                  <Input id="formName" placeholder="E.g., Standard Product Warranty" value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="formDescription">Form Description (Optional)</Label>
                  <Textarea id="formDescription" placeholder="A brief summary of what this form is for" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-1">Form Fields</h3>
                 <p className="text-sm text-muted-foreground mb-4">Define the inputs for your form. Each field requires a label.</p>
                {fields.length === 0 && ( // Should not happen with current logic but good fallback
                  <p className="text-sm text-muted-foreground py-4 text-center">No fields added yet. Click "Add Another Field" to get started.</p>
                )}
                <div className="space-y-5">
                  {fields.map((field, index) => {
                    const isCurrentNamePredefined = predefinedFields.some(pf => pf.key === field.name);
                    const keySelectValueForControl = isCurrentNamePredefined ? field.name : AUTO_GENERATED_KEY_VALUE;

                    return (
                    <div key={index} className="p-4 border border-border rounded-lg space-y-4 bg-background shadow-sm">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-md pt-1">Field {index + 1}</p>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeField(index)} 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                            disabled={fields.length === 1 && index === 0}
                            title="Remove Field"
                        >
                           <Trash2 className="size-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor={`field-label-${index}`}>Field Label <span className="text-destructive">*</span></Label>
                        <Input id={`field-label-${index}`} placeholder="E.g., Product Name, Purchase Date" value={field.label} onChange={(e) => handleFieldChange(index, "label", e.target.value)} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor={`field-name-${index}`}>Field Key (Name)</Label>
                           <Select 
                            value={keySelectValueForControl} 
                            onValueChange={(selectedValue) => {
                                if (selectedValue === AUTO_GENERATED_KEY_VALUE) {
                                    // If label is empty, generated key will be empty. handleFieldChange updates field.name.
                                    handleFieldChange(index, "name", generateKeyFromLabel(fields[index].label));
                                } else { // A predefined key is selected
                                    handleFieldChange(index, "name", selectedValue);
                                }
                            }}
                          >
                            <SelectTrigger id={`field-name-${index}`}>
                              <SelectValue placeholder="Select key or use auto-generated" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={AUTO_GENERATED_KEY_VALUE}>
                                Use auto-generated key (from label)
                              </SelectItem>
                              {predefinedFields.map((keyOption) => (
                                <SelectItem key={keyOption.key} value={keyOption.key}>
                                  {keyOption.label} ({keyOption.key})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                           <p className="text-xs text-muted-foreground pt-1">
                            Actual key: <code className="bg-muted px-1 py-0.5 rounded-sm">{field.name || "(Will be auto-generated from label)"}</code>
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`field-type-${index}`}>Field Type</Label>
                          <Select value={field.type} onValueChange={(value) => handleFieldChange(index, "type", value as Field["type"])}>
                            <SelectTrigger id={`field-type-${index}`}>
                              <SelectValue placeholder="Select field type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                              <SelectItem value="dropdown">Dropdown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id={`field-required-${index}`} checked={field.required} onCheckedChange={(checked) => handleFieldChange(index, "required", !!checked)} />
                        <Label htmlFor={`field-required-${index}`} className="font-normal text-sm cursor-pointer">
                          This field is required
                        </Label>
                      </div>

                      {field.type === "dropdown" && (
                        <div className="pt-2 space-y-3 border-t border-border mt-4">
                          <Label className="text-sm font-medium block mb-2">Dropdown Options</Label>
                          {(field.options || []).map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Input placeholder={`Option ${optionIndex + 1}`} value={option} onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)} />
                              <Button variant="outline" size="icon" onClick={() => handleRemoveOption(index, optionIndex)} className="h-9 w-9 flex-shrink-0" title="Remove option">
                                <Trash2 className="size-4"/>
                              </Button>
                            </div>
                          ))}
                           {(!field.options || field.options.length === 0) && <p className="text-xs text-muted-foreground">No options added yet for this dropdown.</p>}
                          <Button variant="outline" size="sm" onClick={() => handleAddOption(index)}>
                            <PlusCircle className="size-4 mr-2"/> Add Option
                          </Button>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </div>
              
              <Button variant="outline" onClick={addField} className="mt-2 w-full md:w-auto">
                <PlusCircle className="size-4 mr-2"/> Add Another Field
              </Button>

            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t pt-6 mt-6">
                <Button variant="outline" onClick={resetForm} disabled={loading}>
                    {editingFormId ? "Cancel Edit" : "Clear Form"}
                </Button>
                <Button onClick={handleCreateForm} disabled={loading} className="w-full sm:w-auto">
                    {loading
                      ? editingFormId ? "Updating Form..." : "Creating Form..."
                      : editingFormId ? "Save Changes" : "Create Form"}
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="existing">
          <Card>
            <CardHeader>
              <CardTitle>Existing Form Definitions</CardTitle>
              <CardDescription>
                View and manage your created form definitions. Click "Edit" to modify a form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && forms.length === 0 && <p className="text-sm text-muted-foreground">Loading forms...</p>}
              {!loading && forms.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No form definitions found. Create one in the '{editingFormId ? "Edit Form" : "Create Form"}' tab.</p>
              )}
              {forms.map((form) => (
                <div key={form.id} className="flex items-center justify-between p-3.5 border border-border rounded-lg hover:shadow-sm transition-shadow">
                  <div>
                    <p className="text-md font-semibold text-primary">{form.formName}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-xs md:max-w-md">
                        {form.description || "No description provided."}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEditForm(form)}>
                    Edit
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}