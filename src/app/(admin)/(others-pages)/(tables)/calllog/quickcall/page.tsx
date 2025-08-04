"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import TextArea from "@/components/form/input/TextArea";
import InputField from "@/components/form/input/InputField";
import { TimeIcon } from "@/icons";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";
import { callLogHistoryData } from "@/components/tables/sample-data/callLogHistoryData";
import { callLogsData } from "@/components/tables/sample-data/callLogsData";

interface SelectOption {
  value: string;
  label: string;
}

interface PipelineInfo {
  pipelineId: string;
  pipelineName: string;
  leadName: string;
  leadCompany: string;
  propertyName: string;
  propertyLocation: string;
  callerName: string;
  callerPhone: string;
}

export default function QuickCallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pipelineId = searchParams.get('pipelineId') || '';

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Call Pipeline", href: "/callpipeline" },
    { name: "Quick Call" },
  ];

  const [pipelineInfo, setPipelineInfo] = useState<PipelineInfo | null>(null);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(true);

  // Load pipeline information by ID
  useEffect(() => {
    const loadPipelineInfo = async () => {
      if (!pipelineId) {
        setIsLoadingPipeline(false);
        return;
      }

      try {
        // TODO: Replace with actual API call when backend is ready
        // const response = await api.get(`/pipeline/${pipelineId}`);
        // setPipelineInfo(response.data);
        
        // For now, get from sample data
        const pipeline = callLogsData.find(log => log.id.toString() === pipelineId);
        if (pipeline) {
          setPipelineInfo({
            pipelineId: pipeline.id.toString(),
            pipelineName: `${pipeline.lead.name} - ${pipeline.Property.name}`,
            leadName: pipeline.lead.name,
            leadCompany: pipeline.lead.company,
            propertyName: pipeline.Property.name,
            propertyLocation: pipeline.Property.Location,
            callerName: pipeline.caller.name,
            callerPhone: pipeline.caller.phone
          });
        }
      } catch (error) {
        console.error("Error loading pipeline information:", error);
      } finally {
        setIsLoadingPipeline(false);
      }
    };

    loadPipelineInfo();
  }, [pipelineId]);

  const [formData, setFormData] = useState({
    callDate: new Date(), // Use Date object for DatePicker
    callStartTime: "",
    callEndTime: "",
    callStatus: null as SelectOption | null,
    notes: "",
  });

  type CallLogFormErrors = {
    callDate?: string;
    callStartTime?: string;
    callEndTime?: string;
    callStatus?: string;
    notes?: string;
  };

  const [errors, setErrors] = useState<CallLogFormErrors>({});

  // Call status options for Call Log History
  const statusOptions: SelectOption[] = [
    { value: "Completed", label: "Completed" },
    { value: "No Answer", label: "No Answer" },
    { value: "Busy", label: "Busy" },
    { value: "Voicemail", label: "Voicemail" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Failed", label: "Failed" },
  ];

  // Get call log history for this pipeline
  const pipelineCallHistory = pipelineInfo ? callLogHistoryData.filter(
    log => log.callPipelineID === parseInt(pipelineInfo.pipelineId || '0')
  ).sort((a, b) => b.callLogOrderID - a.callLogOrderID) : []; // Latest first

  const handleChange = (field: keyof typeof formData, value: string | SelectOption | null | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: CallLogFormErrors = {};
    
    if (!formData.callDate) newErrors.callDate = "Call date is required.";
    if (!formData.callStartTime) newErrors.callStartTime = "Start time is required.";
    if (!formData.callStatus) newErrors.callStatus = "Call status is required.";
    if (!formData.notes.trim()) newErrors.notes = "Notes are required.";
    
    // Validate end time is after start time if both are provided
    if (formData.callStartTime && formData.callEndTime) {
      const startTime = new Date(`2000-01-01T${formData.callStartTime}`);
      const endTime = new Date(`2000-01-01T${formData.callEndTime}`);
      if (endTime <= startTime) {
        newErrors.callEndTime = "End time must be after start time.";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const resetForm = () => {
    setFormData({
      callDate: new Date(),
      callStartTime: "",
      callEndTime: "",
      callStatus: null,
      notes: "",
    });
    setErrors({});
  };

  const handleSave = async () => { 
    if (!validate() || !pipelineInfo) return;
    
    try {
      setIsSubmitting(true);
      
      // Generate next order ID
      const nextOrderId = pipelineCallHistory.length > 0 
        ? Math.max(...pipelineCallHistory.map(log => log.callLogOrderID)) + 1 
        : 1;

      // Format date for API
      const callDate = formData.callDate instanceof Date 
        ? formData.callDate.toISOString().split('T')[0]
        : formData.callDate;
      
      const callLogData = {
        callPipelineID: parseInt(pipelineInfo.pipelineId),
        callLogOrderID: nextOrderId,
        callDate: callDate,
        callStartTime: formData.callStartTime,
        callEndTime: formData.callEndTime || "",
        callStatus: formData.callStatus?.value,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      };
      
      console.log("Quick Call Log Data to submit:", callLogData);
      
      // TODO: Replace with actual API call when backend is ready
      // await api.post('/call-log-history', callLogData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success modal instead of redirecting immediately
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Error saving quick call log:", error);
      alert("Failed to save quick call log. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    resetForm();
  };

  const handleCloseForm = () => {
    setShowSuccessModal(false);
    router.push("/callpipeline");
  };

  // Pagination state for call log history
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination for call log history
  const totalPages = Math.ceil(pipelineCallHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCallHistory = pipelineCallHistory.slice(startIndex, endIndex);

  // Pagination component - using the same design as CallLogsTable
  const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    const getPageNumbers = () => {
      const pages = [];
      const pageLimit = 2;
      
      if (totalPages <= 1) return [];

      pages.push(1);

      if (currentPage > pageLimit + 1) {
        pages.push('...');
      }

      const startPage = Math.max(2, currentPage - pageLimit);
      const endPage = Math.min(totalPages - 1, currentPage + pageLimit);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - pageLimit - 1) {
        pages.push('...');
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
      
      return [...new Set(pages)];
    };

    return (
      <nav className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <Button 
              key={index} 
              variant={currentPage === page ? 'primary' : 'outline'} 
              size="sm" 
              onClick={() => onPageChange(page)} 
              className="w-9"
            >
              {page}
            </Button>
          ) : (
            <span key={index} className="px-2 py-1 text-sm text-gray-500">...</span>
          )
        )}
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </nav>
    );
  };

  const handleCancel = () => { 
    router.push("/callpipeline"); 
  };

  // Format time for display
  const formatTime = (time: string) => {
    if (!time) return "N/A";
    return time;
  };

  // Calculate call duration
  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return "N/A";
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m`;
  };

  // Show loading or no data if pipeline info is not loaded
  if (isLoadingPipeline) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading pipeline information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to pipeline list if no pipelineId
  if (!pipelineId) {
    router.push("/callpipeline");
    return null;
  }

  if (!pipelineInfo) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Pipeline not found.</p>
            <Button variant="outline" onClick={() => router.push("/callpipeline")}>
              Back to Call Pipeline
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        
        {/* Section 1: General Information (Read-only) */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Pipeline Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Pipeline ID Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Pipeline ID
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 font-mono">
                    #{pipelineInfo.pipelineId}
                  </h4>
                </div>
              </div>
            </div>

            {/* Lead Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Lead
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {pipelineInfo.leadName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pipelineInfo.leadCompany}</p>
                </div>
              </div>
            </div>

            {/* Property Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Property
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {pipelineInfo.propertyName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pipelineInfo.propertyLocation}</p>
                </div>
              </div>
            </div>

            {/* Caller Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Caller
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {pipelineInfo.callerName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pipelineInfo.callerPhone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Quick Call Log Input Form */}
        <ComponentCard title="Quick Call Entry">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-4">
            
            {/* Call Date */}
            <div>
              <DatePicker
                id="call-date-picker"
                label="Call Date *"
                placeholder="Select call date"
                value={formData.callDate}
                onChange={(dates) => handleChange('callDate', dates[0])}
              />
              {errors.callDate && <p className="text-sm text-red-500 mt-1">{errors.callDate}</p>}
            </div>

            {/* Call Start Time */}
            <div>
              <Label htmlFor="callStartTime">Start Time *</Label>
              <div className="relative">
                <InputField
                  type="time"
                  id="callStartTime"
                  value={formData.callStartTime}
                  onChange={(e) => handleChange('callStartTime', e.target.value)}
                  error={!!errors.callStartTime}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <TimeIcon />
                </span>
              </div>
              {errors.callStartTime && <p className="text-sm text-red-500 mt-1">{errors.callStartTime}</p>}
            </div>

            {/* Call End Time */}
            <div>
              <Label htmlFor="callEndTime">End Time</Label>
              <div className="relative">
                <InputField
                  type="time"
                  id="callEndTime"
                  value={formData.callEndTime}
                  onChange={(e) => handleChange('callEndTime', e.target.value)}
                  error={!!errors.callEndTime}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <TimeIcon />
                </span>
              </div>
              {errors.callEndTime && <p className="text-sm text-red-500 mt-1">{errors.callEndTime}</p>}
            </div>

            {/* Call Status */}
            <div>
              <Label htmlFor="callStatus">Call Status *</Label>
              <Select
                placeholder="Select status"
                options={statusOptions}
                value={formData.callStatus}
                onChange={(option) => handleChange('callStatus', option)}
              />
              {errors.callStatus && <p className="text-sm text-red-500 mt-1">{errors.callStatus}</p>}
            </div>
          </div>

          {/* Notes - Full width */}
          <div className="mt-5">
            <Label htmlFor="notes">Call Notes *</Label>
            <TextArea
              placeholder="Enter detailed call notes..."
              value={formData.notes}
              onChange={(value) => handleChange("notes", value)}
              rows={4}
            />
            {errors.notes && <p className="text-sm text-red-500 mt-1">{errors.notes}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Add Call Log"}
            </Button>
          </div>
        </ComponentCard>

        {/* Section 3: Call Log History Table */}
        <div className="space-y-4">
          {/* Table Header with Title */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Call Log History for Pipeline #{pipelineInfo.pipelineId}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total {pipelineCallHistory.length} call log {pipelineCallHistory.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
          </div>

          {pipelineCallHistory.length === 0 ? (
            <div className="py-8 text-center bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05]">
              <p className="text-gray-500 dark:text-gray-400">
                No call history found for this pipeline. Add the first call log entry above.
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <div className="min-w-[800px]">
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                            #
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Date & Time
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Duration
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Status
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Notes
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {currentCallHistory.map((log) => (
                          <TableRow key={`${log.callPipelineID}-${log.callLogOrderID}`}>
                            <TableCell className="px-5 py-4 text-center">
                              <span className="font-mono text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {log.callLogOrderID}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <div>
                                <div className="font-medium text-gray-800 dark:text-white text-sm">
                                  {log.callDate}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-xs">
                                  {formatTime(log.callStartTime)} - {formatTime(log.callEndTime)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500 text-sm dark:text-gray-400">
                              {calculateDuration(log.callStartTime, log.callEndTime)}
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <Badge
                                size="sm"
                                color={
                                  log.callStatus === "Completed"
                                    ? "success"
                                    : log.callStatus === "No Answer" || log.callStatus === "Failed"
                                    ? "error"
                                    : log.callStatus === "Busy" || log.callStatus === "Voicemail"
                                    ? "warning"
                                    : "info"
                                }
                              >
                                {log.callStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <div className="max-w-md text-sm text-gray-600 dark:text-gray-300">
                                {log.notes}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {/* Pagination - Using the same design as CallLogsTable */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Showing{" "}
                      <span className="font-medium">{startIndex + 1}</span>
                      {" "}to{" "}
                      <span className="font-medium">
                        {Math.min(endIndex, pipelineCallHistory.length)}
                      </span>
                      {" "}of{" "}
                      <span className="font-medium">{pipelineCallHistory.length}</span>
                      {" "}entries
                    </span>
                  </div>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        className="max-w-md p-6"
      >
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-900/20">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
            Quick Call Log Added Successfully!
          </h3>
          
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            The call log has been added to pipeline #{pipelineInfo.pipelineId}. What would you like to do next?
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              onClick={handleAddAnother}
              className="flex-1"
            >
              Add Another Call Log
            </Button>
            <Button
              variant="primary"
              onClick={handleCloseForm}
              className="flex-1"
            >
              Close Form
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
