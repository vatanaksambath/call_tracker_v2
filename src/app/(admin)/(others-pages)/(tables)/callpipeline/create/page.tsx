"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import { Modal } from "@/components/ui/modal";
import SelectionModal from "@/components/common/SelectionModal";

// Call Pipeline Creation Form Component
export default function CallPipelineCreateForm() {
  const router = useRouter();

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Call Pipeline", href: "/callpipeline" },
    { name: "Create Pipeline" },
  ];

  // Lead type for modal selection
  type MappedLead = {
    lead_id: string;
    full_name: string;
    primary_contact: string;
    original: Record<string, unknown>;
  };
  const [formData, setFormData] = useState({
    selectedLead: null as MappedLead | null,
    selectedStaff: null as MappedStaff | null,
    selectedProperty: null as MappedProperty | null,
    purpose: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Modal states
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  // Lead API logic
  const [leadsData, setLeadsData] = useState<unknown[]>([]);
  const [isLeadLoading, setIsLeadLoading] = useState(false);
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
      let leadsArr: unknown[] = [];
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].data)) {
        leadsArr = data[0].data;
      } else if (Array.isArray(data?.data)) {
        leadsArr = data.data;
      } else if (Array.isArray(data?.results)) {
        leadsArr = data.results;
      }
      setLeadsData(leadsArr);
    } catch (err) {
      console.error("Lead API error:", err);
      setLeadsData([]);
    } finally {
      setIsLeadLoading(false);
    }
  };

  // Staff type for modal selection
  type MappedStaff = {
    staff_id: number;
    full_name: string;
    position: string;
    original: Record<string, unknown>;
  };
  const [staffData, setStaffData] = useState<MappedStaff[]>([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
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
      let staffArr: unknown[] = [];
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].data)) {
        staffArr = data[0].data;
      } else if (Array.isArray(data?.data)) {
        staffArr = data.data;
      } else if (Array.isArray(data?.results)) {
        staffArr = data.results;
      }
      // Map to MappedStaff
      const mapped = staffArr.map((staff) => {
        const s = staff as Record<string, unknown>;
        const fullName = [s.first_name, s.last_name].filter(Boolean).join(" ").trim();
        return {
          staff_id: s.staff_id as number,
          full_name: fullName || "(No Name)",
          position: (s.position as string) || "(No Position)",
          original: staff as Record<string, unknown>,
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

  // Property type for modal selection
  type MappedProperty = {
    property_profile_id: number;
    property_type_name: string;
    project_name: string;
    price: number;
    original: Record<string, unknown>;
  };
  const [propertiesData, setPropertiesData] = useState<MappedProperty[]>([]);
  const [isPropertyLoading, setIsPropertyLoading] = useState(false);
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
      let propertyArr: unknown[] = [];
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].data)) {
        propertyArr = data[0].data;
      } else if (Array.isArray(data?.data)) {
        propertyArr = data.data;
      } else if (Array.isArray(data?.results)) {
        propertyArr = data.results;
      }
      // Map to MappedProperty
      const mapped = propertyArr.map((property) => {
        const p = property as Record<string, unknown>;
        return {
          property_profile_id: p.property_profile_id as number,
          property_type_name: p.property_type_name as string,
          project_name: p.project_name as string,
          price: p.price as number,
          original: property as Record<string, unknown>,
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

  const handleChange = (
    field: keyof typeof formData,
    value: MappedLead | MappedStaff | MappedProperty | string | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.selectedLead) newErrors.selectedLead = "Lead selection is required.";
    if (!formData.selectedStaff) newErrors.selectedStaff = "Staff selection is required.";
    if (!formData.selectedProperty) newErrors.selectedProperty = "Property selection is required.";
    if (!formData.purpose.trim()) newErrors.purpose = "Purpose is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      // Build payload for API
      const payload = {
        lead_id: String((formData.selectedLead?.original as { lead_id?: string })?.lead_id ?? ""),
        property_profile_id: String((formData.selectedProperty?.original as { property_profile_id?: number })?.property_profile_id ?? ""),
        status_id: "1",
        purpose: String(formData.purpose ?? ""),
        follow_up_date: null,
        fail_reason: null,
        is_follow_up: true,
        p_call_log_detail: [],
        created_by: String((formData.selectedStaff?.original as { staff_id?: number })?.staff_id ?? ""),
      };
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${apiBase}/call-log/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        throw new Error("Failed to create call pipeline");
      }
    } catch (error) {
      console.error('Error creating call pipeline:', error);
      alert("Failed to save call pipeline. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/callpipeline");
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    // Reset form data
    setFormData({
      selectedLead: null,
      selectedStaff: null,
      selectedProperty: null,
      purpose: "",
    });
    setErrors({});
  };

  const handleGoToPipeline = () => {
    setShowSuccessModal(false);
    router.push("/callpipeline");
  };

  // Map leads data to include full name and primary contact
  const mappedLeads = Array.isArray(leadsData)
    ? leadsData.map((lead: unknown) => {
        const l = lead as {
          lead_id?: string;
          first_name?: string;
          last_name?: string;
          contact_data?: Array<{
            contact_values?: Array<{
              user_name?: string;
              contact_number?: string;
              remark?: string;
              is_primary?: boolean;
            }>;
          }>;
        };
        let primaryContact = "";
        if (Array.isArray(l.contact_data)) {
          const allContacts = l.contact_data.flatMap((cd) =>
            Array.isArray(cd.contact_values) ? cd.contact_values : []
          );
          const primary = allContacts.find((v) => v.is_primary && v.contact_number);
          if (primary) {
            primaryContact = String(primary.contact_number);
          } else if (allContacts.length > 0) {
            primaryContact = String(allContacts[0].contact_number || "");
          }
        }
        const fullName = [l.first_name, l.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        return {
          lead_id: String(l.lead_id || ""),
          full_name: fullName || "(No Name)",
          primary_contact: primaryContact || "(No Contact)",
          original: lead as Record<string, unknown>,
        };
      })
    : [];

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        {/* Call Pipeline Creation Form */}
        <ComponentCard title="Create New Call Pipeline">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            {/* Lead Selection */}
            <div>
              <Label htmlFor="selectedLead">Select Lead *</Label>
              <div className="mt-1">
                {formData.selectedLead ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {formData.selectedLead.full_name}
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
              <Label htmlFor="selectedStaff">Select Staff *</Label>
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
                      onClick={() => setShowStaffModal(true)}
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
              <Label htmlFor="selectedProperty">Select Property *</Label>
              <div className="mt-1">
                {formData.selectedProperty ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {formData.selectedProperty.property_profile_id}
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
            <Label htmlFor="purpose">Purpose *</Label>
            <TextArea
              placeholder="Enter call pipeline purpose..."
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
              {isSubmitting ? "Creating..." : "Create Pipeline"}
            </Button>
          </div>
        </ComponentCard>
      </div>

      {/* Selection Modals */}
      <SelectionModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSelect={(lead) => handleChange("selectedLead", lead)}
        title="Select Lead"
        data={mappedLeads}
        columns={[
          { key: "lead_id", label: "ID" },
          { key: "full_name", label: "Name" },
          { key: "primary_contact", label: "Primary Contact" },
        ]}
        searchPlaceholder="Search leads..."
        isLoading={isLeadLoading}
      />

      <SelectionModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        onSelect={(staff) => handleChange("selectedStaff", staff)}
        title="Select Staff"
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
        title="Select Property"
        data={propertiesData}
        columns={[
          { key: "property_profile_id", label: "ID" },
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
            Call Pipeline Created Successfully!
          </h3>

          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Your new call pipeline has been created and is ready for use. What would you like to do next?
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              onClick={handleCreateAnother}
              className="flex-1"
            >
              Create Another Pipeline
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
