"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, PencilIcon, TrashIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { Modal } from "@/components/ui/modal";

interface SelectOption {
  value: string;
  label: string;
}

interface PipelineInfo {
  pipelineId: string;
  pipelineName: string;
  leadId: string;
  leadName: string;
  leadCompany: string;
  propertyName: string;
  propertyLocation: string;
  propertyProfileId: string;
  callerName: string;
  callerPhone: string;
  callerId: string;
}

interface SiteVisitEntry {
  visitPipelineID: number;
  visitLogOrderID: number;
  visitDate: string;
  visitStartTime: string;
  visitEndTime: string;
  visitStatus: string;
  visitType: string;
  attendees: string;
  notes: string;
  createdAt: string;
  lastUpdate: string;
  // Additional fields from API
  siteVisitId?: string;
  propertyProfileName?: string;
  contactResultName?: string;
  photoUrls?: string[];
}

export default function SiteVisitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pipelineId = searchParams.get('pipelineId') || '';

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Call Pipeline", href: "/callpipeline" },
    { name: "Site Visit" },
  ];

  const [pipelineInfo, setPipelineInfo] = useState<PipelineInfo | null>(null);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(true);
  const [siteVisitHistory, setSiteVisitHistory] = useState<SiteVisitEntry[]>([]);

  // Load pipeline information and site visit history by ID
  const loadPipelineInfo = useCallback(async () => {
    if (!pipelineId) {
      setIsLoadingPipeline(false);
      return;
    }

    try {
      // Use the same approach as quickcall page with direct fetch
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const body = {
        page_number: "1",
        page_size: "10",
        search_type: "call_log_id",
        query_search: pipelineId,
      };
      
      console.log("Making API call to:", `${apiBase}/call-log/pagination`);
      console.log("Request body:", body);
      
      const res = await fetch(`${apiBase}/call-log/pagination`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      
      if (!res.ok) throw new Error("Failed to fetch call log data");
      
      const data = await res.json();
      console.log("API Response:", data);
      
      let logArr = [];
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].data)) {
        logArr = data[0].data;
      } else if (Array.isArray(data?.data)) {
        logArr = data.data;
      } else if (Array.isArray(data?.results)) {
        logArr = data.results;
      }
      
      console.log("Parsed logArr:", logArr);
      
      if (logArr.length > 0) {
        const log = logArr[0];
        console.log("Raw log object:", log);
        
        // Set pipeline info using the same structure as quickcall page
        setPipelineInfo({
          pipelineId: log.call_log_id || "",
          pipelineName: `${log.lead_name || 'Unknown Lead'} - ${log.property_profile_name || 'Unknown Property'}`,
          leadId: log.lead_id || "",
          leadName: log.lead_name || "Unknown Lead",
          leadCompany: "N/A", // Not available in current API
          propertyName: log.property_profile_name || "Unknown Property",
          propertyLocation: "N/A", // Not available in current API
          propertyProfileId: log.property_profile_id || "",
          callerName: log.created_by_name || "Unknown Creator",
          callerPhone: "N/A", // Not available in current API
          callerId: log.current_staff_id || ""
        });
        
        // Load site visit history inline to avoid dependency issues
        try {
          const visitBody = {
            page_number: "1",
            page_size: "100", // Get more entries for history
            search_type: "call_log_id",
            query_search: pipelineId,
          };
          
          console.log("Making API call to:", `${apiBase}/site-visit/pagination`);
          console.log("Request body:", visitBody);
          
          const visitRes = await fetch(`${apiBase}/site-visit/pagination`, {
            method: "POST",
            headers,
            body: JSON.stringify(visitBody),
          });
          
          if (visitRes.ok) {
            const visitData = await visitRes.json();
            console.log("Site Visit API Response:", visitData);
            
            // Handle the site visit API response format - it's an array with data object
            let visitArr = [];
            if (Array.isArray(visitData) && visitData.length > 0 && visitData[0].data) {
              visitArr = visitData[0].data;
            } else if (Array.isArray(visitData?.data)) {
              visitArr = visitData.data;
            } else if (Array.isArray(visitData)) {
              // Fallback if it's directly an array
              visitArr = visitData;
            }
            
            console.log("Parsed site visit array:", visitArr);
            
            // Convert API response to SiteVisitEntry format based on the actual API structure
            const convertedVisits = visitArr.map((visit: Record<string, unknown>) => {
              // Extract date and time from start_datetime and end_datetime
              const startDateTime = String(visit.start_datetime || '');
              const endDateTime = String(visit.end_datetime || '');
              
              // Parse date and time from datetime strings (format: "2025-08-12 00:12:00")
              let visitDate = 'N/A';
              let visitStartTime = 'N/A';
              let visitEndTime = 'N/A';
              
              if (startDateTime && startDateTime !== '') {
                const startParts = startDateTime.split(' ');
                if (startParts.length >= 2) {
                  visitDate = startParts[0]; // "2025-08-12"
                  visitStartTime = startParts[1]; // "00:12:00"
                }
              }
              
              if (endDateTime && endDateTime !== '') {
                const endParts = endDateTime.split(' ');
                if (endParts.length >= 2) {
                  visitEndTime = endParts[1]; // "00:13:00"
                }
              }
              
              // Determine visit status based on dates
              const currentDate = new Date();
              const visitDateObj = new Date(visitDate);
              let visitStatus = 'Scheduled';
              
              if (visitDateObj < currentDate) {
                visitStatus = 'Completed';
              } else if (visitDate === currentDate.toISOString().split('T')[0]) {
                visitStatus = 'In Progress';
              }
              
              return {
                visitPipelineID: parseInt(String(visit.call_id || visit.call_log_id || '0').replace('CL-', '')),
                visitLogOrderID: parseInt(String(visit.site_visit_id || '0').replace('ST-', '')) || Math.floor(Math.random() * 1000),
                visitDate: visitDate,
                visitStartTime: visitStartTime,
                visitEndTime: visitEndTime,
                visitStatus: visitStatus,
                visitType: String(visit.contact_result_name || visit.purpose || 'Site Visit'),
                attendees: `${String(visit.staff_name || 'Unknown Staff')}, ${String(visit.lead_name || 'Unknown Lead')}`,
                notes: String(visit.remark || 'N/A'),
                createdAt: String(visit.created_date || 'N/A'),
                lastUpdate: String(visit.last_update || ''),
                // Store additional API data for reference
                siteVisitId: String(visit.site_visit_id || ''),
                propertyProfileName: String(visit.property_profile_name || ''),
                contactResultName: String(visit.contact_result_name || ''),
                photoUrls: Array.isArray(visit.photo_url) ? visit.photo_url : [],
              };
            }).sort((a: SiteVisitEntry, b: SiteVisitEntry) => b.visitLogOrderID - a.visitLogOrderID);
            
            setSiteVisitHistory(convertedVisits);
          } else {
            console.error("Failed to fetch site visit data");
            setSiteVisitHistory([]);
          }
        } catch (visitError) {
          console.error("Error loading site visit history:", visitError);
          setSiteVisitHistory([]);
        }
      }
    } catch (error) {
      console.error("Error loading pipeline information:", error);
    } finally {
      setIsLoadingPipeline(false);
    }
  }, [pipelineId]);

  useEffect(() => {
    loadPipelineInfo();
  }, [loadPipelineInfo]);

  type SiteVisitFormErrors = {
    visitDate?: string;
    visitStartTime?: string;
    visitEndTime?: string;
    visitStatus?: string;
    visitType?: string;
    attendees?: string;
    notes?: string;
    uploadedDocuments?: string;
  };

  // Edit modal state
  const [showEditVisitModal, setShowEditVisitModal] = useState(false);
  const [editingVisitLog, setEditingVisitLog] = useState<SiteVisitEntry | null>(null);
  const [editFormData, setEditFormData] = useState({
    visitDate: "",
    visitStartTime: "",
    visitEndTime: "",
    visitStatus: null as SelectOption | null,
    visitType: null as SelectOption | null,
    attendees: "",
    notes: "",
    uploadedDocuments: [] as File[],
  });
  const [editErrors, setEditErrors] = useState<SiteVisitFormErrors>({});

  // View modal state
  const [showViewVisitModal, setShowViewVisitModal] = useState(false);
  const [viewingVisitLog, setViewingVisitLog] = useState<SiteVisitEntry | null>(null);

  // Visit status options
  const statusOptions: SelectOption[] = [
    { value: "Completed", label: "Completed" },
    { value: "No Show", label: "No Show" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Postponed", label: "Postponed" },
    { value: "In Progress", label: "In Progress" },
    { value: "Scheduled", label: "Scheduled" },
  ];

  // Visit type options
  const visitTypeOptions: SelectOption[] = [
    { value: "Initial Tour", label: "Initial Tour" },
    { value: "Follow-up Visit", label: "Follow-up Visit" },
    { value: "Final Inspection", label: "Final Inspection" },
    { value: "Property Viewing", label: "Property Viewing" },
    { value: "Documentation", label: "Documentation" },
    { value: "Other", label: "Other" },
  ];

  // Use site visit history from API instead of sample data
  const pipelineVisitHistory = siteVisitHistory;

  const handleEditFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setEditFormData((prev) => ({ 
        ...prev, 
        uploadedDocuments: [...prev.uploadedDocuments, ...fileArray] 
      }));
      // Clear any previous upload errors
      if (editErrors.uploadedDocuments) {
        setEditErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors.uploadedDocuments;
          return newErrors;
        });
      }
    }
  };

  const handleRemoveEditDocument = (index: number) => {
    setEditFormData((prev) => ({
      ...prev,
      uploadedDocuments: prev.uploadedDocuments.filter((_, i) => i !== index)
    }));
  };

  // Form submission state for edit modal
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action handlers for site visit history table
  const handleActionSelect = (action: 'view' | 'edit' | 'delete', visitLog: SiteVisitEntry) => {
    switch (action) {
      case 'view':
        handleViewVisitLog(visitLog);
        break;
      case 'edit':
        handleEditVisitLog(visitLog);
        break;
      case 'delete':
        handleDeleteVisitLog(visitLog);
        break;
    }
  };

  const handleEditVisitLog = (log: SiteVisitEntry) => {
    // Navigate to the edit page instead of opening a modal
    router.push(`/callpipeline/sitevisit/edit?pipelineId=${pipelineId}&siteVisitId=${log.siteVisitId}`);
  };

  const handleViewVisitLog = (log: SiteVisitEntry) => {
    setViewingVisitLog(log);
    setShowViewVisitModal(true);
  };

  const handleDeleteVisitLog = (log: SiteVisitEntry) => {
    // TODO: Implement delete functionality with confirmation
    console.log("Delete site visit:", log);
    const confirmed = confirm(`Are you sure you want to delete site visit #${log.visitLogOrderID}?\\n\\nThis action cannot be undone.`);
    if (confirmed) {
      alert(`Delete functionality for site visit #${log.visitLogOrderID} will be implemented soon.`);
    }
  };

  // Edit modal handlers
  const handleEditFormChange = (field: keyof typeof editFormData, value: string | SelectOption | null) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateEditForm = () => {
    const newErrors: SiteVisitFormErrors = {};
    
    if (!editFormData.visitDate) newErrors.visitDate = "Visit date is required.";
    if (!editFormData.visitStartTime) newErrors.visitStartTime = "Start time is required.";
    if (!editFormData.visitStatus) newErrors.visitStatus = "Visit status is required.";
    if (!editFormData.visitType) newErrors.visitType = "Visit type is required.";
    if (!editFormData.attendees.trim()) newErrors.attendees = "Attendees information is required.";
    if (!editFormData.notes.trim()) newErrors.notes = "Notes are required.";
    
    // Validate end time is after start time if both are provided
    if (editFormData.visitStartTime && editFormData.visitEndTime) {
      const startTime = new Date(`2000-01-01T${editFormData.visitStartTime}`);
      const endTime = new Date(`2000-01-01T${editFormData.visitEndTime}`);
      if (endTime <= startTime) {
        newErrors.visitEndTime = "End time must be after start time.";
      }
    }
    
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSave = async () => {
    if (!validateEditForm() || !editingVisitLog) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedVisitData = {
        visitPipelineID: editingVisitLog.visitPipelineID,
        visitLogOrderID: editingVisitLog.visitLogOrderID,
        visitDate: editFormData.visitDate,
        visitStartTime: editFormData.visitStartTime,
        visitEndTime: editFormData.visitEndTime || "",
        visitStatus: editFormData.visitStatus?.value,
        visitType: editFormData.visitType?.value,
        attendees: editFormData.attendees,
        notes: editFormData.notes,
        createdAt: editingVisitLog.createdAt, // Keep original created date
      };
      
      console.log("Updated Site Visit Data to submit:", updatedVisitData);
      
      // TODO: Replace with actual API call when backend is ready
      // await api.put(`/site-visit-history/${editingVisitLog.visitLogOrderID}`, updatedVisitData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Close the edit modal and reset form
      setShowEditVisitModal(false);
      resetEditForm();
      
      // Show success alert (could be replaced with a proper success modal)
      alert("Site visit updated successfully!");
      
      // Refresh the data to reflect changes
      loadPipelineInfo();
      
    } catch (error) {
      console.error("Error updating site visit:", error);
      alert("Failed to update site visit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetEditForm = () => {
    setEditFormData({
      visitDate: "",
      visitStartTime: "",
      visitEndTime: "",
      visitStatus: null,
      visitType: null,
      attendees: "",
      notes: "",
      uploadedDocuments: [],
    });
    setEditErrors({});
    setEditingVisitLog(null);
  };

  const handleCancelEdit = () => {
    setShowEditVisitModal(false);
    resetEditForm();
  };

  // Pagination state for site visit history
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination for site visit history
  const totalPages = Math.ceil(pipelineVisitHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVisitHistory = pipelineVisitHistory.slice(startIndex, endIndex);

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

  // Format time for display
  const formatTime = (time: string) => {
    if (!time) return "N/A";
    return time;
  };

  // Calculate visit duration
  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return "N/A";
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
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
        <ComponentCard title="Pipeline Information">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              General Information
            </h4>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push(`/callpipeline/edit?id=${pipelineInfo.pipelineId}`)}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this call pipeline? This action cannot be undone.')) {
                    // TODO: Implement delete functionality
                    console.log('Delete pipeline:', pipelineInfo.pipelineId);
                    // router.push('/callpipeline');
                  }
                }}
                className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            </div>
          </div>

          {/* Modern Compact Card Layout - 4 cards in one row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Pipeline Overview Card */}
            <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="absolute top-3 right-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <svg className="h-3 w-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pipeline Overview</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Core identification</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-200 leading-tight" title={`Pipeline #${pipelineInfo.pipelineId}`}>
                    Pipeline #{pipelineInfo.pipelineId}
                  </p>
                  <div className="mt-2 flex justify-center">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-mono font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Status: 1
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Information Card */}
            <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-gray-700 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="absolute top-3 right-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Lead Information</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Primary contact</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-800 dark:text-green-200 leading-tight" title={pipelineInfo.leadName}>
                    {pipelineInfo.leadName}
                  </p>
                  <div className="mt-2 flex justify-center">
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-mono font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      ID: {pipelineInfo.leadId || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Information Card */}
            <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:border-gray-700 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="absolute top-3 right-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <svg className="h-3 w-3 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Property Information</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Property profile</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-800 dark:text-purple-200 leading-tight" title={pipelineInfo.propertyName}>
                    {pipelineInfo.propertyName}
                  </p>
                  <div className="mt-2 flex justify-center">
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-mono font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      ID: {pipelineInfo.propertyProfileId || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Caller Information Card */}
            <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:border-gray-700 dark:from-orange-900/20 dark:to-red-900/20">
              <div className="absolute top-3 right-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <svg className="h-3 w-3 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Caller Information</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Staff member</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-800 dark:text-orange-200 leading-tight" title={pipelineInfo.callerName}>
                    {pipelineInfo.callerName}
                  </p>
                  <div className="mt-2 flex justify-center">
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-mono font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      ID: {pipelineInfo.callerId || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </ComponentCard>

        {/* View Site Visit Modal */}
        <Modal
          isOpen={showViewVisitModal}
          onClose={() => setShowViewVisitModal(false)}
          className="max-w-2xl p-4 lg:p-8"
        >
          <div className="px-2 lg:pr-10">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Site Visit Entry Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Viewing details for Site Visit #{viewingVisitLog?.visitLogOrderID || 'Unknown'}
            </p>
          </div>
          <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark">
              <div>
                <h3 className="text-base font-semibold text-black dark:text-white">
                  Site Visit Information
                </h3>
                <p className="mt-1 text-sm text-body dark:text-bodydark">
                  Site Visit #{viewingVisitLog?.visitLogOrderID || 'Unknown'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  viewingVisitLog?.visitStatus === 'Completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : viewingVisitLog?.visitStatus === 'In Progress' || viewingVisitLog?.visitStatus === 'Scheduled'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                  {viewingVisitLog?.visitStatus || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
                <dt className="text-xs font-medium text-body dark:text-bodydark">Visit Log ID</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-black dark:text-white">
                  #{viewingVisitLog?.visitLogOrderID || 'N/A'}
                </dd>
              </div>
              <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
                <dt className="text-xs font-medium text-body dark:text-bodydark">Created Date</dt>
                <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                  {viewingVisitLog?.createdAt || 'Not available'}
                </dd>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
                <dt className="text-xs font-medium text-body dark:text-bodydark">Visit Date</dt>
                <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                  {viewingVisitLog?.visitDate || 'N/A'}
                </dd>
              </div>
              <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
                <dt className="text-xs font-medium text-body dark:text-bodydark">Start Time</dt>
                <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                  {viewingVisitLog?.visitStartTime || 'N/A'}
                </dd>
              </div>
              <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
                <dt className="text-xs font-medium text-body dark:text-bodydark">End Time</dt>
                <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                  {viewingVisitLog?.visitEndTime || 'N/A'}
                </dd>
              </div>
              <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
                <dt className="text-xs font-medium text-body dark:text-bodydark">Visit Type</dt>
                <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                  {viewingVisitLog?.visitType || 'N/A'}
                </dd>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
                <dt className="text-xs font-medium text-body dark:text-bodydark">Attendees</dt>
                <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                  {viewingVisitLog?.attendees || 'N/A'}
                </dd>
              </div>
              <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
                <dt className="text-xs font-medium text-body dark:text-bodydark">Notes</dt>
                <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                  {viewingVisitLog?.notes || 'N/A'}
                </dd>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowViewVisitModal(false)}
            >
              Close
            </Button>
          </div>
        </Modal>

        {/* Section 2: Add Site Visit Button */}
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary bg-opacity-10">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-black dark:text-white">
                  Site Visit Entry
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Schedule or log a site visit for this pipeline
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => router.push(`/callpipeline/sitevisit/create?pipelineId=${pipelineId}`)}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Visit
            </Button>
          </div>
        </div>

        {/* Section 3: Site Visit History Table */}
        <div className="space-y-4">
          {/* Table Header with Title */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Site Visit History for Pipeline #{pipelineInfo.pipelineId}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total {pipelineVisitHistory.length} site visit {pipelineVisitHistory.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
          </div>

          {pipelineVisitHistory.length === 0 ? (
            <div className="py-8 text-center bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/[0.05]">
              <p className="text-gray-500 dark:text-gray-400">
                No site visit history found for this pipeline. Add the first site visit entry above.
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <div className="min-w-[1200px]">
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
                            Property
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Visit Type
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Attendees
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Last Update
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {currentVisitHistory.map((visit) => (
                          <TableRow key={`${visit.visitPipelineID}-${visit.visitLogOrderID}`}>
                            <TableCell className="px-5 py-4 text-center">
                              <span className="font-mono text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {visit.visitLogOrderID}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <div>
                                <div className="font-medium text-gray-800 dark:text-white text-sm">
                                  {visit.visitDate}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-xs">
                                  {formatTime(visit.visitStartTime)} - {formatTime(visit.visitEndTime)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500 text-sm dark:text-gray-400">
                              {calculateDuration(visit.visitStartTime, visit.visitEndTime)}
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <Badge
                                size="sm"
                                color={
                                  visit.visitStatus === "Completed"
                                    ? "success"
                                    : visit.visitStatus === "No Show" || visit.visitStatus === "Cancelled"
                                    ? "error"
                                    : visit.visitStatus === "Postponed" || visit.visitStatus === "Scheduled"
                                    ? "warning"
                                    : "info"
                                }
                              >
                                {visit.visitStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <div className="max-w-xs text-sm text-gray-600 dark:text-gray-300 truncate" title={visit.propertyProfileName}>
                                {visit.propertyProfileName || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {visit.visitType}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <div className="max-w-xs text-sm text-gray-600 dark:text-gray-300 truncate">
                                {visit.attendees}
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                {visit.lastUpdate || 'Never'}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              <ActionMenu visitLog={visit} onSelect={handleActionSelect} />
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
                        {Math.min(endIndex, pipelineVisitHistory.length)}
                      </span>
                      {" "}of{" "}
                      <span className="font-medium">{pipelineVisitHistory.length}</span>
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
    </div>
  );
}

// Action Menu Component for site visit entries
const ActionMenu = ({ visitLog, onSelect }: { 
  visitLog: SiteVisitEntry; 
  onSelect: (action: 'view' | 'edit' | 'delete', visitLog: SiteVisitEntry) => void; 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
      >
        <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/[0.05] rounded-lg shadow-lg z-10">
          <ul className="py-1">
            <li>
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onSelect('view', visitLog); 
                  setIsOpen(false); 
                }} 
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
              >
                <EyeIcon className="h-4 w-4"/> 
                View
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onSelect('edit', visitLog); 
                  setIsOpen(false); 
                }} 
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
              >
                <PencilIcon className="h-4 w-4"/> 
                Edit
              </a>
            </li>
            <li><hr className="my-1 border-gray-200 dark:border-white/[0.05]" /></li>
            <li>
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onSelect('delete', visitLog); 
                  setIsOpen(false); 
                }} 
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
              >
                <TrashIcon className="h-4 w-4"/> 
                Delete
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
