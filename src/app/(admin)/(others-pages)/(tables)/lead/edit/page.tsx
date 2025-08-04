"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api, { getUserFromToken } from "@/lib/api";
import { formatApiDataForSelect, formatDateForAPI } from "@/lib/utils";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import Address, { IAddress } from "@/components/form/Address";
import ContactInfo, { IContactChannel } from "@/components/form/ContactInfo";
import ImageUpload from "@/components/form/ImageUpload";
import LoadingOverlay from "@/components/ui/loading/LoadingOverlay";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Lead", href: "/lead" },
  { name: "Edit", href: "/lead/edit" }
];

interface SelectOption {
  value: string;
  label: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  gender: SelectOption | null;
  dob: Date | null;
  email: string;
  phone: string;
  occupation: string;
  leadSource: SelectOption | null;
  contactDate: Date | null;
  customerType: SelectOption | null;
  business: SelectOption | null;
  address: IAddress;
  remark: string;
  contact_data: IContactChannel[];
  photo: File | null;
  existingPhotoUrl: string | null;
  initialStaffId: string;
  currentStaffId: string;
}

type LeadFormErrors = {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  email?: string;
  phone?: string;
  occupation?: string;
  leadSource?: string;
  contactDate?: string;
  customerType?: string;
  business?: string;
  address?: string;
  remark?: string;
  contact_data?: string;
};

