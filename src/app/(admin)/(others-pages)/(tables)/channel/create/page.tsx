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
  { name: "Channel", href: "/channel" },
  { name: "Create", href: "/channel/create" }
];

interface FormData {
  channel_type_name: string;
  channel_type_description: string;
  is_active: boolean;
}

interface FormErrors {
  channel_type_name?: string;
  channel_type_description?: string;
}

export default function CreateChannelPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    channel_type_name: "",
    channel_type_description: "",
    is_active: true
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.channel_type_name.trim()) {
      newErrors.channel_type_name = "Channel name is required";
    }
    if (!formData.channel_type_description.trim()) {
      newErrors.channel_type_description = "Description is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSuccessModal(true);
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/channel');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push('/channel');
  };

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <ComponentCard title="Create Channel">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="channel_type_name">Channel Name *</Label>
            <Input
              id="channel_type_name"
              value={formData.channel_type_name}
              onChange={e => handleChange('channel_type_name', e.target.value)}
              placeholder="Enter channel name"
              className={errors.channel_type_name ? 'border-red-500' : ''}
            />
            {errors.channel_type_name && <p className="mt-1 text-sm text-red-500">{errors.channel_type_name}</p>}
          </div>
          <div>
            <Label htmlFor="channel_type_description">Description *</Label>
            <TextArea
              value={formData.channel_type_description}
              onChange={value => handleChange('channel_type_description', value)}
              placeholder="Enter channel description"
              rows={4}
              className={errors.channel_type_description ? 'border-red-500' : ''}
            />
            {errors.channel_type_description && <p className="mt-1 text-sm text-red-500">{errors.channel_type_description}</p>}
          </div>
          <div>
            <Label htmlFor="is_active">Active Status</Label>
            <div className="mt-2">
              <Switch
                checked={formData.is_active}
                onChange={checked => handleChange('is_active', checked)}
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
              {isSubmitting ? 'Creating...' : 'Create Channel'}
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
            Channel Created Successfully!
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            The channel has been added to the system.
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleSuccessModalClose}>
              Back to Channel List
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
