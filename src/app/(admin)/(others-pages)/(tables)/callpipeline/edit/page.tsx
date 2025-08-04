"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import { Modal } from "@/components/ui/modal";
import SelectionModal from "@/components/common/SelectionModal";

// Call Pipeline Edit Form Component
export default function CallPipelineEditForm() {
  // --- State Definitions ---
  // Lead, Staff, Property types
  type MappedLead = {
    lead_id: string;
    lead_name: string;
    primary_contact: string;
    original: Record<string, unknown>;
  };
  type MappedStaff = {
    staff_id: string;
    full_name: string;
    position: string;
    original: Record<string, unknown>;
  };
  type MappedProperty = {
    property_profile_id: string;
    property_profile_name: string;
    property_type_name: string;
    project_name: string;
    price: string;
    original: Record<string, unknown>;
  };

  const router = useRouter();

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Call Pipeline", href: "/callpipeline" },
    { name: "Edit Pipeline" },
  ];

  // Form data
  const [formData, setFormData] = useState<{
    selectedLead: MappedLead | null;
    selectedStaff: MappedStaff | null;
    selectedProperty: MappedProperty | null;
    purpose: string;
  }>({
    selectedLead: null,
    selectedStaff: null,
    selectedProperty: null,
    purpose: "",
  });

  // Error state
  const [errors, setErrors] = useState<{
    selectedLead?: string;
    selectedStaff?: string;
    selectedProperty?: string;
    purpose?: string;
  }>({});

  // Modal visibility
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Data arrays for selection modals
  const [mappedLeads, setMappedLeads] = useState<MappedLead[]>([]);
  const [staffData, setStaffData] = useState<MappedStaff[]>([]);
  const [propertiesData, setPropertiesData] = useState<MappedProperty[]>([]);

  // Loading states for modals
  const [isLeadLoading, setIsLeadLoading] = useState(false);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [isPropertyLoading, setIsPropertyLoading] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Initial Loading State ---
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [callLogId, setCallLogId] = useState<string>("");

  // --- Handler Functions ---
  const handleChange = (field: string, value: string | MappedLead | MappedStaff | MappedProperty | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleCancel = () => {
    router.push("/callpipeline");
  };

  const handleSave = async () => {
    // Example validation
    const newErrors: typeof errors = {};
    if (!formData.selectedLead) newErrors.selectedLead = "Lead is required.";
    if (!formData.selectedStaff) newErrors.selectedStaff = "Staff is required.";
    if (!formData.selectedProperty) newErrors.selectedProperty = "Property is required.";
    if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    // TypeScript null checks (should be satisfied by validation above)
    if (!formData.selectedLead || !formData.selectedStaff || !formData.selectedProperty) {
      console.error("Missing required form data");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      baseUrl = baseUrl.replace(/\/+$/, "");
      const endpoint = `${baseUrl}/call-log/update`;
      
      const updateBody = {
        call_log_id: callLogId,
        lead_id: formData.selectedLead.lead_id,
        property_profile_id: formData.selectedProperty.property_profile_id,
        status_id: "1",
        purpose: formData.purpose.trim(),
        fail_reason: null,
        follow_up_date: null,
        is_follow_up: true,
        is_active: true,
        p_call_log_detail: [],
        updated_by: formData.selectedStaff.staff_id,
      };
      
      console.log("Update API endpoint:", endpoint);
      console.log("Update API request body:", updateBody);
      
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updateBody),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Update API error response:", errorData);
        throw new Error(`Failed to update call pipeline: ${res.status} ${res.statusText}`);
      }
      
      const responseData = await res.json();
      console.log("Update API success response:", responseData);
      
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Update call pipeline error:", err);
      // Show error to user
      setErrors({ purpose: "Failed to update call pipeline. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    router.push("/callpipeline/edit");
  };

  const handleGoToPipeline = () => {
    setShowSuccessModal(false);
    router.push("/callpipeline");
  };

  // --- Fetch Functions for Modals ---
  const fetchLeads = async () => {
    setIsLeadLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      baseUrl = baseUrl.replace(/\/+$/, "");
      const endpoint = `${baseUrl}/lead/pagination`;
      const body = {
        page_number: "1",
        page_size: "10",
        search_type: "",
        query_search: "",
      };
      console.log("Lead API endpoint:", endpoint);
      console.log("Lead API request body:", body);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      console.log("Lead API response:", data);
      let leadsArr: unknown[] = [];
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].data)) {
        leadsArr = data[0].data;
      } else if (Array.isArray(data?.data)) {
        leadsArr = data.data;
      } else if (Array.isArray(data?.results)) {
        leadsArr = data.results;
      }
      
      // Map to MappedLead format for edit page
      const mapped = leadsArr.map((lead) => {
        const leadData = lead as Record<string, unknown>;
        const leadFullName = [leadData.first_name, leadData.last_name].filter(Boolean).join(" ").trim();
        let primaryContact = "";
        if (Array.isArray(leadData.contact_data)) {
          const allContacts = leadData.contact_data.flatMap((cd: Record<string, unknown>) => Array.isArray(cd.contact_values) ? cd.contact_values : []);
          const primary = allContacts.find((v: Record<string, unknown>) => v.is_primary && v.contact_number);
          if (primary) {
            primaryContact = String(primary.contact_number);
          } else if (allContacts.length > 0) {
            primaryContact = String(allContacts[0].contact_number || "");
          }
        }
        return {
          lead_id: String(leadData.lead_id || ""),
          lead_name: String(leadData.lead_name || leadFullName || "(No Name)"),
          primary_contact: primaryContact || "(No Contact)",
          original: leadData,
        };
      });
      setMappedLeads(mapped);
    } catch (err) {
      console.error("Lead API error:", err);
      setMappedLeads([]);
    } finally {
      setIsLeadLoading(false);
    }
  };

  const fetchStaff = async () => {
    setIsStaffLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      baseUrl = baseUrl.replace(/\/+$/, "");
      const endpoint = `${baseUrl}/staff/pagination`;
      const body = {
        page_number: "1",
        page_size: "10",
        search_type: "",
        query_search: "",
      };
      console.log("Staff API endpoint:", endpoint);
      console.log("Staff API request body:", body);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();
      console.log("Staff API response:", data);
      let staffArr: unknown[] = [];
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].data)) {
        staffArr = data[0].data;
      } else if (Array.isArray(data?.data)) {
        staffArr = data.data;
      } else if (Array.isArray(data?.results)) {
        staffArr = data.results;
      }
      
      // Map to MappedStaff format for edit page
      const mapped = staffArr.map((staff) => {
        const staffData = staff as Record<string, unknown>;
        const fullName = [staffData.first_name, staffData.last_name].filter(Boolean).join(" ").trim();
        return {
          staff_id: String(staffData.staff_id || ""),
          full_name: String(fullName || "(No Name)"),
          position: String(staffData.position || "(No Position)"),
          original: staffData,
        };
      });
      setStaffData(mapped);
    } catch (err) {
      console.error("Staff API error:", err);
      setStaffData([]);
    } finally {
      setIsStaffLoading(false);
    }
  };

  const fetchProperties = async () => {
    setIsPropertyLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      baseUrl = baseUrl.replace(/\/+$/, "");
      const endpoint = `${baseUrl}/property-profile/pagination`;
      const body = {
        page_number: "1",
        page_size: "10",
        search_type: "",
        query_search: "",
      };
      console.log("Property API endpoint:", endpoint);
      console.log("Property API request body:", body);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      console.log("Property API response:", data);
      let propertyArr: unknown[] = [];
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].data)) {
        propertyArr = data[0].data;
      } else if (Array.isArray(data?.data)) {
        propertyArr = data.data;
      } else if (Array.isArray(data?.results)) {
        propertyArr = data.results;
      }
      
      // Map to MappedProperty format for edit page
      const mapped = propertyArr.map((property) => {
        const propertyData = property as Record<string, unknown>;
        return {
          property_profile_id: String(propertyData.property_profile_id || ""),
          property_profile_name: String(propertyData.property_profile_name || propertyData.property_name || "(No Property Name)"),
          property_type_name: String(propertyData.property_type_name || ""),
          project_name: String(propertyData.project_name || ""),
          price: String(propertyData.price || ""),
          original: propertyData,
        };
      });
      setPropertiesData(mapped);
    } catch (err) {
      console.error("Property API error:", err);
      setPropertiesData([]);
    } finally {
      setIsPropertyLoading(false);
    }
  };

  // --- Fetch Call Log Data on Mount ---
  useEffect(() => {
    // Get callLogId from URL query parameter ?id=CL-000002
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || "";
    console.log("Extracted call log ID from URL query:", id);
    console.log("Full URL:", window.location.href);
    setCallLogId(id);
  }, []);

  useEffect(() => {
    if (!callLogId) return;
    const fetchCallLogData = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        baseUrl = baseUrl.replace(/\/+$/, "");
        const endpoint = `${baseUrl}/call-log/pagination`;
        const body = {
          page_number: "1",
          page_size: "10",
          search_type: "call_log_id",
          query_search: callLogId,
        };
        console.log("Making API call to:", endpoint);
        console.log("Request body:", body);
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
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
          
          // The API response has a flat structure, not nested objects
          // Lead data is directly in the log object
          console.log("Lead fields:", {
            lead_id: log.lead_id,
            lead_name: log.lead_name,
          });
          
          // Get contact data from call_log_details
          let primaryContact = "";
          if (Array.isArray(log.call_log_details) && log.call_log_details.length > 0) {
            for (const detail of log.call_log_details) {
              if (Array.isArray(detail.contact_data)) {
                for (const contactGroup of detail.contact_data) {
                  if (Array.isArray(contactGroup.contact_values)) {
                    const primary = contactGroup.contact_values.find((v: Record<string, unknown>) => v.is_primary && v.contact_number);
                    if (primary) {
                      primaryContact = String(primary.contact_number);
                      break;
                    }
                  }
                }
                if (primaryContact) break;
              }
            }
            // Fallback to first contact if no primary found
            if (!primaryContact && log.call_log_details[0]?.contact_data?.[0]?.contact_values?.[0]?.contact_number) {
              primaryContact = String(log.call_log_details[0].contact_data[0].contact_values[0].contact_number);
            }
          }
          
          const mappedLead: MappedLead = {
            lead_id: String(log.lead_id || ""),
            lead_name: log.lead_name || "(No Name)",
            primary_contact: primaryContact || "(No Contact)",
            original: log,
          };
          console.log("Mapped lead:", mappedLead);
          
          // Staff data is also directly in the log object 
          console.log("Staff fields:", {
            created_by_name: log.created_by_name,
          });
          
          const mappedStaff: MappedStaff = {
            staff_id: "", // Not available in this response
            full_name: log.created_by_name || "(No Name)",
            position: "(No Position)", // Not available in this response
            original: log,
          };
          console.log("Mapped staff:", mappedStaff);
          
          // Property data is also directly in the log object
          console.log("Property fields:", {
            property_profile_id: log.property_profile_id,
            property_profile_name: log.property_profile_name,
          });
          
          const mappedProperty: MappedProperty = {
            property_profile_id: String(log.property_profile_id || ""),
            property_profile_name: log.property_profile_name || "(No Property Name)",
            property_type_name: "", // Not available in this response
            project_name: "", // Not available in this response  
            price: "", // Not available in this response
            original: log,
          };
          console.log("Mapped property:", mappedProperty);
          
          setFormData({
            selectedLead: mappedLead,
            selectedStaff: mappedStaff,
            selectedProperty: mappedProperty,
            purpose: log.purpose || "",
          });
          
          console.log("Final formData set:", {
            selectedLead: mappedLead,
            selectedStaff: mappedStaff,
            selectedProperty: mappedProperty,
            purpose: log.purpose || "",
          });
        }
      } catch (err) {
        console.error("Call Log API error:", err);
      }
      setIsInitialLoading(false);
    };
    fetchCallLogData();
  }, [callLogId]);

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg text-gray-500">Loading call pipeline data...</span>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        {/* Call Pipeline Edit Form */}
        <ComponentCard title="Edit Call Pipeline">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            {/* Lead Selection */}
            <div>
              <Label htmlFor="selectedLead">Edit Lead *</Label>
              <div className="mt-1">
                {formData.selectedLead ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {formData.selectedLead.lead_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.selectedLead.primary_contact}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowLeadModal(true);
                        fetchLeads();
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowLeadModal(true);
                      fetchLeads();
                    }}
                    className="w-full justify-center"
                  >
                    Choose Lead
                  </Button>
                )}
              </div>
              {errors.selectedLead && (
                <p className="text-sm text-red-500 mt-1">{errors.selectedLead}</p>
              )}
            </div>

            {/* Staff Selection */}
            <div>
              <Label htmlFor="selectedStaff">Edit Staff *</Label>
              <div className="mt-1">
                {formData.selectedStaff ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {formData.selectedStaff.full_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.selectedStaff.position}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowStaffModal(true);
                        fetchStaff();
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowStaffModal(true);
                      fetchStaff();
                    }}
                    className="w-full justify-center"
                  >
                    Choose Staff
                  </Button>
                )}
              </div>
              {errors.selectedStaff && (
                <p className="text-sm text-red-500 mt-1">{errors.selectedStaff}</p>
              )}
            </div>

            {/* Property Selection */}
            <div className="lg:col-span-2">
              <Label htmlFor="selectedProperty">Edit Property *</Label>
              <div className="mt-1">
                {formData.selectedProperty ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {formData.selectedProperty.property_profile_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {formData.selectedProperty.property_profile_id}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.selectedProperty.property_type_name} •{" "}
                        {formData.selectedProperty.project_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Price: {formData.selectedProperty.price}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowPropertyModal(true);
                        fetchProperties();
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPropertyModal(true);
                      fetchProperties();
                    }}
                    className="w-full justify-center"
                  >
                    Choose Property
                  </Button>
                )}
              </div>
              {errors.selectedProperty && (
                <p className="text-sm text-red-500 mt-1">{errors.selectedProperty}</p>
              )}
            </div>
          </div>

          {/* Purpose - Full width */}
          <div className="mt-5">
            <Label htmlFor="purpose">Edit Purpose *</Label>
            <TextArea
              placeholder="Update call pipeline purpose..."
              value={formData.purpose}
              onChange={(value) => handleChange("purpose", value)}
              rows={4}
            />
            {errors.purpose && <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>}
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </ComponentCard>
      </div>

      {/* Selection Modals */}
      <SelectionModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSelect={(lead) => handleChange("selectedLead", lead)}
        title="Edit Lead"
        data={mappedLeads}
        columns={[
          { key: "lead_id", label: "ID" },
          { key: "lead_name", label: "Name" },
          { key: "primary_contact", label: "Primary Contact" },
        ]}
        searchPlaceholder="Search leads..."
        isLoading={isLeadLoading}
      />

      <SelectionModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        onSelect={(staff) => handleChange("selectedStaff", staff)}
        title="Edit Staff"
        data={staffData}
        columns={[
          { key: "staff_id", label: "ID" },
          { key: "full_name", label: "Name" },
          { key: "position", label: "Position" },
        ]}
        searchPlaceholder="Search staff..."
        isLoading={isStaffLoading}
      />

      <SelectionModal
        isOpen={showPropertyModal}
        onClose={() => setShowPropertyModal(false)}
        onSelect={(property) => handleChange("selectedProperty", property)}
        title="Edit Property"
        data={propertiesData}
        columns={[
          { key: "property_profile_id", label: "ID" },
          { key: "property_profile_name", label: "Property Name" },
          { key: "property_type_name", label: "Type" },
          { key: "project_name", label: "Project" },
          { key: "price", label: "Price" },
        ]}
        searchPlaceholder="Search properties..."
        isLoading={isPropertyLoading}
      />

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        className="max-w-md p-6"
      >
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-900/20">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
            Call Pipeline Updated Successfully!
          </h3>

          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Your call pipeline changes have been saved. What would you like to do next?
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              onClick={handleCreateAnother}
              className="flex-1"
            >
              Edit Another Pipeline
            </Button>
            <Button
              variant="primary"
              onClick={handleGoToPipeline}
              className="flex-1"
            >
              Go to Call Pipeline
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

