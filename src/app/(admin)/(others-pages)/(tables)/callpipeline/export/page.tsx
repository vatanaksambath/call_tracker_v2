"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LoadingOverlay from "@/components/ui/loading/LoadingOverlay";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import { CallLog } from "@/components/tables/sample-data/callLogsData";
import api from "@/lib/api";
import { 
  DocumentArrowDownIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Call Pipeline", href: "/callpipeline" },
  { name: "Export Data", href: "/callpipeline/export" }
];

// Export functionality
const exportToCSV = (data: CallLog[], format: 'csv' | 'excel' = 'csv', fileName: string = 'call_pipeline_export') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // All available columns
  const allColumns: (keyof CallLog)[] = [
    'call_log_id',
    'lead_name', 
    'phone_number',
    'property_profile_name',
    'property_profile_price',
    'property_type_name',
    'total_call',
    'total_site_visit',
    'status',
    'lead_id',
    'property_profile_id',
    'purpose',
    'is_follow_up',
    'follow_up_date',
    'fail_reason',
    'created_by_name',
    'created_date',
    'updated_by_name',
    'last_update',
    'is_active'
  ];

  // Get column labels
  const getColumnLabel = (key: keyof CallLog): string => {
    const columnConfig = [
      { key: 'call_log_id', label: 'Call Log ID' },
      { key: 'lead_name', label: 'Lead Full Name' },
      { key: 'phone_number', label: 'Phone Number' },
      { key: 'property_profile_name', label: 'Property Name' },
      { key: 'property_profile_price', label: 'Property Price' },
      { key: 'property_type_name', label: 'Property Type' },
      { key: 'total_call', label: 'Total Call' },
      { key: 'total_site_visit', label: 'Total Site Visit' },
      { key: 'status', label: 'Status' },
      { key: 'lead_id', label: 'Lead ID' },
      { key: 'property_profile_id', label: 'Property Profile ID' },
      { key: 'purpose', label: 'Purpose' },
      { key: 'is_follow_up', label: 'Is Follow Up' },
      { key: 'follow_up_date', label: 'Follow Up Date' },
      { key: 'fail_reason', label: 'Fail Reason' },
      { key: 'created_by_name', label: 'Created By' },
      { key: 'created_date', label: 'Created Date' },
      { key: 'updated_by_name', label: 'Updated By' },
      { key: 'last_update', label: 'Last Update' },
      { key: 'is_active', label: 'Is Active' }
    ];
    
    const config = columnConfig.find(col => col.key === key);
    return config ? config.label : String(key);
  };

  // Format value based on column type
  const formatValue = (value: unknown, key: keyof CallLog): string => {
    if (value === null || value === undefined) return '';
    
    if (key === 'property_profile_price' && typeof value === 'number') {
      return `$${value.toLocaleString('en-US')}`;
    }
    
    if (key === 'phone_number' && typeof value === 'string') {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.startsWith("855") && cleaned.length >= 9) {
        const remaining = cleaned.substring(3);
        if (remaining.length >= 8) {
          const part1 = remaining.substring(0, 3);
          const part2 = remaining.substring(3, 6);
          const part3 = remaining.substring(6, 10);
          return `(+855) ${part1}-${part2}-${part3}`;
        }
      }
      return value;
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (typeof value === 'string' && value.includes(',')) {
      return `"${value}"`;
    }
    
    return String(value);
  };

  // Create CSV headers and rows
  const headers = allColumns.map(getColumnLabel);
  const rows = data.map(row => 
    allColumns.map(column => formatValue(row[column], column))
  );

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  // Create and download file
  const mimeType = format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv;charset=utf-8;';
  const fileExtension = format === 'excel' ? 'xls' : 'csv';
  
  const blob = new Blob([csvContent], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.${fileExtension}`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ExportPage() {
  const router = useRouter();
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch all call logs for export
  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        // Fetch all data (use a large page size)
        const body = {
          page_number: "1",
          page_size: "10000", // Large number to get all records
          search_type: "",
          query_search: ""
        };
        
        const logsRes = await api.post('/call-log/pagination', body, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        const apiResult = Array.isArray(logsRes.data) ? logsRes.data[0] : logsRes.data;
        const logs: CallLog[] = apiResult && apiResult.data ? apiResult.data : [];
        
        if (isMounted) {
          setCallLogs(logs);
        }
      } catch (error) {
        console.error('Error fetching data for export:', error);
        if (isMounted) {
          setCallLogs([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchAllData();
    return () => { isMounted = false; };
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for UX
      exportToCSV(callLogs, exportFormat);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb crumbs={breadcrumbs} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2">
          <ComponentCard title="Export Configuration">
            <div className="space-y-6">
              {/* Back Button */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to Call Pipeline
                </Button>
              </div>

              {/* Export Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-800/50">
                    <DocumentArrowDownIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Ready to Export Call Pipeline Data
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      <span className="font-bold">{callLogs.length} records</span> are ready to be exported with all available columns.
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      The export will include all data fields and properly formatted values.
                    </p>
                  </div>
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Export Format
                </label>
                <Select
                  options={[
                    { value: 'csv', label: 'CSV File (.csv) - Recommended' },
                    { value: 'excel', label: 'Excel File (.xls)' }
                  ]}
                  value={exportFormat === 'csv' ? 
                    { value: 'csv', label: 'CSV File (.csv) - Recommended' } : 
                    { value: 'excel', label: 'Excel File (.xls)' }
                  }
                  onChange={(option) => setExportFormat(option?.value as 'csv' | 'excel' || 'csv')}
                  placeholder="Select export format"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  CSV format is recommended for better compatibility with spreadsheet applications.
                </p>
              </div>

              {/* Export Button */}
              <div className="pt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleExport}
                  disabled={isExporting || callLogs.length === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-3"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="h-5 w-5" />
                      Export {callLogs.length} Records
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Included Columns */}
        <div className="lg:col-span-1">
          <ComponentCard title="Included Columns">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="font-medium">All {20} columns included</span>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[
                  'Call Log ID', 'Lead Full Name', 'Phone Number', 'Property Name',
                  'Property Price', 'Property Type', 'Total Call', 'Total Site Visit',
                  'Status', 'Lead ID', 'Property Profile ID', 'Purpose',
                  'Is Follow Up', 'Follow Up Date', 'Fail Reason', 'Created By',
                  'Created Date', 'Updated By', 'Last Update', 'Is Active'
                ].map((column, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{column}</span>
                  </div>
                ))}
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
