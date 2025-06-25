/**
 * CanvasScreenshot.tsx
 * 
 * Provides screenshot functionality for the SpatialCanvas system.
 * Captures the current canvas view as an image for export.
 * 
 * ROLE IN SPATIAL CANVAS SYSTEM:
 * - Captures canvas state as an image
 * - Handles image download and export
 * - Provides visual feedback during capture
 * - Manages canvas element references
 */

import { useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';

export const useCanvasScreenshot = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const takeScreenshot = useCallback(async (elementRef: React.RefObject<HTMLDivElement>) => {
    if (!elementRef.current) {
      console.error('Canvas element not found');
      alert('Canvas element not found. Please try again.');
      return;
    }

    try {
      // Show loading indicator
      const loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      loadingIndicator.innerHTML = `
        <div class="bg-white p-4 rounded-lg shadow-lg">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-gray-800">Capturing screenshot...</span>
          </div>
        </div>
      `;
      document.body.appendChild(loadingIndicator);

      // Use html2canvas to capture the canvas
      console.log('Taking screenshot of canvas...');
      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: '#f9fafb', // Match the bg-gray-50 color
        scale: window.devicePixelRatio, // Use device pixel ratio for better quality
        logging: false,
        allowTaint: true,
        useCORS: true
      });

      // Remove loading indicator
      loadingIndicator.remove();

      console.log('Screenshot captured, preparing download...');
      // Convert canvas to image and download
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `canvas-screenshot-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    } catch (error) {
      console.log('Screenshot downloaded successfully');
      console.error('Error taking screenshot:', error);
      
      // Show error notification
      const errorNotification = document.createElement('div');
      errorNotification.className = 'fixed top-4 right-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-md z-50';
      errorNotification.textContent = 'Failed to capture screenshot';
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        errorNotification.remove();
      }, 3000);
    }
  }, []);

  return {
    takeScreenshot,
    canvasRef
  };
};