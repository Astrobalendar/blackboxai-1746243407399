import React from 'react';
import { LineChart as LC, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LineChart = ({ data }: any) => (
  <div className="bg-white rounded shadow p-4">
    <h4 className="font-semibold mb-2">Planetary Transit Tracking</h4>
    <ResponsiveContainer width="100%" height={250}>
      <LC data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LC>
    </ResponsiveContainer>
  </div>
);
export default LineChart;
