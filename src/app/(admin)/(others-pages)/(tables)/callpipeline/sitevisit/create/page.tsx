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
import FileInput from "@/components/form/input/FileInput";
import { TimeIcon } from "@/icons";
import PhotoUpload, { PhotoFile } from "@/components/form/PhotoUpload";

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

export default function CreateSiteVisitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pipelineId = searchParams.get('pipelineId') || '';

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Call Pipeline", href: "/callpipeline" },
    { name: "Site Visit", href: `/callpipeline/sitevisit?pipelineId=${pipelineId}` },
    { name: "Create" },
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
        // Use the same API approach as the main site visit page
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
          console.log("Available fields in log:", Object.keys(log));
          console.log("current_staff_id value:", log.current_staff_id);
          console.log("created_by_id value:", log.created_by_id);
          console.log("staff_id value:", log.staff_id);
          
          // Set pipeline info using the same structure as main page
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
            callerId: log.current_staff_id || log.created_by_id || log.staff_id || ""
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
    visitDate: "",
    visitStartTime: "",
    visitEndTime: "",
    contactResult: null as SelectOption | null,
    purpose: "",
    notes: "",
    uploadedDocuments: [] as File[],
  });

  const [photos, setPhotos] = useState<PhotoFile[]>([]);

  type SiteVisitFormErrors = {
    visitDate?: string;
    visitStartTime?: string;
    visitEndTime?: string;
    contactResult?: string;
    purpose?: string;
    notes?: string;
    uploadedDocuments?: string;
  };

  const [errors, setErrors] = useState<SiteVisitFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contact result options
  const contactResultOptions: SelectOption[] = [
    { value: "1", label: "Completed" },
    { value: "2", label: "No Answer" },
    { value: "3", label: "Busy" },
    { value: "4", label: "Voicemail" },
    { value: "5", label: "Cancelled" },
    { value: "6", label: "Failed" },
  ];

  const handleChange = (field: keyof typeof formData, value: string | SelectOption | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setFormData((prev) => ({ 
        ...prev, 
        uploadedDocuments: [...prev.uploadedDocuments, ...fileArray] 
      }));
      // Clear any previous upload errors
      if (errors.uploadedDocuments) {
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors.uploadedDocuments;
          return newErrors;
        });
      }
    }
  };

  const handleRemoveDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      uploadedDocuments: prev.uploadedDocuments.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const newErrors: SiteVisitFormErrors = {};
    
    if (!formData.visitDate) newErrors.visitDate = "Visit date is required.";
    if (!formData.visitStartTime) newErrors.visitStartTime = "Start time is required.";
    if (!formData.contactResult) newErrors.contactResult = "Contact result is required.";
    if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required.";
    if (!formData.notes.trim()) newErrors.notes = "Notes/Remarks are required.";
    
    // Validate end time is after start time if both are provided
    if (formData.visitStartTime && formData.visitEndTime) {
      const startTime = new Date(`2000-01-01T${formData.visitStartTime}`);
      const endTime = new Date(`2000-01-01T${formData.visitEndTime}`);
      if (endTime <= startTime) {
        newErrors.visitEndTime = "End time must be after start time.";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => { 
    if (!validate() || !pipelineInfo) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare photo URLs - for now we'll use placeholder URLs since we need file upload handling
      const photoUrls: string[] = [];
      photos.forEach((photo, index) => {
        // In a real implementation, you'd upload the file to a storage service first
        // and get back the actual URL. For now, using placeholder.
        photoUrls.push(`https://example.com/photos/site_visit_${Date.now()}_${index}.jpg`);
      });
      
      // Format datetime strings for API
      const startDatetime = `${formData.visitDate} ${formData.visitStartTime}:00`;
      const endDatetime = formData.visitEndTime 
        ? `${formData.visitDate} ${formData.visitEndTime}:00`
        : "";
      
      // Prepare API request body according to the specified format
      const apiRequestBody = {
        call_id: pipelineInfo.pipelineId,
        property_profile_id: String(pipelineInfo.propertyProfileId),
        staff_id: String(pipelineInfo.callerId || "000001"), // Fallback to default staff ID
        lead_id: pipelineInfo.leadId,
        contact_result_id: formData.contactResult?.value || "1",
        purpose: formData.purpose,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        photo_url: photoUrls,
        remark: formData.notes
      };
      
      console.log("Site Visit API Request Body:", apiRequestBody);
      console.log("Site Visit API Request Body (JSON):", JSON.stringify(apiRequestBody, null, 2));
      console.log("Pipeline Info:", pipelineInfo);
      console.log("Staff ID being used:", pipelineInfo.callerId || "000001");
      
      // Make actual API call
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      console.log("Making API call to:", `${apiBase}/site-visit/create`);
      
      const response = await fetch(`${apiBase}/site-visit/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(apiRequestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log("Site Visit Create API Response:", responseData);
      
      // Show success message
      alert("Site visit created successfully!");
      
      // Redirect back to site visit page
      router.push(`/callpipeline/sitevisit?pipelineId=${pipelineId}`);
      
    } catch (error) {
      console.error("Error saving site visit:", error);
      alert(`Failed to save site visit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/callpipeline/sitevisit?pipelineId=${pipelineId}`);
  };

  // Show loading or no data if pipeline info is not loaded
  if (isLoadingPipeline) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
      
      <ComponentCard title="Create Site Visit Entry">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-dark dark:text-white">
            Add Site Visit Entry for Pipeline #{pipelineInfo.pipelineId}
          </h2>
          <p className="text-body-color dark:text-dark-6 mt-2">
            <span className="font-medium">{pipelineInfo.leadName}</span> - {pipelineInfo.propertyName}
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
            
            {/* Visit Date */}
            <div>
              <DatePicker
                id="visit-date-picker"
                label="Visit Date *"
                placeholder="Select visit date"
                defaultDate={formData.visitDate}
                onChange={(selectedDates) => {
                  if (selectedDates.length > 0) {
                    const date = selectedDates[0];
                    const formattedDate = date.toISOString().split('T')[0];
                    handleChange('visitDate', formattedDate);
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
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            {/* Contact Result */}
            <div>
              <Label htmlFor="contactResult">Contact Result *</Label>
              <Select
                placeholder="Select contact result"
                options={contactResultOptions}
                value={formData.contactResult}
                onChange={(option) => handleChange('contactResult', option)}
              />
              {errors.contactResult && <p className="text-sm text-red-500 mt-1">{errors.contactResult}</p>}
            </div>

            {/* Purpose */}
            <div>
              <Label htmlFor="purpose">Purpose *</Label>
              <InputField
                type="text"
                id="purpose"
                placeholder="e.g., Create property assessment and client meeting"
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                error={!!errors.purpose}
              />
              {errors.purpose && <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>}
            </div>
          </div>

          {/* Notes/Remarks - Full width */}
          <div>
            <Label htmlFor="notes">Remarks *</Label>
            <TextArea
              placeholder="Enter detailed visit notes..."
              value={formData.notes}
              onChange={(value) => handleChange("notes", value)}
              rows={4}
            />
            {errors.notes && <p className="text-sm text-red-500 mt-1">{errors.notes}</p>}
          </div>

          {/* Photos */}
          <div>
            <Label>Photos</Label>
            <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
            <p className="text-xs text-gray-500 mt-1">Upload up to 10 photos (5MB each)</p>
          </div>


          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
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
              {isSubmitting ? "Creating..." : "Create Site Visit"}
            </Button>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
