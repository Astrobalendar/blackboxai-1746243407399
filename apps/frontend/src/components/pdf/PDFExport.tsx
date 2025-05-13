import jsPDF from 'jspdf';
import 'jspdf-autotable';
import React from 'react';

const PDFExport = ({ predictionData, chartsData }: any) => {
  const handleExport = () => {
    const doc = new jsPDF();
    doc.text('KP Nuke Home Prediction Report', 10, 10);
    // Add personal details, charts, tables, etc.
    // doc.addImage(...chartsData.radar, ...);
    // doc.autoTable({ ... });
    doc.save('prediction.pdf');
  };
  return <button onClick={handleExport} className="btn btn-primary">Export PDF</button>;
};
export default PDFExport;
