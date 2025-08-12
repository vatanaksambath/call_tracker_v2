"use client";
import React, { useState, useRef, useCallback } from "react";
import { TrashIcon, PlusIcon, EyeIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/ui/modal";

export interface PhotoFile {
  id: string;
  file: File | null;
  preview: string;
  name: string;
  size: number;
  isExisting?: boolean;
}

interface PhotoUploadProps {
  photos: PhotoFile[];
  onPhotosChange: (photos: PhotoFile[]) => void;
  maxPhotos?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  className?: string;
}

export default function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  maxFileSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  className = ''
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoFile | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const generateId = () => {
    return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList) => {
    const newPhotos: PhotoFile[] = [];
    const currentCount = photos.length;

    for (let i = 0; i < files.length; i++) {
      if (currentCount + newPhotos.length >= maxPhotos) {
        alert(`Maximum ${maxPhotos} photos allowed`);
        break;
      }

      const file = files[i];
      
      if (!acceptedTypes.includes(file.type)) {
        alert(`File type ${file.type} not supported. Please use: ${acceptedTypes.join(', ')}`);
        continue;
      }

      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File size must be less than ${maxFileSize}MB`);
        continue;
      }

      const photoId = generateId();
      const preview = URL.createObjectURL(file);

      newPhotos.push({
        id: photoId,
        file,
        preview,
        name: file.name,
        size: file.size,
        isExisting: false
      });
    }

    if (newPhotos.length > 0) {
      onPhotosChange([...photos, ...newPhotos]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    onPhotosChange(updatedPhotos);
    
    if (previewPhoto?.id === photoId) {
      setShowPreviewModal(false);
      setPreviewPhoto(null);
    }
  };

  const previewPhotoHandler = (photo: PhotoFile) => {
    setPreviewPhoto(photo);
    setCurrentPhotoIndex(photos.findIndex(p => p.id === photo.id));
    setShowPreviewModal(true);
  };

  const goToPreviousPhoto = useCallback(() => {
    const newIndex = currentPhotoIndex > 0 ? currentPhotoIndex - 1 : photos.length - 1;
    setCurrentPhotoIndex(newIndex);
    setPreviewPhoto(photos[newIndex]);
  }, [currentPhotoIndex, photos]);

  const goToNextPhoto = useCallback(() => {
    const newIndex = currentPhotoIndex < photos.length - 1 ? currentPhotoIndex + 1 : 0;
    setCurrentPhotoIndex(newIndex);
    setPreviewPhoto(photos[newIndex]);
  }, [currentPhotoIndex, photos]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center">
          <PlusIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
            Add Photos
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag & drop or click to select ({photos.length}/{maxPhotos})
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Supported: JPG, PNG, GIF • Max {maxFileSize}MB each
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    type="button"
                    onClick={() => previewPhotoHandler(photo)}
                    className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    title="Preview"
                  >
                    <EyeIcon className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600"
                    title="Remove"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <div className="mt-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {photo.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {photo.isExisting ? 'Existing' : formatFileSize(photo.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple Photo Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        className="max-w-6xl"
      >
        {previewPhoto && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {previewPhoto.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Photo {currentPhotoIndex + 1} of {photos.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[400px] flex items-center justify-center relative">
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPreviousPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-60 text-white w-10 h-10 rounded-full hover:bg-opacity-80 flex items-center justify-center text-xl"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goToNextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-60 text-white w-10 h-10 rounded-full hover:bg-opacity-80 flex items-center justify-center text-xl"
                  >
                    ›
                  </button>
                </>
              )}
              
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.preview}
                alt={previewPhoto.name}
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const container = target.parentElement;
                  if (container) {
                    const fallback = document.createElement('div');
                    fallback.className = 'text-center p-8';
                    fallback.innerHTML = `
                      <div class="text-6xl mb-4">📷</div>
                      <h3 class="text-lg font-medium mb-2 text-gray-900 dark:text-white">Photo unavailable</h3>
                      <p class="text-sm text-gray-500 mb-4">Could not load image</p>
                      <button onclick="window.open('${previewPhoto.preview}', '_blank')" 
                              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Open in New Tab
                      </button>
                    `;
                    container.appendChild(fallback);
                  }
                }}
              />
            </div>
            
            {photos.length > 1 && (
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-2 overflow-x-auto py-2">
                  {photos.map((photo, index) => (
                    <button
                      type="button"
                      key={photo.id}
                      onClick={() => {
                        setCurrentPhotoIndex(index);
                        setPreviewPhoto(photo);
                      }}
                      className={`flex-shrink-0 w-16 h-16 border-2 overflow-hidden ${
                        index === currentPhotoIndex ? 'border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.preview}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => removePhoto(previewPhoto.id)}
                className="px-4 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
