"use client";
/*
 * Create Site Visit Page - API Ready
 * 
 * This component is fully prepared for backend integration with the following API endpoints:
 * 
 * REQUIRED API ENDPOINTS:
 * 
 * 1. General Information APIs:
 *    - GET /api/calls/generate-id 
 *      Response: { call_id: string }
 *    - GET /api/property-profiles/current
 *      Response: { property_profile_id: string }  
 *    - GET /api/staff/current
 *      Response: { staff_id: string }
 * 
 * 2. Contact Results API:
 *    - GET /api/contact-results
 *      Response: [{ contact_result_id: number, contact_result_name: string }]
 * 
 * 3. Site Visit Submission API:
 *    - POST /api/site-visits
 *      Request Body: {
 *        call_id: string,
 *        staff_id: string, 
 *        property_profile_id: string,
 *        lead_id: string,
 *        site_visit_date: string (YYYY-MM-DD),
 *        start_time: string (HH:MM),
 *        end_time: string (HH:MM),
 *        contact_result_id: string,
 *        address: { province_id, district_id, commune_id, village_id, home_address, street_address },
 *        purpose: string,
 *        remark: string,
 *        photo_url?: string (TODO: implement file upload)
 *      }
 * 
 * CURRENT STATE:
 * - All API functions are implemented with mock data
 * - Loading and error states are handled
 * - Form validation is complete
 * - UI/UX is polished and ready for production
 * 
 * TODO:
 * - Replace mock API calls with actual endpoints
 * - Implement file upload for photo_url field
 * - Add proper error notification system (replace alert())
 * - Add success notification after submission
 */
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import TextArea from "@/components/form/input/TextArea";
import Input from "@/components/form/input/InputField";
import { TimeIcon, ChevronDownIcon } from "@/icons";
import Address, { IAddress } from "@/components/form/Address";
import Lead, { ILead } from "@/components/form/Lead";

interface SelectOption {
  value: string;
  label: string;
}

