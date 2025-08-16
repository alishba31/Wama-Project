"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface Report {
  id: number;
  productName: string;
  productCategory: string;
  serialNumber: string;
  modelNumber: string;
  manufacturerName: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  ticketId: number;
  ticketDate: string;
  adminStatus: string;
  oemStatus: string;
  ticketType: string;
  claimDescription: string;
  causeOfFailure: string;
  adminComments?: string;
  oemComments?: string;
}

export default function ProductSpecificReporting() {
  const [reports, setReports] = useState<Report[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    axios
      .get("/api/admin/product-specific-reports")
      .then((response) => setReports(response.data))
      .catch((error) => setError(error.response?.data?.message || "Failed to load reports."));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/admin/product-specific-reports", formData);
      setReports([...reports, response.data.newReport]);
      setFormData({});
      setSuccess("Product-specific report created successfully.");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create report.");
    }
  };

  const handleDownloadPDF = (report: Report) => {
    const doc = new jsPDF();

    // Set the title
    doc.setFontSize(16);
    doc.text(`Product-Specific Report`, 10, 10);
    doc.text(`Product Name: ${report.productName}`, 10, 20);
    doc.text(`Category: ${report.productCategory}`, 10, 30);
    doc.text(`Serial Number: ${report.serialNumber}`, 10, 40);
    doc.text(`Model Number: ${report.modelNumber}`, 10, 50);
    doc.text(`Manufacturer: ${report.manufacturerName}`, 10, 60);
    doc.text(`Warranty: ${report.warrantyStartDate} - ${report.warrantyEndDate}`, 10, 70);
    doc.text(`Ticket ID: ${report.ticketId}`, 10, 80);
    doc.text(`Ticket Date: ${report.ticketDate}`, 10, 90);
    doc.text(`Ticket Type: ${report.ticketType}`, 10, 100);

    const additionalDetails = [
      `Admin Status: ${report.adminStatus}`,
      `OEM Status: ${report.oemStatus}`,
      `Claim Description: ${report.claimDescription}`,
      `Cause of Failure: ${report.causeOfFailure}`,
      `Admin Comments: ${report.adminComments || "N/A"}`,
      `OEM Comments: ${report.oemComments || "N/A"}`,
    ];

    doc.setFontSize(12);
    additionalDetails.forEach((line, index) => {
      doc.text(line, 10, 110 + index * 10);
    });

    // Save the file
    const fileName = `${report.productName.replace(/\s+/g, "_")}_${report.id}.pdf`;
    doc.save(fileName);
  };

  const handleDownloadExcel = (report: Report) => {
    const worksheet = XLSX.utils.json_to_sheet([report]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const fileName = `${report.productName.replace(/\s+/g, "_")}_${report.id}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="p-6">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Product-Specific Reporting</CardTitle>
        </CardHeader>

        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid">
                <label className="text-sm text-gray-600">Product Name</label>
                <Input
                  name="productName"
                  placeholder="Product Name"
                  value={formData.productName || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid">
                <label className="text-sm text-gray-600">Product Category</label>
                <Input
                  name="productCategory"
                  placeholder="Product Category"
                  value={formData.productCategory || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid">
                <label className="text-sm text-gray-600">Serial Number</label>
                <Input
                  name="serialNumber"
                  placeholder="Serial Number"
                  value={formData.serialNumber || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid">
                <label className="text-sm text-gray-600">Model Number</label>
                <Input
                  name="modelNumber"
                  placeholder="Model Number"
                  value={formData.modelNumber || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid">
                <label className="text-sm text-gray-600">Manufacturer Name</label>
                <Input
                  name="manufacturerName"
                  placeholder="Manufacturer Name"
                  value={formData.manufacturerName || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid">
                <label className="text-sm text-gray-600">Warranty Start Date</label>
                <Input
                  name="warrantyStartDate"
                  type="date"
                  value={formData.warrantyStartDate || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid">
                <label className="text-sm text-gray-600">Warranty End Date</label>
                <Input
                  name="warrantyEndDate"
                  type="date"
                  value={formData.warrantyEndDate || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid">
                <label className="text-sm text-gray-600">Ticket ID</label>
                <Input
                  name="ticketId"
                  type="number"
                  placeholder="Ticket ID"
                  value={formData.ticketId || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid">
                <label className="text-sm text-gray-600">Ticket Date</label>
                <Input
                  name="ticketDate"
                  type="date"
                  value={formData.ticketDate || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid">
                <label className="text-sm text-gray-600">Ticket Type</label>
                <Input
                  name="ticketType"
                  placeholder="Ticket Type"
                  value={formData.ticketType || ""}
                  onChange={handleInputChange}

                />
              </div>
            </div>

            <div className="grid">
              <label className="text-sm text-gray-600">Claim Description</label>
              <Textarea
                name="claimDescription"
                placeholder="Claim Description"
                value={formData.claimDescription || ""}
                onChange={handleInputChange}

              />
            </div>
            <div className="grid">
              <label className="text-sm text-gray-600">Cause of Failure</label>
              <Textarea
                name="causeOfFailure"
                placeholder="Cause of Failure"
                value={formData.causeOfFailure || ""}
                onChange={handleInputChange}

              />
            </div>
            <div className="grid">
              <label className="text-sm text-gray-600">Status by Admin</label>
              <Input
                name="adminStatus"
                placeholder="Status by Admin"
                value={formData.adminStatus || ""}
                onChange={handleInputChange}

              />
            </div>
            <div className="grid">
              <label className="text-sm text-gray-600">Status by OEM</label>
              <Input
                name="oemStatus"
                placeholder="Status by OEM"
                value={formData.oemStatus || ""}
                onChange={handleInputChange}

              />
            </div>
            <div className="grid">
              <label className="text-sm text-gray-600">Admin Comments</label>
              <Textarea
                name="adminComments"
                placeholder="Admin Comments"
                value={formData.adminComments || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid">
              <label className="text-sm text-gray-600">OEM Comments</label>
              <Textarea
                name="oemComments"
                placeholder="OEM Comments"
                value={formData.oemComments || ""}
                onChange={handleInputChange}
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary-foreground">
              Create Report
            </Button>
          </form>

          <h2 className="text-xl font-bold mt-8">Generated Reports</h2>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="p-4 border rounded-md shadow-sm">
                <h3 className="text-lg font-semibold">{report.productName}</h3>


                <p>Ticket ID: {report.ticketId}</p>

                <div className="flex space-x-4 mt-2">
                  <Button
                    onClick={() => handleDownloadPDF(report)}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => handleDownloadExcel(report)}
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    Download Excel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
