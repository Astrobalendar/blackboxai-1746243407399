import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import * as htmlToImage from 'html-to-image';
import * as XLSX from 'xlsx';
import { PredictionResult } from '@shared/types/prediction';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

interface ExportHoroscopeSheetProps {
  horoscopeData: {
    fullName: string;
    dob: string;
    tob: string;
    pob: string;
    rectifiedTime: string;
    rulingPlanets: {
      dayLord: string;
      timeLord: string;
      lagnaLord: string;
      moonSubLords: string[];
    };
    prediction: PredictionResult;
    ayanamsa: string;
    astrologerName: string;
    clientRefNo: string;
  };
}

const ExportHoroscopeSheet: React.FC<ExportHoroscopeSheetProps> = ({ horoscopeData }) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = async () => {
    try {
      setIsExporting(true);
      const element = sheetRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`horoscope_${horoscopeData.fullName}.pdf`);
      
      toast.success('PDF generated successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const generateExcel = () => {
    try {
      setIsExporting(true);
      const data = [
        ['Astrobalendar Horoscope Report'],
        [''],
        ['Client Information'],
        ['Name', horoscopeData.fullName],
        ['Date of Birth', horoscopeData.dob],
        ['Time of Birth', horoscopeData.tob],
        ['Place of Birth', horoscopeData.pob],
        ['Rectified Time', horoscopeData.rectifiedTime],
        [''],
        ['Ruling Planets'],
        ['Day Lord', horoscopeData.rulingPlanets.dayLord],
        ['Time Lord', horoscopeData.rulingPlanets.timeLord],
        ['Lagna Lord', horoscopeData.rulingPlanets.lagnaLord],
        ['Moon Sub-Lords', horoscopeData.rulingPlanets.moonSubLords.join(', ')],
        [''],
        ['Prediction'],
        [horoscopeData.prediction.prediction],
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Horoscope');
      XLSX.writeFile(wb, `horoscope_${horoscopeData.fullName}.xlsx`);
      
      toast.success('Excel generated successfully!');
    } catch (error) {
      toast.error('Failed to generate Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={sheetRef} className="p-8 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold mr-4">Astrobalendar</h1>
              <span className="text-sm">Astrologer: {horoscopeData.astrologerName}</span>
            </div>
            <div className="text-sm">
              <span>Date: {new Date().toLocaleDateString()}</span>
              <br />
              <span>Client Ref No: {horoscopeData.clientRefNo}</span>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={generatePDF}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Export as PDF
            </button>
            <button
              onClick={generateExcel}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Export as Excel
            </button>
          </div>
        </div>

        {/* Basic Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-lg mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Basic Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm">Name:</p>
              <p className="font-semibold">{horoscopeData.fullName}</p>
            </div>
            <div>
              <p className="text-sm">Date of Birth:</p>
              <p className="font-semibold">{horoscopeData.dob}</p>
            </div>
            <div>
              <p className="text-sm">Time of Birth:</p>
              <p className="font-semibold">{horoscopeData.tob}</p>
            </div>
            <div>
              <p className="text-sm">Rectified Time:</p>
              <p className="font-semibold">{horoscopeData.rectifiedTime}</p>
            </div>
            <div>
              <p className="text-sm">Place of Birth:</p>
              <p className="font-semibold">{horoscopeData.pob}</p>
            </div>
            <div>
              <p className="text-sm">Ayanamsa:</p>
              <p className="font-semibold">{horoscopeData.ayanamsa}</p>
            </div>
          </div>
        </motion.div>

        {/* Ruling Planets Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-lg mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Ruling Planets</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm">Day Lord</p>
              <p className="font-semibold">{horoscopeData.rulingPlanets.dayLord}</p>
            </div>
            <div className="text-center">
              <p className="text-sm">Time Lord</p>
              <p className="font-semibold">{horoscopeData.rulingPlanets.timeLord}</p>
            </div>
            <div className="text-center">
              <p className="text-sm">Lagna Lord</p>
              <p className="font-semibold">{horoscopeData.rulingPlanets.lagnaLord}</p>
            </div>
            <div className="text-center">
              <p className="text-sm">Moon Sub-Lords</p>
              <p className="font-semibold">{horoscopeData.rulingPlanets.moonSubLords.join(', ')}</p>
            </div>
          </div>
        </motion.div>

        {/* Prediction Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-lg mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Prediction Analysis</h2>
          <div className="prose prose-invert max-w-none">
            <p>{horoscopeData.prediction.prediction}</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-lg"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm">Generated by Astrobalendar</p>
              <p className="text-xs">Page {1}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Astrologer Signature</p>
              <div className="w-32 h-8 border-2 border-dashed border-gray-600 mt-2" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExportHoroscopeSheet;
