"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Switch from "@/components/form/switch/Switch";
import Address from "@/components/form/Address";
import { IAddress } from "@/components/form/Address";

import { projectData } from "@/components/form/sample-data/projectData";
// import { developerData } from "@/components/form/sample-data/developerData";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Project", href: "/project" },
  { name: "Edit", href: "/project/edit" }
];

interface FormData {
  project_name: string;
  project_description: string;
  address: IAddress;
  is_active: boolean;
}

interface FormErrors {
  project_name?: string;
  project_description?: string;
  address?: string;
}


export default function ProjectEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const [formData, setFormData] = useState<FormData>({
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
    is_active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // Developer modal state removed

  useEffect(() => {
    if (projectId) {
      const project = projectData.find((p) => p.project_id === projectId);
      if (project) {
        setFormData({
          project_name: project.project_id,
          project_description: project.project_description,
          address: {
            province: project.province ? { value: project.province, label: project.province } : null,
            district: project.district ? { value: project.district, label: project.district } : null,
            commune: project.commune ? { value: project.commune, label: project.commune } : null,
            village: project.village ? { value: project.village, label: project.village } : null,
            homeAddress: project.homeAddress || "",
            streetAddress: project.streetAddress || "",
          },
          is_active: project.is_active,
        });
      }
    }
  }, [projectId]);

  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.project_name.trim()) newErrors.project_name = "Project name is required";
    if (!formData.project_description.trim()) newErrors.project_description = "Description is required";
    if (!formData.address.province || !formData.address.district) newErrors.address = "Complete address information is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowSuccessModal(true);
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/project");
  };

  // DeveloperModal removed

  return (
    <>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <ComponentCard title={`Edit Project - ${projectId}`} desc="Update the project details below">
        <form onSubmit={handleSubmit} className="space-y-6">

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
  {/* Developer selection modal removed */}
    </>
  );
}
