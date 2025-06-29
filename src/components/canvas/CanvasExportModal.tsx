import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Image } from 'lucide-react';

interface CanvasExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPNG: () => void;
  onExportPDF?: () => void;
}

export const CanvasExportModal: React.FC<CanvasExportModalProps> = ({
  isOpen,
  onClose,
  onExportPNG,
  onExportPDF
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100 flex items-center justify-between">
                <h3 className="text-lg font-medium text-blue-800">Export Canvas</h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-blue-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600">
                  Choose a format to export your canvas design:
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => {
                      onExportPNG();
                      onClose();
                    }}
                    className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Image className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">PNG Image</h4>
                      <p className="text-xs text-blue-600">Export as a high-quality image file</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (onExportPDF) {
                        onExportPDF();
                        onClose();
                      }
                    }}
                    disabled={!onExportPDF}
                    className={`flex items-center gap-3 p-4 border rounded-lg transition-colors text-left ${
                      onExportPDF 
                        ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200' 
                        : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-indigo-800">PDF Document</h4>
                        {!onExportPDF && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">Coming Soon</span>
                        )}
                      </div>
                      <p className="text-xs text-indigo-600">Export as a printable document</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};