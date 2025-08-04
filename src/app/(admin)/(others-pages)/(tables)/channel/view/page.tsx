"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { channelData } from "@/components/form/sample-data/channelData";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Channel", href: "/channel" },
  { name: "View", href: "/channel/view" }
];

interface ChannelType {
  channel_type_id: string;
  channel_type_name: string;
  channel_type_description: string;
  is_active: boolean;
  created_date: string;
  updated_date: string;
  status: 'Active' | 'Inactive' | 'Pending';
  icon?: string;
  properties?: number;
  category?: string;
}

export default function ViewChannelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelId = searchParams.get('id');

  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [channelNotFound, setChannelNotFound] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load channel data
  useEffect(() => {
    if (channelId) {
      const foundChannel = channelData.find(ch => ch.channel_type_id === channelId);
      if (foundChannel) {
        setChannel(foundChannel);
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

  const handleEdit = () => {
    router.push(`/channel/edit?id=${channelId}`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/channel');
    } catch {
      // Handle error
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleBack = () => {
    router.push('/channel');
  };

  const getStatusBadge = (status: 'Active' | 'Inactive' | 'Pending') => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === 'Active' 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
          : status === 'Inactive'
          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      }`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Channel Details">
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

  if (channelNotFound || !channel) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Channel Details">
          <div className="text-red-500 text-lg mb-4">Channel Not Found</div>
          <p className="text-gray-600 mb-6">The channel you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Button variant="outline" onClick={handleBack}>Back to Channel List</Button>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <ComponentCard title="Channel Details">
        <div className="space-y-8">
          {/* Header with Action Buttons */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {channel.channel_type_name}
              </h1>
              <div className="flex items-center gap-3">
                {getStatusBadge(channel.status)}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Button>
              <Button variant="outline" onClick={handleEdit}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/10"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            </div>
          </div>

          {/* Channel Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Channel ID:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{channel.channel_type_id}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Channel Name:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{channel.channel_type_name || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Description:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{channel.channel_type_description || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Properties:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{channel.properties !== undefined ? channel.properties : 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps & Status */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date:</div>
                  <div className="col-span-2 text-sm text-gray-900 dark:text-white">{channel.created_date || 'N/A'}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated:</div>
                  <div className="col-span-2 text-sm text-gray-900 dark:text-white">{channel.updated_date || 'N/A'}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</div>
                  <div className="col-span-2 text-sm text-gray-900 dark:text-white">{getStatusBadge(channel.status)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/20">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-center text-gray-900 dark:text-white">
            Delete Channel
          </h3>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
            Are you sure you want to delete &quot;{channel.channel_type_name}&quot;? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/10"
            >
              {isDeleting ? 'Deleting...' : 'Delete Channel'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
