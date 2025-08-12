"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SiteVisitTable from "@/components/tables/SiteVisitTable";
import Pagination from "@/components/tables/Pagination";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Select from '@/components/form/Select';
import { ChevronDownIcon, TimeIcon } from '@/icons';
import DatePicker from '@/components/form/date-picker';
import TextArea from "@/components/form/input/TextArea";

// export const metadata: Metadata = {
//   title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
//   // other metadata
// };

export default function SiteVisitTables() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Lead", href: "/sitevisit-tables" }
  ];

  const optionsCity = [
    { value: "Phnom_Penh", label: "Phnom Penh" },
    { value: "Kampot", label: "Kampot" },
    { value: "Battambang", label: "Battambang" },
  ];

  const optionsDistrict = [
    { value: "Beong Keng Kang", label: "Beong Keng Kang" },
    { value: "Chamkar Mon", label: "Chamkar Mon" },
  ];

  const handleCitySelectChange = (value: string) => {
    console.log("Selected value:", value);
  };

  const handleDistrictSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };

  const [message, setMessage] = useState("");

  return (
    <div>
      <PageBreadcrumb crumbs={breadcrumbs} />

      <div className="space-y-6">
        <ComponentCard title="Site Visit Table">
          <div className="flex items-center gap-3 justify-between mb-5">
            <div className="flex items-center gap-3">
              <Button size="md" variant="primary"
                onClick={openModal}
              >
                Add Site Visit +
              </Button>
              <Button size="md" variant="outline">
                Edit Site Visit
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                <svg
                  className="stroke-current fill-white dark:fill-gray-800"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.29004 5.90393H17.7067"
                    stroke=""
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.7075 14.0961H2.29085"
                    stroke=""
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                    fill=""
                    stroke=""
                    strokeWidth="1.5"
                  />
                  <path
                    d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                    fill=""
                    stroke=""
                    strokeWidth="1.5"
                  />
                </svg>
                Filter
              </button>
            </div>
          </div>

          <SiteVisitTable />
          <div className="flex items-center justify-center">
            <Pagination currentPage={1} totalPages={5} onPageChange={() => { }
            } />

          </div>

        </ComponentCard>

      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 lg:pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Site Visit Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Add your details to keep your site visit up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="space-y-7">
                <div>
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    General Information
                  </h5>
                  <div>
                    <Label htmlFor="tm">Select a lead</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        disabled
                        placeholder="Select a lead"
                        className="pl-[62px]"
                      />
                      <span className="absolute left-0 top-1/2 flex h-11 w-[46px] -translate-y-1/2 items-center justify-center border-r border-gray-200 dark:border-gray-800">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11 4C7.68629 4 5 6.68629 5 10C5 13.3137 7.68629 16 11 16C12.6569 16 14.1566 15.3679 15.3124 14.3126C16.3711 13.2596 17 11.7783 17 10C17 6.68629 14.3137 4 11 4Z"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <line
                            x1="15.5"
                            y1="15.5"
                            x2="20"
                            y2="20"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>

                </div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Location Information
                </h5>
                <div>
                  <Label>Select City</Label>
                  <div className="relative">
                    <Select
                      options={optionsCity}
                      placeholder="Select an option"
                      onChange={handleCitySelectChange}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Select District</Label>
                  <div className="relative">
                    <Select
                      options={optionsDistrict}
                      placeholder="Select an option"
                      onChange={handleDistrictSelectChange}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>


                <div>
                  <Label>Select Commune</Label>
                  <div className="relative">
                    <Select
                      options={optionsDistrict}
                      placeholder="Select an option"
                      onChange={handleDistrictSelectChange}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Select Village</Label>
                  <div className="relative">
                    <Select
                      options={optionsDistrict}
                      placeholder="Select an option"
                      onChange={handleDistrictSelectChange}
                      className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Date & TIme
                </h5>
                <div>
                  <DatePicker
                    id="date-picker"
                    label="Site Visit Date"
                    placeholder="Select a date"
                    onChange={(dates, currentDateString) => {
                      // Handle your logic
                      console.log({ dates, currentDateString });
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="tm">Start Time</Label>
                  <div className="relative">
                    <Input
                      type="time"
                      id="tm"
                      name="tm"
                      onChange={(e) => console.log(e.target.value)}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <TimeIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tm">End Time</Label>
                  <div className="relative">
                    <Input
                      type="time"
                      id="tm"
                      name="tm"
                      onChange={(e) => console.log(e.target.value)}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                      <TimeIcon />
                    </span>
                  </div>
                </div>
                <div>
                  <DatePicker
                    id="date-picker"
                    label="Follow up Date"
                    placeholder="Select a date"
                    onChange={(dates, currentDateString) => {
                      // Handle your logic
                      console.log({ dates, currentDateString });
                    }}
                  />
                </div>
                <div>
                  <Label>Site Visit Description</Label>
                  <TextArea
                    value={message}
                    onChange={(value) => setMessage(value)}
                    rows={6}
                  />
                </div>

              </div>

              {/* <div>
                <DropzoneComponent />
              </div> */}
            </div>

            <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
              <button
                onClick={closeModal}
                type="button"
                className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
            {/* <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div> */}
          </form>
        </div>
      </Modal>

    </div>
  );
}
