"use client";
import React, { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import Address, { IAddress } from "@/components/form/Address";


const breadcrumbs = [
        return results
  { name: "Project", href: "/project" },
  { name: "Create", href: "/project/create" }
];

  interface ISelectOption {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{ open: boolean; statusCode?: number; message?: string }>({ open: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // Prepare payload for API
      const payload = {
        developer_id: "20",
        village_id: formData.address.village?.value || "",
        project_name: formData.project_name,
        project_description: formData.project_description
      };
      const response = await api.post("/project/create", payload);
      if (response.status === 200 || response.status === 201) {
        setShowSuccessModal(true);
      } else {
        setErrorModal({ open: true, statusCode: response.status, message: "Failed to create project. Unexpected response." });
      }
    } catch (err: any) {
      let message = "Failed to create project.";
      if (err?.response?.data?.message) message = err.response.data.message;
      setErrorModal({ open: true, statusCode: err?.response?.status || 500, message });
      console.error("Failed to create project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  const [errors, setErrors] = useState<FormErrors>({});

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/project");
        }}
        statusCode={201}
        message="Project has been created successfully!"
        buttonText="Go to Projects"
      />
      <SuccessModal
        isOpen={errorModal.open}
        onClose={() => setErrorModal({ open: false })}
        statusCode={errorModal.statusCode}
        message={errorModal.message}
        buttonText="Okay, Got It"
      />


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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [apiError, setApiError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // Prepare payload for API
      const payload = {
        developer_id: "20",
        village_id: formData.address.village?.value || "",
        project_name: formData.project_name,
        project_description: formData.project_description
      };
      const response = await api.post("/project/create", payload);
      if (response.status === 200 || response.status === 201) {
        setShowSuccessModal(true);
      } else {
        setApiError("Failed to create project. Unexpected response.");
      }
    } catch (err: unknown) {
      let message = "Failed to create project.";
      if (typeof err === "object" && err !== null) {
  // @ts-expect-error: Non-standard error object from axios or API client
  if (err.response?.data?.message) message = err.response.data.message;
      }
      setApiError(message);
      console.error("Failed to create project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/project");
  };



  return (
    <>
      <PageBreadcrumb crumbs={breadcrumbs} />
      
      <ComponentCard title="Create New Project" desc="Fill in the details below to create a new project">
        {apiError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {apiError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">


          {/* Address Section */}
          <div className="border-t pt-6">
            <Address
              value={formData.address}
              onSave={(address) => handleChange('address', address)}
              error={errors.address}
              label="Address Information * (Village is required)"
            />
            <p className="text-xs text-gray-500 mt-1">Only the village is required for project creation.</p>
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


    </>
  );
}
