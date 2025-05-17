import React, { useState } from 'react';
import { Button } from './ui/button';
import { Download, Share2, Mail, Loader2, Copy } from 'lucide-react';
import { PredictionResult } from '@shared/types/prediction';
import { toast } from 'sonner';
import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportOptions {
  includeCharts?: boolean;
  includePredictions?: boolean;
  includeRemedies?: boolean;
}

interface ExportResult {
  url: string;
  fileName: string;
  size: number;
}

interface ExportButtonProps {
  prediction: PredictionResult & { id?: string };
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showShare?: boolean;
  showCopyLink?: boolean;
  autoDownload?: boolean;
  emailRecipient?: string;
  exportOptions?: ExportOptions;
  onExportStart?: () => void;
  onExportSuccess?: (result: ExportResult) => void;
  onEmailSent?: (email: string) => void;
  onExportError?: (error: Error) => void;
  onCopyLink?: (url: string) => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  prediction,
  variant = 'outline',
  size = 'default',
  className = '',
  showShare = true,
  showCopyLink = true,
  autoDownload = true,
  emailRecipient,
  exportOptions = {
    includeCharts: true,
    includePredictions: true,
    includeRemedies: true,
  },
  onExportStart,
  onExportSuccess,
  onEmailSent,
  onExportError,
  onCopyLink,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Generate PDF from DOM element
  const generatePdf = async (elementId: string): Promise<Blob> => {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Could not find element to export');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
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

  // Upload PDF to Firebase Storage
  const uploadToFirebase = async (blob: Blob, fileName: string): Promise<ExportResult | undefined> => {
    const storageRef = ref(storage, `predictions/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: 'application/pdf',
      cacheControl: 'public, max-age=31536000',
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
              fileName,
              size: uploadTask.snapshot.bytesTransferred,
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  // Handle the entire export process
  const handleExport = async (): Promise<ExportResult | undefined> => {
    if (isProcessing) return;

    setIsProcessing(true);
    onExportStart?.();

    try {
      // 1. Generate PDF
      const pdfBlob = await generatePdf('prediction-content');

      // 2. Upload to Firebase
      const fileName = `prediction_${prediction.id || uuidv4()}.pdf`;
      const result = await uploadToFirebase(pdfBlob, fileName);

      if (!result) {
        throw new Error('Failed to upload PDF to Firebase');
      }

      setDownloadUrl(result.url);
      toast.success('Prediction exported successfully!');

      // 3. Auto-download if enabled
      if (autoDownload) {
        const link = document.createElement('a');
        link.href = result.url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // 4. Call success callback
      onExportSuccess?.(result);
      return result;
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      toast.error(errorMessage);
      onExportError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle email sending
  const handleEmail = async (): Promise<void> => {
    if (!emailRecipient) {
      toast.error('No email recipient specified');
      return;
    }

    try {
      setIsProcessing(true);
      const result = await handleExport();
      if (!result) {
        throw new Error('Failed to generate PDF');
      }

      // In a real app, you would send the email with the PDF attachment
      // using your backend service
      console.log('Would send email to:', emailRecipient, 'with PDF:', result.url);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(`Email sent to ${emailRecipient}`);
      onEmailSent?.(emailRecipient);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
      onExportError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle sharing
  const handleShare = async (): Promise<void> => {
    try {
      const result = await handleExport();
      if (!result) {
        throw new Error('Failed to generate PDF');
      }

      if (navigator.share) {
        await navigator.share({
          title: 'Your Astrological Prediction',
          text: 'Check out this astrological prediction',
          url: result.url,
        });
      } else {
        await navigator.clipboard.writeText(result.url);
        toast.success('Link copied to clipboard!');
        onCopyLink?.(result.url);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share. Please try again.');
      onExportError?.(error as Error);
    }
  };

  // Handle copy link
  const handleCopyLink = async (): Promise<void> => {
    try {
      const result = await handleExport();
      if (!result) {
        throw new Error('Failed to generate PDF');
      }

      await navigator.clipboard.writeText(result.url);
      toast.success('Link copied to clipboard!');
      onCopyLink?.(result.url);
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link. Please try again.');
      onExportError?.(error as Error);
    }
  };

  const isLoading = isProcessing;
  const buttonVariant = variant === 'link' ? 'ghost' : variant;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        variant={buttonVariant}
        size={size}
        onClick={handleExport}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {isLoading ? 'Exporting...' : 'Export PDF'}
      </Button>
      
      {showShare && (
        <Button
          variant="outline"
          size={size}
          onClick={handleShare}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      )}
      
      {showCopyLink && (
        <Button
          variant="ghost"
          size={size}
          onClick={handleCopyLink}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Link
        </Button>
      )}
      
      {emailRecipient && (
        <Button
          variant="ghost"
          size={size}
          onClick={handleEmail}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Email PDF
        </Button>
      )}
    </div>
  );
};

export default ExportButton;
