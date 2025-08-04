"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { EllipsisHorizontalIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import Button from "../ui/button/Button";
import { CallLog } from "./sample-data/callLogsData";

export const callLogColumnConfig: { key: keyof CallLog; label: string }[] = [
  { key: 'call_log_id', label: 'Call Log ID' },
  { key: 'lead_id', label: 'Lead ID' },
  { key: 'lead_name', label: 'Lead Name' },
  { key: 'property_profile_name', label: 'Property Profile Name' },
  { key: 'total_call', label: 'Total Call' },
  { key: 'total_site_visit', label: 'Total Site Visit' },
  { key: 'status_id', label: 'Status ID' },
  { key: 'is_follow_up', label: 'Is Follow Up' },
  { key: 'follow_up_date', label: 'Follow Up Date' },
  // The rest, in original order, for column selector completeness
  { key: 'created_by_name', label: 'Created By' },
  { key: 'created_date', label: 'Created Date' },
  { key: 'fail_reason', label: 'Fail Reason' },
  { key: 'is_active', label: 'Is Active' },
  { key: 'last_update', label: 'Last Update' },
  { key: 'property_profile_id', label: 'Property Profile ID' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'updated_by_name', label: 'Updated By' },
];

const ActionMenu = ({ callLog, onSelect }: { callLog: CallLog; onSelect: (action: 'view' | 'edit' | 'delete' | 'quickCall' | 'siteVisit', callLog: CallLog) => void; }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors">
        <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/[0.05] rounded-lg shadow-lg z-10">
          <ul className="py-1">
            <li><a href="#" onClick={e => { e.preventDefault(); onSelect('view', callLog); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]">View</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); onSelect('edit', callLog); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]">Edit</a></li>
            <li><hr className="my-1 border-gray-200 dark:border-white/[0.05]" /></li>
            <li><a href="#" onClick={e => { e.preventDefault(); onSelect('quickCall', callLog); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/[0.05]">Quick Call</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); onSelect('siteVisit', callLog); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-white/[0.05]">Site Visit</a></li>
            <li><hr className="my-1 border-gray-200 dark:border-white/[0.05]" /></li>
            <li><a href="#" onClick={e => { e.preventDefault(); onSelect('delete', callLog); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]">Delete</a></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export const ColumnSelector = ({ visibleColumns, setVisibleColumns }: { visibleColumns: (keyof CallLog)[], setVisibleColumns: React.Dispatch<React.SetStateAction<(keyof CallLog)[]>> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleColumn = (columnKey: keyof CallLog) => {
    setVisibleColumns(prev => prev.includes(columnKey) ? prev.filter(key => key !== columnKey) : [...prev, columnKey]);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={menuRef}>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2">
        <AdjustmentsHorizontalIcon className="h-4 w-4" />
        Columns
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/[0.05] rounded-lg shadow-lg z-10">
          <div className="p-4">
            <h4 className="font-semibold mb-2">Visible Columns</h4>
            <div className="flex flex-col gap-2">
              {callLogColumnConfig.map(col => (
                <label key={col.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={visibleColumns.includes(col.key)} onChange={() => toggleColumn(col.key)} className="form-checkbox h-4 w-4 rounded text-blue-600" />
                  {col.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CallLogsTable({ data = [], visibleColumns = callLogColumnConfig.map(col => col.key) }: {
  data: CallLog[];
  visibleColumns: (keyof CallLog)[];
}) {
  const router = useRouter();
  const handleActionSelect = (action: 'view' | 'edit' | 'delete' | 'quickCall' | 'siteVisit', callLog: CallLog) => {
    if (action === 'view') {
      router.push(`/callpipeline/view?id=${callLog.call_log_id}`);
    } else if (action === 'edit') {
      router.push(`/callpipeline/edit?id=${callLog.call_log_id}`);
    } else if (action === 'quickCall') {
      router.push(`/callpipeline/quickcall?pipelineId=${callLog.call_log_id}`);
    } else if (action === 'siteVisit') {
      router.push(`/callpipeline/sitevisit?pipelineId=${callLog.call_log_id}`);
    }
    // You can add other actions here as needed
  };
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {callLogColumnConfig.filter(col => visibleColumns.includes(col.key)).map(col => (
                    <TableCell key={col.key} isHeader className="px-5 py-3 text-left font-medium text-gray-500 text-theme-xs dark:text-gray-400">{col.label}</TableCell>
                  ))}
                  <TableCell isHeader className="px-5 py-3 text-center"><span className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Actions</span></TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data.map((callLog, rowIdx) => (
                  <TableRow key={callLog.call_log_id || rowIdx} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    {callLogColumnConfig.filter(col => visibleColumns.includes(col.key)).map((column) => {
                      const value = callLog[column.key];
                      if (typeof value === 'boolean') {
                        return (
                          <TableCell key={`${callLog.call_log_id || rowIdx}-col-${column.key}`} className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90">
                            <span className={value ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}>{value ? 'Yes' : 'No'}</span>
                          </TableCell>
                        );
                      } else {
                        return (
                          <TableCell key={`${callLog.call_log_id || rowIdx}-col-${column.key}`} className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90">{typeof value === 'string' || typeof value === 'number' ? value : '-'}</TableCell>
                        );
                      }
                    })}
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-center">
                        <ActionMenu callLog={callLog} onSelect={handleActionSelect} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {!data.length && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-gray-800">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Call Logs Found</h3>
              <p className="text-gray-600 dark:text-gray-400">No call logs available.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
