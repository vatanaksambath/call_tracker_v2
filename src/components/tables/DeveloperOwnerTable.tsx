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
import { 
    EyeIcon, PencilIcon, TrashIcon, EllipsisHorizontalIcon, 
    AdjustmentsHorizontalIcon, XMarkIcon, ChevronLeftIcon, 
    ChevronRightIcon, UserCircleIcon, PhoneIcon, EnvelopeIcon, 
    BriefcaseIcon, BuildingOffice2Icon 
} from "@heroicons/react/24/outline";
import Button from "../ui/button/Button";
import { IDeveloperOwner, developerOwnerData } from "@/data/developerOwnerData";

const allColumns: { key: keyof IDeveloperOwner; label: string }[] = [
    { key: 'DeveloperOwnerFullName', label: 'Full Name' },
    { key: 'Email', label: 'Email' },
    { key: 'Phone', label: 'Phone' },
    { key: 'Company', label: 'Company' },
    { key: 'Position', label: 'Position' },
    { key: 'Status', label: 'Status' },
];

const ActionMenu = ({ 
    developerOwner, 
    onSelect 
}: { 
    developerOwner: IDeveloperOwner; 
    onSelect: (action: 'view' | 'edit' | 'delete', developerOwner: IDeveloperOwner) => void; 
}) => {
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
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
            >
                <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <button onClick={() => { onSelect('view', developerOwner); setIsOpen(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg flex items-center gap-2">
                        <EyeIcon className="h-4 w-4" /> View
                    </button>
                    <button onClick={() => { onSelect('edit', developerOwner); setIsOpen(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                        <PencilIcon className="h-4 w-4" /> Edit
                    </button>
                    <button onClick={() => { onSelect('delete', developerOwner); setIsOpen(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg flex items-center gap-2 text-red-600">
                        <TrashIcon className="h-4 w-4" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>, label: string, value: string }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <Icon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm text-gray-900 dark:text-white break-words">{value || 'N/A'}</p>
        </div>
    </div>
);

const DeveloperOwnerModal = ({ 
    developerOwner, 
    onClose 
}: { 
    developerOwner: IDeveloperOwner; 
    onClose: () => void; 
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Developer Owner Details</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 flex flex-col items-center text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                                <UserCircleIcon className="h-12 w-12 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{developerOwner.DeveloperOwnerFullName}</h4>
                            <Badge color={developerOwner.Status === 'Active' ? 'success' : 'error'}>{developerOwner.Status}</Badge>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">ID: {developerOwner.DeveloperOwnerID}</p>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Contact Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailItem icon={EnvelopeIcon} label="Email" value={developerOwner.Email || 'N/A'} />
                                    <DetailItem icon={PhoneIcon} label="Phone" value={developerOwner.Phone || 'N/A'} />
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Professional Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailItem icon={BuildingOffice2Icon} label="Company" value={developerOwner.Company || 'N/A'} />
                                    <DetailItem icon={BriefcaseIcon} label="Position" value={developerOwner.Position || 'N/A'} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 px-6 pb-6">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
};

const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
}: { 
    currentPage: number, 
    totalPages: number, 
    onPageChange: (page: number) => void 
}) => {
    const getPageNumbers = () => {
        const pages = [];
        const pageLimit = 2;
        
        if (totalPages <= 1) return [];

        pages.push(1);

        if (currentPage > pageLimit + 1) {
            pages.push('...');
        }

        const startPage = Math.max(2, currentPage - pageLimit);
        const endPage = Math.min(totalPages - 1, currentPage + pageLimit);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - pageLimit - 1) {
            pages.push('...');
        }

        if (totalPages > 1) {
            pages.push(totalPages);
        }
        
        return [...new Set(pages)];
    };

    return (
        <nav className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
            >
                <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            {getPageNumbers().map((page, index) =>
                typeof page === 'number' ? (
                    <Button 
                        key={index} 
                        variant={currentPage === page ? 'outline' : 'primary'} 
                        size="sm" 
                        onClick={() => onPageChange(page)} 
                        className="w-9"
                    >
                        {page}
                    </Button>
                ) : (
                    <span key={index} className="px-2 py-1 text-sm">...</span>
                )
            )}
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
            >
                <ChevronRightIcon className="h-4 w-4" />
            </Button>
        </nav>
    );
};

export default function DeveloperOwnerTable() {
    const [developerOwners, setDeveloperOwners] = useState<IDeveloperOwner[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    const [visibleColumns, setVisibleColumns] = useState<(keyof IDeveloperOwner)[]>(() => {
        try {
            const savedColumns = localStorage.getItem('developerOwnerTableVisibleColumns');
            return savedColumns ? JSON.parse(savedColumns) : ['DeveloperOwnerFullName', 'Email', 'Phone', 'Company', 'Status'];
        } catch {
            return ['DeveloperOwnerFullName', 'Email', 'Phone', 'Company', 'Status'];
        }
    });

    const [selectedDeveloperOwner, setSelectedDeveloperOwner] = useState<IDeveloperOwner | null>(null);
    const [showColumnSettings, setShowColumnSettings] = useState(false);

    useEffect(() => {
        const fetchDeveloperOwners = () => {
            // Simulate API call with local data
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedData = developerOwnerData.slice(startIndex, endIndex);
            
            setDeveloperOwners(paginatedData);
            setTotalRows(developerOwnerData.length);
        };

        fetchDeveloperOwners();
    }, [currentPage, pageSize]);

    useEffect(() => {
        localStorage.setItem('developerOwnerTableVisibleColumns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    const handleColumnToggle = (column: keyof IDeveloperOwner) => {
        setVisibleColumns(prev => 
            prev.includes(column) 
                ? prev.filter(col => col !== column)
                : [...prev, column]
        );
    };

    const handleAction = (action: 'view' | 'edit' | 'delete', developerOwner: IDeveloperOwner) => {
        switch (action) {
            case 'view':
                setSelectedDeveloperOwner(developerOwner);
                break;
            case 'edit':
                console.log('Edit developer owner:', developerOwner);
                // TODO: Navigate to edit page
                break;
            case 'delete':
                console.log('Delete developer owner:', developerOwner);
                // TODO: Show delete confirmation
                break;
        }
    };

    const renderCellContent = (developerOwner: IDeveloperOwner, column: keyof IDeveloperOwner) => {
        const value = developerOwner[column];
        
        switch (column) {
            case 'DeveloperOwnerFullName':
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-medium">
                                {developerOwner.DeveloperOwnerFullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{value}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">ID: {developerOwner.DeveloperOwnerID}</p>
                        </div>
                    </div>
                );
            case 'Status':
                return <Badge color={value === 'Active' ? 'success' : 'error'}>{value}</Badge>;
            case 'Email':
                return value ? (
                    <div className="flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{value}</span>
                    </div>
                ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                );
            case 'Phone':
                return value ? (
                    <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{value}</span>
                    </div>
                ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                );
            default:
                return <span className="text-sm">{value || 'N/A'}</span>;
        }
    };

    const totalPages = Math.ceil(totalRows / pageSize);

    return (
        <div className="space-y-4">
            {/* Column Settings */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRows)} of {totalRows} results
                    </span>
                </div>
                
                <div className="relative">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowColumnSettings(!showColumnSettings)}
                        className="flex items-center gap-2"
                    >
                        <AdjustmentsHorizontalIcon className="h-4 w-4" />
                        Columns
                    </Button>
                    
                    {showColumnSettings && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 p-4">
                            <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Visible Columns</h4>
                            <div className="space-y-2">
                                {allColumns.map(({ key, label }) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns.includes(key)}
                                            onChange={() => handleColumnToggle(key)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-200 dark:border-gray-700">
                            {visibleColumns.map(column => (
                                <TableCell key={column} className="font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50">
                                    {allColumns.find(col => col.key === column)?.label}
                                </TableCell>
                            ))}
                            <TableCell className="font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 w-16">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {developerOwners.map((developerOwner) => (
                            <TableRow key={developerOwner.DeveloperOwnerID} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                {visibleColumns.map(column => (
                                    <TableCell key={column} className="py-4">
                                        {renderCellContent(developerOwner, column)}
                                    </TableCell>
                                ))}
                                <TableCell className="py-4">
                                    <ActionMenu developerOwner={developerOwner} onSelect={handleAction} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                    <select 
                        value={pageSize} 
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
                </div>
                
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            {/* Detail Modal */}
            {selectedDeveloperOwner && (
                <DeveloperOwnerModal 
                    developerOwner={selectedDeveloperOwner} 
                    onClose={() => setSelectedDeveloperOwner(null)} 
                />
            )}
        </div>
    );
}
