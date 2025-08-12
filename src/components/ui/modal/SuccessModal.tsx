import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmButtonText = "OK"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-auto max-w-md mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none dark:bg-boxdark">
          {/* Header */}
          <div className="flex items-center justify-center p-6 border-b border-solid rounded-t border-stroke dark:border-strokedark">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full dark:bg-green-900/20">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          {/* Body */}
          <div className="relative flex-auto p-6 text-center">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-body dark:text-bodydark">
              {message}
            </p>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-center p-6 border-t border-solid rounded-b border-stroke dark:border-strokedark">
            <button
              className="px-6 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-boxdark"
              onClick={onClose}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
