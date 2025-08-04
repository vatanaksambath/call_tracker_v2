"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { EnvelopeIcon, PhoneIcon, BuildingOffice2Icon, BriefcaseIcon } from "@heroicons/react/24/outline";

interface SelectOption {
    value: string;
    label: string;
}

export default function CreateDeveloperOwnerPage() {
  const router = useRouter();

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Developer Owner", href: "/developer-owner" },
    { name: "Create" },
  ];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    status: { value: "Active", label: "Active" } as SelectOption,
  });

  type DeveloperOwnerFormErrors = {
    fullName?: string;
    email?: string;
    phone?: string;
    company?: string;
    position?: string;
    status?: string;
  };

  const [errors, setErrors] = useState<DeveloperOwnerFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions: SelectOption[] = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  const validateForm = () => {
    const newErrors: DeveloperOwnerFormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Developer Owner Data:", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        position: formData.position,
        status: formData.status.value,
      });

      // Redirect to developer owner list
      router.push("/developer-owner");
    } catch (error) {
      console.error("Error creating developer owner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | SelectOption) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof DeveloperOwnerFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />
      <div className="space-y-6">
        <ComponentCard title="Create Developer Owner">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    error={!!errors.fullName}
                    hint={errors.fullName}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={!!errors.email}
                      hint={errors.email}
                      className="pl-10"
                    />
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      error={!!errors.phone}
                      hint={errors.phone}
                      className="pl-10"
                    />
                    <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    options={statusOptions}
                    value={formData.status}
                    onChange={(option) => handleInputChange('status', option || statusOptions[0])}
                    placeholder="Select status"
                  />
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <div className="relative">
                    <Input
                      id="company"
                      type="text"
                      placeholder="Enter company name"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      error={!!errors.company}
                      hint={errors.company}
                      className="pl-10"
                    />
                    <BuildingOffice2Icon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="position">Position *</Label>
                  <div className="relative">
                    <Input
                      id="position"
                      type="text"
                      placeholder="Enter position/title"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      error={!!errors.position}
                      hint={errors.position}
                      className="pl-10"
                    />
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Developer Owner"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => router.push("/developer-owner")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}
