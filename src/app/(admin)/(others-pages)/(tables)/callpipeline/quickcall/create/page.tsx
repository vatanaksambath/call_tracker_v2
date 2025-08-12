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
import { Modal } from "@/components/ui/modal";
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

export default function QuickCallCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pipelineId = searchParams.get('pipelineId') || '';

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Call Pipeline", href: "/callpipeline" },
    { name: "Quick Call" },
    { name: "Create Call Log" },
  ];

  const [pipelineInfo, setPipelineInfo] = useState<PipelineInfo | null>(null);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(true);
  const [showInputModal, setShowInputModal] = useState(false);

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
    contactInfo: null as SelectOption | null,
    notes: "",
    isFollowUp: false,
    followUpDate: null as Date | null,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [statusOptions, setStatusOptions] = useState<SelectOption[]>([]);

  // Helper function to get contact result name
  const getContactResultName = (contactResultId: number): string => {
    // First try to get from API-loaded options
    const option = statusOptions.find(opt => opt.value === contactResultId.toString());
    if (option) {
      return option.label;
    }
    
    // Fallback to static mapping if API data not loaded yet
    const staticMapping: { [key: number]: string } = {
      1: "No Answer",
      2: "Busy", 
      3: "Voicemail",
      4: "Answered",
      5: "Callback Requested",
      6: "Not Interested",
      7: "Follow-up Scheduled"
    };
    
    return staticMapping[contactResultId] || "Unknown";
  };

  // Load contact result options from API
  useEffect(() => {
    const loadContactResults = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        baseUrl = baseUrl.replace(/\/+$/, "");
        const endpoint = `${baseUrl}/contact-result/pagination`;
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            page_number: "1",
            page_size: "50",
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          let contactResults = [];
          
          if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].data)) {
            contactResults = data[0].data;
          } else if (Array.isArray(data?.data)) {
            contactResults = data.data;
          }
          
          const options = contactResults.map((result: any) => ({
            value: result.contact_result_id.toString(),
            label: result.contact_result_name
          }));
          
          setStatusOptions(options);
        }
      } catch (error) {
        console.error("Error loading contact results:", error);
        // Set fallback options if API fails
        setStatusOptions([
          { value: "1", label: "No Answer" },
          { value: "2", label: "Busy" },
          { value: "3", label: "Voicemail" },
          { value: "4", label: "Answered" },
          { value: "5", label: "Callback Requested" },
          { value: "6", label: "Not Interested" },
          { value: "7", label: "Follow-up Scheduled" },
        ]);
      }
    };
    
    loadContactResults();
  }, []);

  const handleChange = (field: keyof typeof formData, value: Date | string | SelectOption | null | boolean) => {
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
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.callDate) newErrors.callDate = "Call date is required.";
    if (!formData.callStartTime) newErrors.callStartTime = "Start time is required.";
    if (!formData.callStatus) newErrors.callStatus = "Call status is required.";
    if (!formData.notes.trim()) newErrors.notes = "Call notes are required.";
    
    // Validate follow-up date if follow-up is required
    if (formData.isFollowUp && !formData.followUpDate) {
      newErrors.followUpDate = "Follow-up date is required when follow-up is enabled.";
    }
    
    // Validate time format and logic
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

  const handleSave = async () => {
    if (!validate()) return;
    
    try {
      setIsSubmitting(true);
      
      const callLogData = {
        pipelineId,
        callDate: formData.callDate,
        callStartTime: formData.callStartTime,
        callEndTime: formData.callEndTime,
        callStatus: formData.callStatus?.value,
        notes: formData.notes,
        isFollowUp: formData.isFollowUp,
        followUpDate: formData.followUpDate,
        createdAt: new Date().toISOString(),
      };
      
      console.log("Call Log Data to submit:", callLogData);
      
      // TODO: Replace with actual API call when backend is ready
      // await api.post('/call-logs', callLogData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success modal
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Error saving call log:", error);
      alert("Failed to save call log. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowInputModal(false);
    // Reset form data
    setFormData({
      callDate: new Date(),
      callStartTime: "",
      callEndTime: "",
      callStatus: null,
      contactInfo: null,
      notes: "",
      isFollowUp: false,
      followUpDate: null,
    });
    setErrors({});
  };

  const handleAddCallLog = () => {
    setShowInputModal(true);
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setShowInputModal(true);
    // Reset form data
    setFormData({
      callDate: new Date(),
      callStartTime: "",
      callEndTime: "",
      callStatus: null,
      contactInfo: null,
      notes: "",
      isFollowUp: false,
      followUpDate: null,
    });
    setErrors({});
  };

  const handleGoToQuickCall = () => {
    setShowSuccessModal(false);
    setShowInputModal(false);
    router.push(`/callpipeline/quickcall?pipelineId=${pipelineId}`);
  };

  if (isLoadingPipeline) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <div className="space-y-6">
          <ComponentCard title="Quick Call - Create Call Log">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading pipeline information...</span>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  if (!pipelineInfo) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <div className="space-y-6">
          <ComponentCard title="Quick Call - Create Call Log">
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No pipeline information found.</p>
              <Button variant="outline" onClick={() => router.push('/callpipeline')}>
                Back to Call Pipeline
              </Button>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        
        {/* Section 1: General Information */}
        <ComponentCard title="General Information">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            
            {/* Lead Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">
                Lead Information
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Name:</span> {pipelineInfo.leadName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Company:</span> {pipelineInfo.leadCompany}
                </p>
              </div>
            </div>

            {/* Property Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">
                Property Information
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Property:</span> {pipelineInfo.propertyName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Location:</span> {pipelineInfo.propertyLocation}
                </p>
              </div>
            </div>

            {/* Caller Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">
                Caller Information
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Name:</span> {pipelineInfo.callerName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Phone:</span> {pipelineInfo.callerPhone}
                </p>
              </div>
            </div>

            {/* Add Call Log Button */}
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleAddCallLog}
                className="w-full h-12"
              >
                Add Call Log
              </Button>
            </div>
          </div>
        </ComponentCard>

        {/* Call History Table (you can add this later if needed) */}
        <ComponentCard title="Call History">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Call history will be displayed here after creating call logs.
            </p>
          </div>
        </ComponentCard>
      </div>

      {/* Input Information Modal */}
      <Modal 
        isOpen={showInputModal} 
        onClose={handleCloseModal}
        className="max-w-4xl p-6"
      >
        <div className="mb-6">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Quick Call Entry
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add a call log entry for Pipeline #{pipelineInfo.pipelineId}
          </p>
        </div>

        {/* Pipeline Summary */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-6">
          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-3 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Pipeline</h3>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-200">#{pipelineInfo.pipelineId}</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 p-3 dark:border-gray-700 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Lead</h3>
              <p className="text-sm font-bold text-green-800 dark:text-green-200">{pipelineInfo.leadName}</p>
              {pipelineInfo.callerPhone && (
                <p className="text-xs text-green-600 dark:text-green-300">
                  {pipelineInfo.callerPhone}
                </p>
              )}
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50 p-3 dark:border-gray-700 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Property</h3>
              <p className="text-sm font-bold text-purple-800 dark:text-purple-200">{pipelineInfo.propertyName}</p>
            </div>
          </div>
        </div>
        
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

          {/* Follow-up Section */}
          <div>
            <Label htmlFor="followUpToggle">Follow-up Required</Label>
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="followUpToggle"
                  checked={formData.isFollowUp}
                  onChange={(e) => handleChange('isFollowUp', e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  formData.isFollowUp ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                    formData.isFollowUp ? 'transform translate-x-5' : ''
                  }`}></div>
                </div>
              </label>
            </div>
            {errors.isFollowUp && <p className="text-sm text-red-500 mt-1">{errors.isFollowUp}</p>}
          </div>

          {/* Follow-up Date - Show when toggle is on */}
          {formData.isFollowUp && (
            <div>
              <DatePicker
                id="follow-up-date-picker"
                label="Follow-up Date *"
                placeholder="Select date"
                value={formData.followUpDate || undefined}
                onChange={(selectedDates) => {
                  if (selectedDates && selectedDates.length > 0) {
                    handleChange('followUpDate', selectedDates[0]);
                  }
                }}
              />
              {errors.followUpDate && <p className="text-sm text-red-500 mt-1">{errors.followUpDate}</p>}
            </div>
          )}
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
            onClick={handleCloseModal}
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
            {isSubmitting ? "Saving..." : "Save Call Log"}
          </Button>
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
            Call Log Created Successfully!
          </h3>
          
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Your call log has been saved. What would you like to do next?
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              onClick={handleCreateAnother}
              className="flex-1"
            >
              Add Another Call Log
            </Button>
            <Button
              variant="primary"
              onClick={handleGoToQuickCall}
              className="flex-1"
            >
              Back to Quick Call
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}