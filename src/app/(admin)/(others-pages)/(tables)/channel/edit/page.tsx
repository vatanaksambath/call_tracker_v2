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
import { channelData } from "@/components/form/sample-data/channelData";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Channel", href: "/channel" },
  { name: "Edit", href: "/channel/edit" }
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

export default function EditChannelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelId = searchParams.get('id');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [channelNotFound, setChannelNotFound] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    channel_type_name: "",
    channel_type_description: "",
    is_active: true
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Load channel data
  useEffect(() => {
    if (channelId) {
      const foundChannel = channelData.find(ch => ch.channel_type_id === channelId);
      if (foundChannel) {
        setFormData({
          channel_type_name: foundChannel.channel_type_name,
          channel_type_description: foundChannel.channel_type_description,
          is_active: foundChannel.is_active
        });
        setIsLoading(false);
      } else {
        setChannelNotFound(true);
        setIsLoading(false);
      }
    } else {
      setChannelNotFound(true);
      setIsLoading(false);
    }
  }, [channelId]);

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

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Edit Channel">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading channel...</p>
            </div>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (channelNotFound) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Edit Channel">
          <div className="text-red-500 text-lg mb-4">Channel Not Found</div>
          <p className="text-gray-600 mb-6">The channel you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Button variant="outline" onClick={() => router.push('/channel')}>Back to Channel List</Button>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <ComponentCard title="Edit Channel">
        {/* Channel Information Card */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-md dark:border-blue-900/30 dark:bg-blue-900/10 transition-colors">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3 dark:border-blue-900/40">
            <div>
              <h3 className="text-base font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                Editing Channel
              </h3>
              <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                {channelData.find(ch => ch.channel_type_id === channelId)?.channel_type_name || 'Unknown Channel'}
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
              <dt className="text-xs font-medium text-body dark:text-bodydark">Channel ID</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-black dark:text-white">
                #{channelId}
              </dd>
            </div>
            <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
              <dt className="text-xs font-medium text-body dark:text-bodydark">Last Updated</dt>
              <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                {channelData.find(ch => ch.channel_type_id === channelId)?.updated_date || 'Not available'}
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
                  Review and update the channel information below. Changes will be saved when you submit the form.
                </p>
              </div>
            </div>
          </div>
        </div>
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
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
            Channel Updated Successfully!
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            The channel has been updated.
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
