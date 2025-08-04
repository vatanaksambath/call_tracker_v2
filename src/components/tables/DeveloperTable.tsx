"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { 
    EyeIcon, PencilIcon, TrashIcon, EllipsisHorizontalIcon, 
    AdjustmentsHorizontalIcon, ChevronLeftIcon, 
    ChevronRightIcon, DocumentMagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import Button from "../ui/button/Button";
import { developerData, Developer } from "../form/sample-data/developerData";
import { useRouter } from "next/navigation";

// Column definitions
const allColumns = [
    { key: 'developer_id', label: 'Developer ID' },
    { key: 'developer_name', label: 'Developer Name' },
    { key: 'developer_description', label: 'Description' },
    { key: 'projects', label: 'Projects' },
    { key: 'location', label: 'Location' },
    { key: 'created_date', label: 'Created Date' },
    { key: 'is_active', label: 'Status' },
] as const;

const ActionMenu = ({ developer, onSelect }: { developer: Developer; onSelect: (action: 'view' | 'edit' | 'delete', developer: Developer) => void; }) => {
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
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('view', developer); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><EyeIcon className="h-4 w-4"/> View</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('edit', developer); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><PencilIcon className="h-4 w-4"/> Edit</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('delete', developer); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><TrashIcon className="h-4 w-4"/> Delete</a></li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const ColumnSelector = ({ visibleColumns, setVisibleColumns }: { visibleColumns: (keyof Developer)[], setVisibleColumns: React.Dispatch<React.SetStateAction<(keyof Developer)[]>> }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleColumn = (columnKey: keyof Developer) => {
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
                                        checked={visibleColumns.includes(col.key)}
                                        onChange={() => toggleColumn(col.key)}
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

interface DeveloperTableProps {
    searchTerm?: string;
    visibleColumns?: (keyof Developer)[];
}

export default function DeveloperTable({ searchTerm = "", visibleColumns: propVisibleColumns }: DeveloperTableProps) {
    const router = useRouter();
    const [developers] = useState<Developer[]>(developerData);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    
    // Use passed visibleColumns or default
    const visibleColumns = propVisibleColumns || ['developer_id', 'developer_name', 'developer_description', 'projects', 'location', 'created_date', 'is_active'];

    // Filter developers based on search term
    const filteredDevelopers = developers.filter(developer =>
        developer.developer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        developer.developer_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (developer.location && developer.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (developer.projects && developer.projects.toString().includes(searchTerm)) ||
        developer.developer_id.toString().includes(searchTerm)
    );

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleActionSelect = (action: 'view' | 'edit' | 'delete', developer: Developer) => {
        if (action === 'view') {
            router.push(`/developer/view?id=${developer.developer_id}`);
        } else if (action === 'edit') {
            router.push(`/developer/edit?id=${developer.developer_id}`);
        } else if (action === 'delete') {
            console.log(`Delete developer ${developer.developer_id}`);
            // Handle delete logic here
        }
    };

    const renderCellContent = (developer: Developer, columnKey: keyof Developer) => {
        switch (columnKey) {
            case 'developer_name':
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                            <Image 
                                width={40} 
                                height={40} 
                                src={developer.avatar || "/images/user/user-02.jpg"} 
                                alt={developer.developer_name} 
                                onError={(e) => { e.currentTarget.src = "/images/user/user-02.jpg"; }}
                            />
                        </div>
                        <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{developer.developer_name}</span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">{developer.developer_id}</span>
                        </div>
                    </div>
                );
            case 'is_active':
                return (
                    <Badge size="sm" color={developer.is_active ? "success" : "error"}>
                        {developer.is_active ? "Active" : "Inactive"}
                    </Badge>
                );
            case 'developer_description':
                return (
                    <div className="max-w-xs">
                        <span className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                            {developer.developer_description}
                        </span>
                    </div>
                );
            default:
                return <span className="text-gray-600 dark:text-gray-400">{developer[columnKey]}</span>;
        }
    };

    const sortedVisibleColumns = allColumns.filter(col => visibleColumns.includes(col.key));
    const totalPages = Math.ceil(filteredDevelopers.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedDevelopers = filteredDevelopers.slice(startIndex, startIndex + pageSize);

    return (
        <>
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
                                {paginatedDevelopers.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={sortedVisibleColumns.length + 1}
                                            className="h-[300px] px-5 py-4"
                                        >
                                            <div className="flex flex-col items-center justify-center h-full w-full text-center text-gray-400 gap-2">
                                                <DocumentMagnifyingGlassIcon className="h-12 w-12" />
                                                <span className="font-medium">No developers found.</span>
                                                <span className="text-sm">
                                                    {searchTerm ? `No developers match "${searchTerm}"` : "No developers available."}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedDevelopers.map((developer) => (
                                        <TableRow key={developer.developer_id}>
                                            {sortedVisibleColumns.map(col => (
                                                <TableCell key={`${developer.developer_id}-${col.key}`} className="px-5 py-4 text-start text-theme-sm">
                                                    {renderCellContent(developer, col.key)}
                                                </TableCell>
                                            ))}
                                            <TableCell className="px-4 py-3 text-center">
                                                <ActionMenu developer={developer} onSelect={handleActionSelect} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* No results message for search */}
                {filteredDevelopers.length === 0 && searchTerm && (
                    <div className="py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            No developers found matching &quot;{searchTerm}&quot;.
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
                                {Math.min(startIndex + pageSize, filteredDevelopers.length)}
                            </span>
                            {" "}of{" "}
                            <span className="font-medium">{filteredDevelopers.length}</span>
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