"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  { name: "Create", href: "/property/create" }
];

interface ISelectOption {
  value: string;
  label: string;
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
  Project: ISelectOption | null;
  Width: string;
  Length: string;
}

interface FormErrors {
  PropertyName?: string;
  Location?: string;
  PropertyType?: string;
  Status?: string;
  Price?: string;
  Description?: string;
  Features?: string;
  Bedrooms?: string;
  Bathrooms?: string;
  Area?: string;
  YearBuilt?: string;
  Project?: string;
  Width?: string;
  Length?: string;
}

export default function CreatePropertyPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedProfileId, setSavedProfileId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    PropertyName: "",
    Location: {
      province: null,
      district: null,
      commune: null,
      village: null,
      homeAddress: "",
      streetAddress: ""
    },
    PropertyType: null,
    Status: null,
    Price: "",
    Description: "",
    Features: "",
    Bedrooms: "",
    Bathrooms: "",
    Area: "",
    YearBuilt: "",
    Project: null,
    Width: "",
    Length: "",
  });
  // Project Options (fetched from API)
  const [projectOptions, setProjectOptions] = useState<ISelectOption[]>([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState<ISelectOption[]>([]);
  React.useEffect(() => {
    async function fetchDropdowns() {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      // Fetch projects
      try {
        const response = await fetch(`${apiBase}/project/pagination`, {
          method: "POST",
          headers,
          body: JSON.stringify({ page_number: "1", page_size: "100" })
        });
        const data = await response.json();
        console.log("Project API response:", data);
        const apiResult = data[0];
        if (apiResult && apiResult.data) {
          setProjectOptions(apiResult.data.map((proj: { project_id: string, project_name: string }) => ({ value: proj.project_id, label: proj.project_name })));
        }
      } catch (err) {
        console.error("Project API error:", err);
        setProjectOptions([]);
      }
      // Fetch property types
      try {
        const response = await fetch(`${apiBase}/property-type/pagination`, {
          method: "POST",
          headers,
          body: JSON.stringify({ page_number: "1", page_size: "100" })
        });
        const data = await response.json();
        console.log("Property Type API response:", data);
        const apiResult = data[0];
        if (apiResult && apiResult.data) {
          setPropertyTypeOptions(apiResult.data.map((type: { property_type_id: string, property_type_name: string }) => ({ value: type.property_type_id, label: type.property_type_name })));
        }
      } catch (err) {
        console.error("Property Type API error:", err);
        setPropertyTypeOptions([]);
      }
    }
    fetchDropdowns();
  }, []);
  
  const [errors, setErrors] = useState<FormErrors>({});


  // Status Options
  const statusOptions: ISelectOption[] = [
    { value: "Available", label: "Available" },
    { value: "Reserved", label: "Reserved" },
    { value: "Sold", label: "Sold" },
    { value: "Under Construction", label: "Under Construction" },
    { value: "Maintenance", label: "Maintenance" },
  ];

  const handleChange = (field: keyof FormData, value: string | boolean | ISelectOption | null | IAddress) => {
    console.log("Property form handleChange:", field, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    // Property Name
    if (!formData.PropertyName.trim()) {
      newErrors.PropertyName = "Property name is required";
    } else if (formData.PropertyName.length < 3) {
      newErrors.PropertyName = "Property name must be at least 3 characters";
    }
    // Location
    if (!formData.Location.province || !formData.Location.district || !formData.Location.commune || !formData.Location.village) {
      newErrors.Location = "Complete location is required";
    }
    // Property Type
    if (!formData.PropertyType) {
      newErrors.PropertyType = "Property type is required";
    }
    // Project
    if (!formData.Project) {
      newErrors.Project = "Project is required";
    }
    // Status
    if (!formData.Status) {
      newErrors.Status = "Status is required";
    }
    // Price
    if (!formData.Price.trim()) {
      newErrors.Price = "Price is required";
    } else if (isNaN(Number(formData.Price.replace(/[^\d.]/g, "")))) {
      newErrors.Price = "Price must be a valid number";
    }
    // Description
    if (!formData.Description.trim()) {
      newErrors.Description = "Description is required";
    } else if (formData.Description.length < 10) {
      newErrors.Description = "Description must be at least 10 characters";
    }
    // Features
    if (formData.Features && formData.Features.length < 3) {
      newErrors.Features = "Features must be at least 3 characters";
    }
    // Bedrooms
    if (formData.Bedrooms && (isNaN(Number(formData.Bedrooms)) || Number(formData.Bedrooms) < 0)) {
      newErrors.Bedrooms = "Bedrooms must be a non-negative number";
    }
    // Bathrooms
    if (formData.Bathrooms && (isNaN(Number(formData.Bathrooms)) || Number(formData.Bathrooms) < 0)) {
      newErrors.Bathrooms = "Bathrooms must be a non-negative number";
    }
    // Area
    if (formData.Area && (isNaN(Number(formData.Area)) || Number(formData.Area) < 0)) {
      newErrors.Area = "Area must be a non-negative number";
    }
    // Year Built
    if (formData.YearBuilt && (isNaN(Number(formData.YearBuilt)) || Number(formData.YearBuilt) < 1800 || Number(formData.YearBuilt) > new Date().getFullYear())) {
      newErrors.YearBuilt = `Year built must be between 1800 and ${new Date().getFullYear()}`;
    }
    // Width
    if (formData.Width && (isNaN(Number(formData.Width)) || Number(formData.Width) < 0)) {
      newErrors.Width = "Width must be a non-negative number";
    }
    // Length
    if (formData.Length && (isNaN(Number(formData.Length)) || Number(formData.Length) < 0)) {
      newErrors.Length = "Length must be a non-negative number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // Build payload for API
      const payload = {
        property_type_id: String(formData.PropertyType?.value || ""),
        project_id: String(formData.Project?.value || ""),
        project_owner_id: "3", // TODO: Replace with actual owner selection if needed
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
      };
      console.log("Property Create Payload:", payload);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${apiBase}/property-profile/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        // Try to get the new profile id from the response
        let newId: string | null = null;
        try {
          const resData = await response.json();
          // Try common patterns for id
          newId = resData?.property_profile_id || resData?.id || resData?.data?.property_profile_id || null;
        } catch {}
        setSavedProfileId(newId);
        setShowSuccessModal(true);
      } else {
        throw new Error("Failed to create property");
      }
    } catch (error) {
      console.error('Error creating property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/property');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push('/property');
  };

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      

      <ComponentCard title="Create Property">
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
                  className={errors.PropertyName ? 'border-red-500' : ''}
                />
                {errors.PropertyName && (
                  <p className="mt-1 text-sm text-red-500">{errors.PropertyName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="PropertyType">Property Type *</Label>
                <Select
                  value={formData.PropertyType}
                  onChange={(value) => handleChange('PropertyType', value)}
                  options={propertyTypeOptions}
                  placeholder="Select Property Type"
                  className={errors.PropertyType ? 'border-red-500' : ''}
                />
                {errors.PropertyType && (
                  <p className="mt-1 text-sm text-red-500">{errors.PropertyType}</p>
                )}
              </div>
              <div>
                <Label htmlFor="Project">Project *</Label>
                <Select
                  value={formData.Project}
                  onChange={(value) => handleChange('Project', value)}
                  options={projectOptions}
                  placeholder="Select Project"
                  className={errors.Project ? 'border-red-500' : ''}
                />
                {errors.Project && (
                  <p className="mt-1 text-sm text-red-500">{errors.Project}</p>
                )}
              </div>
              <div>
                <Label htmlFor="Status">Status *</Label>
                <Select
                  value={formData.Status}
                  onChange={(value) => handleChange('Status', value)}
                  options={statusOptions}
                  placeholder="Select Status"
                  className={errors.Status ? 'border-red-500' : ''}
                />
                {errors.Status && (
                  <p className="mt-1 text-sm text-red-500">{errors.Status}</p>
                )}
              </div>
              <div>
                <Label htmlFor="Price">Price *</Label>
                <Input
                  id="Price"
                  type="text"
                  value={formData.Price}
                  onChange={(e) => handleChange('Price', e.target.value)}
                  placeholder="Enter price (e.g., $500,000)"
                  className={errors.Price ? 'border-red-500' : ''}
                />
                {errors.Price && (
                  <p className="mt-1 text-sm text-red-500">{errors.Price}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Location</h4>
            <Address
              value={formData.Location}
              onSave={(address) => handleChange('Location', address)}
              error={errors.Location}
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
                  className={errors.Width ? 'border-red-500' : ''}
                />
                {errors.Width && (
                  <p className="mt-1 text-sm text-red-500">{errors.Width}</p>
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
                  className={errors.Length ? 'border-red-500' : ''}
                />
                {errors.Length && (
                  <p className="mt-1 text-sm text-red-500">{errors.Length}</p>
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
                  className={errors.Area ? 'border-red-500' : ''}
                />
                {errors.Area && (
                  <p className="mt-1 text-sm text-red-500">{errors.Area}</p>
                )}
              </div>
              <div>
                <Label htmlFor="Bedrooms">Bedrooms</Label>
                <Input
                  id="Bedrooms"
                  type="number"
                  value={formData.Bedrooms}
                  onChange={(e) => handleChange('Bedrooms', e.target.value)}
                  placeholder="Number of bedrooms"
                  className={errors.Bedrooms ? 'border-red-500' : ''}
                />
                {errors.Bedrooms && (
                  <p className="mt-1 text-sm text-red-500">{errors.Bedrooms}</p>
                )}
              </div>
              <div>
                <Label htmlFor="Bathrooms">Bathrooms</Label>
                <Input
                  id="Bathrooms"
                  type="number"
                  value={formData.Bathrooms}
                  onChange={(e) => handleChange('Bathrooms', e.target.value)}
                  placeholder="Number of bathrooms"
                  className={errors.Bathrooms ? 'border-red-500' : ''}
                />
                {errors.Bathrooms && (
                  <p className="mt-1 text-sm text-red-500">{errors.Bathrooms}</p>
                )}
              </div>
              <div>
                <Label htmlFor="YearBuilt">Year Built</Label>
                <Input
                  id="YearBuilt"
                  type="number"
                  value={formData.YearBuilt}
                  onChange={(e) => handleChange('YearBuilt', e.target.value)}
                  placeholder="Year property was built"
                  className={errors.YearBuilt ? 'border-red-500' : ''}
                />
                {errors.YearBuilt && (
                  <p className="mt-1 text-sm text-red-500">{errors.YearBuilt}</p>
                )}
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
                  className={errors.Description ? 'border-red-500' : ''}
                />
                {errors.Description && (
                  <p className="mt-1 text-sm text-red-500">{errors.Description}</p>
                )}
              </div>
              <div>
                <Label htmlFor="Features">Features & Amenities</Label>
                <TextArea
                  value={formData.Features}
                  onChange={(value) => handleChange('Features', value)}
                  placeholder="Enter property features and amenities (e.g., Pool, Gym, Parking, etc.)"
                  rows={3}
                  className={errors.Features ? 'border-red-500' : ''}
                />
                {errors.Features && (
                  <p className="mt-1 text-sm text-red-500">{errors.Features}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Property'}
            </Button>
          </div>
        </form>
      </ComponentCard>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={handleSuccessModalClose}>
        <div className="p-6 text-center max-w-md mx-auto">
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-900/20">
            <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            Property Profile Created!
          </h3>
          <p className="mb-2 text-gray-700 dark:text-gray-300">
            The property profile has been successfully added to the system.
          </p>
          {savedProfileId && (
            <div className="mb-4">
              <span className="block text-sm text-gray-500 dark:text-gray-400">Profile ID:</span>
              <span className="text-lg font-semibold text-green-700 dark:text-green-400">{savedProfileId}</span>
            </div>
          )}
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            You can now view or manage this property profile in the property list.
          </p>
          <div className="flex justify-center">
            <Button onClick={handleSuccessModalClose} className="px-6 py-2 rounded-lg">
              Back to Property List
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
