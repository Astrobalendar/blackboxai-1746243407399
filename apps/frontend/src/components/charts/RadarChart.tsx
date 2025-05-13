import React from 'react';
import { Radar, RadarChart as RC, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const RadarChart = ({ data }: any) => (
  <div className="bg-white rounded shadow p-4">
    <h4 className="font-semibold mb-2">Planetary Strengths</h4>
    <ResponsiveContainer width="100%" height={250}>
      <RC cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis />
        <Radar name="Strength" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
      </RC>
    </ResponsiveContainer>
  </div>
);
export default RadarChart;
