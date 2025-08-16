"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ArrowLeft, BookCopy, List, Plus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface WarrantyData {
  id: number;
  productType: string;
  serialNumber: string;
  clientName: string;
  warrantySpan: string;
  dateOfPurchase: string;
}

export default function WarrantyDataManagement() {
  const [items, setItems] = useState<WarrantyData[]>([]);
  const [filteredItems, setFilteredItems] = useState<WarrantyData[]>([]);
  const [formData, setFormData] = useState<Partial<WarrantyData>>({});
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [progress, setProgress] = useState<number>(0);
  const router = useRouter();
  const [searchProductType, setSearchProductType] = useState("");
  const [searchSerialNumber, setSearchSerialNumber] = useState("");
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchProductType, searchSerialNumber]);

  const fetchItems = async () => {
    try {
      const response = await axios.get("/api/admin/warranty-data");
      setItems(response.data);
    } catch (error: any) {
      setError("Failed to fetch items.");
    }
  };

  const applyFilters = () => {
    let filtered = items;

    if (searchProductType) {
      filtered = filtered.filter((item) =>
        item.productType.toLowerCase().includes(searchProductType.toLowerCase())
      );
    }

    if (searchSerialNumber) {
      filtered = filtered.filter((item) =>
        item.serialNumber.toLowerCase().includes(searchSerialNumber.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileSubmit = async () => {
    if (!file) {
      setError("Please upload a file.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setProgress(66);
        const response = await axios.post("/api/admin/upload-warranty-data", jsonData);

        if (response.status === 201) {
          setSuccess("File uploaded successfully, and data has been added.");
          setProgress(100);
          setTimeout(() => setProgress(0), 1000);
          fetchItems();
        } else {
          setError(response.data.message || "Failed to upload data.");
          setProgress(0);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to process the file.");
      setProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editMode && formData.id) {
        await axios.put(`/api/admin/warranty-data`, formData);
        setSuccess("Item updated successfully.");
      } else {
        await axios.post("/api/admin/warranty-data", formData);
        setSuccess("Item added successfully.");
      }
      fetchItems();
      setFormData({});
      setEditMode(false);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to save item.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/api/admin/warranty-data?id=${id}`);

      if (response.status === 200) {
        toast({
          variant: "default",
          description: "Item deleted successfully.",
        });

        fetchItems();
      } else {
        toast({
          description: "Failed to delete item.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        description: error.response?.data?.message || "Failed to delete item.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: WarrantyData) => {
    setFormData(item);
    setEditMode(true);
  };

  return (
    <div className="p-6">
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Button size="icon" variant="outline" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="size-5" />
        </Button>
        <BookCopy className="w-7 h-7 text-primary mr-2" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-50">Warranty Data Management</h1>
      </div>

      <Card className="w-full shadow-lg">
        {progress > 0 && <Progress value={progress} className="h-1" />}
        
        <CardHeader>
          <h2 className="text-lg font-semibold">{editMode ? "Edit Item" : "Add New Item"}</h2>
        </CardHeader>

        <CardContent className="pt-2">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="productType" placeholder="Product Type" value={formData.productType || ""} onChange={handleInputChange} required />
              <Input name="serialNumber" placeholder="Serial Number" value={formData.serialNumber || ""} onChange={handleInputChange} required />
              <Input name="clientName" placeholder="Client Name" value={formData.clientName || ""} onChange={handleInputChange} required />
              <Input name="warrantySpan" placeholder="Warranty Span (e.g., 5 years)" value={formData.warrantySpan || ""} onChange={handleInputChange} required />
              <Input name="dateOfPurchase" type="date" placeholder="Date of Purchase" value={formData.dateOfPurchase || ""} onChange={handleInputChange} required />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1 gap-2">
                <Plus className="h-4 w-4" />
                {editMode ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </form>

          <div className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium mb-2">Upload CSV/Excel File</label>
                <Input 
                  type="file" 
                  accept=".csv, .xlsx" 
                  onChange={handleFileUpload} 
                  className="cursor-pointer w-full"
                />
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <Button 
                  onClick={handleFileSubmit} 
                  disabled={!file}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowItems(!showItems)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <List className="h-4 w-4" />
                  {showItems ? "Hide Items" : "Show Items"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        {showItems && (
          <CardFooter className="border-t p-0">
            <div className="w-full p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input 
                  placeholder="Search by Product Type" 
                  value={searchProductType} 
                  onChange={(e) => setSearchProductType(e.target.value)} 
                />
                <Input 
                  placeholder="Search by Serial Number" 
                  value={searchSerialNumber} 
                  onChange={(e) => setSearchSerialNumber(e.target.value)} 
                />
              </div>

              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Serial Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Warranty Span</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date of Purchase</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">{item.productType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.serialNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.clientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.warrantySpan}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.dateOfPurchase}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  </div>
  );
}