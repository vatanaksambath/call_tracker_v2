"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { locationData } from "@/components/form/sample-data/locationData";
import { MapPinIcon } from "@heroicons/react/24/outline";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Location", href: "/location" },
  { name: "View", href: "/location/view" }
];

interface Location {
  location_id: string;
  location_description: string;
  is_active: boolean;
  created_date: string;
  updated_date?: string;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  homeAddress?: string;
  streetAddress?: string;
  properties?: number;
}

export default function ViewLocationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get('id');
  
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationNotFound, setLocationNotFound] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load location data
  useEffect(() => {
    if (locationId) {
      // Simulate loading location data
      const foundLocation = locationData.find(l => l.location_id === locationId);
      
      if (foundLocation) {
        setLocation(foundLocation);
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

  const handleEdit = () => {
    router.push(`/location/edit?id=${locationId}`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Deleting location:', locationId);
      router.push('/location');
    } catch (error) {
      console.error('Error deleting location:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleBack = () => {
    router.push('/location');
  };

  const getActiveBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getLocationPath = () => {
    if (!location) return '';
    const path = [location.province, location.district, location.commune, location.village]
      .filter(Boolean)
      .join(' → ');
    return path || 'Location Path Not Available';
  };

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Location Details">
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

  if (locationNotFound || !location) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Location Details">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Location Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">The location you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Button onClick={handleBack}>Back to Location List</Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      
      <ComponentCard title="Location Details">
        <div className="space-y-8">
          {/* Header with Action Buttons */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                  <MapPinIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {location.province || 'Location'}
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                {getLocationPath()}
              </p>
              <div className="flex items-center gap-3">
                {getActiveBadge(location.is_active)}
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

          {/* Location Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Administrative Hierarchy */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  Administrative Hierarchy
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Location ID:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white font-mono">{location.location_id}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Province/City:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{location.province || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">District:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{location.district || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Commune:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{location.commune || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Village:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{location.village || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Additional Address Information */}
              {(location.homeAddress || location.streetAddress) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address Details</h3>
                  <div className="space-y-3">
                    {location.homeAddress && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Home Address:</div>
                        <div className="col-span-2 text-sm text-gray-900 dark:text-white">{location.homeAddress}</div>
                      </div>
                    )}
                    {location.streetAddress && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Street Address:</div>
                        <div className="col-span-2 text-sm text-gray-900 dark:text-white">{location.streetAddress}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description and Additional Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Description</h3>
                <div className="bg-gray-50 dark:bg-white/[0.02] rounded-lg p-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {location.location_description || 'No description available for this location.'}
                  </div>
                </div>
              </div>

              {/* Location Hierarchy Visualization */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Location Path</h3>
                <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPinIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-wrap">
                      {[location.province, location.district, location.commune, location.village]
                        .filter(Boolean)
                        .map((item, index, array) => (
                          <React.Fragment key={index}>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                              {item}
                            </span>
                            {index < array.length - 1 && (
                              <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </React.Fragment>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date:</div>
                  <div className="col-span-2 text-sm text-gray-900 dark:text-white">{location.created_date}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated Date:</div>
                  <div className="col-span-2 text-sm text-gray-900 dark:text-white">{location.updated_date || 'Not updated yet'}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</div>
                  <div className="col-span-2">{getActiveBadge(location.is_active)}</div>
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
            Delete Location
          </h3>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
            Are you sure you want to delete location &quot;{location.location_id}&quot; ({location.province})? This action cannot be undone.
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
              {isDeleting ? 'Deleting...' : 'Delete Location'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
