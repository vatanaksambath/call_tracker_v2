"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import { Modal } from "@/components/ui/modal";
import Address, { IAddress } from "@/components/form/Address";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Property", href: "/property" },
  { name: "Edit", href: "/property/edit" }
];


interface ISelectOption {
  value: string;
  label: string;
}

interface FormData {
  property_profile_id: string;
  PropertyName: string;
  Location: IAddress;
  PropertyType: ISelectOption | null;
  Project: ISelectOption | null;
  ProjectOwner: ISelectOption | null;
  Price: string;
  Description: string;
  Features: string;
  Bedrooms: string;
  Bathrooms: string;
  YearBuilt: string;
  Width: string;
  Length: string;
  Area: string;
  Status: ISelectOption | null;
}

interface FormErrors {
  PropertyName?: string;
  Location?: string;
  PropertyType?: string;
  Project?: string;
  Price?: string;
  Description?: string;
  Features?: string;
  Bedrooms?: string;
  Bathrooms?: string;
  YearBuilt?: string;
  Width?: string;
  Length?: string;
}

interface FormData {
  PropertyName: string;
  Location: IAddress;
  PropertyType: ISelectOption | null;
  Status: ISelectOption | null;
  Price: string;
  Description: string;
  Features: string;
  Bedrooms: string;
  Bathrooms: string;
  Area: string;
  YearBuilt: string;
}

interface FormErrors {
  PropertyName?: string;
  Location?: string;
  PropertyType?: string;
  Price?: string;
  Status?: string;
  Description?: string;
  Features?: string;
  Bedrooms?: string;
  Bathrooms?: string;
  Area?: string;
  YearBuilt?: string;
}


