import { useState, useCallback } from 'react';
import { PredictionResult } from '@shared/types/prediction';
import { generatePdf, uploadToFirebase, generateUniqueFilename, downloadBlob } from '../lib/export-utils';
import { storage } from '../firebase/config';
import { ref, getDownloadURL } from 'firebase/storage';

/**
 * Shares a file using the Web Share API if available, otherwise falls back to downloading
 */
async function shareFile(file: Blob, title: string, text: string): Promise<void> {
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([file], 'prediction.pdf', { type: 'application/pdf' })] })) {
    try {
      await navigator.share({
        title,
        text,
        files: [new File([file], 'prediction.pdf', { type: 'application/pdf' })],
      });
      return;
    } catch (err) {
      console.warn('Error sharing file:', err);
      // Fall through to download if sharing fails
    }
  }
  
  // Fallback to download if Web Share API is not available
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'prediction.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ExportOptions {
  includeCharts?: boolean;
  includePredictions?: boolean;
  includeRemedies?: boolean;
  elementId?: string;
  fileName?: string;
  metadata?: Record<string, any>;
}

export interface ExportResult {
  url: string;
  fileName: string;
  size: number;
  contentType: string;
  fullPath: string;
}

export const usePredictionExportV2 = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setExportResult(null);
  }, []);

  const exportToPdf = useCallback(async (
    elementId: string,
    options: Omit<ExportOptions, 'elementId'> = {}
  ): Promise<ExportResult> => {
    if (isProcessing) {
      throw new Error('Export already in progress');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Generate PDF from DOM element
      const pdfBlob = await generatePdf(elementId, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: process.env.NODE_ENV === 'development',
      });

      // 2. Generate a unique filename if not provided
      const fileName = options.fileName || generateUniqueFilename('prediction');
      const storagePath = `predictions/${fileName}`;

      // 3. Upload to Firebase Storage
      const result = await uploadToFirebase(pdfBlob, storagePath, {
        contentType: 'application/pdf',
        cacheControl: 'public, max-age=31536000', // 1 year
        customMetadata: {
          exportedAt: new Date().toISOString(),
          ...(options.metadata || {}),
        },
      });

      setExportResult(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Export failed');
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const downloadPdf = useCallback(async (
    elementId: string,
    fileName: string = 'prediction.pdf'
  ): Promise<void> => {
    try {
      setIsProcessing(true);
      const pdfBlob = await generatePdf(elementId);
      downloadBlob(pdfBlob, fileName);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Download failed');
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const sharePdf = useCallback(async (
    elementId: string,
    title: string = 'Your Astrological Prediction',
    text: string = 'Check out your astrological prediction'
  ): Promise<void> => {
    try {
      setIsProcessing(true);
      const pdfBlob = await generatePdf(elementId);
      await shareFile(pdfBlob, title, text);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sharing failed');
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const sendEmail = useCallback(async (
    elementId: string,
    email: string,
    subject: string = 'Your Astrological Prediction'
  ): Promise<void> => {
    try {
      setIsProcessing(true);
      
      // 1. Generate and upload PDF
      const result = await exportToPdf(elementId, {
        fileName: `prediction_${Date.now()}.pdf`,
        metadata: { email, purpose: 'email' },
      });

      // 2. Send email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject,
          url: result.url,
          fileName: result.fileName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      return response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Email send failed');
      setError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [exportToPdf]);

  return {
    // State
    isProcessing,
    error,
    exportResult,
    
    // Actions
    exportToPdf,
    downloadPdf,
    sharePdf,
    sendEmail,
    reset,
    
    // Helpers
    getDownloadUrl: (path: string) => getDownloadURL(ref(storage, path)),
  };
};

export default usePredictionExportV2;
