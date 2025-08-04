"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LocationTable, { ColumnSelector } from "@/components/tables/LocationTable"; 
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import { 
  PlusIcon, 
  MapPinIcon, 
  BuildingOfficeIcon,
  GlobeAltIcon 
} from "@heroicons/react/24/outline";
import { Location, locationData } from "@/components/form/sample-data/locationData";

const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Location Management", href: "/location" }
  ];

export default function LocationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<(keyof Location)[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locationTableVisibleColumnsV3');
      return saved ? JSON.parse(saved) : ['location_id', 'province', 'district', 'commune', 'village', 'created_date', 'is_active'];
    }
    return ['location_id', 'province', 'district', 'commune', 'village', 'created_date', 'is_active'];
  });

  // Calculate location statistics
  const totalLocations = locationData.length;
  const activeLocations = locationData.filter(loc => loc.is_active).length;
  const totalProvinces = new Set(locationData.map(loc => loc.province)).size;

  useEffect(() => {
    localStorage.setItem('locationTableVisibleColumnsV3', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  return (
    <div className="space-y-6">
      <PageBreadcrumb crumbs={breadcrumbs} />
      
      {/* Location Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLocations}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <MapPinIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Locations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeLocations}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-500/10">
              <GlobeAltIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Provinces/Cities</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProvinces}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-500/10">
              <BuildingOfficeIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Location Management Card */}
      <ComponentCard title="Location Directory">
        <div className="space-y-6">
          {/* Enhanced Header Section */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/location/create">
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add New Location
                </Button>
              </Link>
              
              {/* Search Input */}
              <div className="relative min-w-0 flex-1 sm:max-w-md">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                  <svg
                    className="fill-gray-500 dark:fill-gray-400"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                      fill=""
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search by location, province, district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </div>
            
            {/* Column Selector */}
            <div className="flex items-center gap-2">
              <ColumnSelector visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
            </div>
          </div>
          
          {/* Location Table */}
          <LocationTable 
            searchTerm={searchTerm}
            visibleColumns={visibleColumns}
          />
        </div>
      </ComponentCard>
    </div>
  );
}
