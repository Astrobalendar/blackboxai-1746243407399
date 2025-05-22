import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  includeCharts?: boolean;
  includePredictions?: boolean;
  includeRemedies?: boolean;
}

export interface ExportResult {
  url: string;
  fileName: string;
  size: number;
  contentType: string;
  fullPath: string;
}

export const generatePdf = async (elementId: string, options: {
  scale?: number;
  backgroundColor?: string;
  logging?: boolean;
} = {}): Promise<Blob> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Could not find element to export');
  }

  const canvas = await html2canvas(element, {
    scale: options.scale || 2,
    useCORS: true,
    logging: options.logging || false,
    backgroundColor: options.backgroundColor || '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
  });

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  return new Blob([pdf.output('blob')], { type: 'application/pdf' });
};

export const uploadToFirebase = async (
  blob: Blob,
  path: string,
  metadata: Record<string, any> = {}
): Promise<ExportResult> => {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, blob, {
    contentType: 'application/pdf',
    cacheControl: 'public, max-age=31536000',
    ...metadata,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      null,
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url,
            fileName: uploadTask.snapshot.ref.name,
            size: uploadTask.snapshot.bytesTransferred,
            contentType: uploadTask.snapshot.metadata.contentType || 'application/pdf',
            fullPath: uploadTask.snapshot.ref.fullPath,
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

export const generateUniqueFilename = (prefix: string = 'prediction', extension: string = 'pdf'): string => {
  const timestamp = Date.now();
  const randomId = uuidv4().substring(0, 8);
  return `${prefix}_${timestamp}_${randomId}.${extension.replace(/^\./, '')}`;
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareFile = async (file: File | Blob, title: string, text: string): Promise<void> => {
  const shareData: ShareData = {
    title,
    text,
  };

  // Check if we can share files (Chrome/Edge for Android)
  const canShareFiles = navigator.canShare && navigator.canShare({ files: [new File([file], title, { type: file.type })] });
  
  if (navigator.share && canShareFiles) {
    try {
      // Add files to share data if supported
      shareData.files = [new File([file], title, { type: file.type })];
      await navigator.share(shareData);
    } catch (error) {
      console.error('Error sharing file:', error);
      throw error;
    }
  } else {
    throw new Error('Web Share API not supported in this browser');
  }
};
