"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import Address from "@/components/form/Address";
import { IAddress } from "@/components/form/Address";
import { CheckIcon, XMarkIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { projectData } from "@/components/form/sample-data/projectData";
import { developerData } from "@/components/form/sample-data/developerData";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Project", href: "/project" },
  { name: "Edit", href: "/project/edit" }
];

interface FormData {
  selectedDeveloper: string;
  project_name: string;
  project_description: string;
  address: IAddress;
  is_active: boolean;
}

interface FormErrors {
  selectedDeveloper?: string;
  project_name?: string;
  project_description?: string;
  address?: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    selectedDeveloper: "",
    project_name: "",
    project_description: "",
    address: {
      province: null,
      district: null,
      commune: null,
      village: null,
      homeAddress: "",
      streetAddress: "",
    },
    is_active: true
  });

  // Load project data
  useEffect(() => {
    if (projectId) {
      // In real app, this would be an API call
      const project = projectData.find(p => p.project_id === projectId);
      if (project) {
        setFormData({
          selectedDeveloper: "DEV001", // Default developer for editing
          project_name: project.project_id, // Use project_id as name for now
          project_description: project.project_description,
          address: {
            province: project.province ? { value: project.province, label: project.province } : null,
            district: project.district ? { value: project.district, label: project.district } : null,
            commune: project.commune ? { value: project.commune, label: project.commune } : null,
            village: project.village ? { value: project.village, label: project.village } : null,
            homeAddress: project.homeAddress || "",
            streetAddress: project.streetAddress || "",
          },
          is_active: project.is_active
        });
      }
      setLoading(false);
    }
  }, [projectId]);

  const handleChange = (field: keyof FormData, value: string | boolean | IAddress) => {
    console.log("Project form handleChange:", field, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
    
    if (!formData.selectedDeveloper) {
      newErrors.selectedDeveloper = "Developer selection is required";
    }
    
    if (!formData.project_name.trim()) {
      newErrors.project_name = "Project name is required";
    }
    
    if (!formData.project_description.trim()) {
      newErrors.project_description = "Description is required";
    }
    
    if (!formData.address.province || !formData.address.district) {
      newErrors.address = "Complete address information is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Developer selection functionality
  const itemsPerPage = 6;
  const filteredDevelopers = developerData.filter(developer =>
    developer.developer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    developer.developer_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDevelopers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDevelopers = filteredDevelopers.slice(startIndex, startIndex + itemsPerPage);

  const handleDeveloperSelect = (developerId: string) => {
    handleChange("selectedDeveloper", developerId);
    setShowDeveloperModal(false);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const DeveloperModal = () => {
    const handleModalClose = () => {
      setShowDeveloperModal(false);
      setSearchTerm("");
      setCurrentPage(1);
    };

    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Select Developer</h2>
            <Button variant="outline" size="sm" onClick={handleModalClose}>
              <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" />
            </Button>
          </div>

          {/* Search Section */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search developers by name, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {filteredDevelopers.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {filteredDevelopers.length} developer{filteredDevelopers.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          
          <div className="flex-grow overflow-y-auto p-6">
            {paginatedDevelopers.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No developers found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedDevelopers.map((developer) => (
                  <div 
                    key={developer.developer_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => handleDeveloperSelect(developer.developer_id)}
                  >
                    <div className="flex items-start gap-3">
                      <Image
                        src={developer.avatar || "/images/user/user-02.jpg"}
                        alt={developer.developer_name}
                        width={48}
                        height={48}
                        className="rounded-full bg-gray-200 flex-shrink-0"
                        onError={(e) => { e.currentTarget.src = "/images/user/user-02.jpg"; }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {developer.developer_name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {developer.developer_description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <CheckIcon className="h-3 w-3" />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDevelopers.length)} of {filteredDevelopers.length} developers
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      console.log("Updating project:", {
        project_id: projectId,
        selectedDeveloper: formData.selectedDeveloper,
        project_name: formData.project_name,
        project_description: formData.project_description,
        province_id: formData.address.province?.value,
        district_id: formData.address.district?.value,
        commune_id: formData.address.commune?.value,
        village_id: formData.address.village?.value,
        home_address: formData.address.homeAddress,
        street_address: formData.address.streetAddress,
        is_active: formData.is_active
      });
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to update project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/project");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageBreadcrumb crumbs={breadcrumbs} />
      
      <ComponentCard title={`Edit Project - ${projectId}`} desc="Update the project details below">
        {/* Project Information Card */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-md dark:border-blue-900/30 dark:bg-blue-900/10 transition-colors">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3 dark:border-blue-900/40">
            <div>
              <h3 className="text-base font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                Editing Project
              </h3>
              <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                Project {projectId}
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
              <dt className="text-xs font-medium text-body dark:text-bodydark">Project ID</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-black dark:text-white">
                #{projectId}
              </dd>
            </div>
            <div className="rounded-md bg-gray-1 p-3 dark:bg-meta-4">
              <dt className="text-xs font-medium text-body dark:text-bodydark">Created Date</dt>
              <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
                {projectData.find(proj => proj.project_id === projectId)?.created_date || 'Not available'}
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
                  Review and update the project information below. Changes will be saved when you submit the form.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Developer Selection */}
          <div>
            <div className="mb-4">
              <Label htmlFor="developers">Select Developer *</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose a developer for this project
              </p>
              {errors.selectedDeveloper && (
                <p className="mt-1 text-sm text-red-600">{errors.selectedDeveloper}</p>
              )}
            </div>
            
            <div className="mt-1">
              {formData.selectedDeveloper ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const developer = developerData.find(d => d.developer_id === formData.selectedDeveloper);
                      return developer ? (
                        <>
                          <Image
                            src={developer.avatar || "/images/user/user-02.jpg"}
                            alt={developer.developer_name}
                            width={40}
                            height={40}
                            className="rounded-full bg-gray-200"
                            onError={(e) => { e.currentTarget.src = "/images/user/user-02.jpg"; }}
                          />
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">{developer.developer_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {developer.developer_description.length > 50 
                                ? `${developer.developer_description.substring(0, 50)}...` 
                                : developer.developer_description}
                            </div>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeveloperModal(true)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeveloperModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3"
                >
                  <UserGroupIcon className="h-5 w-5" />
                  Select Developer
                </Button>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="border-t pt-6">
            <Address
              value={formData.address}
              onSave={(address) => handleChange("address", address)}
              error={errors.address}
              label="Address Information *"
            />
          </div>

          {/* Project Name */}
          <div className="grid grid-cols-1 gap-6 border-t pt-6">
            <div>
              <Label htmlFor="project_name">
                Project Name *
              </Label>
              <Input
                type="text"
                value={formData.project_name}
                onChange={(e) => handleChange("project_name", e.target.value)}
                placeholder="Enter project name"
                error={!!errors.project_name}
              />
              {errors.project_name && (
                <p className="mt-1 text-sm text-red-600">{errors.project_name}</p>
              )}
            </div>
          </div>

          {/* Project Description */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="project_description">
                Project Description *
              </Label>
              <TextArea
                value={formData.project_description}
                onChange={(value) => handleChange("project_description", value)}
                placeholder="Enter project description"
                rows={4}
                error={!!errors.project_description}
              />
              {errors.project_description && (
                <p className="mt-1 text-sm text-red-600">{errors.project_description}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Status</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enable or disable this project
                </p>
              </div>
              <Switch
                label="Active"
                checked={formData.is_active}
                onChange={(checked) => handleChange("is_active", checked)}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/project")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </ComponentCard>

      {/* Success notification */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Success</h3>
            <p>Project has been updated successfully!</p>
            <button 
              onClick={handleSuccessClose}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Go to Projects
            </button>
          </div>
        </div>
      )}

      {/* Developer selection modal */}
      {showDeveloperModal && <DeveloperModal />}
    </>
  );
}
