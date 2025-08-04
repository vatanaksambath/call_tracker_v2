"use client";
import React, { useState, useRef, useCallback } from "react";
import { TrashIcon, PlusIcon, EyeIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";

interface PhotoFile {
  id: string;
  file: File | null; // Allow null for existing photos
  preview: string;
  name: string;
  size: number;
  isExisting?: boolean; // Flag to identify existing photos
}

interface PhotoUploadProps {
  photos: PhotoFile[];
  onPhotosChange: (photos: PhotoFile[]) => void;
  maxPhotos?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

export default function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  maxFileSize = 5, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  className = ''
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoFile | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Generate unique ID for each photo
  const generateId = () => {
    return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }
    
    return null;
  }, [acceptedTypes, maxFileSize]);

  // Process files
  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newPhotos: PhotoFile[] = [];
    const errors: string[] = [];

    // Check if adding these files would exceed the limit
    if (photos.length + fileArray.length > maxPhotos) {
      errors.push(`Maximum ${maxPhotos} photos allowed. You can only add ${maxPhotos - photos.length} more photo(s).`);
      return;
    }

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        return;
      }

      // Check for duplicates (by name and size)
      const isDuplicate = photos.some(photo => 
        photo.file && photo.name === file.name && photo.size === file.size
      );
      
      if (isDuplicate) {
        errors.push(`${file.name}: Duplicate file already added`);
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      
      newPhotos.push({
        id: generateId(),
        file,
        preview,
        name: file.name,
        size: file.size
      });
    });

    if (errors.length > 0) {
      alert(`Upload errors:\n${errors.join('\n')}`);
    }

    if (newPhotos.length > 0) {
      onPhotosChange([...photos, ...newPhotos]);
    }
  }, [photos, onPhotosChange, maxPhotos, validateFile]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Remove photo
  const removePhoto = (photoId: string) => {
    const photoToRemove = photos.find(p => p.id === photoId);
    if (photoToRemove) {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(photoToRemove.preview);
      onPhotosChange(photos.filter(p => p.id !== photoId));
    }
  };

  // Preview photo
  const previewPhotoHandler = (photo: PhotoFile) => {
    setPreviewPhoto(photo);
    setShowPreviewModal(true);
  };

  // Cleanup URLs when component unmounts or photos change
  React.useEffect(() => {
    return () => {
      photos.forEach(photo => {
        // Only revoke blob URLs (URLs that start with "blob:")
        if (photo.preview.startsWith('blob:')) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, [photos]);

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${photos.length >= maxPhotos ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (photos.length < maxPhotos && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
          disabled={photos.length >= maxPhotos}
        />
        
        <div className="flex flex-col items-center">
          <PlusIcon className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {photos.length >= maxPhotos 
              ? `Maximum ${maxPhotos} photos reached`
              : 'Click to upload or drag and drop photos'
            }
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {maxFileSize}MB each
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {photos.length}/{maxPhotos} photos
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Uploaded Photos ({photos.length}/{maxPhotos})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.preview}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          previewPhotoHandler(photo);
                        }}
                        className="p-1.5 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                        title="Preview"
                      >
                        <EyeIcon className="h-4 w-4 text-gray-700" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(photo.id);
                        }}
                        className="p-1.5 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                        title="Remove"
                      >
                        <TrashIcon className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Photo info */}
                <div className="mt-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={photo.name}>
                    {photo.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {photo.isExisting ? 'Existing Photo' : formatFileSize(photo.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        className="max-w-4xl"
      >
        {previewPhoto && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Photo Preview
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {previewPhoto.name} {previewPhoto.isExisting ? '(Existing Photo)' : `(${formatFileSize(previewPhoto.size)})`}
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.preview}
                alt={previewPhoto.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => removePhoto(previewPhoto.id)}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/10"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Remove
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowPreviewModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export type { PhotoFile };
