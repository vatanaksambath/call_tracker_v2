"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import TextArea from "@/components/form/input/TextArea";
import InputField from "@/components/form/input/InputField";
import PhotoUpload, { PhotoFile } from "@/components/form/PhotoUpload";
import { TimeIcon } from "@/icons";
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, PencilIcon, TrashIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  site_visit_id: string;
  call_id: string;
  property_profile_id: number;
  property_profile_name: string | null;
  staff_id: number;
  staff_name: string;
  lead_id: string;
  lead_name: string;
  contact_result_id: number;
  contact_result_name: string;
  purpose: string;
  start_datetime: string;
  end_datetime: string;
  photo_url: string[];
  remark: string;
  is_active: boolean;
  created_date: string;
  created_by_name: string;
  last_update: string | null;
  updated_by_name: string;
}

interface SiteVisitFormData {
  visitDate: Date;
  visitStartTime: string;
  visitEndTime: string;
  purpose: string;
  contactResult: SelectOption | null;
  notes: string;
  photos: PhotoFile[];
}

interface SiteVisitFormErrors {
  visitDate?: string;
  visitStartTime?: string;
  visitEndTime?: string;
  purpose?: string;
  contactResult?: string;
  notes?: string;
}

// Action Menu Component
const ActionMenu = ({ siteVisit, onSelect }: { siteVisit: SiteVisitEntry; onSelect: (action: 'view' | 'edit' | 'delete', siteVisit: SiteVisitEntry) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1"
      >
        <EllipsisHorizontalIcon className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-8 z-50 w-32 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={() => {
              onSelect('view', siteVisit);
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <EyeIcon className="h-4 w-4" />
            View
          </button>
          <button
            onClick={() => {
              onSelect('edit', siteVisit);
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => {
              onSelect('delete', siteVisit);
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

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

  // Modal states
  const [showAddSiteVisitModal, setShowAddSiteVisitModal] = useState(false);
  const [showEditSiteVisitModal, setShowEditSiteVisitModal] = useState(false);
  const [showViewSiteVisitModal, setShowViewSiteVisitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState<SiteVisitFormData>({
    visitDate: new Date(),
    visitStartTime: "",
    visitEndTime: "",
    purpose: "",
    contactResult: null,
    notes: "",
    photos: [],
  });

  const [editFormData, setEditFormData] = useState<SiteVisitFormData>({
    visitDate: new Date(),
    visitStartTime: "",
    visitEndTime: "",
    purpose: "",
    contactResult: null,
    notes: "",
    photos: [],
  });

  const [errors, setErrors] = useState<SiteVisitFormErrors>({});
  const [editErrors, setEditErrors] = useState<SiteVisitFormErrors>({});
  const [editingSiteVisit, setEditingSiteVisit] = useState<SiteVisitEntry | null>(null);
  const [viewingSiteVisit, setViewingSiteVisit] = useState<SiteVisitEntry | null>(null);

  // Contact result options for Site Visits
  const contactResultOptions: SelectOption[] = [
    { value: "1", label: "No Response" },
    { value: "2", label: "Completed" },
    { value: "3", label: "Postponed" },
    { value: "4", label: "Cancelled" },
    { value: "5", label: "Busy" },
  ];

  // Helper function to format time to 12-hour format with AM/PM
  const formatTime = (timeString: string): string => {
    if (!timeString) return 'N/A';
    try {
      // Parse time string (assuming format like "10:00:00" or "10:00")
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      if (isNaN(hour24) || isNaN(minute)) return timeString;
      
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      const formattedMinute = minute.toString().padStart(2, '0');
      
      return `${hour12}:${formattedMinute} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Helper function to format duration
  const formatDuration = (startDateTime: string, endDateTime: string): string => {
    if (!startDateTime || !endDateTime) return 'N/A';
    
    try {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
      const diffMs = end.getTime() - start.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes <= 0) return '0 min';
      if (diffMinutes < 60) return `${diffMinutes} min`;
      
      const hours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
      
      if (remainingMinutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    } catch {
      return 'N/A';
    }
  };

  // Helper function to format date strings
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Check if it's a valid date
      if (isNaN(date.getTime())) return dateString;
      
      // If the original string includes time information (has a space or 'T')
      if (dateString.includes(' ') || dateString.includes('T')) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        // Just date, no time
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      return dateString; // Return original if parsing fails
    }
  };

  // Load pipeline information by ID and site visit history
  const loadPipelineInfo = useCallback(async () => {
    if (!pipelineId) {
      setIsLoadingPipeline(false);
      return;
    }

    try {
      // First, load pipeline info from call-log API (same as quickcall)
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const callLogBody = {
        page_number: "1",
        page_size: "10",
        search_type: "call_log_id",
        query_search: pipelineId,
      };
      
      console.log("Loading pipeline info from call-log API:", `${apiBase}/call-log/pagination`);
      
      const callLogRes = await fetch(`${apiBase}/call-log/pagination`, {
        method: "POST",
        headers,
        body: JSON.stringify(callLogBody),
      });
      
      if (!callLogRes.ok) throw new Error("Failed to fetch call log data");
      
      const callLogData = await callLogRes.json();
      console.log("Call log API Response:", callLogData);
      
      let logArr = [];
      if (Array.isArray(callLogData) && callLogData.length > 0 && Array.isArray(callLogData[0].data)) {
        logArr = callLogData[0].data;
      } else if (Array.isArray(callLogData?.data)) {
        logArr = callLogData.data;
      } else if (Array.isArray(callLogData?.results)) {
        logArr = callLogData.results;
      }
      
      if (logArr.length > 0) {
        const log = logArr[0];
        console.log("Setting pipeline info from log:", log);
        
        setPipelineInfo({
          pipelineId: log.call_log_id || "",
          pipelineName: `${log.lead_name || 'Unknown Lead'} - ${log.property_profile_name || 'Unknown Property'}`,
          leadId: log.lead_id || "",
          leadName: log.lead_name || "Unknown Lead",
          leadCompany: "N/A",
          propertyName: log.property_profile_name || "Unknown Property",
          propertyLocation: "N/A",
          propertyProfileId: log.property_profile_id || "",
          callerName: log.created_by_name || "Unknown Creator",
          callerPhone: "N/A",
          callerId: log.current_staff_id || ""
        });
      }

      // Now load site visit history using the dedicated endpoint
      const siteVisitBody = {
        page_number: "1",
        page_size: "50", // Get more records for site visits
        search_type: "call_id",
        query_search: pipelineId,
      };
      
      console.log("Loading site visit history:", `${apiBase}/site-visit/pagination`);
      console.log("Site visit request body:", siteVisitBody);
      
      const siteVisitRes = await fetch(`${apiBase}/site-visit/pagination`, {
        method: "POST",
        headers,
        body: JSON.stringify(siteVisitBody),
      });
      
      if (!siteVisitRes.ok) {
        console.warn("Failed to fetch site visit data, but continuing with empty list");
        setSiteVisitHistory([]);
      } else {
        const siteVisitData = await siteVisitRes.json();
        console.log("Site visit API Response:", siteVisitData);
        
        let siteVisitArr = [];
        if (Array.isArray(siteVisitData) && siteVisitData.length > 0 && Array.isArray(siteVisitData[0].data)) {
          siteVisitArr = siteVisitData[0].data;
        } else if (Array.isArray(siteVisitData?.data)) {
          siteVisitArr = siteVisitData.data;
        } else if (Array.isArray(siteVisitData?.results)) {
          siteVisitArr = siteVisitData.results;
        }
        
        console.log("Parsed site visit array:", siteVisitArr);
        setSiteVisitHistory(siteVisitArr);
      }
      
    } catch (error) {
      console.error("Error loading pipeline info:", error);
    } finally {
      setIsLoadingPipeline(false);
    }
  }, [pipelineId]);

  useEffect(() => {
    loadPipelineInfo();
  }, [loadPipelineInfo]);

  const handleChange = (field: keyof SiteVisitFormData, value: string | SelectOption | null | Date | PhotoFile[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field !== 'photos' && errors[field as keyof SiteVisitFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: SiteVisitFormErrors = {};
    
    if (!formData.visitDate) newErrors.visitDate = "Visit date is required.";
    if (!formData.visitStartTime) newErrors.visitStartTime = "Start time is required.";
    if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required.";
    if (!formData.contactResult) newErrors.contactResult = "Contact result is required.";
    if (!formData.notes.trim()) newErrors.notes = "Notes are required.";
    
    // Validate end time is after start time if both are provided
    if (formData.visitStartTime && formData.visitEndTime) {
      const startTime = new Date(`2000-01-01 ${formData.visitStartTime}:00`);
      const endTime = new Date(`2000-01-01 ${formData.visitEndTime}:00`);
      if (endTime <= startTime) {
        newErrors.visitEndTime = "End time must be after start time.";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      visitDate: new Date(),
      visitStartTime: "",
      visitEndTime: "",
      purpose: "",
      contactResult: null,
      notes: "",
      photos: [],
    });
    setErrors({});
    
    // Reset the date picker by clearing its value
    setTimeout(() => {
      const datePickerElement = document.getElementById('site-visit-date-picker') as HTMLInputElement;
      if (datePickerElement) {
        datePickerElement.value = '';
      }
    }, 0);
  };

  const handleSave = async () => { 
    if (!validate() || !pipelineInfo) return;
    
    try {
      setIsSubmitting(true);
      
      // Format datetime strings for API
      const visitDate = formData.visitDate instanceof Date 
        ? formData.visitDate.toISOString().split('T')[0]
        : formData.visitDate;
      
      const visitStartDatetime = `${visitDate} ${formData.visitStartTime}:00`;
      const visitEndDatetime = formData.visitEndTime 
        ? `${visitDate} ${formData.visitEndTime}:00`
        : "";

      // Prepare FormData for API request (to handle file uploads)
      const formDataToSend = new FormData();
      
      // Add basic site visit data
      formDataToSend.append('call_id', pipelineInfo.pipelineId);
      formDataToSend.append('property_profile_id', (parseInt(pipelineInfo.propertyProfileId) || 0).toString());
      formDataToSend.append('staff_id', (parseInt(pipelineInfo.callerId) || 0).toString());
      formDataToSend.append('lead_id', pipelineInfo.leadId);
      formDataToSend.append('contact_result_id', (parseInt(formData.contactResult?.value || "1")).toString());
      formDataToSend.append('purpose', formData.purpose);
      formDataToSend.append('start_datetime', visitStartDatetime);
      formDataToSend.append('end_datetime', visitEndDatetime);
      formDataToSend.append('remark', formData.notes);
      formDataToSend.append('is_active', 'true');
      formDataToSend.append('menu_id', 'MU_03');
      
      // Add photos to FormData
      if (formData.photos.length > 0) {
        console.log(`Adding ${formData.photos.length} photos to request`);
        formData.photos.forEach((photo, index) => {
          formDataToSend.append('photos', photo.file);
          console.log(`Added photo ${index + 1}: ${photo.name} (${photo.size} bytes)`);
        });
      }
      
      console.log("Site Visit FormData prepared with photos");
      
      // Make actual API call for site visit creation
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      // Note: Don't set Content-Type for FormData, let the browser set it automatically
      
      console.log("About to make POST request to:", `${apiBase}/site-visit/create`);
      console.log("Request headers:", headers);
      
      const response = await fetch(`${apiBase}/site-visit/create`, {
        method: "POST",
        headers,
        body: formDataToSend, // Send FormData instead of JSON
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response:", errorData);
        throw new Error(`Failed to create site visit: ${response.status} - ${errorData}`);
      }
      
      const responseData = await response.json();
      console.log("Create Site Visit API Response:", responseData);
      
      // Close the modal and reset form
      setShowAddSiteVisitModal(false);
      resetForm();
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Refresh the site visit history to show the new entry
      await loadPipelineInfo();
      
    } catch (error) {
      console.error("Error creating site visit:", error);
      alert(`Failed to create site visit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    resetForm();
    setShowAddSiteVisitModal(true);
  };

  const handleCloseForm = () => {
    setShowSuccessModal(false);
  };

  // Action handlers for site visit history table
  const handleActionSelect = (action: 'view' | 'edit' | 'delete', siteVisit: SiteVisitEntry) => {
    switch (action) {
      case 'view':
        handleViewSiteVisit(siteVisit);
        break;
      case 'edit':
        handleEditSiteVisit(siteVisit);
        break;
      case 'delete':
        handleDeleteSiteVisit(siteVisit);
        break;
    }
  };

  const handleEditSiteVisit = (siteVisit: SiteVisitEntry) => {
    // Set the site visit being edited
    setEditingSiteVisit(siteVisit);
    
    // Parse the date string back to Date object
    let visitDate = new Date();
    try {
      visitDate = new Date(siteVisit.start_datetime.split(' ')[0]);
    } catch {
      visitDate = new Date();
    }
    
    // Extract time from datetime strings
    const extractTimeFromDatetime = (datetime: string): string => {
      try {
        const timePart = datetime.split(' ')[1];
        if (timePart) {
          return timePart.substring(0, 5); // Get HH:MM
        }
      } catch {
        // ignore
      }
      return "";
    };
    
    const startTime = extractTimeFromDatetime(siteVisit.start_datetime);
    const endTime = extractTimeFromDatetime(siteVisit.end_datetime);
    
    // Find the matching contact result option
    const contactResultOption = contactResultOptions.find(option => option.value === siteVisit.contact_result_id.toString());
    
    // Populate edit form with existing data
    setEditFormData({
      visitDate: visitDate,
      visitStartTime: startTime,
      visitEndTime: endTime,
      purpose: siteVisit.purpose || '',
      contactResult: contactResultOption || null,
      notes: siteVisit.remark || '',
      photos: [], // TODO: Load existing photos when implemented
    });
    
    // Clear any previous errors
    setEditErrors({});
    
    // Show the edit modal
    setShowEditSiteVisitModal(true);
    
    // Set the date picker value after modal opens
    setTimeout(() => {
      const editDatePickerElement = document.getElementById('edit-site-visit-date-picker') as HTMLInputElement;
      if (editDatePickerElement && visitDate) {
        editDatePickerElement.value = visitDate.toISOString().split('T')[0];
      }
    }, 100);
  };

  const handleViewSiteVisit = (siteVisit: SiteVisitEntry) => {
    setViewingSiteVisit(siteVisit);
    setShowViewSiteVisitModal(true);
  };

  const handleDeleteSiteVisit = (siteVisit: SiteVisitEntry) => {
    const confirmed = confirm(`Are you sure you want to delete site visit #${siteVisit.site_visit_id}?\n\nThis action cannot be undone.`);
    if (confirmed) {
      // TODO: Implement delete functionality
      console.log("Delete site visit:", siteVisit);
      alert("Delete functionality will be implemented soon.");
    }
  };

  // Edit modal handlers
  const handleEditFormChange = (field: keyof SiteVisitFormData, value: string | SelectOption | null | Date | PhotoFile[]) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    if (field !== 'photos' && editErrors[field as keyof SiteVisitFormErrors]) {
      setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateEditForm = () => {
    const newErrors: SiteVisitFormErrors = {};
    
    if (!editFormData.visitDate) newErrors.visitDate = "Visit date is required.";
    if (!editFormData.visitStartTime) newErrors.visitStartTime = "Start time is required.";
    if (!editFormData.purpose.trim()) newErrors.purpose = "Purpose is required.";
    if (!editFormData.contactResult) newErrors.contactResult = "Contact result is required.";
    if (!editFormData.notes.trim()) newErrors.notes = "Notes are required.";
    
    // Validate end time is after start time if both are provided
    if (editFormData.visitStartTime && editFormData.visitEndTime) {
      const startTime = new Date(`2000-01-01 ${editFormData.visitStartTime}:00`);
      const endTime = new Date(`2000-01-01 ${editFormData.visitEndTime}:00`);
      if (endTime <= startTime) {
        newErrors.visitEndTime = "End time must be after start time.";
      }
    }
    
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSave = async () => {
    if (!validateEditForm() || !editingSiteVisit || !pipelineInfo) return;
    
    try {
      setIsSubmitting(true);
      
      // Format datetime strings for API
      const visitDate = editFormData.visitDate instanceof Date 
        ? editFormData.visitDate.toISOString().split('T')[0]
        : editFormData.visitDate;
      
      const visitStartDatetime = `${visitDate} ${editFormData.visitStartTime}:00`;
      const visitEndDatetime = editFormData.visitEndTime 
        ? `${visitDate} ${editFormData.visitEndTime}:00`
        : "";

      // TODO: Handle photo updates
      // In a complete implementation:
      // 1. Compare editFormData.photos with existing photos
      // 2. Upload new photos to storage service
      // 3. Remove deleted photos from storage service  
      // 4. Combine existing and new photo URLs
      
      // Prepare FormData for API request (to handle file uploads)
      const formDataToSend = new FormData();
      
      // Add basic site visit data
      formDataToSend.append('site_visit_id', editingSiteVisit.site_visit_id);
      formDataToSend.append('call_id', pipelineInfo.pipelineId);
      formDataToSend.append('property_profile_id', (parseInt(pipelineInfo.propertyProfileId) || 0).toString());
      formDataToSend.append('staff_id', (parseInt(pipelineInfo.callerId) || 0).toString());
      formDataToSend.append('lead_id', pipelineInfo.leadId);
      formDataToSend.append('contact_result_id', (parseInt(editFormData.contactResult?.value || "1")).toString());
      formDataToSend.append('purpose', editFormData.purpose);
      formDataToSend.append('start_datetime', visitStartDatetime);
      formDataToSend.append('end_datetime', visitEndDatetime);
      formDataToSend.append('remark', editFormData.notes);
      formDataToSend.append('is_active', 'true');
      formDataToSend.append('menu_id', 'MU_03');
      
      // Add new photos to FormData (if any)
      if (editFormData.photos.length > 0) {
        console.log(`Adding ${editFormData.photos.length} new photos to update request`);
        editFormData.photos.forEach((photo, index) => {
          formDataToSend.append('photos', photo.file);
          console.log(`Added new photo ${index + 1}: ${photo.name} (${photo.size} bytes)`);
        });
      }
      
      // Add existing photo URLs to preserve them (if the API requires this)
      if (editingSiteVisit.photo_url && editingSiteVisit.photo_url.length > 0) {
        editingSiteVisit.photo_url.forEach((url, index) => {
          formDataToSend.append('existing_photo_urls', url);
          console.log(`Preserving existing photo ${index + 1}: ${url}`);
        });
      }
      
      console.log("Edit Site Visit FormData prepared with photos");
      
      // Make actual API call for site visit update
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      // Note: Don't set Content-Type for FormData, let the browser set it automatically
      
      console.log("About to make PUT request to:", `${apiBase}/site-visit/update`);
      console.log("Request headers:", headers);
      console.log("Starting update operation for site visit ID:", editingSiteVisit.site_visit_id);
      
      const response = await fetch(`${apiBase}/site-visit/update`, {
        method: "PUT",
        headers,
        body: formDataToSend, // Send FormData instead of JSON
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response:", errorData);
        throw new Error(`Failed to update site visit: ${response.status} - ${errorData}`);
      }
      
      const responseData = await response.json();
      console.log("Edit Site Visit API Response:", responseData);
      
      // Close the edit modal and reset form
      setShowEditSiteVisitModal(false);
      resetEditForm();
      
      // Show success alert
      alert("Site visit updated successfully!");
      
      // Refresh the site visit history to show the updated entry
      await loadPipelineInfo();
      
    } catch (error) {
      console.error("Error updating site visit:", error);
      alert(`Failed to update site visit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetEditForm = () => {
    setEditFormData({
      visitDate: new Date(),
      visitStartTime: "",
      visitEndTime: "",
      purpose: "",
      contactResult: null,
      notes: "",
      photos: [],
    });
    setEditErrors({});
    setEditingSiteVisit(null);
    
    // Reset the edit date picker by clearing its value
    setTimeout(() => {
      const editDatePickerElement = document.getElementById('edit-site-visit-date-picker') as HTMLInputElement;
      if (editDatePickerElement) {
        editDatePickerElement.value = '';
      }
    }, 0);
  };

  const handleCancelEdit = () => {
    setShowEditSiteVisitModal(false);
    resetEditForm();
  };

  // Pagination state for site visit history
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination for site visit history
  const totalPages = Math.ceil(siteVisitHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSiteVisitHistory = siteVisitHistory.slice(startIndex, endIndex);

  // Pagination component
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

  // Show loading or no data if pipeline info is not loaded
  if (isLoadingPipeline) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading pipeline information...</p>
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
            <p className="text-gray-500 dark:text-gray-400">No pipeline information found.</p>
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                General Information
              </h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Overview of pipeline details and associated information
              </p>
            </div>
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

            {/* Staff Information Card */}
            <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:border-gray-700 dark:from-orange-900/20 dark:to-red-900/20">
              <div className="absolute top-3 right-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <svg className="h-3 w-3 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Staff Information</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Assigned staff member</p>
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
          isOpen={showViewSiteVisitModal}
          onClose={() => setShowViewSiteVisitModal(false)}
          className="max-w-3xl"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Site Visit Details
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {viewingSiteVisit?.site_visit_id || 'Site Visit ID not available'}
                </p>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Visit Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white text-base border-b border-gray-200 dark:border-gray-700 pb-2">
                  Visit Information
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Date:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(viewingSiteVisit?.start_datetime || 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Start Time:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatTime(viewingSiteVisit?.start_datetime.split(' ')[1] || 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">End Time:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatTime(viewingSiteVisit?.end_datetime.split(' ')[1] || 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {viewingSiteVisit ? formatDuration(viewingSiteVisit.start_datetime, viewingSiteVisit.end_datetime) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white text-base border-b border-gray-200 dark:border-gray-700 pb-2">
                  Contact Details
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Lead:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {viewingSiteVisit?.lead_name || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Property:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {viewingSiteVisit?.property_profile_name || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Result:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      viewingSiteVisit?.contact_result_name === 'Completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : viewingSiteVisit?.contact_result_name === 'No Response' || viewingSiteVisit?.contact_result_name === 'Postponed'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : viewingSiteVisit?.contact_result_name === 'Busy' || viewingSiteVisit?.contact_result_name === 'Cancelled'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {viewingSiteVisit?.contact_result_name || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Staff:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {viewingSiteVisit?.staff_name || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purpose Section */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white text-base border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
                Purpose
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {viewingSiteVisit?.purpose || 'No purpose specified for this visit.'}
                </p>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white text-base border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
                Notes
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {viewingSiteVisit?.remark || 'No notes available for this visit.'}
                </p>
              </div>
            </div>

            {/* Photos Section */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white text-base border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
                Photos
              </h4>
              {viewingSiteVisit?.photo_url && viewingSiteVisit.photo_url.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {viewingSiteVisit.photo_url.map((photoUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoUrl}
                          alt={`Site visit photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay with preview button */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => {
                                // Open photo in new tab for full view
                                window.open(photoUrl, '_blank');
                              }}
                              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                              title="View full size"
                            >
                              <EyeIcon className="h-5 w-5 text-gray-700" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Photo info */}
                      <div className="mt-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                          Photo {index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No photos available for this site visit.
                  </p>
                </div>
              )}
            </div>

            {/* System Info */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Visit ID: {viewingSiteVisit?.site_visit_id || 'N/A'}</span>
                <span>Created: {formatDate(viewingSiteVisit?.created_date || 'N/A')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowViewSiteVisitModal(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowViewSiteVisitModal(false);
                  if (viewingSiteVisit) {
                    handleEditSiteVisit(viewingSiteVisit);
                  }
                }}
              >
                Edit
              </Button>
            </div>
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
                  Schedule or record a site visit for this pipeline
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => router.push("/sitevisit/create")}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Site Visit
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
                Total {siteVisitHistory.length} site visit {siteVisitHistory.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
          </div>

          {siteVisitHistory.length === 0 ? (
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
                  <div className="min-w-[900px]">
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                            Visit ID
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Visit Date
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Time
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Duration
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Lead Name
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Property
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Result
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Staff Name
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Purpose
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                            Photos
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {currentSiteVisitHistory.map((visit) => (
                          <TableRow key={visit.site_visit_id}>
                            <TableCell className="px-5 py-4 text-center">
                              <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
                                {visit.site_visit_id}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <div className="font-medium text-gray-800 dark:text-white text-sm">
                                {formatDate(visit.start_datetime.split(' ')[0])}
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-sm text-gray-500 dark:text-gray-400">
                                  {formatTime(visit.start_datetime.split(' ')[1] || '')} - {formatTime(visit.end_datetime.split(' ')[1] || '')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                                {formatDuration(visit.start_datetime, visit.end_datetime)}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500 text-sm dark:text-gray-400">
                              {visit.lead_name || 'N/A'}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500 text-sm dark:text-gray-400">
                              {visit.property_profile_name || 'N/A'}
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                visit.contact_result_name === 'Completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                  : visit.contact_result_name === 'No Response' || visit.contact_result_name === 'Postponed'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                                  : visit.contact_result_name === 'Busy' || visit.contact_result_name === 'Cancelled'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                              }`}>
                                {visit.contact_result_name || 'Unknown'}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500 text-sm dark:text-gray-400">
                              {visit.staff_name || 'Unknown'}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500 text-sm dark:text-gray-400">
                              <div className="max-w-32 truncate" title={visit.purpose}>
                                {visit.purpose || 'No purpose'}
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-center">
                              {visit.photo_url && visit.photo_url.length > 0 ? (
                                <div className="flex items-center justify-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                    {visit.photo_url.length} photo{visit.photo_url.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-xs">
                                  No photos
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              <ActionMenu siteVisit={visit} onSelect={handleActionSelect} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Showing{" "}
                      <span className="font-medium">{startIndex + 1}</span>
                      {" "}to{" "}
                      <span className="font-medium">
                        {Math.min(endIndex, siteVisitHistory.length)}
                      </span>
                      {" "}of{" "}
                      <span className="font-medium">{siteVisitHistory.length}</span>
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

      {/* Add Site Visit Modal */}
      <Modal 
        isOpen={showAddSiteVisitModal} 
        onClose={() => setShowAddSiteVisitModal(false)}
        className="max-w-4xl p-4 lg:p-11"
      >
        <div className="px-2 lg:pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add Site Visit Entry
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details for this site visit entry for Pipeline #{pipelineInfo.pipelineId}
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-4">
            
            {/* Visit Date */}
            <div>
              <DatePicker
                id="site-visit-date-picker"
                label="Visit Date *"
                placeholder="Select visit date"
                defaultDate={formData.visitDate}
                onChange={(selectedDates) => {
                  if (selectedDates && selectedDates.length > 0) {
                    handleChange('visitDate', selectedDates[0]);
                  }
                }}
              />
              {errors.visitDate && <p className="text-sm text-red-500 mt-1">{errors.visitDate}</p>}
            </div>

            {/* Visit Start Time */}
            <div>
              <Label htmlFor="visitStartTime">Start Time *</Label>
              <div className="relative">
                <InputField
                  type="time"
                  id="visitStartTime"
                  value={formData.visitStartTime}
                  onChange={(e) => handleChange('visitStartTime', e.target.value)}
                  error={!!errors.visitStartTime}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <TimeIcon />
                </span>
              </div>
              {errors.visitStartTime && <p className="text-sm text-red-500 mt-1">{errors.visitStartTime}</p>}
            </div>

            {/* Visit End Time */}
            <div>
              <Label htmlFor="visitEndTime">End Time</Label>
              <div className="relative">
                <InputField
                  type="time"
                  id="visitEndTime"
                  value={formData.visitEndTime}
                  onChange={(e) => handleChange('visitEndTime', e.target.value)}
                  error={!!errors.visitEndTime}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <TimeIcon />
                </span>
              </div>
              {errors.visitEndTime && <p className="text-sm text-red-500 mt-1">{errors.visitEndTime}</p>}
            </div>

            {/* Contact Result */}
            <div>
              <Label htmlFor="contactResult">Visit Result *</Label>
              <Select
                placeholder="Select result"
                options={contactResultOptions}
                value={formData.contactResult}
                onChange={(option) => handleChange('contactResult', option)}
              />
              {errors.contactResult && <p className="text-sm text-red-500 mt-1">{errors.contactResult}</p>}
            </div>
          </div>

          {/* Purpose - Full width row */}
          <div>
            <Label htmlFor="purpose">Purpose *</Label>
            <TextArea
              placeholder="Enter the purpose of this site visit..."
              value={formData.purpose}
              onChange={(value) => handleChange("purpose", value)}
              rows={3}
            />
            {errors.purpose && <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>}
          </div>

          {/* Notes - Full width */}
          <div>
            <Label htmlFor="notes">Visit Notes *</Label>
            <TextArea
              placeholder="Enter detailed visit notes..."
              value={formData.notes}
              onChange={(value) => handleChange("notes", value)}
              rows={4}
            />
            {errors.notes && <p className="text-sm text-red-500 mt-1">{errors.notes}</p>}
          </div>

          {/* Photo Upload - Full width */}
          <div>
            <Label htmlFor="photos">Site Visit Photos</Label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Upload photos from the site visit. You can upload up to 10 photos (max 5MB each).
            </p>
            <PhotoUpload
              photos={formData.photos}
              onPhotosChange={(photos) => handleChange("photos", photos)}
              maxPhotos={10}
              maxFileSize={5}
              className="mt-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddSiteVisitModal(false)}
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
              {isSubmitting ? "Saving..." : "Add Site Visit"}
            </Button>
          </div>
        </div>
      </Modal>

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
            Site Visit Added Successfully!
          </h3>
          
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            The site visit has been added to pipeline #{pipelineInfo.pipelineId}. What would you like to do next?
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              onClick={handleAddAnother}
              className="flex-1"
            >
              Add Another Site Visit
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

      {/* Edit Site Visit Modal */}
      <Modal 
        isOpen={showEditSiteVisitModal} 
        onClose={() => setShowEditSiteVisitModal(false)}
        className="max-w-4xl p-4 lg:p-11"
      >
        <div className="px-2 lg:pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Site Visit Entry
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the details for this site visit entry
          </p>
        </div>

        {/* Site Visit Information Card */}
        <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark">
            <div>
              <h3 className="text-base font-semibold text-black dark:text-white">
                Editing Site Visit Entry
              </h3>
              <p className="mt-1 text-sm text-body dark:text-bodydark">
                Site Visit ID: {editingSiteVisit?.site_visit_id || 'Unknown'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                editingSiteVisit?.contact_result_name === 'Completed'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : editingSiteVisit?.contact_result_name === 'No Response' || editingSiteVisit?.contact_result_name === 'Postponed'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              }`}>
                {editingSiteVisit?.contact_result_name || 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
              <dt className="text-xs font-medium text-body dark:text-bodydark">Visit ID</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-black dark:text-white">
                {editingSiteVisit?.site_visit_id || 'N/A'}
              </dd>
            </div>
            <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
              <dt className="text-xs font-medium text-body dark:text-bodydark">Created Date</dt>
              <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                {editingSiteVisit?.created_date || 'Not available'}
              </dd>
            </div>
          </div>
          
          <div className="mt-3 rounded-md bg-blue-50 p-2 dark:bg-blue-900/10">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Review and update the site visit information below. Changes will be saved when you submit the form.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-4">
            
            {/* Visit Date */}
            <div>
              <DatePicker
                id="edit-site-visit-date-picker"
                label="Visit Date *"
                placeholder="Select visit date"
                defaultDate={editFormData.visitDate}
                onChange={(selectedDates) => {
                  if (selectedDates && selectedDates.length > 0) {
                    handleEditFormChange('visitDate', selectedDates[0]);
                  }
                }}
              />
              {editErrors.visitDate && <p className="text-sm text-red-500 mt-1">{editErrors.visitDate}</p>}
            </div>

            {/* Visit Start Time */}
            <div>
              <Label htmlFor="editVisitStartTime">Start Time *</Label>
              <div className="relative">
                <InputField
                  type="time"
                  id="editVisitStartTime"
                  value={editFormData.visitStartTime}
                  onChange={(e) => handleEditFormChange('visitStartTime', e.target.value)}
                  error={!!editErrors.visitStartTime}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <TimeIcon />
                </span>
              </div>
              {editErrors.visitStartTime && <p className="text-sm text-red-500 mt-1">{editErrors.visitStartTime}</p>}
            </div>

            {/* Visit End Time */}
            <div>
              <Label htmlFor="editVisitEndTime">End Time</Label>
              <div className="relative">
                <InputField
                  type="time"
                  id="editVisitEndTime"
                  value={editFormData.visitEndTime}
                  onChange={(e) => handleEditFormChange('visitEndTime', e.target.value)}
                  error={!!editErrors.visitEndTime}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <TimeIcon />
                </span>
              </div>
              {editErrors.visitEndTime && <p className="text-sm text-red-500 mt-1">{editErrors.visitEndTime}</p>}
            </div>

            {/* Contact Result */}
            <div>
              <Label htmlFor="editContactResult">Visit Result *</Label>
              <Select
                placeholder="Select result"
                options={contactResultOptions}
                value={editFormData.contactResult}
                onChange={(option) => handleEditFormChange('contactResult', option)}
              />
              {editErrors.contactResult && <p className="text-sm text-red-500 mt-1">{editErrors.contactResult}</p>}
            </div>
          </div>

          {/* Purpose - Full width row */}
          <div>
            <Label htmlFor="editPurpose">Purpose *</Label>
            <TextArea
              placeholder="Enter the purpose of this site visit..."
              value={editFormData.purpose}
              onChange={(value) => handleEditFormChange("purpose", value)}
              rows={3}
            />
            {editErrors.purpose && <p className="text-sm text-red-500 mt-1">{editErrors.purpose}</p>}
          </div>

          {/* Notes - Full width */}
          <div>
            <Label htmlFor="editNotes">Visit Notes *</Label>
            <TextArea
              placeholder="Enter detailed visit notes..."
              value={editFormData.notes}
              onChange={(value) => handleEditFormChange("notes", value)}
              rows={4}
            />
            {editErrors.notes && <p className="text-sm text-red-500 mt-1">{editErrors.notes}</p>}
          </div>

          {/* Photo Upload - Full width */}
          <div>
            <Label htmlFor="editPhotos">Site Visit Photos</Label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Upload or manage photos from the site visit. You can upload up to 10 photos (max 5MB each).
            </p>
            <PhotoUpload
              photos={editFormData.photos}
              onPhotosChange={(photos) => handleEditFormChange("photos", photos)}
              maxPhotos={10}
              maxFileSize={5}
              className="mt-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleEditSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
