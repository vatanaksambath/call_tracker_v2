"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";


const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Property", href: "/property" },
  { name: "View", href: "/property/view" }
];

interface Property {
  PropertyID: string;
  PropertyName: string;
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
  is_active?: boolean;
  created_date?: string;
  updated_date?: string;
}

export default function ViewPropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id');
  

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [propertyNotFound, setPropertyNotFound] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch property data from API
  useEffect(() => {
    if (!propertyId) {
      setPropertyNotFound(true);
      setIsLoading(false);
      return;
    }
    const fetchProperty = async () => {
      setIsLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${apiBase}/property-profile/pagination`, {
          method: "POST",
          headers,
          body: JSON.stringify({ page_number: "1", page_size: "1", search_type: "property_profile_id", query_search: propertyId })
        });
        const data = await res.json();
        const prop = data[0]?.data?.[0];
        if (!prop) {
          setPropertyNotFound(true);
          setIsLoading(false);
          return;
        }
        setProperty({
          PropertyID: String(prop.property_profile_id),
          PropertyName: prop.property_profile_name || '',
          Location: [
            prop.province_name,
            prop.district_name,
            prop.commune_name,
            prop.village_name,
            prop.home_number ? `#${prop.home_number}` : ''
          ].filter(Boolean).join(', '),
          PropertyType: prop.property_type_name || '',
          Price: prop.price ? String(prop.price) : '',
          Status: prop.is_active ? 'Available' : 'Inactive',
          Description: prop.description || '',
          Features: prop.feature || '',
          Bedrooms: prop.bedroom ? String(prop.bedroom) : '',
          Bathrooms: prop.bathroom ? String(prop.bathroom) : '',
          Area: prop.area ? String(prop.area) : '',
          YearBuilt: prop.year_built ? String(prop.year_built) : '',
          is_active: !!prop.is_active,
          created_date: prop.created_date || '',
          updated_date: prop.updated_date || '',
        });
        setIsLoading(false);
      } catch {
        setPropertyNotFound(true);
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);



  const handleEdit = () => {
    router.push(`/property/edit?id=${propertyId}`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Deleting property:', propertyId);
      router.push('/property');
    } catch (error) {
      console.error('Error deleting property:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleBack = () => {
    router.push('/property');
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Available': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'Reserved': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'Sold': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      'Under Construction': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'Maintenance': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'}`}>
        {status}
      </span>
    );
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

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Property Details">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading property...</p>
            </div>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (propertyNotFound || !property) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Property Details">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Property Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Button onClick={handleBack}>Back to Property List</Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      
      <ComponentCard title="Property Details">
        <div className="space-y-8">
          {/* Header with Action Buttons */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {property.PropertyName}
              </h1>
              <div className="flex items-center gap-3">
                {property.Status && getStatusBadge(property.Status)}
                {getActiveBadge(property.is_active || false)}
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

          {/* Property Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Property ID:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{property.PropertyID}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Location:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{property.Location || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Property Type:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{property.PropertyType || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Price:</div>
                    <div className="col-span-2 text-sm font-semibold text-green-600 dark:text-green-400">{property.Price || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Property Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Area:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{property.Area ? `${property.Area} sq ft` : 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Bedrooms:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{property.Bedrooms || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Bathrooms:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{property.Bathrooms || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Year Built:</div>
                    <div className="col-span-2 text-sm text-gray-900 dark:text-white">{property.YearBuilt || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description and Features */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Description</h3>
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {property.Description || 'No description available.'}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Features & Amenities</h3>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {property.Features ? (
                    <div className="flex flex-wrap gap-2">
                      {property.Features.split(',').map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                        >
                          {feature.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    'No features listed.'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date:</div>
                  <div className="col-span-2 text-sm text-gray-900 dark:text-white">{property.created_date || 'N/A'}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated:</div>
                  <div className="col-span-2 text-sm text-gray-900 dark:text-white">{property.updated_date || 'N/A'}</div>
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
            Delete Property
          </h3>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
            Are you sure you want to delete &quot;{property.PropertyName}&quot;? This action cannot be undone.
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
              {isDeleting ? 'Deleting...' : 'Delete Property'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
