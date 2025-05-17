import { PredictionResult } from '@shared/types/prediction';
import { generatePdfAndUpload, UploadResult } from '../utils/storage';

export interface ExportOptions {
  includeCharts?: boolean;
  includePredictions?: boolean;
  includeRemedies?: boolean;
  fileName?: string;
}

export const exportPrediction = async (
  prediction: PredictionResult,
  options: ExportOptions = {}
): Promise<UploadResult> => {
  const {
    includeCharts = true,
    includePredictions = true,
    includeRemedies = true,
    fileName = `prediction_${prediction.id || Date.now()}`,
  } = options;

  try {
    // Format the prediction data for PDF
    let content = `Prediction Report\n`;
    content += `Generated on: ${new Date().toLocaleString()}\n\n`;

    // Add basic prediction info
    if (prediction.user) {
      content += `Name: ${prediction.user.fullName || 'N/A'}\n`;
    }
    if (prediction.dateOfBirth) {
      content += `Date of Birth: ${new Date(prediction.dateOfBirth).toLocaleDateString()}\n`;
    }
    if (prediction.placeOfBirth) {
      content += `Place of Birth: ${prediction.placeOfBirth}\n`;
    }
    content += '\n';

    // Add charts section
    if (includeCharts && prediction.charts) {
      content += '=== Astrological Charts ===\n\n';
      if (prediction.charts.rasi) {
        content += 'Rasi Chart:\n';
        content += `Ascendant: ${prediction.charts.rasi.ascendant.sign} ${prediction.charts.rasi.ascendant.degree}°\n`;
        content += 'Planets:\n';
        Object.entries(prediction.charts.rasi.planets).forEach(([planet, position]) => {
          content += `- ${planet}: ${position.sign} ${position.house} (${position.nature})\n`;
        });
        content += '\n';
      }

      if (prediction.charts.navamsa) {
        content += 'Navamsa Chart:\n';
        content += `Ascendant: ${prediction.charts.navamsa.ascendant.sign} ${prediction.charts.navamsa.ascendant.degree}°\n`;
        content += 'Planets:\n';
        Object.entries(prediction.charts.navamsa.planets).forEach(([planet, position]) => {
          content += `- ${planet}: ${position.sign} ${position.house} (${position.nature})\n`;
        });
        content += '\n';
      }
    }

    // Add predictions section
    if (includePredictions && prediction.predictions) {
      content += '=== Predictions ===\n\n';
      Object.entries(prediction.predictions).forEach(([aspect, predictionText]) => {
        content += `${aspect}:\n${predictionText}\n\n`;
      });
    }

    // Add remedies section
    if (includeRemedies && prediction.remedies && prediction.remedies.length > 0) {
      content += '=== Suggested Remedies ===\n\n';
      prediction.remedies.forEach((remedy, index) => {
        content += `${index + 1}. ${remedy.description}\n`;
        if (remedy.type) {
          content += `   Type: ${remedy.type}\n`;
        }
        content += '\n';
      });
    }

    // Generate and upload PDF
    return await generatePdfAndUpload(content, `${fileName}.pdf`);
  } catch (error) {
    console.error('Error exporting prediction:', error);
    throw new Error('Failed to export prediction');
  }
};

// Helper function to share a prediction export
export const sharePrediction = async (
  prediction: PredictionResult,
  options: ExportOptions = {}
): Promise<void> => {
  try {
    const { url } = await exportPrediction(prediction, options);
    
    if (navigator.share) {
      // Use Web Share API if available
      await navigator.share({
        title: 'Your Astrological Prediction',
        text: 'Check out your astrological prediction',
        url,
      });
    } else {
      // Fallback to copying the URL to clipboard
      await navigator.clipboard.writeText(url);
      alert('Prediction URL copied to clipboard!');
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error sharing prediction:', error);
      throw new Error('Failed to share prediction');
    }
    // User cancelled the share, no action needed
  }
};
