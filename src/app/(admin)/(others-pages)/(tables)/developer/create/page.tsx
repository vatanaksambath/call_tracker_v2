"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import { Modal } from "@/components/ui/modal";


const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Developer", href: "/developer" },
  { name: "Create", href: "/developer/create" }
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

export default function CreateDeveloperPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    developer_name: "",
    developer_description: "",
    is_active: true
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    console.log("Developer form handleChange:", field, value);
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
    console.log("Developer form submit triggered");
    
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }
    
    console.log("Form validation passed, submitting...");
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newDeveloper = {
        developer_id: Date.now().toString(),
        ...formData,
        created_date: new Date().toISOString()
      };
      
      console.log('Creating developer:', newDeveloper);
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating developer:', error);
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

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      
      <ComponentCard title="Create Developer">
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
              {isSubmitting ? 'Creating...' : 'Create Developer'}
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
            Developer Created Successfully!
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            The developer has been added to the system.
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
