/// <reference lib="dom" />
/// <reference types="node" />
/// <reference lib="dom" />
/* eslint-env browser */
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from '../firebase/config';

const storage = getStorage(app);

export interface UploadResult {
  url: string;
  path: string;
  name: string;
}

export const uploadFile = async (
  file: File,
  path: string = 'predictions',
  metadata: Record<string, any> = {}
): Promise<UploadResult> => {
  try {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: metadata,
    });
    
    const url = await getDownloadURL(snapshot.ref);
    
    return {
      url,
      path: snapshot.ref.fullPath,
      name: file.name,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

export const deleteFile = async (path: string): Promise<void> => {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

export const getFileUrl = async (path: string): Promise<string> => {
  try {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw new Error('File not found');
  }
};

export const generatePdfAndUpload = async (
  content: string,
  fileName: string = `prediction_${Date.now()}.pdf`
): Promise<UploadResult> => {
  try {
    // Using jsPDF for PDF generation
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Add content to PDF
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 20);
    
    // Generate PDF as blob
    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    
    // Upload to Firebase Storage
    return await uploadFile(pdfFile, 'predictions', {
      contentType: 'application/pdf',
      cacheControl: 'public, max-age=31536000',
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
