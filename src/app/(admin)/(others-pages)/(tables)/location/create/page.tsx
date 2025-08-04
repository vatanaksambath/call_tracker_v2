"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import Select from "@/components/form/Select";
import { Modal } from "@/components/ui/modal";
import api from "@/lib/api";
import formatApiDataForSelect from "@/lib/utils";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Location", href: "/location" },
  { name: "Create", href: "/location/create" }
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

export default function CreateLocationPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleChange = (field: keyof FormData, value: string | boolean | ISelectOption | null) => {
    console.log("Location form handleChange:", field, value);
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
      
      const newLocation = {
        location_id: Date.now().toString(),
        ...formData,
        created_date: new Date().toISOString()
      };
      
      console.log('Creating location:', newLocation);
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating location:', error);
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

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      
      <ComponentCard title="Create Location">
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
              {isSubmitting ? 'Creating...' : 'Create Location'}
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
            Location Created Successfully!
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            The location has been added to the system.
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
