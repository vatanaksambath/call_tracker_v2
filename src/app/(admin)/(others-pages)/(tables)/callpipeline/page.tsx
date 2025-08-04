"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import React, { useEffect, useState } from "react";
import LoadingOverlay from "@/components/ui/loading/LoadingOverlay";
import CallLogsTable, { ColumnSelector } from "@/components/tables/CallLogsTable";
import { CallLog } from "@/components/tables/sample-data/callLogsData";
import api from "@/lib/api";
import { 
  PhoneIcon,
  FireIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon 
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import Pagination from "@/components/tables/Pagination";

const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Call Pipeline", href: "/callpipeline" }
  ];


export default function CallPipelinePage() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  // Default columns as specified by user
  const defaultColumns: (keyof CallLog)[] = [
    'call_log_id',
    'lead_id',
    'lead_name',
    'property_profile_name',
    'total_call',
    'total_site_visit',
    'status_id',
    'is_follow_up',
    'follow_up_date',
  ];
  
  // Load visible columns from localStorage or use default
  const getInitialVisibleColumns = (): (keyof CallLog)[] => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('callPipelineVisibleColumns');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return defaultColumns;
        }
      }
    }
    return defaultColumns;
  };

  const [visibleColumns, setVisibleColumns] = useState<(keyof CallLog)[]>(getInitialVisibleColumns);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [stats, setStats] = useState({ totalCalls: 0, hotLeads: 0, followUpRequired: 0, siteVisits: 0, closedWon: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  // Save visible columns to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('callPipelineVisibleColumns', JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  // Fetch call logs and summary from API
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const body = {
          page_number: String(currentPage),
          page_size: String(itemsPerPage),
          search_type: "",
          query_search: searchTerm || ""
        };
        const [logsRes, summaryRes] = await Promise.all([
          api.post('/call-log/pagination', body, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }),
          api.get('/call-log/summary', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
        ]);
        // Call logs
        const apiResult = Array.isArray(logsRes.data) ? logsRes.data[0] : logsRes.data;
        const logs: CallLog[] = apiResult && apiResult.data ? apiResult.data : [];
        if (isMounted) {
          setCallLogs(logs);
          setTotalPages(apiResult && apiResult.total_page ? apiResult.total_page : 1);
          setTotalRows(apiResult && apiResult.total_row ? apiResult.total_row : logs.length);
        }
        // Summary cards
        const summaryResult = Array.isArray(summaryRes.data) ? summaryRes.data[0] : summaryRes.data;
        const summary = summaryResult && summaryResult.data && summaryResult.data[0] ? summaryResult.data[0] : {};
        if (isMounted) {
          setStats({
            totalCalls: summary.total_call_detail || 0,
            hotLeads: summary.total_success_call || 0,
            followUpRequired: summary.total_follow_up_call || 0,
            siteVisits: summary.total_site_visit || 0,
            closedWon: summary.total_fail_call || 0
          });
        }
      } catch {
        if (isMounted) {
          setCallLogs([]);
          setTotalPages(1);
          setStats({ totalCalls: 0, hotLeads: 0, followUpRequired: 0, siteVisits: 0, closedWon: 0 });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [currentPage, searchTerm]);

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb crumbs={breadcrumbs} />
      {/* Call Pipeline Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCalls}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <PhoneIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Case</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.hotLeads}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
              <FireIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Follow Up Required</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.followUpRequired}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 dark:bg-yellow-500/10">
              <CalendarIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Site Visits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.siteVisits}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-500/10">
              <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-white/[0.05] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fail Case</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.closedWon}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-500/10">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <ComponentCard title="Call Pipeline">
          {/* Header: Add, Search, Column Selector */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Link href="/callpipeline/create">
                <Button size="md" variant="primary">
                  Add Call Pipeline +
                </Button>
              </Link>
              <div className="relative flex-1 max-w-md min-w-0">
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
                  placeholder="Search call pipelines..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ColumnSelector visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
            </div>
          </div>
          <CallLogsTable
            data={callLogs}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
          />
        </ComponentCard>
      {/* Pagination - Outside the ComponentCard like in developer page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Showing{" "}
              <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>
              {" "}to{" "}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalRows)}</span>
              {" "}of{" "}
              <span className="font-medium">{totalRows}</span>
              {" "}results
            </span>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
      </div>
    </div>
  );
}
