import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface KPReportExportProps {
  predictionData: any;
  chartsData: any;
  astrologerName: string;
  onExported?: () => void;
}

// Utility to format date
const formatDate = (date: Date) =>
  date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });

const KPReportExport: React.FC<KPReportExportProps> = ({ predictionData, chartsData, astrologerName, onExported }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    pdf.save(`KP_Prediction_Report_${predictionData?.fullName || 'client'}.pdf`);
    if (onExported) onExported();
  };

  // --- PDF Layout ---
  return (
    <div className="w-full">
      <div ref={reportRef} className="bg-white text-gray-900 font-sans rounded-xl shadow-lg p-8 max-w-5xl mx-auto my-8 border border-gray-200 relative print:bg-white print:shadow-none print:border-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-yellow-400 pb-4 mb-4">
          <div className="flex items-center gap-2">
            {/* Logo placeholder */}
            <img src="/logo192.png" alt="AstroBalendar Logo" className="w-16 h-16 object-contain" />
            <span className="text-2xl font-extrabold tracking-wider text-yellow-700">AstroBalendar</span>
          </div>
          <div className="flex flex-col items-end">
            <img src="/ganesha.png" alt="Ganesha" className="w-12 h-12 mb-1 object-contain" />
            <span className="text-xs text-gray-500">Ref No: {predictionData?.refNo || 'N/A'}</span>
            <span className="text-xs text-gray-500">Date: {formatDate(new Date())}</span>
          </div>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-1 tracking-wide">KP Stellar Prediction Report</h1>
          <div className="text-lg font-medium text-gray-700">Client: {predictionData?.fullName || 'N/A'}</div>
        </div>
        {/* Client Info Block */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-gray-200 pb-4 mb-4">
          <div><span className="font-bold">Name:</span> {predictionData?.fullName}</div>
          <div><span className="font-bold">Gender:</span> {predictionData?.gender}</div>
          <div><span className="font-bold">DOB:</span> {predictionData?.dob}</div>
          <div><span className="font-bold">TOB:</span> {predictionData?.tob}</div>
          <div><span className="font-bold">POB:</span> {predictionData?.pob}</div>
          <div><span className="font-bold">Zone:</span> {predictionData?.zone || 'IST'}</div>
          <div><span className="font-bold">Rectified Time:</span> {predictionData?.rectifiedTime || '-'}</div>
          <div><span className="font-bold">Ayanamsa:</span> {predictionData?.ayanamsa || '-'}</div>
          <div><span className="font-bold">Star:</span> {predictionData?.star || '-'}</div>
          <div><span className="font-bold">Yogam:</span> {predictionData?.yogam || '-'}</div>
          <div><span className="font-bold">Karana:</span> {predictionData?.karana || '-'}</div>
          <div><span className="font-bold">Lagna:</span> {predictionData?.lagna || '-'}</div>
        </div>
        {/* Ruling Planets & Dasa Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-yellow-700 mb-2">Ruling Planets & Dasa</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold mb-1">Ruling Planets</div>
              <table className="w-full text-sm border border-gray-200 mb-2">
                <thead>
                  <tr className="bg-yellow-50 text-yellow-800">
                    <th className="border px-2 py-1">Planet</th>
                    <th className="border px-2 py-1">Sign</th>
                  </tr>
                </thead>
                <tbody>
                  {(predictionData?.chartData?.rulingPlanets || []).map((p: any, i: number) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{p.planet}</td>
                      <td className="border px-2 py-1">{p.sign}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold mb-1">Dasa Bukthi Balance</div>
              <table className="w-full text-sm border border-gray-200 mb-2">
                <thead>
                  <tr className="bg-yellow-50 text-yellow-800">
                    <th className="border px-2 py-1">Dasa</th>
                    <th className="border px-2 py-1">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {(predictionData?.chartData?.dasaBalance || []).map((d: any, i: number) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{d.dasa}</td>
                      <td className="border px-2 py-1">{d.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold mb-1">Current Dasa Chain</div>
              <div className="flex flex-col gap-1">
                {(predictionData?.chartData?.dasa || []).map((d: string, i: number) => (
                  <span key={i} className="inline-block bg-blue-50 text-blue-700 rounded px-2 py-1 text-xs font-semibold border border-blue-200 mb-1">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Planetary Table */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-yellow-700 mb-2">Planetary Table</h2>
          <table className="w-full text-xs border border-gray-200 mb-2">
            <thead>
              <tr className="bg-yellow-50 text-yellow-800">
                <th className="border px-2 py-1">Planet</th>
                <th className="border px-2 py-1">Rasi</th>
                <th className="border px-2 py-1">Longitude</th>
                <th className="border px-2 py-1">Star Lord</th>
                <th className="border px-2 py-1">Sublord</th>
                <th className="border px-2 py-1">Significator</th>
              </tr>
            </thead>
            <tbody>
              {(predictionData?.chartData?.planetTable || []).map((row: any, i: number) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{row.planet}</td>
                  <td className="border px-2 py-1">{row.rasi}</td>
                  <td className="border px-2 py-1">{row.longitude}</td>
                  <td className="border px-2 py-1">{row.starLord}</td>
                  <td className="border px-2 py-1">{row.sublord}</td>
                  <td className="border px-2 py-1">{row.significator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Bhava & Cuspal Links */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-yellow-700 mb-2">Bhava & Cuspal Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold mb-1">Bhava Chart</div>
              <table className="w-full text-xs border border-gray-200 mb-2">
                <thead>
                  <tr className="bg-yellow-50 text-yellow-800">
                    <th className="border px-2 py-1">House</th>
                    <th className="border px-2 py-1">Sign</th>
                    <th className="border px-2 py-1">Degree</th>
                  </tr>
                </thead>
                <tbody>
                  {(predictionData?.chartData?.bhavaChart || []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{row.house}</td>
                      <td className="border px-2 py-1">{row.sign}</td>
                      <td className="border px-2 py-1">{row.degree}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <div className="font-semibold mb-1">Cuspal Links</div>
              <table className="w-full text-xs border border-gray-200 mb-2">
                <thead>
                  <tr className="bg-yellow-50 text-yellow-800">
                    <th className="border px-2 py-1">Cusp</th>
                    <th className="border px-2 py-1">Ruler</th>
                    <th className="border px-2 py-1">Significators</th>
                  </tr>
                </thead>
                <tbody>
                  {(predictionData?.chartData?.cuspalLinks || []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{row.cusp}</td>
                      <td className="border px-2 py-1">{row.ruler}</td>
                      <td className="border px-2 py-1">{row.significators}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Significators Breakdown */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-yellow-700 mb-2">Significators Breakdown</h2>
          <table className="w-full text-xs border border-gray-200 mb-2">
            <thead>
              <tr className="bg-yellow-50 text-yellow-800">
                <th className="border px-2 py-1">House</th>
                <th className="border px-2 py-1">Strong For</th>
                <th className="border px-2 py-1">Weak For</th>
              </tr>
            </thead>
            <tbody>
              {(predictionData?.chartData?.significators || []).map((row: any, i: number) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{row.house}</td>
                  <td className="border px-2 py-1">{row.strongFor}</td>
                  <td className="border px-2 py-1">{row.weakFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Notes & Observations */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-yellow-700 mb-2">Notes & Observations</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm min-h-[40px]">
            {predictionData?.notes || '—'}
          </div>
          {predictionData?.confidenceScores && (
            <div className="mt-2 text-xs text-gray-500">
              <span className="font-semibold">Confidence Scores:</span> {Object.entries(predictionData.confidenceScores).map(([k,v]) => `${k}: ${v}`).join(', ')}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between border-t-2 border-yellow-400 pt-4 mt-4 text-xs text-gray-500">
          <span>Printed by: {astrologerName}</span>
          <span>{formatDate(new Date())}</span>
          <span>AstroBalendar — KP Stellar Astrology Platform</span>
        </div>
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={handleExportPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow transition"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default KPReportExport;
