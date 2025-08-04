

import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { 
  DocumentMagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, PencilIcon, TrashIcon, EllipsisHorizontalIcon, AdjustmentsHorizontalIcon 
} from "@heroicons/react/24/outline";
// ColumnSelector for customizing visible columns
const ColumnSelector = ({ visibleColumns, setVisibleColumns }: { visibleColumns: (keyof ChannelType)[], setVisibleColumns: React.Dispatch<React.SetStateAction<(keyof ChannelType)[]>> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleColumn = (columnKey: keyof ChannelType) => {
    setVisibleColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(key => key !== columnKey) 
        : [...prev, columnKey]
    );
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
        Customize Columns
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/[0.05] rounded-lg shadow-lg z-10">
          <div className="p-4">
            <h4 className="font-semibold mb-2">Visible Columns</h4>
            <div className="grid grid-cols-2 gap-2">
              {allColumns.map(col => (
                <label key={col.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={visibleColumns.includes(col.key as keyof ChannelType)}
                    onChange={() => toggleColumn(col.key as keyof ChannelType)}
                    className="form-checkbox h-4 w-4 rounded text-blue-600"
                  />
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

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
  const pageLimit = 2;
  const startPage = Math.max(1, currentPage - pageLimit);
  const endPage = Math.min(totalPages, currentPage + pageLimit);

  return (
    <nav className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      {startPage > 1 && (
        <>
          <Button variant="outline" size="sm" onClick={() => onPageChange(1)}>1</Button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
        <Button 
          key={page} 
          variant={currentPage === page ? 'primary' : 'outline'} 
          size="sm" 
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)}>{totalPages}</Button>
        </>
      )}
      <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </nav>
  );
};
import Button from "../ui/button/Button";
import { channelData, ChannelType } from "../form/sample-data/channelData";
import { useRouter } from "next/navigation";

const allColumns = [
  { key: 'channel_type_id', label: 'Channel ID' },
  { key: 'channel_type_name', label: 'Channel Name' },
  { key: 'channel_type_description', label: 'Description' },
  { key: 'created_date', label: 'Created Date' },
  { key: 'updated_date', label: 'Updated Date' },
  { key: 'status', label: 'Status' },
] as const;

const ActionMenu = ({ channel, onSelect }: { channel: ChannelType; onSelect: (action: 'view' | 'edit' | 'delete', channel: ChannelType) => void; }) => {
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
            <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('view', channel); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><EyeIcon className="h-4 w-4"/> View</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('edit', channel); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><PencilIcon className="h-4 w-4"/> Edit</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('delete', channel); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><TrashIcon className="h-4 w-4"/> Delete</a></li>
          </ul>
        </div>
      )}
    </div>
  );
};

const renderCellContent = (channel: ChannelType, columnKey: keyof ChannelType) => {
  switch (columnKey) {
    case 'channel_type_name':
      return (
        <div>
          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{channel.channel_type_name}</span>
          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">{channel.channel_type_id}</span>
        </div>
      );
    case 'channel_type_description':
      return (
        <div className="max-w-xs">
          <span className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {channel.channel_type_description}
          </span>
        </div>
      );
    case 'status':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          channel.status === 'Active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : channel.status === 'Inactive'
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        }`}>
          {channel.status}
        </span>
      );
    default:
      return <span className="text-gray-600 dark:text-gray-400">{channel[columnKey]}</span>;
  }
};


interface ChannelTableProps {
  searchTerm?: string;
  visibleColumns?: (keyof ChannelType)[];
}


function ChannelTable({ searchTerm = "", visibleColumns: propVisibleColumns }: ChannelTableProps) {
  const router = useRouter();
  const [data] = useState<ChannelType[]>(channelData);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [visibleColumns] = useState<(keyof ChannelType)[]>(
    propVisibleColumns || allColumns.map(col => col.key as keyof ChannelType)
  );

  // Filtering logic
  const filteredData = data.filter((channel: ChannelType) =>
    channel.channel_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.channel_type_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.channel_type_id.toString().includes(searchTerm)
  );

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const sortedVisibleColumns = allColumns.filter(col => visibleColumns.includes(col.key as keyof ChannelType));

  const handleAction = (action: 'view' | 'edit' | 'delete', channel: ChannelType) => {
    if (action === 'view') router.push(`/channel/view?id=${channel.channel_type_id}`);
    if (action === 'edit') router.push(`/channel/edit?id=${channel.channel_type_id}`);
    // Implement delete logic as needed
  };

  return (
    <>
      {/* Removed duplicate ColumnSelector at the bottom. Now only in the header row. */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {sortedVisibleColumns.map(col => (
                    <TableCell key={col.key} isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      {col.label}
                    </TableCell>
                  ))}
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={sortedVisibleColumns.length + 1}
                      className="h-[300px] px-5 py-4"
                    >
                      <div className="flex flex-col items-center justify-center h-full w-full text-center text-gray-400 gap-2">
                        <DocumentMagnifyingGlassIcon className="h-12 w-12" />
                        <span className="font-medium">No channels found.</span>
                        <span className="text-sm">
                          {searchTerm ? `No channels match "${searchTerm}"` : "No channels available."}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((channel: ChannelType) => (
                    <TableRow key={channel.channel_type_id}>
                      {sortedVisibleColumns.map(col => (
                        <TableCell key={`${channel.channel_type_id}-${col.key}`} className="px-5 py-4 text-start text-theme-sm">
                          {renderCellContent(channel, col.key as keyof ChannelType)}
                        </TableCell>
                      ))}
                      <TableCell className="px-4 py-3 text-center">
                        <ActionMenu channel={channel} onSelect={handleAction} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* No results message for search */}
        {filteredData.length === 0 && searchTerm && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No channels found matching &quot;{searchTerm}&quot;.
            </p>
          </div>
        )}
      </div>
      {/* Pagination - Now outside the table container */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Showing{" "}
              <span className="font-medium">{startIndex + 1}</span>
              {" "}to{" "}
              <span className="font-medium">
                {Math.min(startIndex + pageSize, filteredData.length)}
              </span>
              {" "}of{" "}
              <span className="font-medium">{filteredData.length}</span>
              {" "}results
            </span>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </>
  );
}

export { ColumnSelector };
export default ChannelTable;
