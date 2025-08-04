"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DeveloperTable, { ColumnSelector } from "@/components/tables/DeveloperTable"; 
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import { 
  PlusIcon,
  UserGroupIcon,
  BriefcaseIcon,
  BuildingOffice2Icon 
} from "@heroicons/react/24/outline";
import { Developer, developerData } from "@/components/form/sample-data/developerData";

const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Developer", href: "/developer" }
  ];

export default function DeveloperPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<(keyof Developer)[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('developerTableVisibleColumnsV2');
      return saved ? JSON.parse(saved) : ['developer_id', 'developer_name', 'developer_description', 'projects', 'location', 'created_date', 'is_active'];
    }
    return ['developer_id', 'developer_name', 'developer_description', 'projects', 'location', 'created_date', 'is_active'];
  });

  useEffect(() => {
    localStorage.setItem('developerTableVisibleColumnsV2', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Calculate developer statistics
  const totalDevelopers = developerData.length;
  const activeDevelopers = developerData.filter(dev => dev.is_active).length;
  const totalProjects = developerData.reduce((sum, dev) => sum + (dev.projects || 0), 0);

  useEffect(() => {
    // Log the statistics to the console (or handle them as needed)
    console.log("Total Developers:", totalDevelopers);
    console.log("Active Developers:", activeDevelopers);
    console.log("Total Projects:", totalProjects);
  }, [totalDevelopers, activeDevelopers, totalProjects]);

  return (
    <div className="space-y-6">
      <PageBreadcrumb crumbs={breadcrumbs} />
      
      {/* Developer Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Developers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDevelopers}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-500/10">
              <UserGroupIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Developers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeDevelopers}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-500/10">
              <BriefcaseIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProjects}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <BuildingOffice2Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Developer Management">
          <div className="space-y-4">
            {/* Search Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Link href="/developer/create">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Developer
                  </Button>
                </Link>
                <div className="flex-1 max-w-md">
                  <div className="relative">
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
                      placeholder="Search developers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ColumnSelector visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
              </div>
            </div>
            
            <DeveloperTable 
              searchTerm={searchTerm}
              visibleColumns={visibleColumns}
            />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
