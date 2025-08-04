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
    ChevronRightIcon, DocumentMagnifyingGlassIcon, UserCircleIcon, 
    CalendarDaysIcon, InformationCircleIcon, MapPinIcon
} from "@heroicons/react/24/outline";
import Button from "../ui/button/Button";
import { locationData, Location } from "../form/sample-data/locationData";
import { useRouter } from "next/navigation";

// Column definitions
const allColumns = [
    { key: 'location_id', label: 'ID' },
    { key: 'location_description', label: 'Description' },
    { key: 'province', label: 'City/Province' },
    { key: 'district', label: 'District' },
    { key: 'commune', label: 'Commune' },
    { key: 'village', label: 'Village' },
    { key: 'created_date', label: 'Created Date' },
    { key: 'is_active', label: 'Status' },
] as const;

const ActionMenu = ({ location, onSelect }: { location: Location; onSelect: (action: 'view' | 'edit' | 'delete', location: Location) => void; }) => {
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
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('view', location); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><EyeIcon className="h-4 w-4"/> View</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('edit', location); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><PencilIcon className="h-4 w-4"/> Edit</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onSelect('delete', location); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]"><TrashIcon className="h-4 w-4"/> Delete</a></li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const ColumnSelector = ({ visibleColumns, setVisibleColumns }: { visibleColumns: (keyof Location)[], setVisibleColumns: React.Dispatch<React.SetStateAction<(keyof Location)[]>> }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleColumn = (columnKey: keyof Location) => {
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

const ViewLocationModal = ({ location, onClose }: { location: Location | null; onClose: () => void; }) => {
    if (!location) return null;

    const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm text-gray-800 dark:text-gray-100 break-words">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                            <MapPinIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Location Details</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{location.location_id}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" />
                    </Button>
                </div>
                
                <div className="flex-grow overflow-y-auto mt-6 pr-2">
                    <div className="space-y-6">
                        {/* Location Header */}
                        <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{location.province}</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                                {[location.district, location.commune, location.village].filter(Boolean).join(" → ")}
                            </p>
                            <div className="mt-3 flex items-center justify-center gap-4">
                                <Badge size="md" color={location.is_active ? "success" : "error"}>
                                    {location.is_active ? "Active Location" : "Inactive Location"}
                                </Badge>
                            </div>
                        </div>

                        {/* Location Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <MapPinIcon className="h-5 w-5" />
                                    Administrative Hierarchy
                                </h4>
                                <div className="space-y-3">
                                    <DetailItem icon={MapPinIcon} label="Province/City" value={location.province || 'Not specified'} />
                                    <DetailItem icon={MapPinIcon} label="District" value={location.district || 'Not specified'} />
                                    <DetailItem icon={MapPinIcon} label="Commune" value={location.commune || 'Not specified'} />
                                    <DetailItem icon={MapPinIcon} label="Village" value={location.village || 'Not specified'} />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <InformationCircleIcon className="h-5 w-5" />
                                    Location Information
                                </h4>
                                <div className="space-y-3">
                                    <DetailItem icon={UserCircleIcon} label="Location ID" value={location.location_id} />
                                    <DetailItem icon={CalendarDaysIcon} label="Created Date" value={location.created_date} />
                                    <DetailItem icon={InformationCircleIcon} label="Status" value={
                                        <Badge size="sm" color={location.is_active ? "success" : "error"}>
                                            {location.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    } />
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        {location.location_description && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <InformationCircleIcon className="h-5 w-5" />
                                    Description
                                </h4>
                                <div className="bg-gray-50 dark:bg-white/[0.02] rounded-lg p-4">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {location.location_description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
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

interface LocationTableProps {
    searchTerm?: string;
    visibleColumns?: (keyof Location)[];
}

export default function LocationTable({ searchTerm = "", visibleColumns: propVisibleColumns }: LocationTableProps) {
    const router = useRouter();
    const [locations] = useState<Location[]>(locationData);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    
    // Use passed visibleColumns or default to all columns
    const visibleColumns = propVisibleColumns || allColumns.map(col => col.key as keyof Location);

    // Filter locations based on search term
    const filteredLocations = locations.filter(location =>
        location.location_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (location.location_description && location.location_description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (location.province && location.province.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (location.district && location.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (location.commune && location.commune.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (location.village && location.village.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleActionSelect = (action: 'view' | 'edit' | 'delete', location: Location) => {
        if (action === 'view') {
            router.push(`/location/view?id=${location.location_id}`);
        } else if (action === 'edit') {
            router.push(`/location/edit?id=${location.location_id}`);
        } else if (action === 'delete') {
            console.log(`Delete location ${location.location_id}`);
            // Handle delete logic here
        }
    };

    const renderCellContent = (location: Location, columnKey: keyof Location) => {
        switch (columnKey) {
            case 'location_id':
                return (
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                            <MapPinIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {location.location_id}
                        </span>
                    </div>
                );
            case 'location_description':
                return (
                    <div className="max-w-xs">
                        <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2" title={location.location_description}>
                            {location.location_description ? location.location_description.length > 100 ? `${location.location_description.substring(0, 100)}...` : location.location_description : 'No description available'}
                        </p>
                    </div>
                );
            case 'province':
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">
                            {location.province || '-'}
                        </span>
                    </div>
                );
            case 'district':
            case 'commune':
            case 'village':
                return (
                    <span className="text-gray-700 dark:text-gray-300">
                        {location[columnKey] || '-'}
                    </span>
                );
            case 'created_date':
                return (
                    <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                            {location.created_date}
                        </span>
                    </div>
                );
            case 'is_active':
                return (
                    <Badge size="sm" color={location.is_active ? "success" : "error"}>
                        {location.is_active ? "Active" : "Inactive"}
                    </Badge>
                );
            default:
                return <span className="text-gray-600 dark:text-gray-400">{location[columnKey] || '-'}</span>;
        }
    };

    const sortedVisibleColumns = allColumns.filter(col => visibleColumns.includes(col.key));
    const totalPages = Math.ceil(filteredLocations.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedLocations = filteredLocations.slice(startIndex, startIndex + pageSize);

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
                                {paginatedLocations.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={sortedVisibleColumns.length + 1}
                                            className="h-[300px] px-5 py-4"
                                        >
                                            <div className="flex flex-col items-center justify-center h-full w-full text-center text-gray-400 gap-2">
                                                <DocumentMagnifyingGlassIcon className="h-12 w-12" />
                                                <span className="font-medium">No locations found.</span>
                                                <span className="text-sm">
                                                    {searchTerm ? `No locations match &quot;${searchTerm}&quot;` : "No locations available."}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedLocations.map((location) => (
                                        <TableRow key={location.location_id}>
                                            {sortedVisibleColumns.map(col => (
                                                <TableCell key={`${location.location_id}-${col.key}`} className="px-5 py-4 text-start text-theme-sm">
                                                    {renderCellContent(location, col.key)}
                                                </TableCell>
                                            ))}
                                            <TableCell className="px-4 py-3 text-center">
                                                <ActionMenu location={location} onSelect={handleActionSelect} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* No results message for search */}
                {filteredLocations.length === 0 && searchTerm && (
                    <div className="py-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            No locations found matching &quot;{searchTerm}&quot;.
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
                                {Math.min(startIndex + pageSize, filteredLocations.length)}
                            </span>
                            {" "}of{" "}
                            <span className="font-medium">{filteredLocations.length}</span>
                            {" "}results
                        </span>
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}

            <ViewLocationModal location={selectedLocation} onClose={() => setSelectedLocation(null)} />
        </>
    );
}

export { ColumnSelector };
