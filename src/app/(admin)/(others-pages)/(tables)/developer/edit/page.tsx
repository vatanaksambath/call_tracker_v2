"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import { Modal } from "@/components/ui/modal";
import { developerData } from "@/components/form/sample-data/developerData";


const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Developer", href: "/developer" },
  { name: "Edit", href: "/developer/edit" }
];

interface FormData {
  developer_name: string;
  developer_description: string;
  is_active: boolean;
}

interface FormErrors {
  developer_name?: string;
  developer_description?: string;
}

export default function EditDeveloperPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const developerId = searchParams.get('id');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [developerNotFound, setDeveloperNotFound] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    developer_name: "",
    developer_description: "",
    is_active: true
  });
  
  const [errors, setErrors] = useState<FormErrors>({});



  useEffect(() => {
    if (developerId) {
      // Simulate loading developer data
      const developer = developerData.find(d => d.developer_id === developerId);
      
      if (developer) {
        setFormData({
          developer_name: developer.developer_name,
          developer_description: developer.developer_description,
          is_active: developer.is_active
        });
        setIsLoading(false);
      } else {
        setDeveloperNotFound(true);
        setIsLoading(false);
      }
    } else {
      setDeveloperNotFound(true);
      setIsLoading(false);
    }
  }, [developerId]);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
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
    
    if (!formData.developer_name.trim()) {
      newErrors.developer_name = "Developer name is required";
    }
    
    if (!formData.developer_description.trim()) {
      newErrors.developer_description = "Description is required";
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedDeveloper = {
        developer_id: developerId,
        ...formData,
        created_date: new Date().toISOString()
      };
      
      console.log('Updating developer:', updatedDeveloper);
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating developer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/developer');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push('/developer');
  };

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Edit Developer">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading developer data...</span>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (developerNotFound) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Edit Developer">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Developer Not Found</h3>
            <p className="text-gray-600 mb-4">The developer you&apos;re looking for doesn&apos;t exist.</p>
            <Button onClick={handleCancel}>Back to Developer List</Button>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      
      <ComponentCard title="Edit Developer">
        {/* Developer Information Card */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-md dark:border-blue-900/30 dark:bg-blue-900/10 transition-colors">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3 dark:border-blue-900/40">
            <div>
              <h3 className="text-base font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                Editing Developer
              </h3>
              <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                {developerData.find(dev => dev.developer_id === developerId)?.developer_name || 'Unknown Developer'}
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
              <dt className="text-xs font-medium text-body dark:text-bodydark">Developer ID</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-black dark:text-white">
                #{developerId}
              </dd>
            </div>
            <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
              <dt className="text-xs font-medium text-body dark:text-bodydark">Last Updated</dt>
              <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                {developerData.find(dev => dev.developer_id === developerId)?.created_date || 'Not available'}
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
                  Review and update the developer information below. Changes will be saved when you submit the form.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="developer_name">Developer Name *</Label>
              <Input
                id="developer_name"
                type="text"
                value={formData.developer_name}
                onChange={(e) => handleChange('developer_name', e.target.value)}
                placeholder="Enter developer name"
                className={errors.developer_name ? 'border-red-500' : ''}
              />
              {errors.developer_name && (
                <p className="mt-1 text-sm text-red-500">{errors.developer_name}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="developer_description">Description *</Label>
            <TextArea
              value={formData.developer_description}
              onChange={(value) => handleChange('developer_description', value)}
              placeholder="Enter developer description"
              rows={4}
              className={errors.developer_description ? 'border-red-500' : ''}
            />
            {errors.developer_description && (
              <p className="mt-1 text-sm text-red-500">{errors.developer_description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="is_active">Active Status</Label>
            <div className="mt-2">
              <Switch
                checked={formData.is_active}
                onChange={(checked) => handleChange('is_active', checked)}
                label=""
              />
              <span className="ml-2 text-sm text-gray-600">
                {formData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
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
              {isSubmitting ? 'Updating...' : 'Update Developer'}
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
            Developer Updated Successfully!
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            The developer information has been updated.
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleSuccessModalClose}>
              Back to Developer List
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
