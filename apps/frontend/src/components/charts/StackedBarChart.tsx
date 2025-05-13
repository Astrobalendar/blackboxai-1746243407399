import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StackedBarChart = ({ data }: any) => (
  <div className="bg-white rounded shadow p-4">
    <h4 className="font-semibold mb-2">Dasa/Bhukti Timelines</h4>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="dasa" stackId="a" fill="#8884d8" />
        <Bar dataKey="bhukti" stackId="a" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
export default StackedBarChart;
