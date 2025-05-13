import React from 'react';
import PredictionCard from './PredictionCard';
import RadarChart from '../charts/RadarChart';
import StackedBarChart from '../charts/StackedBarChart';
import PieChart from '../charts/PieChart';
import LineChart from '../charts/LineChart';
import KPChartSVG from '../charts/KPChartSVG';
import PDFExport from '../pdf/PDFExport';

const PredictionView = ({ predictionData, chartsData, onEdit, onExportPDF }: any) => (
  <div className="p-6">
    <header className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Prediction for {predictionData?.name || 'Client'}</h2>
      <div>
        <button onClick={onExportPDF} className="btn btn-primary">Export PDF</button>
      </div>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <PredictionCard title="General" content={predictionData?.general} editable onEdit={onEdit} />
      <PredictionCard title="Health" content={predictionData?.health} editable onEdit={onEdit} />
      <PredictionCard title="Education" content={predictionData?.education} editable onEdit={onEdit} />
      <PredictionCard title="Profession" content={predictionData?.profession} editable onEdit={onEdit} />
      <PredictionCard title="Marriage" content={predictionData?.marriage} editable onEdit={onEdit} />
      <PredictionCard title="Financial" content={predictionData?.financial} editable onEdit={onEdit} />
      <PredictionCard title="Travel" content={predictionData?.travel} editable onEdit={onEdit} />
      <PredictionCard title="Remedies" content={predictionData?.remedies} editable onEdit={onEdit} />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RadarChart data={chartsData?.radar} />
      <StackedBarChart data={chartsData?.dasaBhukti} />
      <PieChart data={chartsData?.bhava} />
      <LineChart data={chartsData?.transit} />
      <KPChartSVG data={chartsData?.kp} />
    </div>
  </div>
);

export default PredictionView;
