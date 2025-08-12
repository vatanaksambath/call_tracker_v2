"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CsvRow {
  phone_number: string;
  staff_id: string;
}

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Call Pipeline", href: "/callpipeline" },
  { name: "Import Data", href: "/callpipeline/import_data" }
];

export default function ImportDataPage() {
  const router = useRouter();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
        setError("Please select a valid CSV file");
        return;
      }
      setCsvFile(file);
      setError("");
      parseCSV(file);
    }
  };

  const parseCSV = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        if (lines.length < 2) {
          setError("CSV file must contain at least a header row and one data row");
          setIsLoading(false);
          return;
        }

        // Get header row and validate columns
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const phoneIndex = headers.findIndex(h => h.includes('phone'));
        const staffIndex = headers.findIndex(h => h.includes('staff'));

        if (phoneIndex === -1 || staffIndex === -1) {
          setError("CSV must contain 'phone_number' and 'staff_id' columns");
          setIsLoading(false);
          return;
        }

        // Parse data rows (first 10 for preview)
        const dataRows: CsvRow[] = [];
        for (let i = 1; i < Math.min(lines.length, 11); i++) {
          const row = lines[i].split(',').map(cell => cell.trim());
          if (row.length >= Math.max(phoneIndex, staffIndex) + 1) {
            dataRows.push({
              phone_number: row[phoneIndex] || "",
              staff_id: row[staffIndex] || ""
            });
          }
        }

        setCsvData(dataRows);
        setIsLoading(false);
      } catch {
        setError("Error parsing CSV file. Please check the file format.");
        setIsLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!csvFile) return;
    
    setIsLoading(true);
    try {
      // Here you would implement the actual upload logic
      // For now, we'll just simulate an upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // After successful upload, redirect back to call pipeline
      router.push('/callpipeline');
    } catch {
      setError("Failed to upload data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCsvFile(null);
    setCsvData([]);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageBreadcrumb crumbs={breadcrumbs} />
        <Link href="/callpipeline">
          <Button variant="outline" className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </Button>
        </Link>
      </div>
      
      <ComponentCard title="Import CSV Data">
        <div className="space-y-6">
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              Upload a CSV file containing phone numbers and staff IDs
            </p>
          </div>
          {/* File Upload Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select CSV File
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">CSV files only</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            {csvFile && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Selected file: <span className="font-medium">{csvFile.name}</span>
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* CSV Preview Section */}
          {csvData.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Data Preview (First 10 rows)
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Row #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Staff ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {csvData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.phone_number || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {row.staff_id || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing preview of {csvData.length} rows from your CSV file.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {csvData.length > 0 && (
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </div>
                ) : (
                  'Upload Data'
                )}
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">CSV Format Requirements:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• File must be in CSV format (.csv)</li>
              <li>• Must contain columns with &quot;phone&quot; and &quot;staff&quot; in the header names</li>
              <li>• Example headers: &quot;phone_number&quot;, &quot;staff_id&quot; or &quot;Phone Number&quot;, &quot;Staff ID&quot;</li>
              <li>• First row should contain column headers</li>
              <li>• Phone numbers should be in a valid format</li>
            </ul>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
