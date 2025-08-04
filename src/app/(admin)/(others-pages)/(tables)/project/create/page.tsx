"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import Address, { IAddress } from "@/components/form/Address";
import { developerData } from "@/components/form/sample-data/developerData";
import Image from "next/image";
import { CheckIcon, XMarkIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Project", href: "/project" },
  { name: "Create", href: "/project/create" }
];

interface ISelectOption {
  value: string;
  label: string;
}

interface FormData {
  project_name: string;
  project_description: string;
  address: IAddress;
  is_active: boolean;
  selectedDeveloper: string | null; // Single developer ID
}

interface FormErrors {
  project_name?: string;
  project_description?: string;
  address?: string;
  selectedDeveloper?: string;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    project_name: "",
    project_description: "",
    address: {
      province: null,
      district: null,
      commune: null,
      village: null,
      homeAddress: "",
      streetAddress: ""
    },
    is_active: true,
    selectedDeveloper: null
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: keyof FormData, value: string | boolean | ISelectOption | null | IAddress) => {
    console.log("Project form handleChange:", field, value);
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

  const handleDeveloperSelect = (developerId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDeveloper: prev.selectedDeveloper === developerId ? null : developerId
    }));
    
    // Clear error when developer is selected
    if (errors.selectedDeveloper) {
      setErrors(prev => ({
        ...prev,
        selectedDeveloper: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.project_name.trim()) {
      newErrors.project_name = "Project name is required";
    }
    
    if (!formData.project_description.trim()) {
      newErrors.project_description = "Description is required";
    }
    
    if (!formData.address.province) {
      newErrors.address = "Address is required";
    }

    if (!formData.selectedDeveloper) {
      newErrors.selectedDeveloper = "Please select a developer";
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
      console.log("Creating project:", {
        project_name: formData.project_name,
        project_description: formData.project_description,
        address: formData.address,
        is_active: formData.is_active,
        selected_developer: formData.selectedDeveloper
      });
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/project");
  };

  // Developer Selection Modal Component
  const DeveloperSelectionModal = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Reset to first page when search changes
    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm]);

    if (!showDeveloperModal) return null;

    // Filter developers based on search term
    const filteredDevelopers = developerData.filter(developer =>
      developer.developer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      developer.developer_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (developer.location && developer.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredDevelopers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDevelopers = filteredDevelopers.slice(startIndex, startIndex + itemsPerPage);

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
                <div className="text-gray-400 mb-2">
                  <UserGroupIcon className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? `No developers found matching "${searchTerm}"` : "No developers available"}
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {paginatedDevelopers.map((developer) => (                  <div
                    key={developer.developer_id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      formData.selectedDeveloper === developer.developer_id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => handleDeveloperSelect(developer.developer_id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Image
                          src={developer.avatar || "/images/user/user-02.jpg"}
                          alt={developer.developer_name}
                          width={48}
                          height={48}
                          className="rounded-full bg-gray-200"
                          onError={(e) => { e.currentTarget.src = "/images/user/user-02.jpg"; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {developer.developer_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {developer.developer_description.length > 100 
                            ? `${developer.developer_description.substring(0, 100)}...` 
                            : developer.developer_description}
                        </p>
                        {developer.projects && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {developer.projects} projects • {developer.location}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {formData.selectedDeveloper === developer.developer_id && (
                          <CheckIcon className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDevelopers.length)} of {filteredDevelopers.length} developers
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: {formData.selectedDeveloper ? 1 : 0} developer
                </p>
                {formData.selectedDeveloper && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(() => {
                      const developer = developerData.find(d => d.developer_id === formData.selectedDeveloper);
                      return developer ? (
                        <span
                          key={formData.selectedDeveloper}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                        >
                          {developer.developer_name}
                        </span>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleModalClose}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleModalClose}
                  disabled={!formData.selectedDeveloper}
                >
                  Done {formData.selectedDeveloper ? '(1)' : ''}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <PageBreadcrumb crumbs={breadcrumbs} />
      
      <ComponentCard title="Create New Project" desc="Fill in the details below to create a new project">
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
              onSave={(address) => handleChange('address', address)}
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
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </ComponentCard>

      {/* Success notification can be added later */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Success</h3>
            <p>Project has been created successfully!</p>
            <button 
              onClick={handleSuccessClose}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Go to Projects
            </button>
          </div>
        </div>
      )}

      {/* Developer Selection Modal */}
      <DeveloperSelectionModal />
    </>
  );
}