export default function EditPropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectOptions, setProjectOptions] = useState<ISelectOption[]>([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<ISelectOption[]>([]);
  const [projectOwnerOptions, setProjectOwnerOptions] = useState<ISelectOption[]>([]);

  // Status Options
  const statusOptions: ISelectOption[] = [
    { value: "Available", label: "Available" },
    { value: "Reserved", label: "Reserved" },
    { value: "Sold", label: "Sold" },
    { value: "Under Construction", label: "Under Construction" },
    { value: "Maintenance", label: "Maintenance" },
  ];

  // Fetch dropdowns and property data
  useEffect(() => {
    async function fetchDropdownsAndData() {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Fetch project options
      try {
        const res = await fetch(`${apiBase}/project/pagination`, {
          method: "POST",
          headers,
          body: JSON.stringify({ page_number: "1", page_size: "100" })
        });
        const data = await res.json();
        const apiResult = data[0];
        if (apiResult && apiResult.data) {
          setProjectOptions(apiResult.data.map((proj: unknown) => {
            const p = proj as Record<string, unknown>;
            return { value: String(p.project_id), label: p.project_name as string };
          }));
        }
      } catch {}
      // Fetch property type options
      try {
        const res = await fetch(`${apiBase}/property-type/pagination`, {
          method: "POST",
          headers,
          body: JSON.stringify({ page_number: "1", page_size: "100" })
        });
        const data = await res.json();
        const apiResult = data[0];
        if (apiResult && apiResult.data) {
          setPropertyTypeOptions(apiResult.data.map((type: unknown) => {
            const t = type as Record<string, unknown>;
            return { value: String(t.property_type_id), label: t.property_type_name as string };
          }));
        }
      } catch {}
      // Fetch project owner options (if needed)
      try {
        const res = await fetch(`${apiBase}/project-owner/pagination`, {
          method: "POST",
          headers,
          body: JSON.stringify({ page_number: "1", page_size: "100" })
        });
        const data = await res.json();
        const apiResult = data[0];
        if (apiResult && apiResult.data) {
          setProjectOwnerOptions(apiResult.data.map((owner: unknown) => {
            const o = owner as Record<string, unknown>;
            return { value: String(o.project_owner_id), label: o.project_owner_name as string };
          }));
        }
      } catch {}

      // Fetch property data
      if (!propertyId) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${apiBase}/property-profile/pagination`, {
          method: "POST",
          headers,
          body: JSON.stringify({ page_number: "1", page_size: "10", search_type: "property_profile_id", query_search: propertyId })
        });
        const data = await res.json();
        const apiResult = data[0];
        if (!apiResult || !apiResult.data || !apiResult.data[0]) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const prop = apiResult.data[0];
        setFormData({
          property_profile_id: String(prop.property_profile_id),
          PropertyName: prop.property_profile_name || '',
          Location: {
            province: prop.province_id ? { value: String(prop.province_id), label: prop.province_name } : null,
            district: prop.district_id ? { value: String(prop.district_id), label: prop.district_name } : null,
            commune: prop.commune_id ? { value: String(prop.commune_id), label: prop.commune_name } : null,
            village: prop.village_id ? { value: String(prop.village_id), label: prop.village_name } : null,
            homeAddress: prop.home_number || '',
            streetAddress: prop.street_address || '',
          },
          PropertyType: prop.property_type_id ? { value: String(prop.property_type_id), label: prop.property_type_name } : null,
          Project: prop.project_id ? { value: String(prop.project_id), label: prop.project_name } : null,
          ProjectOwner: prop.project_owner_id ? { value: String(prop.project_owner_id), label: prop.project_owner_name } : null,
          Price: prop.price ? String(prop.price) : '',
          Description: prop.description || '',
          Features: prop.feature || '',
          Bedrooms: prop.bedroom ? String(prop.bedroom) : '',
          Bathrooms: prop.bathroom ? String(prop.bathroom) : '',
          YearBuilt: prop.year_built ? String(prop.year_built) : '',
          Width: prop.width ? String(prop.width) : '',
          Length: prop.length ? String(prop.length) : '',
          Area: prop.area ? String(prop.area) : '',
          Status: prop.is_active ? { value: "Available", label: "Available" } : null,
        });
        setLoading(false);
      } catch {
        setNotFound(true);
        setLoading(false);
      }
    }
    fetchDropdownsAndData();
  }, [propertyId]);


  // Handlers
  const handleChange = (field: keyof FormData, value: unknown) => {
    if (!formData) return;
    setFormData((prev) => prev ? { ...prev, [field]: value } : prev);
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleAddressSave = (value: IAddress) => {
    if (!formData) return;
    setFormData((prev) => prev ? { ...prev, Location: value } : prev);
    setFormErrors((prev) => ({ ...prev, Location: undefined }));
  };

  const validate = (): boolean => {
    if (!formData) return false;
    const errors: FormErrors = {};
    if (!formData.PropertyName) errors.PropertyName = 'Property name is required';
    if (!formData.Location || !formData.Location.province) errors.Location = 'Province is required';
    if (!formData.PropertyType) errors.PropertyType = 'Property type is required';
    if (!formData.Project) errors.Project = 'Project is required';
    if (!formData.Price) errors.Price = 'Price is required';
    if (!formData.Description) errors.Description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !formData) return;
    setIsSubmitting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const payload = {
        property_profile_id: String(formData.property_profile_id),
        property_type_id: String(formData.PropertyType?.value || ""),
        project_id: String(formData.Project?.value || ""),
        project_owner_id: String(formData.ProjectOwner?.value || ""),
        village_id: String(formData.Location.village?.value || ""),
        property_profile_name: String(formData.PropertyName || ""),
        home_number: String(formData.Location.homeAddress || ""),
        room_number: String(formData.Bedrooms || ""),
        address: String(formData.Location.province?.label || ""),
        width: String(formData.Width || ""),
        length: String(formData.Length || ""),
        price: String(formData.Price || ""),
        bedroom: String(formData.Bedrooms || ""),
        bathroom: String(formData.Bathrooms || ""),
        year_built: String(formData.YearBuilt || ""),
        description: String(formData.Description || ""),
        feature: String(formData.Features || ""),
        is_active: true
      };
      const bodyString = JSON.stringify(payload);
      console.log("Property Update Payload (JSON string):", bodyString);
      const response = await fetch(`${apiBase}/property-profile/update`, {
        method: "POST",
        headers,
        body: bodyString
      });
      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        throw new Error("Failed to update property");
      }
    } catch (error) {
      console.error('Error updating property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render branches
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading property data...</span>
      </div>
    );
  }

  if (notFound || !formData) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Property Not Found</h3>
        <p className="text-gray-600 mb-4">The property you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.push('/property')}>Back to Property List</Button>
      </div>
    );
  }

  // Grouped form layout (like create page)
  if (!formData) return null;
  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <ComponentCard title="Edit Property">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">General Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="PropertyName">Property Name *</Label>
                <Input
                  id="PropertyName"
                  type="text"
                  value={formData.PropertyName}
                  onChange={(e) => handleChange('PropertyName', e.target.value)}
                  placeholder="Enter property name"
                  className={formErrors.PropertyName ? 'border-red-500' : ''}
                />
                {formErrors.PropertyName && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.PropertyName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="PropertyType">Property Type *</Label>
                <Select
                  value={formData.PropertyType}
                  onChange={(value) => handleChange('PropertyType', value)}
                  options={propertyTypeOptions}
                  placeholder="Select Property Type"
                  className={formErrors.PropertyType ? 'border-red-500' : ''}
                />
                {formErrors.PropertyType && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.PropertyType}</p>
                )}
              </div>
              <div>
                <Label htmlFor="Project">Project *</Label>
                <Select
                  value={formData.Project}
                  onChange={(value) => handleChange('Project', value)}
                  options={projectOptions}
                  placeholder="Select Project"
                  className={formErrors.Project ? 'border-red-500' : ''}
                />
                {formErrors.Project && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.Project}</p>
                )}
              </div>
              <div>
                <Label htmlFor="ProjectOwner">Project Owner</Label>
                <Select
                  value={formData.ProjectOwner}
                  onChange={(value) => handleChange('ProjectOwner', value)}
                  options={projectOwnerOptions}
                  placeholder="Select Project Owner"
                />
              </div>
              <div>
                <Label htmlFor="Price">Price *</Label>
                <Input
                  id="Price"
                  type="text"
                  value={formData.Price}
                  onChange={(e) => handleChange('Price', e.target.value)}
                  placeholder="Enter price"
                  className={formErrors.Price ? 'border-red-500' : ''}
                />
                {formErrors.Price && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.Price}</p>
                )}
              </div>
              <div>
                <Label htmlFor="Status">Status</Label>
                <Select
                  value={formData.Status}
                  onChange={(value) => handleChange('Status', value)}
                  options={statusOptions}
                  placeholder="Select Status"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Location</h4>
            <Address
              value={formData.Location}
              onSave={handleAddressSave}
              error={formErrors.Location}
              label="Location *"
            />
          </div>

          {/* Property Details */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Property Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="Width">Width</Label>
                <Input
                  id="Width"
                  type="text"
                  value={formData.Width}
                  onChange={(e) => handleChange('Width', e.target.value)}
                  placeholder="Enter width"
                  className={formErrors.Width ? 'border-red-500' : ''}
                />
                {formErrors.Width && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.Width}</p>
                )}
              </div>
              <div>
                <Label htmlFor="Length">Length</Label>
                <Input
                  id="Length"
                  type="text"
                  value={formData.Length}
                  onChange={(e) => handleChange('Length', e.target.value)}
                  placeholder="Enter length"
                  className={formErrors.Length ? 'border-red-500' : ''}
                />
                {formErrors.Length && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.Length}</p>
                )}
              </div>
              <div>
                <Label htmlFor="Area">Area (sq ft)</Label>
                <Input
                  id="Area"
                  type="text"
                  value={formData.Area}
                  onChange={(e) => handleChange('Area', e.target.value)}
                  placeholder="Enter area in square feet"
                />
              </div>
              <div>
                <Label htmlFor="Bedrooms">Bedrooms</Label>
                <Input
                  id="Bedrooms"
                  type="number"
                  value={formData.Bedrooms}
                  onChange={(e) => handleChange('Bedrooms', e.target.value)}
                  placeholder="Number of bedrooms"
                />
              </div>
              <div>
                <Label htmlFor="Bathrooms">Bathrooms</Label>
                <Input
                  id="Bathrooms"
                  type="number"
                  value={formData.Bathrooms}
                  onChange={(e) => handleChange('Bathrooms', e.target.value)}
                  placeholder="Number of bathrooms"
                />
              </div>
              <div>
                <Label htmlFor="YearBuilt">Year Built</Label>
                <Input
                  id="YearBuilt"
                  type="number"
                  value={formData.YearBuilt}
                  onChange={(e) => handleChange('YearBuilt', e.target.value)}
                  placeholder="Year property was built"
                />
              </div>
            </div>
          </div>

          {/* Features & Description */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Features & Description</h4>
            <div className="space-y-6">
              <div>
                <Label htmlFor="Description">Description *</Label>
                <TextArea
                  value={formData.Description}
                  onChange={(value) => handleChange('Description', value)}
                  placeholder="Enter property description"
                  rows={4}
                  className={formErrors.Description ? 'border-red-500' : ''}
                />
                {formErrors.Description && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.Description}</p>
                )}
              </div>
              <div>
                <Label htmlFor="Features">Features & Amenities</Label>
                <TextArea
                  value={formData.Features}
                  onChange={(value) => handleChange('Features', value)}
                  placeholder="Enter property features and amenities (e.g., Pool, Gym, Parking, etc.)"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/property')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </ComponentCard>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={() => { setShowSuccessModal(false); router.push('/property'); }}>
        <div className="p-6 text-center max-w-md mx-auto">
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-900/20">
            <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            Property Profile Updated!
          </h3>
          <p className="mb-2 text-gray-700 dark:text-gray-300">
            The property profile has been successfully updated.
          </p>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            You can now view or manage this property profile in the property list.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => { setShowSuccessModal(false); router.push('/property'); }} className="px-6 py-2 rounded-lg">
              Back to Property List
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
