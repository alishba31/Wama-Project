"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";

interface Report {
  id: number;
  reportType: string;
  createdAt: string;
  data: object;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportType, setReportType] = useState("");
  const [reportData, setReportData] = useState("");
  const [error, setError] = useState("");
  const [reportTypeError, setReportTypeError] = useState("");

  useEffect(() => {
    axios
      .get("/api/admin/reports")
      .then((response) => setReports(response.data))
      .catch((error) => setError(error.response?.data?.message || "Failed to load reports."));
  }, []);

  const validateForm = () => {
    let isValid = true;
    setReportTypeError("");

    if (reportType.trim() === "") {
      setReportTypeError("Report type is required.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axios.post("/api/admin/reports", {
        reportType,
        data: reportData,
      });

      if (response.status === 201) {
        setReports([...reports, response.data.report]);
        setReportType("");
        setReportData("");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to generate report.");
    }
  };

  const handleDownloadPDF = (report: Report) => {
    const doc = new jsPDF();

    // Set the title
    doc.setFontSize(16);
    doc.text(`Report Type: ${report.reportType}`, 10, 10);
    doc.text(`Created At: ${new Date(report.createdAt).toLocaleString()}`, 10, 20);

    // Add report data
    doc.setFontSize(12);
    const dataString = JSON.stringify(report.data, null, 2);
    const lines = doc.splitTextToSize(dataString, 180);
    doc.text(lines, 10, 30);

    // Save the file
    const fileName = `${report.reportType.replace(/\s+/g, "_")}_${new Date(
      report.createdAt
    ).toISOString()}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="flex items-center justify-center max-h-screen p-6">
      <Card className="w-full max-w-lg shadow-lg rounded-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-primary dark:text-primary-foreground">
            Generate Reports
          </CardTitle>
        </CardHeader>

        <CardContent>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Type Input */}
            <div className="grid gap-2">
              <label htmlFor="reportType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Report Type
              </label>
              <Input
                id="reportType"
                type="text"
                placeholder="Enter Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full"
              />
              {reportTypeError && <p className="text-red-500 text-sm">{reportTypeError}</p>}
            </div>

            {/* Report Data Textarea */}
            <div className="grid gap-2">
              <label htmlFor="reportData" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Report Data
              </label>
              <Textarea
                id="reportData"
                placeholder="Enter Report Data"
                value={reportData}
                onChange={(e) => setReportData(e.target.value)}
                className="w-full"
              />
            </div>

            <Button type="submit" variant="outline" className="w-full bg-primary hover:bg-primary-foreground">
              Generate Report
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <h2 className="text-lg font-semibold mt-4 mb-2">Generated Reports</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            {reports.map((report) => (
              <li key={report.id} className="flex justify-between items-center text-sm">
                <span>
                  Report Type: {report.reportType}, Created At:{" "}
                  {new Date(report.createdAt).toLocaleString()}
                </span>
                <Button
                  onClick={() => handleDownloadPDF(report)}
                  variant="outline"
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Download PDF
                </Button>
              </li>
            ))}
          </ul>
        </CardFooter>
      </Card>
    </div>
  );
}
