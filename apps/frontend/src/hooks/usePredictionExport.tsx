import { useState, useCallback } from 'react';
import { PredictionResult } from '@shared/types/prediction';
import { exportPrediction, sharePrediction, ExportOptions } from '../services/exportService';

export const usePredictionExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  const resetExport = useCallback(() => {
    setExportError(null);
    setExportUrl(null);
  }, []);

  const handleExport = useCallback(
    async (prediction: PredictionResult, options: ExportOptions = {}) => {
      if (isExporting) return;

      setIsExporting(true);
      setExportError(null);
      setExportUrl(null);

      try {
        const result = await exportPrediction(prediction, options);
        setExportUrl(result.url);
        return result;
      } catch (error) {
        console.error('Export failed:', error);
        setExportError(
          error.message || 'Failed to export prediction. Please try again.'
        );
        throw error;
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting]
  );

  const handleShare = useCallback(
    async (prediction: PredictionResult, options: ExportOptions = {}) => {
      if (isExporting) return;

      setIsExporting(true);
      setExportError(null);

      try {
        await sharePrediction(prediction, options);
      } catch (error) {
        console.error('Share failed:', error);
        setExportError(
          error.message || 'Failed to share prediction. Please try again.'
        );
        throw error;
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting]
  );

  return {
    isExporting,
    exportError,
    exportUrl,
    exportPrediction: handleExport,
    sharePrediction: handleShare,
    resetExport,
  };
};

export default usePredictionExport;