export default function CreateSiteVisitPage() {
  const router = useRouter();

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Site Visit", href: "/sitevisit" },
    { name: "Create" },
  ];

  // General Information State - for display-only fields
  const [generalInfo, setGeneralInfo] = useState({
    callId: "",
    propertyProfileId: "",
    staffId: "",
    loading: true,
    error: null as string | null,
  });

  const [formData, setFormData] = useState({
    siteVisitDate: null as Date | null,
    startTime: "",
    endTime: "",
    contactResult: null as SelectOption | null,
    address: {
        province: null, district: null, commune: null, village: null,
        homeAddress: "", streetAddress: ""
    } as IAddress,
    lead: null as ILead | null,
    purpose: "",
    remark: "",
  });

  type LeadFormErrors = {
    siteVisitDate?: string; startTime?: string; endTime?: string; contactResult?: string; address?: string; lead?: string; purpose?: string; remark?: string;
  };

  const [errors, setErrors] = useState<LeadFormErrors>({});

  // API Functions for General Information
  // TODO: Replace with actual API endpoints when available
  const fetchGeneralInfo = async () => {
    try {
      setGeneralInfo(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API calls - replace with actual endpoints
      // Expected APIs:
      // 1. GET /api/calls/generate-id - Generate new call ID
      // 2. GET /api/property-profiles/current - Get current property profile
      // 3. GET /api/staff/current - Get current staff member from session
      
      // Simulated delay for realistic loading behavior
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API responses
      const callId = `CL-${String(Date.now()).slice(-6)}`;
      const propertyProfileId = "PP-000002";
      const staffId = "ST-000001";
      
      setGeneralInfo({
        callId,
        propertyProfileId,
        staffId,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching general information:", error);
      setGeneralInfo(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load general information. Please refresh the page.",
      }));
    }
  };

  // Contact Result State - for dropdown options
  const [contactResults, setContactResults] = useState({
    options: [] as SelectOption[],
    loading: false,
    error: null as string | null,
  });

  // API Function for Contact Results
  // TODO: Replace with actual API endpoint when available
  const fetchContactResults = async () => {
    try {
      setContactResults(prev => ({ ...prev, loading: true, error: null }));
      
      // Expected API: GET /api/contact-results
      // Response: [{ contact_result_id: number, contact_result_name: string }]
      
      // Simulated delay for realistic loading behavior
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - replace with actual API response
      const mockOptions: SelectOption[] = [
        { value: "1", label: "Interest" },
        { value: "2", label: "Call Not pick up" },
        { value: "3", label: "Pick up not interest" },
        { value: "4", label: "Need follow up" },
      ];
      
      setContactResults({
        options: mockOptions,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching contact results:", error);
      setContactResults(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load contact results.",
      }));
    }
  };

  // Load general information on component mount
  useEffect(() => {
    fetchGeneralInfo();
    fetchContactResults();
  }, []);

  const handleChange = (field: keyof typeof formData, value: Date | string | IAddress | ILead | SelectOption | null) => {
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
    const newErrors: LeadFormErrors = {};
    if (!formData.siteVisitDate) newErrors.siteVisitDate = "Site Visit Date is required.";
    if (!formData.startTime) newErrors.startTime = "Start Time is required.";
    if (!formData.endTime) newErrors.endTime = "End Time is required.";
    if (!formData.contactResult) newErrors.contactResult = "Please select a contact result.";
    if (!formData.lead) newErrors.lead = "Please select a lead.";
    if (!formData.address.province) {
        newErrors.address = "A complete address with province is required.";
    }
    if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required.";
    
    // Validate that end time is after start time
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        newErrors.endTime = "End time must be after start time.";
    }
    
    console.log(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => { 
    if (!validate()) return;
    
    try {
      setIsSubmitting(true);
      
      // TODO: Replace with actual API endpoint when available
      // Expected API: POST /api/site-visits
      // Request body structure based on the form data
      const siteVisitData = {
        call_id: generalInfo.callId,
        staff_id: generalInfo.staffId,
        property_profile_id: generalInfo.propertyProfileId,
        lead_id: formData.lead?.LeadID,
        site_visit_date: formData.siteVisitDate?.toISOString().split('T')[0], // Format as YYYY-MM-DD
        start_time: formData.startTime,
        end_time: formData.endTime,
        contact_result_id: formData.contactResult?.value,
        address: {
          province_id: formData.address.province?.value,
          district_id: formData.address.district?.value,
          commune_id: formData.address.commune?.value,
          village_id: formData.address.village?.value,
          home_address: formData.address.homeAddress,
          street_address: formData.address.streetAddress,
        },
        purpose: formData.purpose,
        remark: formData.remark,
        // photo_url: "", // TODO: Implement file upload functionality
      };
      
      console.log("Site Visit Data to submit:", siteVisitData);
      
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // On successful submission, redirect to site visit list
      router.push("/sitevisit");
      
    } catch (error) {
      console.error("Error saving site visit:", error);
      // TODO: Add proper error handling and user notification
      alert("Failed to save site visit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => { router.push("/sitevisit"); };

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        <ComponentCard title="Create New Site Visit">
          {/* General Information Display Section */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mb-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                  General Information
                </h4>

                {generalInfo.loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading information...</span>
                  </div>
                ) : generalInfo.error ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <p className="text-red-500 text-sm mb-2">{generalInfo.error}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fetchGeneralInfo}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Call ID
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {generalInfo.callId || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Property Profile ID
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {generalInfo.propertyProfileId || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Staff ID
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {generalInfo.staffId || "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Refresh Button - Similar to Edit button in UserInfoCard */}
              <button
                onClick={fetchGeneralInfo}
                disabled={generalInfo.loading}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
              >
                <svg
                  className={`fill-current ${generalInfo.loading ? 'animate-spin' : ''}`}
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9 1.5C4.85775 1.5 1.5 4.85775 1.5 9C1.5 13.1422 4.85775 16.5 9 16.5C13.1422 16.5 16.5 13.1422 16.5 9C16.5 7.51472 16.0245 6.13817 15.2097 5C14.9344 4.61281 14.4656 4.52344 14.0784 4.79875C13.6912 5.07406 13.6019 5.54281 13.8772 5.93C14.4228 6.74183 14.75 7.73 14.75 8.75C14.75 12.2018 11.9518 15 8.5 15C5.04822 15 2.25 12.2018 2.25 8.75C2.25 5.29822 5.04822 2.5 8.5 2.5C9.52 2.5 10.5082 2.82722 11.32 3.37281C11.7072 3.64812 12.1759 3.55875 12.4512 3.17156C12.7265 2.78437 12.6372 2.31562 12.25 2.04031C11.1118 1.27553 9.80528 0.75 8.5 0.75Z"
                    fill=""
                  />
                </svg>
                {generalInfo.loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Site Visit Input Section */}
          <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mb-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                Site Visit Input
              </h4>

              <div className="flex flex-col">
                <div className="px-2 pb-3">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">

                    <div className="col-span-2 lg:col-span-1">
                      <Lead 
                        value={formData.lead || undefined}
                        onChange={(newLead) => handleChange('lead', newLead)}
                        error={errors.lead}
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <DatePicker id="date-picker-siteVisitDate" label="Site Visit Date" placeholder="Select a date" value={formData.siteVisitDate || undefined} onChange={(dates) => handleChange("siteVisitDate", dates[0])} />
                      {errors.siteVisitDate && <p className="text-sm text-red-500 mt-1">{errors.siteVisitDate}</p>}
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label htmlFor="startTime">Start Time</Label>
                      <div className="relative">
                        <Input
                          type="time"
                          id="startTime"
                          name="startTime"
                          value={formData.startTime}
                          onChange={(e) => handleChange("startTime", e.target.value)}
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <TimeIcon />
                        </span>
                      </div>
                      {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>}
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label htmlFor="endTime">End Time</Label>
                      <div className="relative">
                        <Input
                          type="time"
                          id="endTime"
                          name="endTime"
                          value={formData.endTime}
                          onChange={(e) => handleChange("endTime", e.target.value)}
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <TimeIcon />
                        </span>
                      </div>
                      {errors.endTime && <p className="text-sm text-red-500 mt-1">{errors.endTime}</p>}
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Contact Result</Label>
                      <div className="relative">
                        <Select 
                          options={contactResults.loading ? [] : contactResults.options} 
                          value={formData.contactResult || undefined} 
                          onChange={(selectedOption) => handleChange("contactResult", selectedOption)} 
                          className="dark:bg-dark-900" 
                          placeholder={contactResults.loading ? "Loading options..." : "Select contact result"}
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <ChevronDownIcon />
                        </span>
                      </div>
                      {contactResults.error && (
                        <p className="text-sm text-orange-500 mt-1">{contactResults.error}</p>
                      )}
                      {errors.contactResult && <p className="text-sm text-red-500 mt-1">{errors.contactResult}</p>}
                    </div>

                     <div className="col-span-2 lg:col-span-1">
                        <Address 
                          value={formData.address}
                          onSave={(newAddress) => handleChange('address', newAddress) }
                          error={errors.address}
                        />
                    </div>
     
                    <div className="col-span-3">
                      <Label>Purpose</Label>
                      <TextArea value={formData.purpose} onChange={(value) => handleChange("purpose", value)} rows={3} />
                      {errors.purpose && <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>}
                    </div>

                    <div className="col-span-3">
                      <Label>Remark</Label>
                      <TextArea value={formData.remark} onChange={(value) => handleChange("remark", value)} rows={3} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex items-center gap-3 mt-6 justify-end">
            <Button 
              size="md" 
              variant="outline" 
              type="button" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              size="md" 
              type="submit" 
              onClick={handleSave}
              disabled={isSubmitting || generalInfo.loading}
            >
              {isSubmitting ? "Saving..." : "Save Site Visit"}
            </Button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}