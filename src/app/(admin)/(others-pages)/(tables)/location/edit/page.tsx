"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import Select from "@/components/form/Select";
import { Modal } from "@/components/ui/modal";
import { locationData } from "@/components/form/sample-data/locationData";
import api from "@/lib/api";
import formatApiDataForSelect from "@/lib/utils";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Location", href: "/location" },
  { name: "Edit", href: "/location/edit" }
];

interface ISelectOption {
  value: string;
  label: string;
}

interface FormData {
  location_description: string;
  province: ISelectOption | null;
  district: ISelectOption | null;
  commune: ISelectOption | null;
  village: ISelectOption | null;
  is_active: boolean;
}

interface FormErrors {
  location_description?: string;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
}

export default function EditLocationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get('id');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationNotFound, setLocationNotFound] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    location_description: "",
    province: null,
    district: null,
    commune: null,
    village: null,
    is_active: true
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [provinces, setProvinces] = useState<ISelectOption[]>([]);
  const [districts, setDistricts] = useState<ISelectOption[]>([]);
  const [communes, setCommunes] = useState<ISelectOption[]>([]);
  const [villages, setVillages] = useState<ISelectOption[]>([]);

  // Load provinces on component mount
  useEffect(() => {
    api
      .get("common/address/province")
      .then(res => {
        setProvinces(formatApiDataForSelect(res.data, "province_id", "province_name"));
      })
      .catch(err => console.error("Failed to fetch provinces", err));
  }, []);

  // Load districts when province changes
  useEffect(() => {
    const provinceId = formData.province?.value;
    setDistricts([]);
    if (provinceId) {
      api
        .get(`common/address/district/${provinceId}`)
        .then(res => {
          setDistricts(formatApiDataForSelect(res.data, "district_id", "district_name"));
        })
        .catch(err => console.error("Failed to fetch districts", err));
    }
  }, [formData.province]);

  // Load communes when district changes
  useEffect(() => {
    const districtId = formData.district?.value;
    setCommunes([]);
    if (districtId) {
      api
        .get(`common/address/commune/${districtId}`)
        .then(res => {
          setCommunes(formatApiDataForSelect(res.data, "commune_id", "commune_name"));
        })
        .catch(err => console.error("Failed to fetch communes", err));
    }
  }, [formData.district]);

  // Load villages when commune changes
  useEffect(() => {
    const communeId = formData.commune?.value;
    setVillages([]);
    if (communeId) {
      api
        .get(`common/address/village/${communeId}`)
        .then(res => {
          setVillages(formatApiDataForSelect(res.data, "village_id", "village_name"));
        })
        .catch(err => console.error("Failed to fetch villages", err));
    }
  }, [formData.commune]);

  // Load location data
  useEffect(() => {
    if (locationId) {
      // Simulate loading location data
      const location = locationData.find(l => l.location_id === locationId);
      
      if (location) {
        setFormData({
          location_description: location.location_description,
          province: location.province ? { value: location.province, label: location.province } : null,
          district: location.district ? { value: location.district, label: location.district } : null,
          commune: location.commune ? { value: location.commune, label: location.commune } : null,
          village: location.village ? { value: location.village, label: location.village } : null,
          is_active: location.is_active
        });
        setIsLoading(false);
      } else {
        setLocationNotFound(true);
        setIsLoading(false);
      }
    } else {
      setLocationNotFound(true);
      setIsLoading(false);
    }
  }, [locationId]);

  const handleChange = (field: keyof FormData, value: string | boolean | ISelectOption | null) => {
    console.log("Location edit form handleChange:", field, value);
    setFormData(prev => {
      const newState = { ...prev, [field]: value };

      // Reset dependent fields when parent changes
      if (field === "province") {
        newState.district = null;
        newState.commune = null;
        newState.village = null;
      } else if (field === "district") {
        newState.commune = null;
        newState.village = null;
      } else if (field === "commune") {
        newState.village = null;
      }

      return newState;
    });
    
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
    
    if (!formData.location_description.trim()) {
      newErrors.location_description = "Description is required";
    }
    
    if (!formData.province) {
      newErrors.province = "Province is required";
    }
    
    if (!formData.district) {
      newErrors.district = "District is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Location form submit triggered");
    
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }
    
    console.log("Form validation passed, submitting...");
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedLocation = {
        location_id: locationId,
        ...formData,
        updated_date: new Date().toISOString()
      };
      
      console.log('Updating location:', updatedLocation);
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/location');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push('/location');
  };

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Edit Location">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading location...</p>
            </div>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (locationNotFound) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Edit Location">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Location Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">The location you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Button onClick={handleCancel}>Back to Location List</Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      
      <ComponentCard title="Edit Location">
        {/* Location Information Card */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-md dark:border-blue-900/30 dark:bg-blue-900/10 transition-colors">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3 dark:border-blue-900/40">
            <div>
              <h3 className="text-base font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                Editing Location
              </h3>
              <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                {locationData.find(loc => loc.location_id === locationId)?.village || 'Unknown Location'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                formData.is_active 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              }`}>
                {formData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
              <dt className="text-xs font-medium text-body dark:text-bodydark">Location ID</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-black dark:text-white">
                #{locationId}
              </dd>
            </div>
            <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
              <dt className="text-xs font-medium text-body dark:text-bodydark">Created Date</dt>
              <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                {locationData.find(loc => loc.location_id === locationId)?.created_date || 'Not available'}
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
                  Review and update the location information below. Changes will be saved when you submit the form.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Address Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Address Information</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="province">City/Province *</Label>
                  <Select
                    value={formData.province}
                    onChange={(value) => handleChange('province', value)}
                    options={provinces}
                    placeholder="Select City/Province"
                    className={errors.province ? 'border-red-500' : ''}
                  />
                  {errors.province && (
                    <p className="mt-1 text-sm text-red-500">{errors.province}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="district">District *</Label>
                  <Select
                    value={formData.district}
                    onChange={(value) => handleChange('district', value)}
                    options={districts}
                    placeholder="Select District"
                    className={errors.district ? 'border-red-500' : ''}
                  />
                  {errors.district && (
                    <p className="mt-1 text-sm text-red-500">{errors.district}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="commune">Commune</Label>
                  <Select
                    value={formData.commune}
                    onChange={(value) => handleChange('commune', value)}
                    options={communes}
                    placeholder="Select Commune"
                    className={errors.commune ? 'border-red-500' : ''}
                  />
                  {errors.commune && (
                    <p className="mt-1 text-sm text-red-500">{errors.commune}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="village">Village</Label>
                  <Select
                    value={formData.village}
                    onChange={(value) => handleChange('village', value)}
                    options={villages}
                    placeholder="Select Village"
                    className={errors.village ? 'border-red-500' : ''}
                  />
                  {errors.village && (
                    <p className="mt-1 text-sm text-red-500">{errors.village}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location_description">Description *</Label>
                <TextArea
                  value={formData.location_description}
                  onChange={(value) => handleChange('location_description', value)}
                  placeholder="Enter location description"
                  rows={4}
                  className={errors.location_description ? 'border-red-500' : ''}
                />
                {errors.location_description && (
                  <p className="mt-1 text-sm text-red-500">{errors.location_description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Status</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enable or disable this location
                </p>
              </div>
              <Switch
                label="Active"
                checked={formData.is_active}
                onChange={(checked) => handleChange("is_active", checked)}
              />
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
              {isSubmitting ? 'Updating...' : 'Update Location'}
            </Button>
          </div>
        </form>
      </ComponentCard>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={handleSuccessModalClose}>
        <div className="p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-900/20">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Location Updated Successfully!
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            The location has been updated in the system.
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleSuccessModalClose}>
              Back to Location List
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
