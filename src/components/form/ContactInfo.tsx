"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { EnvelopeIcon, ChevronDownIcon } from "@/icons";
import api from "@/lib/api";
import formatApiDataForSelect from "@/lib/utils"; 

export interface IContactValue {
    id: number;
    user_name: string;
    contact_number: string;
    remark: string;
    is_primary: boolean;
}

export interface IContactChannel {
    id: number;
    channel_type: ISelectOption | null;
    contact_values: IContactValue[];
}

interface ISelectOption {
    value: string;
    label: string;
}

interface ContactInfoProps {
    value: IContactChannel[];
    onChange: (contacts: IContactChannel[]) => void;
    error?: string;
}

// Type for modal-specific validation errors
type ModalErrors = {
    channel_type?: string;
    contact_values?: {
        contact_number?: string;
    }[];
}[];

const PrimarySegmentedControl = ({ isPrimary, onSetPrimary }: { isPrimary: boolean; onSetPrimary: () => void; }) => {
    const baseClasses = "w-1/2 px-3 py-2.5 text-sm font-medium transition-colors duration-200 focus:outline-none";
    const primaryClasses = isPrimary ? "bg-blue-600 text-white" : "bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100";
    const notPrimaryClasses = !isPrimary ? "bg-red-500 text-white" : "bg-white dark:bg-dark-700 text-gray-600 dark:text-gray-300";

    return (
        <div className="flex w-full rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button type="button" onClick={onSetPrimary} disabled={isPrimary} className={`${baseClasses} rounded-l-md ${primaryClasses} disabled:cursor-not-allowed`}>
                Primary
            </button>
            <div className="border-l border-gray-300 dark:border-gray-600"></div>
            <button type="button" className={`${baseClasses} rounded-r-md ${notPrimaryClasses} cursor-default`}>
                Not Primary
            </button>
        </div>
    );
};

