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

interface CallLogEntry {
  callPipelineID: number;
  callLogOrderID: number;
  callDate: string;
  callStartTime: string;
  callEndTime: string;
  callStatus: string;
  notes: string;
  createdAt: string;
  // Add fields to match view page data
  contactMethod?: string;
  contactNumber?: string;
  detailId?: string;
  totalCallMinute?: number;
  // Add new fields for table display
  contactResultId?: number;
  contactResultName?: string;
  callerName?: string;
}

interface CallLogDetail {
  call_log_detail_id: string;
  contact_result_id: number;
  call_date: string;
  call_start_datetime: string;
  call_end_datetime: string;
  total_call_minute: number;
  remark: string | null;
  is_active: boolean;
  created_date: string;
  updated_by: number | null;
  contact_data: ContactData[];
}

interface ContactData {
  channel_type_id: number;
  channel_type_name: string;
  menu_id: string;
  contact_values: ContactValue[];
}

interface ContactValue {
  user_name: string;
  contact_number: string;
  remark: string;
  is_primary: boolean;
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
  const [callLogHistory, setCallLogHistory] = useState<CallLogEntry[]>([]);

  // Helper function to format phone numbers
  const formatPhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber || phoneNumber === 'N/A') return phoneNumber;
    
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format based on length and patterns
    if (cleaned.length === 9 && cleaned.startsWith('0')) {
      // Cambodian format: 012345678 => (+855) 012 345 678
      return `(+855) ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('855')) {
      // Already has 855 country code: 85512345678 => (+855) 012 345 678
      return `(+855) 0${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    } else if (cleaned.length === 10) {
      // US format: (123) 456-7890
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US format with country code: +1 (123) 456-7890
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length >= 8) {
      // International format: +XXX XXX XXX XXX
      return `+${cleaned.slice(0, -6)} ${cleaned.slice(-6, -3)} ${cleaned.slice(-3)}`;
    }
    
    // Return original if it doesn't match common patterns
    return phoneNumber;
  };

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
  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  // Helper function to format date strings - same as view page
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

  // Load pipeline information by ID
  const loadPipelineInfo = useCallback(async () => {
    if (!pipelineId) {
      setIsLoadingPipeline(false);
      return;
    }

    try {
      // Use the same approach as create page with direct fetch
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
        console.log("Extracted lead_id:", log.lead_id);
        console.log("Extracted property_profile_id:", log.property_profile_id);
        console.log("Extracted current_staff_id:", log.current_staff_id);
        
        // Set pipeline info using the same structure as view page
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
        
        // Set call log details from the nested call_log_details
        if (log.call_log_details && Array.isArray(log.call_log_details)) {
          console.log("Raw call_log_details from API:", log.call_log_details);
          
          // Log each detail for better debugging
          log.call_log_details.forEach((detail: CallLogDetail, index: number) => {
            console.log(`Detail ${index}:`, {
              call_log_detail_id: detail.call_log_detail_id,
              call_date: detail.call_date,
              call_start_datetime: detail.call_start_datetime,
              call_end_datetime: detail.call_end_datetime,
              total_call_minute: detail.total_call_minute,
              remark: detail.remark,
              contact_data: detail.contact_data || "No contact_data found"
            });
          });
          
          // Convert API call log details to our interface format - same as view page
          const convertedDetails = log.call_log_details.map((detail: CallLogDetail, index: number) => {
            // Extract primary contact information - same logic as view page
            let primaryContactMethod = "N/A";
            let primaryContactNumber = "N/A";
            
            if (detail.contact_data && detail.contact_data.length > 0) {
              for (const contactGroup of detail.contact_data) {
                if (contactGroup.contact_values && contactGroup.contact_values.length > 0) {
                  const primaryContact = contactGroup.contact_values.find(v => v.is_primary);
                  if (primaryContact) {
                    primaryContactMethod = contactGroup.channel_type_name;
                    primaryContactNumber = primaryContact.contact_number;
                    break;
                  }
                }
              }
            }
            
            return {
              callPipelineID: parseInt(log.call_log_id?.replace(/^CL-0*/, '') || '0'),
              callLogOrderID: index + 1, // Use index as order ID since API doesn't provide this
              callDate: detail.call_date || 'N/A',
              callStartTime: detail.call_start_datetime || 'N/A', // Use full datetime, formatTime will handle it
              callEndTime: detail.call_end_datetime || 'N/A', // Use full datetime, formatTime will handle it
              callStatus: detail.contact_result_id === 1 ? 'Completed' : 
                         detail.contact_result_id === 2 ? 'No Answer' :
                         detail.contact_result_id === 3 ? 'Busy' :
                         detail.contact_result_id === 4 ? 'Voicemail' :
                         detail.contact_result_id === 5 ? 'Cancelled' :
                         detail.contact_result_id === 6 ? 'Failed' : 'Unknown', // Enhanced status mapping
              notes: detail.remark || 'No notes',
              createdAt: detail.created_date || 'N/A',
              // Add the extracted contact information
              contactMethod: primaryContactMethod,
              contactNumber: primaryContactNumber,
              detailId: detail.call_log_detail_id || `CD-${String(index + 1).padStart(6, '0')}`,
              totalCallMinute: detail.total_call_minute || 0,
              // Add new fields for table display
              contactResultId: detail.contact_result_id || 0,
              contactResultName: detail.contact_result_id === 1 ? 'Completed' : 
                               detail.contact_result_id === 2 ? 'No Answer' :
                               detail.contact_result_id === 3 ? 'Busy' :
                               detail.contact_result_id === 4 ? 'Voicemail' :
                               detail.contact_result_id === 5 ? 'Cancelled' :
                               detail.contact_result_id === 6 ? 'Failed' : 'Unknown',
              callerName: log.created_by_name || 'Unknown'
            };
          });
          
          console.log("Converted details for quickcall:", convertedDetails);
          setCallLogHistory(convertedDetails);
        } else {
          setCallLogHistory([]);
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

  const [formData, setFormData] = useState({
    callDate: new Date(), // Use Date object for DatePicker
    callStartTime: "",
    callEndTime: "",
    callStatus: null as SelectOption | null,
    contactInfo: null as SelectOption | null, // Add contact selection
    notes: "",
  });

  type CallLogFormErrors = {
    callDate?: string;
    callStartTime?: string;
    callEndTime?: string;
    callStatus?: string;
    contactInfo?: string;
    notes?: string;
  };

  const [errors, setErrors] = useState<CallLogFormErrors>({});
  const [showAddCallModal, setShowAddCallModal] = useState(false);
  
  // Edit modal state
  const [showEditCallModal, setShowEditCallModal] = useState(false);
  const [editingCallLog, setEditingCallLog] = useState<CallLogEntry | null>(null);
  const [editFormData, setEditFormData] = useState({
    callDate: new Date(),
    callStartTime: "",
    callEndTime: "",
    callStatus: null as SelectOption | null,
    notes: "",
  });
  const [editErrors, setEditErrors] = useState<CallLogFormErrors>({});

  // View modal state
  const [showViewCallModal, setShowViewCallModal] = useState(false);
  const [viewingCallLog, setViewingCallLog] = useState<CallLogEntry | null>(null);

  // Contact options state
  const [contactOptions, setContactOptions] = useState<SelectOption[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [leadContactData, setLeadContactData] = useState<ContactData[]>([]); // Store full contact data

  // Call status options for Call Log History
  const statusOptions: SelectOption[] = [
    { value: "Completed", label: "Completed" },
    { value: "No Answer", label: "No Answer" },
    { value: "Busy", label: "Busy" },
    { value: "Voicemail", label: "Voicemail" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Failed", label: "Failed" },
  ];

  // Fetch contact data for dropdown when modal opens
  useEffect(() => {
    const fetchContactOptions = async () => {
      if (!showAddCallModal || !pipelineInfo) return;

      try {
        setIsLoadingContacts(true);
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        
        // Extract lead_id from pipeline info (assuming it's stored there)
        const leadId = pipelineInfo.leadId || pipelineInfo.pipelineId; // Fallback to pipelineId if leadId not available
        
        const body = {
          page_number: "1",
          page_size: "10",
          search_type: "lead_id",
          query_search: leadId,
        };

        console.log("Fetching contacts for lead:", leadId);
        console.log("Request body:", body);

        const res = await fetch(`${apiBase}/lead/pagination`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("Failed to fetch lead contact data");

        const data = await res.json();
        console.log("Lead contact API Response:", data);

        // Extract contact options from the response
        const options: SelectOption[] = [];
        
        if (Array.isArray(data) && data.length > 0 && data[0].data && Array.isArray(data[0].data)) {
          const leadData = data[0].data[0]; // Get first lead
          if (leadData.contact_data && Array.isArray(leadData.contact_data)) {
            // Store the full contact data for API calls
            console.log("Original lead contact data from API:", leadData.contact_data);
            setLeadContactData(leadData.contact_data);
            
            leadData.contact_data.forEach((contactGroup: ContactData, groupIndex: number) => {
              if (contactGroup.contact_values && Array.isArray(contactGroup.contact_values)) {
                console.log(`Contact group ${groupIndex}:`, contactGroup);
                contactGroup.contact_values.forEach((contact: ContactValue, contactIndex: number) => {
                  if (contact.contact_number) {
                    const label = `${contact.contact_number}${contact.user_name ? ` (${contact.user_name})` : ''} - Channel: ${contactGroup.channel_type_id}${contact.is_primary ? ' [Primary]' : ''}`;
                    console.log(`Adding contact option ${groupIndex}-${contactIndex}:`, { contact, label });
                    options.push({
                      value: `${groupIndex}-${contactIndex}`, // Store indices to reference back
                      label: label
                    });
                  }
                });
              }
            });
          }
        }

        console.log("Parsed contact options:", options);
        setContactOptions(options);

      } catch (error) {
        console.error("Error fetching contact options:", error);
        setContactOptions([]);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    fetchContactOptions();
  }, [showAddCallModal, pipelineInfo]);

  // Call status options for Call Log History

  // Get call log history for this pipeline - now using state instead of inline calculation
  const pipelineCallHistory = callLogHistory;

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
    if (!formData.contactInfo) newErrors.contactInfo = "Contact information is required.";
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
      contactInfo: null,
      notes: "",
    });
    setErrors({});
    
    // Reset the date picker by destroying and recreating it
    setTimeout(() => {
      const datePickerElement = document.getElementById('call-date-picker') as HTMLInputElement;
      if (datePickerElement) {
        datePickerElement.value = '';
      }
    }, 0);
  };

  const handleSave = async () => { 
    if (!validate() || !pipelineInfo) return;
    
    try {
      setIsSubmitting(true);
      
      // Parse the selected contact indices
      if (!formData.contactInfo?.value) {
        alert("Please select a contact.");
        return;
      }

      const contactIndices = formData.contactInfo.value.split('-');
      if (contactIndices.length !== 2) {
        alert("Invalid contact selection. Please refresh and try again.");
        return;
      }

      const [groupIndex, contactIndex] = contactIndices.map(Number);
      
      if (isNaN(groupIndex) || isNaN(contactIndex)) {
        alert("Invalid contact selection format. Please refresh and try again.");
        return;
      }
      
      // Validate that we have the lead contact data
      if (!leadContactData || leadContactData.length === 0) {
        alert("Contact data not loaded. Please refresh the page and try again.");
        return;
      }
      
      // Get the selected contact data
      const selectedContactGroup = leadContactData[groupIndex];
      const selectedContact = selectedContactGroup?.contact_values?.[contactIndex];
      
      if (!selectedContact || !selectedContactGroup) {
        alert("Selected contact data not found. Please refresh and try again.");
        return;
      }

      console.log("Selected contact group:", selectedContactGroup);
      console.log("Selected contact:", selectedContact);
      console.log("Original leadContactData:", leadContactData);

      // Format datetime strings for API
      const callDate = formData.callDate instanceof Date 
        ? formData.callDate.toISOString().split('T')[0]
        : formData.callDate;
      
      const callStartDatetime = `${callDate} ${formData.callStartTime}:00`;
      const callEndDatetime = formData.callEndTime 
        ? `${callDate} ${formData.callEndTime}:00`
        : "";

      // Map status to contact_result_id (you may need to adjust this mapping)
      const getContactResultId = (status: string): string => {
        switch (status) {
          case "Completed": return "1";
          case "No Answer": return "2";
          case "Busy": return "3";
          case "Voicemail": return "4";
          case "Cancelled": return "5";
          case "Failed": return "6";
          default: return "1";
        }
      };

      // Prepare the single contact data - ensuring only one contact is sent
      const singleContactData = {
        channel_type_id: String(selectedContactGroup.channel_type_id),
        contact_values: [
          {
            user_name: selectedContact.user_name,
            contact_number: selectedContact.contact_number,
            remark: selectedContact.remark || "Mobile",
            is_primary: selectedContact.is_primary
          }
        ]
      };

      console.log("Single contact data being sent:", singleContactData);
      console.log("Contact values length:", singleContactData.contact_values.length);
      console.log("Selected contact details:", selectedContact);

      // Prepare API request body
      const apiRequestBody = {
        call_log_id: pipelineInfo.pipelineId,
        contact_result_id: getContactResultId(formData.callStatus?.value || ""),
        call_start_datetime: callStartDatetime,
        call_end_datetime: callEndDatetime,
        remark: formData.notes || null,
        menu_id: "MU_02", // Static for now as requested
        contact_data: [singleContactData]
      };
      
      console.log("API Request Body:", apiRequestBody);
      console.log("API Request Body (JSON):", JSON.stringify(apiRequestBody, null, 2));
      
      // Validation: Ensure we only have one contact in the contact_data
      if (apiRequestBody.contact_data.length !== 1) {
        console.error("ERROR: Multiple contact groups detected!", apiRequestBody.contact_data);
        alert("Error: Multiple contact groups detected. Please refresh and try again.");
        return;
      }
      
      if (apiRequestBody.contact_data[0].contact_values.length !== 1) {
        console.error("ERROR: Multiple contacts detected in contact_values!", apiRequestBody.contact_data[0].contact_values);
        alert("Error: Multiple contacts detected. Please refresh and try again.");
        return;
      }
      
      console.log("✓ Validation passed: Single contact confirmed");
      
      // Make actual API call - following create page pattern
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const response = await fetch(`${apiBase}/call-log-detail/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(apiRequestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log("API Response:", responseData);
      
      // Close the add call modal and reset form
      setShowAddCallModal(false);
      resetForm();
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Refresh the call log history to show the new entry
      await loadPipelineInfo();
      
    } catch (error) {
      console.error("Error saving quick call log:", error);
      alert(`Failed to save quick call log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    resetForm();
    setShowAddCallModal(true);
  };

  const handleCloseForm = () => {
    setShowSuccessModal(false);
    // Stay on the current quick call page instead of redirecting
    // router.push("/callpipeline");
  };

  // Action handlers for call log history table
  const handleActionSelect = (action: 'view' | 'edit' | 'delete', callLog: CallLogEntry) => {
    switch (action) {
      case 'view':
        handleViewCallLog(callLog);
        break;
      case 'edit':
        handleEditCallLog(callLog);
        break;
      case 'delete':
        handleDeleteCallLog(callLog);
        break;
    }
  };

  const handleEditCallLog = (log: CallLogEntry) => {
    // Set the call log being edited
    setEditingCallLog(log);
    
    // Parse the date string back to Date object
    let callDate = new Date();
    try {
      if (log.callDate && log.callDate !== 'N/A') {
        // Handle different date formats from API
        if (log.callDate.includes('T')) {
          callDate = new Date(log.callDate);
        } else {
          // Assume YYYY-MM-DD format
          callDate = new Date(log.callDate + 'T00:00:00');
        }
        // Validate the date
        if (isNaN(callDate.getTime())) {
          callDate = new Date(); // Fallback to current date
        }
      }
    } catch {
      callDate = new Date(); // Fallback to current date
    }
    
    // Extract time from datetime strings
    const extractTimeFromDatetime = (datetime: string): string => {
      if (!datetime || datetime === 'N/A') return '';
      try {
        // Handle different datetime formats
        if (datetime.includes('T')) {
          // ISO format: 2024-01-01T10:30:00
          const timeWithSeconds = datetime.split('T')[1]?.split('.')[0] || '';
          return timeWithSeconds.substring(0, 5); // Return HH:MM format
        } else if (datetime.includes(' ')) {
          // Space format: 2024-01-01 10:30:00
          const timeWithSeconds = datetime.split(' ')[1] || '';
          return timeWithSeconds.substring(0, 5); // Return HH:MM format
        } else if (datetime.includes(':')) {
          // Just time: 10:30:00 or 10:30
          return datetime.substring(0, 5); // Return HH:MM format
        }
        return '';
      } catch {
        return '';
      }
    };
    
    const startTime = extractTimeFromDatetime(log.callStartTime);
    const endTime = extractTimeFromDatetime(log.callEndTime);
    
    // Find the matching status option
    const statusOption = statusOptions.find(option => option.value === log.callStatus);
    
    // Populate edit form with existing data
    setEditFormData({
      callDate: callDate,
      callStartTime: startTime,
      callEndTime: endTime,
      callStatus: statusOption || null,
      notes: log.notes || '',
    });
    
    // Clear any previous errors
    setEditErrors({});
    
    // Show the edit modal
    setShowEditCallModal(true);
    
    // Set the date picker value after modal opens
    setTimeout(() => {
      const editDatePickerElement = document.getElementById('edit-call-date-picker') as HTMLInputElement;
      if (editDatePickerElement) {
        // Format date as YYYY-MM-DD for the input
        const formattedDate = callDate.toISOString().split('T')[0];
        editDatePickerElement.value = formattedDate;
        
        // Trigger change event so Flatpickr updates
        const event = new Event('change', { bubbles: true });
        editDatePickerElement.dispatchEvent(event);
      }
    }, 100);
  };

  const handleViewCallLog = (log: CallLogEntry) => {
    setViewingCallLog(log);
    setShowViewCallModal(true);
  };

  const handleDeleteCallLog = (log: CallLogEntry) => {
    // TODO: Implement delete functionality with confirmation
    console.log("Delete call log:", log);
    const confirmed = confirm(`Are you sure you want to delete call log #${log.callLogOrderID}?\n\nThis action cannot be undone.`);
    if (confirmed) {
      alert(`Delete functionality for call log #${log.callLogOrderID} will be implemented soon.`);
    }
  };

  // Edit modal handlers
  const handleEditFormChange = (field: keyof typeof editFormData, value: string | SelectOption | null | Date) => {
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
    const newErrors: CallLogFormErrors = {};
    
    if (!editFormData.callDate) newErrors.callDate = "Call date is required.";
    if (!editFormData.callStartTime) newErrors.callStartTime = "Start time is required.";
    if (!editFormData.callStatus) newErrors.callStatus = "Call status is required.";
    if (!editFormData.notes.trim()) newErrors.notes = "Notes are required.";
    
    // Validate end time is after start time if both are provided
    if (editFormData.callStartTime && editFormData.callEndTime) {
      const startTime = new Date(`2000-01-01T${editFormData.callStartTime}`);
      const endTime = new Date(`2000-01-01T${editFormData.callEndTime}`);
      if (endTime <= startTime) {
        newErrors.callEndTime = "End time must be after start time.";
      }
    }
    
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to get contact data for editing a call log detail
  const getContactDataForEdit = async (callLogDetailId: string) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      // Get the call log detail data which contains the contact_data
      const body = {
        page_number: "1",
        page_size: "10",
        search_type: "call_log_id",
        query_search: pipelineId,
      };
      
      console.log("Fetching contact data for edit, call log detail ID:", callLogDetailId);
      
      const res = await fetch(`${apiBase}/call-log/pagination`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      
      if (!res.ok) throw new Error("Failed to fetch call log data for edit");
      
      const data = await res.json();
      
      // Find the specific call log detail by ID
      let targetDetail = null;
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].data)) {
        const log = data[0].data[0];
        if (log.call_log_details && Array.isArray(log.call_log_details)) {
          targetDetail = log.call_log_details.find((detail: CallLogDetail) => 
            detail.call_log_detail_id === callLogDetailId
          );
        }
      }
      
      if (targetDetail && targetDetail.contact_data && Array.isArray(targetDetail.contact_data)) {
        console.log("Found original contact data for edit:", targetDetail.contact_data);
        
        // Filter the contact data to only include the primary contact that was actually used
        // This prevents sending duplicate contacts
        const filteredContactData = targetDetail.contact_data.map((contactGroup: ContactData) => {
          if (contactGroup.contact_values && Array.isArray(contactGroup.contact_values)) {
            // Find the primary contact or the first contact if no primary is found
            const primaryContact = contactGroup.contact_values.find(contact => contact.is_primary);
            const contactToUse = primaryContact || contactGroup.contact_values[0];
            
            if (contactToUse) {
              return {
                ...contactGroup,
                channel_type_id: String(contactGroup.channel_type_id), // Ensure it's a string
                contact_values: [contactToUse] // Only include the single contact that was used
              };
            }
          }
          return contactGroup;
        }).filter((group: ContactData) => group.contact_values && group.contact_values.length > 0);
        
        console.log("Filtered contact data for edit (single contact only):", filteredContactData);
        return filteredContactData;
      }
      
      console.warn("No contact data found for call log detail ID:", callLogDetailId);
      return [];
      
    } catch (error) {
      console.error("Error fetching contact data for edit:", error);
      return [];
    }
  };

  const handleEditSave = async () => {
    if (!validateEditForm() || !editingCallLog || !pipelineInfo) return;
    
    try {
      setIsSubmitting(true);
      
      // We need to get the contact data from the API first for the edit operation
      // Get the original contact data from the call log detail
      const originalContactData = await getContactDataForEdit(editingCallLog.detailId || '');
      
      if (!originalContactData || originalContactData.length === 0) {
        alert("Unable to retrieve contact data for this call log. Please refresh and try again.");
        return;
      }
      
      // Format datetime strings for API
      const callDate = editFormData.callDate instanceof Date 
        ? editFormData.callDate.toISOString().split('T')[0]
        : editFormData.callDate;
      
      const callStartDatetime = `${callDate} ${editFormData.callStartTime}:00`;
      const callEndDatetime = editFormData.callEndTime 
        ? `${callDate} ${editFormData.callEndTime}:00`
        : "";

      // Map status to contact_result_id
      const getContactResultId = (status: string): string => {
        switch (status) {
          case "Completed": return "1";
          case "No Answer": return "2";
          case "Busy": return "3";
          case "Voicemail": return "4";
          case "Cancelled": return "5";
          case "Failed": return "6";
          default: return "1";
        }
      };

      // Prepare API request body following the same format as create page
      const apiRequestBody = {
        call_log_id: pipelineInfo.pipelineId,
        call_log_detail_id: editingCallLog.detailId,
        contact_result_id: getContactResultId(editFormData.callStatus?.value || ""),
        call_start_datetime: callStartDatetime,
        call_end_datetime: callEndDatetime,
        remark: editFormData.notes || null,
        is_active: true,
        menu_id: "MU_02",
        contact_data: originalContactData
      };
      
      console.log("Edit API Request Body:", apiRequestBody);
      console.log("Edit API Request Body (JSON):", JSON.stringify(apiRequestBody, null, 2));
      
      // Validation: Ensure we only have one contact in each contact group
      if (originalContactData.length > 0) {
        originalContactData.forEach((contactGroup: ContactData, index: number) => {
          if (contactGroup.contact_values && contactGroup.contact_values.length > 1) {
            console.warn(`Warning: Contact group ${index} has ${contactGroup.contact_values.length} contacts:`, contactGroup.contact_values);
          } else {
            console.log(`✓ Contact group ${index} has exactly 1 contact`);
          }
        });
      }
      
      // Make actual API call - following create page pattern
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      console.log("About to make PUT request to:", `${apiBase}/call-log-detail/update`);
      console.log("Request headers:", headers);
      console.log("Starting update operation for call log detail ID:", editingCallLog.detailId);
      
      const response = await fetch(`${apiBase}/call-log-detail/update`, {
        method: "PUT",
        headers,
        body: JSON.stringify(apiRequestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log("Edit API Response:", responseData);
      
      // Close the edit modal and reset form
      setShowEditCallModal(false);
      resetEditForm();
      
      // Show success alert
      alert("Call log updated successfully!");
      
      // Refresh the call log history to show the updated entry
      await loadPipelineInfo();
      
    } catch (error) {
      console.error("Error updating call log:", error);
      alert(`Failed to update call log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetEditForm = () => {
    setEditFormData({
      callDate: new Date(),
      callStartTime: "",
      callEndTime: "",
      callStatus: null,
      notes: "",
    });
    setEditErrors({});
    setEditingCallLog(null);
    
    // Reset the edit date picker by clearing its value
    setTimeout(() => {
      const editDatePickerElement = document.getElementById('edit-call-date-picker') as HTMLInputElement;
      if (editDatePickerElement) {
        editDatePickerElement.value = '';
      }
    }, 0);
  };

  const handleCancelEdit = () => {
    setShowEditCallModal(false);
    resetEditForm();
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

        {/* View Call Log Modal */}
        <Modal
          isOpen={showViewCallModal}
          onClose={() => setShowViewCallModal(false)}
          className="max-w-3xl"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Call Log Details
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {viewingCallLog?.detailId || 'Detail ID not available'}
                </p>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Call Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white text-base border-b border-gray-200 dark:border-gray-700 pb-2">
                  Call Information
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Date:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(viewingCallLog?.callDate || 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Start Time:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatTime(viewingCallLog?.callStartTime || 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">End Time:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatTime(viewingCallLog?.callEndTime || 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {viewingCallLog?.totalCallMinute ? formatDuration(viewingCallLog.totalCallMinute) : 'N/A'}
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
                    <span className="text-sm text-gray-500 dark:text-gray-400">Method:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {viewingCallLog?.contactMethod || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Number:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatPhoneNumber(viewingCallLog?.contactNumber || 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Result:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      viewingCallLog?.contactResultName === 'Completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : viewingCallLog?.contactResultName === 'No Answer' || viewingCallLog?.contactResultName === 'Voicemail'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : viewingCallLog?.contactResultName === 'Busy' || viewingCallLog?.contactResultName === 'Failed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {viewingCallLog?.contactResultName || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Caller:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {viewingCallLog?.callerName || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white text-base border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
                Notes
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {viewingCallLog?.notes || 'No notes available for this call.'}
                </p>
              </div>
            </div>

            {/* System Info */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Detail ID: {viewingCallLog?.detailId || 'N/A'}</span>
                <span>Created: {formatDate(viewingCallLog?.createdAt || 'N/A')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowViewCallModal(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowViewCallModal(false);
                  if (viewingCallLog) {
                    handleEditCallLog(viewingCallLog);
                  }
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        </Modal>

        {/* Section 2: Add Call Log Button */}
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary bg-opacity-10">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-black dark:text-white">
                  Quick Call Entry
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Add a new call log for this pipeline
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowAddCallModal(true)}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Call
            </Button>
          </div>
        </div>

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
                  <div className="min-w-[900px]">
                    <Table>
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                            Detail ID
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Call Date
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Time
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Duration (min)
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Contact Method
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Contact Number
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Contact Result
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Caller Name
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Remark
                          </TableCell>
                          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {currentCallHistory.map((log) => (
                          <TableRow key={`${log.callPipelineID}-${log.callLogOrderID}`}>
                            <TableCell className="px-5 py-4 text-center">
                              <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
                                {log.detailId || `CD-${String(log.callLogOrderID).padStart(6, '0')}`}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <div className="font-medium text-gray-800 dark:text-white text-sm">
                                {formatDate(log.callDate)}
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-sm text-gray-500 dark:text-gray-400">
                                  {formatTime(log.callStartTime)} - {formatTime(log.callEndTime)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
                                {log.totalCallMinute ? formatDuration(log.totalCallMinute) : 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500 text-sm dark:text-gray-400">
                              {log.contactMethod || 'N/A'}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500 text-sm dark:text-gray-400">
                              {formatPhoneNumber(log.contactNumber || 'N/A')}
                            </TableCell>
                            <TableCell className="px-5 py-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                log.contactResultName === 'Completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                  : log.contactResultName === 'No Answer' || log.contactResultName === 'Voicemail'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                                  : log.contactResultName === 'Busy' || log.contactResultName === 'Failed'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                              }`}>
                                {log.contactResultName || 'Unknown'}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500 text-sm dark:text-gray-400">
                              {log.callerName || 'Unknown'}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500 text-sm dark:text-gray-400">
                              {log.notes || 'No remark'}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-start">
                              <ActionMenu callLog={log} onSelect={handleActionSelect} />
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

      {/* Add Call Log Modal */}
      <Modal 
        isOpen={showAddCallModal} 
        onClose={() => setShowAddCallModal(false)}
        className="max-w-4xl p-4 lg:p-11"
      >
        <div className="px-2 lg:pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add Call Log Entry
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details for this call log entry for Pipeline #{pipelineInfo.pipelineId}
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-4">
            
            {/* Call Date */}
            <div>
              <DatePicker
                id="call-date-picker"
                label="Call Date *"
                placeholder="Select call date"
                defaultDate={formData.callDate}
                onChange={(selectedDates) => {
                  if (selectedDates && selectedDates.length > 0) {
                    handleChange('callDate', selectedDates[0]);
                  }
                }}
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

          {/* Contact Information - Full width row */}
          <div>
            <Label htmlFor="contactInfo">Contact Information *</Label>
            <Select
              placeholder={isLoadingContacts ? "Loading contacts..." : "Select contact"}
              options={contactOptions}
              value={formData.contactInfo}
              onChange={(option) => handleChange('contactInfo', option)}
            />
            {errors.contactInfo && <p className="text-sm text-red-500 mt-1">{errors.contactInfo}</p>}
            {contactOptions.length === 0 && !isLoadingContacts && (
              <p className="text-sm text-gray-500 mt-1">No contacts found for this lead. Please add contacts to the lead first.</p>
            )}
          </div>

          {/* Notes - Full width */}
          <div>
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
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddCallModal(false)}
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

      {/* Edit Call Log Modal */}
      <Modal 
        isOpen={showEditCallModal} 
        onClose={() => setShowEditCallModal(false)}
        className="max-w-4xl p-4 lg:p-11"
      >
        <div className="px-2 lg:pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Call Log Entry
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the details for this call log entry
          </p>
        </div>

        {/* Call Log Information Card */}
        <div className="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between border-b border-stroke pb-3 dark:border-strokedark">
            <div>
              <h3 className="text-base font-semibold text-black dark:text-white">
                Editing Call Log Entry
              </h3>
              <p className="mt-1 text-sm text-body dark:text-bodydark">
                Call Log #{editingCallLog?.callLogOrderID || 'Unknown'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                editingCallLog?.callStatus === 'Completed'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : editingCallLog?.callStatus === 'Pending'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              }`}>
                {editingCallLog?.callStatus || 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
              <dt className="text-xs font-medium text-body dark:text-bodydark">Call Log ID</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-black dark:text-white">
                #{editingCallLog?.callLogOrderID || 'N/A'}
              </dd>
            </div>
            <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
              <dt className="text-xs font-medium text-body dark:text-bodydark">Created Date</dt>
              <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                {editingCallLog?.createdAt || 'Not available'}
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
                  Review and update the call log information below. Changes will be saved when you submit the form.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-4">
            
            {/* Call Date */}
            <div>
              <DatePicker
                id="edit-call-date-picker"
                label="Call Date *"
                placeholder="Select call date"
                defaultDate={editFormData.callDate}
                onChange={(selectedDates) => {
                  if (selectedDates && selectedDates.length > 0) {
                    handleEditFormChange('callDate', selectedDates[0]);
                  }
                }}
              />
              {editErrors.callDate && <p className="text-sm text-red-500 mt-1">{editErrors.callDate}</p>}
            </div>

            {/* Call Start Time */}
            <div>
              <Label htmlFor="editCallStartTime">Start Time *</Label>
              <div className="relative">
                <InputField
                  type="time"
                  id="editCallStartTime"
                  value={editFormData.callStartTime}
                  onChange={(e) => handleEditFormChange('callStartTime', e.target.value)}
                  error={!!editErrors.callStartTime}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <TimeIcon />
                </span>
              </div>
              {editErrors.callStartTime && <p className="text-sm text-red-500 mt-1">{editErrors.callStartTime}</p>}
            </div>

            {/* Call End Time */}
            <div>
              <Label htmlFor="editCallEndTime">End Time</Label>
              <div className="relative">
                <InputField
                  type="time"
                  id="editCallEndTime"
                  value={editFormData.callEndTime}
                  onChange={(e) => handleEditFormChange('callEndTime', e.target.value)}
                  error={!!editErrors.callEndTime}
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <TimeIcon />
                </span>
              </div>
              {editErrors.callEndTime && <p className="text-sm text-red-500 mt-1">{editErrors.callEndTime}</p>}
            </div>

            {/* Call Status */}
            <div>
              <Label htmlFor="editCallStatus">Call Status *</Label>
              <Select
                placeholder="Select status"
                options={statusOptions}
                value={editFormData.callStatus}
                onChange={(option) => handleEditFormChange('callStatus', option)}
              />
              {editErrors.callStatus && <p className="text-sm text-red-500 mt-1">{editErrors.callStatus}</p>}
            </div>
          </div>

          {/* Notes - Full width */}
          <div>
            <Label htmlFor="editNotes">Call Notes *</Label>
            <TextArea
              placeholder="Enter detailed call notes..."
              value={editFormData.notes}
              onChange={(value) => handleEditFormChange("notes", value)}
              rows={4}
            />
            {editErrors.notes && <p className="text-sm text-red-500 mt-1">{editErrors.notes}</p>}
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

// Action Menu Component for call log entries
const ActionMenu = ({ callLog, onSelect }: { 
  callLog: CallLogEntry; 
  onSelect: (action: 'view' | 'edit' | 'delete', callLog: CallLogEntry) => void; 
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
                  onSelect('view', callLog); 
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
                  onSelect('edit', callLog); 
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
                  onSelect('delete', callLog); 
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