export default function EditLeadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('id');

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    gender: null,
    dob: null,
    email: "",
    phone: "",
    occupation: "",
    leadSource: null,
    contactDate: null,
    customerType: null,
    business: null,
    address: {
      province: null,
      district: null,
      commune: null,
      village: null,
      homeAddress: "",
      streetAddress: ""
    } as IAddress,
    remark: "",
    contact_data: [] as IContactChannel[],
    photo: null,
    existingPhotoUrl: null,
    initialStaffId: "",
    currentStaffId: "",
  });

  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [dropdownOptions, setDropdownOptions] = useState<{
    gender: SelectOption[];
    business: SelectOption[];
    leadSource: SelectOption[];
    customerType: SelectOption[];
    channelType: SelectOption[];
  }>({
    gender: [],
    business: [],
    leadSource: [],
    customerType: [],
    channelType: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    variant: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!leadId) {
      setIsLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        const [gender, business, leadSource, customerType, channelType] = await Promise.all([
          api.get('common/gender'),
          api.get('common/business'),
          api.get('lead-source/lead-source'),
          api.get('customer-type/customer-type'),
          api.get('channel-type/channel-type'),
        ]);

        const leadRes = await api.post('/lead/pagination', {
          page_number: String('1'),
          page_size: String('10'),
          search_type: 'lead_id',
          query_search: String(`${leadId}`),
        });

        const leadData = leadRes.data[0];
        const allChannelTypes = formatApiDataForSelect(
          channelType.data,
          'channel_type_id',
          'channel_type_name'
        );

        const userData = getUserFromToken();
        if (userData) {
          setFormData(prev => ({
            ...prev,
            currentStaffId: userData.staff_id,
          }));
        }

        setFormData(prev => ({
          ...prev,
          firstName: leadData.data[0].first_name || '',
          lastName: leadData.data[0].last_name || '',
          gender: leadData.data[0].gender_id ? {
            value: String(leadData.data[0].gender_id),
            label: leadData.data[0].gender_name,
          } : null,
          dob: leadData.data[0].date_of_birth ? new Date(leadData.data[0].date_of_birth) : null,
          email: leadData.data[0].email || '',
          occupation: leadData.data[0].occupation || '',
          leadSource: leadData.data[0].lead_source_id ? {
            value: String(leadData.data[0].lead_source_id),
            label: leadData.data[0].lead_source_name,
          } : null,
          contactDate: leadData.data[0].relationship_date ? new Date(leadData.data[0].relationship_date) : null,
          customerType: leadData.data[0].customer_type_id ? {
            value: String(leadData.data[0].customer_type_id),
            label: leadData.data[0].customer_type_name,
          } : null,
          business: leadData.data[0].business_id ? {
            value: String(leadData.data[0].business_id),
            label: leadData.data[0].business_name,
          } : null,
          address: {
            province: leadData.data[0].province_id ? {
              value: String(leadData.data[0].province_id),
              label: leadData.data[0].province_name,
            } : null,
            district: leadData.data[0].district_id ? {
              value: String(leadData.data[0].district_id),
              label: leadData.data[0].district_name,
            } : null,
            commune: leadData.data[0].commune_id ? {
              value: String(leadData.data[0].commune_id),
              label: leadData.data[0].commune_name,
            } : null,
            village: leadData.data[0].village_id ? {
              value: String(leadData.data[0].village_id),
              label: leadData.data[0].village_name,
            } : null,
            homeAddress: leadData.data[0].home_address || '',
            streetAddress: leadData.data[0].street_address || '',
          },
          contact_data: (leadData.data[0].contact_data || []).map((channel: { channel_type_id: string, contact_values: { contact_number: string, user_name: string, remark: string, is_primary: boolean }[] }) => ({
            id: Math.random(),
            channel_type: allChannelTypes.find(ct => ct.value === String(channel.channel_type_id)) || null,
            contact_values: (channel.contact_values || []).map((val: { contact_number: string, user_name: string, remark: string, is_primary: boolean }) => ({ ...val, id: Math.random() })),
          })),
          existingPhotoUrl: leadData.data[0].photo_url || '',
          initialStaffId: leadData.data[0].initial_staff_id || '',
          currentStaffId: leadData.data[0].current_staff_id || (userData ? userData.staff_id : ''),
        }));

        setDropdownOptions({
          gender: formatApiDataForSelect(gender.data, 'gender_id', 'gender_name'),
          business: formatApiDataForSelect(business.data, 'business_id', 'business_name'),
          leadSource: formatApiDataForSelect(leadSource.data, 'lead_source_id', 'lead_source_name'),
          customerType: formatApiDataForSelect(customerType.data, 'customer_type_id', 'customer_type_name'),
          channelType: allChannelTypes,
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching lead data:', error);
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [leadId]);

  const handleChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof LeadFormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof LeadFormErrors];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: LeadFormErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!formData.gender) newErrors.gender = 'Please select a gender.';
    if (!formData.dob) newErrors.dob = 'Date of birth is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required.';
    if (!formData.leadSource) newErrors.leadSource = 'Please select a lead source.';
    if (!formData.contactDate) newErrors.contactDate = 'Contact Date is required.';
    if (!formData.customerType) newErrors.customerType = 'Please select a customer type.';
    if (!formData.business) newErrors.business = 'Please select a business.';
    if (!formData.address.province) {
      newErrors.address = 'A complete address with province is required.';
    }
    if (formData.contact_data.length === 0 || !formData.contact_data.some(c => c.contact_values.length > 0)) {
      newErrors.contact_data = 'Contact is required.';
    } else {
      const isInvalid = formData.contact_data.some(c => !c.channel_type || c.contact_values.some(v => !v.contact_number.trim()));
      if (isInvalid) {
        newErrors.contact_data = 'Each contact group must have a channel and each contact must have a number/ID.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate() || !formData.currentStaffId.toString()) {
      if (!formData.currentStaffId.toString()) {
        setAlertInfo({
          variant: 'error',
          title: 'Authentication Error',
          message: 'Could not find user information. Please log in again.',
        });
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      }
      return;
    }

    setIsSaving(true);
    try {
      let photoUrl = formData.existingPhotoUrl;
      if (formData.photo) {
        const photoFormData = new FormData();
        photoFormData.append('photo', formData.photo);
        photoFormData.append('menu', 'lead');
        photoFormData.append('photoId', String(`${leadId}`));
        const uploadResponse = await api.post('/files/upload-one-photo', photoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        photoUrl = uploadResponse.data.imageUrl;
      }

      const contactDataGrouped = formData.contact_data.map(channel => ({
        channel_type_id: channel.channel_type?.value,
        contact_values: channel.contact_values.map(val => ({
          user_name: val.user_name,
          contact_number: val.contact_number,
          remark: val.remark,
          is_primary: val.is_primary,
        })),
      }));

      const leadPayload = {
        lead_id: String(`${leadId}`),
        first_name: formData.firstName,
        last_name: formData.lastName,
        gender_id: formData.gender?.value,
        customer_type_id: formData.customerType?.value,
        lead_source_id: formData.leadSource?.value,
        village_id: formData.address.village?.value,
        business_id: formData.business?.value,
        current_staff_id: formData.currentStaffId.toString(),
        initial_staff_id: formData.initialStaffId.toString(),
        date_of_birth: formatDateForAPI(formData.dob),
        email: formData.email,
        occupation: formData.occupation,
        home_address: formData.address.homeAddress,
        street_address: formData.address.streetAddress,
        biz_description: null,
        relationship_date: formatDateForAPI(formData.contactDate),
        remark: formData.remark,
        photo_url: photoUrl,
        contact_data: contactDataGrouped,
        is_active: true,
      };

      const updateLead = await api.put(`/lead/update`, leadPayload);
      if (updateLead.data[0].statusCode === 200) {
        setAlertInfo({
          variant: 'success',
          title: 'Success!',
          message: 'Lead has been updated successfully.',
        });
        setTimeout(() => {
          router.push('/lead');
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to update lead:', err);
      setAlertInfo({
        variant: 'error',
        title: 'Update Failed',
        message: 'An error occurred while updating the lead. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/lead');
  };

  if (isLoading) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Edit Lead">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading lead data...</span>
          </div>
        </ComponentCard>
      </div>
    );
  }

  if (!leadId) {
    return (
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Edit Lead">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lead ID Missing</h3>
            <p className="text-gray-600 mb-4">No lead ID provided for editing.</p>
            <Button onClick={handleCancel}>Back to Lead List</Button>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay isLoading={isLoading || isSaving} />
      {alertInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">{alertInfo.title}</h3>
            <p className="text-gray-600 mb-4">{alertInfo.message}</p>
            <Button onClick={() => setAlertInfo(null)}>OK</Button>
          </div>
        </div>
      )}
      <div>
        <PageBreadcrumb crumbs={breadcrumbs} />
        <ComponentCard title="Edit Lead">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Lead</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">Editing Lead</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2">
              {/* Photo Upload Section */}
              <div className="lg:col-span-2">
                <ImageUpload
                  value={formData.photo}
                  onChange={(file) => handleChange('photo', file)}
                  initialPreviewUrl={formData.existingPhotoUrl}
                />
                <p className="text-sm text-gray-500 mt-2">Upload Profile picture</p>
              </div>

              {/* Personal Information */}
              <div className="mb-8 p-4 border border-gray-200 rounded-lg dark:border-gray-700 lg:col-span-2">
                <h3 className="text-base font-medium mb-4 text-gray-800 dark:text-gray-200">Personal Information</h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      type="text"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                    />
                    {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <Label>Last Name</Label>
                    <Input
                      type="text"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                    />
                    {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <Select
                      options={dropdownOptions.gender}
                      value={formData.gender || undefined}
                      onChange={(selectedOption) => handleChange('gender', selectedOption)}
                    />
                    {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
                  </div>

                  <div>
                    <DatePicker
                      id="date-picker-dob"
                      label="Date of Birth"
                      placeholder="Select a date"
                      value={formData.dob || undefined}
                      onChange={(dates) => handleChange('dob', dates[0])}
                    />
                    {errors.dob && <p className="text-sm text-red-500 mt-1">{errors.dob}</p>}
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label>Occupation</Label>
                    <Input
                      type="text"
                      placeholder="Enter occupation"
                      value={formData.occupation}
                      onChange={(e) => handleChange('occupation', e.target.value)}
                    />
                    {errors.occupation && <p className="text-sm text-red-500 mt-1">{errors.occupation}</p>}
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="mb-8 p-4 border border-gray-200 rounded-lg dark:border-gray-700 lg:col-span-2">
                <h3 className="text-base font-medium mb-4 text-gray-800 dark:text-gray-200">Business Information</h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Business</Label>
                    <Select
                      options={dropdownOptions.business}
                      value={formData.business || undefined}
                      onChange={(selectedOption) => handleChange('business', selectedOption)}
                    />
                    {errors.business && <p className="text-sm text-red-500 mt-1">{errors.business}</p>}
                  </div>

                  <div>
                    <Label>Lead Source</Label>
                    <Select
                      options={dropdownOptions.leadSource}
                      value={formData.leadSource || undefined}
                      onChange={(selectedOption) => handleChange('leadSource', selectedOption)}
                    />
                    {errors.leadSource && <p className="text-sm text-red-500 mt-1">{errors.leadSource}</p>}
                  </div>

                  <div>
                    <Label>Customer Type</Label>
                    <Select
                      options={dropdownOptions.customerType}
                      value={formData.customerType || undefined}
                      onChange={(selectedOption) => handleChange('customerType', selectedOption)}
                    />
                    {errors.customerType && <p className="text-sm text-red-500 mt-1">{errors.customerType}</p>}
                  </div>

                  <div>
                    <DatePicker
                      id="date-picker-contactDate"
                      label="Contact Date"
                      placeholder="Select a date"
                      value={formData.contactDate || undefined}
                      onChange={(dates) => handleChange('contactDate', dates[0])}
                    />
                    {errors.contactDate && <p className="text-sm text-red-500 mt-1">{errors.contactDate}</p>}
                  </div>
                </div>
              </div>

              {/* Contact & Address Information */}
              <div className="mb-8 p-4 border border-gray-200 rounded-lg dark:border-gray-700 lg:col-span-2">
                <h3 className="text-base font-medium mb-4 text-gray-800 dark:text-gray-200">Contact & Address Information</h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-1">
                  <div>
                    <ContactInfo
                      value={formData.contact_data}
                      onChange={(newContactData) => handleChange('contact_data', newContactData)}
                      error={errors.contact_data}
                    />
                  </div>

                  <div>
                    <Address
                      value={formData.address}
                      onSave={(newAddress) => handleChange('address', newAddress)}
                      error={errors.address}
                    />
                  </div>

                  <div>
                    <Label>Remark</Label>
                    <TextArea
                      value={formData.remark}
                      onChange={(value) => handleChange("remark", value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isSaving}>
                {isSaving ? 'Updating...' : 'Update Lead'}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