export default function ContactInfo({ value, onChange, error }: ContactInfoProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [localContacts, setLocalContacts] = useState<IContactChannel[]>([]);
    const [channelTypes, setChannelTypes] = useState<ISelectOption[]>([]);
    const [modalErrors, setModalErrors] = useState<ModalErrors>([]);

    useEffect(() => {
        if (isModalOpen && channelTypes.length === 0) {
            api.get('channel-type/channel-type').then(res => {
                setChannelTypes(formatApiDataForSelect(res.data, 'channel_type_id', 'channel_type_name'));
            }).catch(err => console.error("Failed to fetch channel types", err));
        }
    }, [isModalOpen, channelTypes.length]);

    const handleOpenModal = () => {
        setLocalContacts(JSON.parse(JSON.stringify(value)));
        setModalErrors([]);
        setIsModalOpen(true);
    };
    
    const addChannel = () => {
        setLocalContacts(prev => [
            ...prev,
            {
                id: Date.now(),
                channel_type: null,
                contact_values: [{
                    id: Date.now() + 1,
                    user_name: "",
                    contact_number: "",
                    remark: "",
                    is_primary: !prev.some(c => c.contact_values.some(v => v.is_primary)),
                }]
            }
        ]);
    };
    
    const removeChannel = (channelIndex: number) => {
        const newContacts = localContacts.filter((_, idx) => idx !== channelIndex);
        const wasPrimaryRemoved = localContacts[channelIndex].contact_values.some(v => v.is_primary);
        if (wasPrimaryRemoved && newContacts.length > 0 && newContacts[0].contact_values.length > 0) {
            newContacts[0].contact_values[0].is_primary = true;
        }
        setLocalContacts(newContacts);
    };

    const handleChannelTypeChange = (channelIndex: number, selectedOption: ISelectOption | null) => {
        const newContacts = [...localContacts];
        newContacts[channelIndex].channel_type = selectedOption;
        setLocalContacts(newContacts);

        if (modalErrors[channelIndex]?.channel_type) {
            const newErrors = [...modalErrors];
            newErrors[channelIndex] = { ...newErrors[channelIndex], channel_type: undefined };
            setModalErrors(newErrors);
        }
    };

    const addContactValue = (channelIndex: number) => {
        const newContacts = [...localContacts];
        newContacts[channelIndex].contact_values.push({
            id: Date.now(),
            user_name: "",
            contact_number: "",
            remark: "",
            is_primary: !localContacts.some(c => c.contact_values.some(v => v.is_primary)),
        });
        setLocalContacts(newContacts);
    };

    const removeContactValue = (channelIndex: number, valueIndex: number) => {
        const newContacts = [...localContacts];
        const wasPrimary = newContacts[channelIndex].contact_values[valueIndex].is_primary;
        newContacts[channelIndex].contact_values.splice(valueIndex, 1);
        if (wasPrimary && newContacts[channelIndex].contact_values.length > 0) {
            newContacts[channelIndex].contact_values[0].is_primary = true;
        }
        setLocalContacts(newContacts);
    };
    
    const handleValueChange = (channelIndex: number, valueIndex: number, field: keyof IContactValue, fieldValue: any) => {
        const newContacts = [...localContacts];
        (newContacts[channelIndex].contact_values[valueIndex] as any)[field] = fieldValue;
        setLocalContacts(newContacts);

        if (field === 'contact_number' && modalErrors[channelIndex]?.contact_values?.[valueIndex]?.contact_number) {
            const newErrors = [...modalErrors];
            if (!newErrors[channelIndex]) newErrors[channelIndex] = {};
            if (!newErrors[channelIndex].contact_values) newErrors[channelIndex].contact_values = [];
            newErrors[channelIndex].contact_values![valueIndex] = { ...newErrors[channelIndex].contact_values![valueIndex], contact_number: undefined };
            setModalErrors(newErrors);
        }
    };

    const setAsPrimary = (channelIndex: number, valueIndex: number) => {
        const newContacts = localContacts.map((channel, cIdx) => ({
            ...channel,
            contact_values: channel.contact_values.map((contact, vIdx) => ({
                ...contact,
                is_primary: cIdx === channelIndex && vIdx === valueIndex
            }))
        }));
        setLocalContacts(newContacts);
    };

    const validateModal = (): boolean => {
        let isValid = true;
        const newErrors: ModalErrors = [];

        localContacts.forEach((channel, cIdx) => {
            const channelErrors: ModalErrors[number] = {};
            if (!channel.channel_type) {
                channelErrors.channel_type = "Channel type is required.";
                isValid = false;
            }

            const valueErrors: { contact_number?: string }[] = [];
            channel.contact_values.forEach((contact, vIdx) => {
                const contactErrors: { contact_number?: string } = {};
                if (!contact.contact_number.trim()) {
                    contactErrors.contact_number = "Contact number is required.";
                    isValid = false;
                }
                valueErrors[vIdx] = contactErrors;
            });

            if (valueErrors.some(e => e.contact_number)) {
                channelErrors.contact_values = valueErrors;
            }
            newErrors[cIdx] = channelErrors;
        });

        setModalErrors(newErrors);
        return isValid;
    };
    
    const handleSave = () => {
        if (validateModal()) {
            onChange(localContacts);
            setIsModalOpen(false);
        }
    };

    const primaryContact = value.flatMap(c => c.contact_values).find(v => v.is_primary);
    const allContacts = value.flatMap(c => c.contact_values).filter(v => v.contact_number.trim());
    const hasContacts = allContacts.length > 0;

    return (
        <div>
            <Label>Contact Information</Label>
            <div className="mt-1">
                {hasContacts ? (
                    // Selected contacts display (card style similar to Address)
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                        <div className="flex items-start gap-3">
                            <EnvelopeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="font-medium text-gray-800 dark:text-white">
                                    {primaryContact ? 
                                        `${primaryContact.contact_number}${primaryContact.user_name ? ` (${primaryContact.user_name})` : ''}` : 
                                        allContacts[0].contact_number
                                    }
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {primaryContact?.remark || allContacts[0]?.remark || 'Contact Information'}
                                    {allContacts.length > 1 && (
                                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                            +{allContacts.length - 1} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="outline"
                            onClick={handleOpenModal}
                            className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
                        >
                            Edit
                        </Button>
                    </div>
                ) : (
                    // Empty state (matching Address component design)
                    <Button 
                        type="button"
                        variant="outline"
                        onClick={handleOpenModal}
                        className="w-full flex items-center justify-center gap-2 py-3"
                    >
                        <EnvelopeIcon className="h-5 w-5" />
                        Click to input contact
                    </Button>
                )}
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

            {isModalOpen && (
                <div className="fixed inset-0 bg-grey/10 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark-900 p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[75vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Contact Information</h2>
                            <Button size="sm" type="button" onClick={addChannel} className="flex items-center gap-2">
                                <PlusIcon className="h-4 w-4" /> Add Channel
                            </Button>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto space-y-5 pr-2">
                            {localContacts.map((channel, channelIndex) => (
                                <div key={channel.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-dark-800/50">
                                    <div className="flex justify-end mb-2">
                                        <Button variant="ghost" size="icon" type="button" onClick={() => removeChannel(channelIndex)}>
                                            <XMarkIcon className="h-6 w-6 text-red-500 hover:text-red-600 transition-colors" />
                                        </Button>
                                    </div>
                                    <div className="flex justify-between items-center mb-4 bg-white dark:bg-dark-800">
                                        <div className="relative flex-grow">
                                            <Select options={channelTypes} value={channel.channel_type || undefined} onChange={opt => handleChannelTypeChange(channelIndex, opt)} placeholder="Select a channel type..."/>
                                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"><ChevronDownIcon /></span>
                                            {modalErrors[channelIndex]?.channel_type && <p className="text-xs text-red-500 mt-1">{modalErrors[channelIndex]?.channel_type}</p>}
                                        </div>    
                                    </div>
                                    <div className="space-y-4">
                                        {channel.contact_values.map((contact, valueIndex) => (
                                            <div key={contact.id} className="flex items-end p-3 rounded-md bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700">
                                                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">                                    
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Username</Label>
                                                        <Input placeholder="Optional" value={contact.user_name} onChange={e => handleValueChange(channelIndex, valueIndex, 'user_name', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Contact Number / ID</Label>
                                                        <Input placeholder="Contact value" value={contact.contact_number} onChange={e => handleValueChange(channelIndex, valueIndex, 'contact_number', e.target.value)} />
                                                        {modalErrors[channelIndex]?.contact_values?.[valueIndex]?.contact_number && <p className="text-xs text-red-500 mt-1">{modalErrors[channelIndex]?.contact_values?.[valueIndex]?.contact_number}</p>}
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Remark</Label>
                                                        <Input placeholder="e.g., Work" value={contact.remark} onChange={e => handleValueChange(channelIndex, valueIndex, 'remark', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-gray-500">Status</Label>
                                                        <PrimarySegmentedControl isPrimary={contact.is_primary} onSetPrimary={() => setAsPrimary(channelIndex, valueIndex)} />
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 pl-2">
                                                    {channel.contact_values.length > 1 && (
                                                        <Button variant="ghost" size="icon" type="button" onClick={() => removeContactValue(channelIndex, valueIndex)}>
                                                            <TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button size="xs" variant="ghost" type="button" onClick={() => addContactValue(channelIndex)} className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                                            <PlusIcon className="h-4 w-4"/>
                                            Add Contact
                                        </Button>
                                    </div>
                                </div>
                            ))}
                             {localContacts.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No contact channels. Click &apos;Add Channel&apos; to start.</p>}
                        </div>

                        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={handleSave}>Save Contacts</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
