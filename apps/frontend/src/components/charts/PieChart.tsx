import React from 'react';
import { PieChart as PC, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0'];

const PieChart = ({ data }: any) => (
  <div className="bg-white rounded shadow p-4">
    <h4 className="font-semibold mb-2">Bhava-wise Distribution</h4>
    <ResponsiveContainer width="100%" height={250}>
      <PC>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PC>
    </ResponsiveContainer>
  </div>
);
export default PieChart;
