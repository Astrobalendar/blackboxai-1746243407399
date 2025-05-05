import React from 'react';

interface Payment {
  payment_id: string;
  status: string;
  amount: number;
  currency: string;
  client_id: string;
  created_at: string;
}

interface PaymentTableProps {
  data: Payment[];
}

const PaymentTable: React.FC<PaymentTableProps> = ({ data }) => {
  return (
    <table className="min-w-full bg-white border">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Payment ID</th>
          <th className="py-2 px-4 border-b">Status</th>
          <th className="py-2 px-4 border-b">Amount</th>
          <th className="py-2 px-4 border-b">Currency</th>
          <th className="py-2 px-4 border-b">Client ID</th>
          <th className="py-2 px-4 border-b">Created At</th>
        </tr>
      </thead>
      <tbody>
        {data.map((payment) => (
          <tr key={payment.payment_id} className="hover:bg-gray-100">
            <td className="py-2 px-4 border-b">{payment.payment_id}</td>
            <td className="py-2 px-4 border-b">{payment.status}</td>
            <td className="py-2 px-4 border-b">{payment.amount}</td>
            <td className="py-2 px-4 border-b">{payment.currency}</td>
            <td className="py-2 px-4 border-b">{payment.client_id}</td>
            <td className="py-2 px-4 border-b">{payment.created_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PaymentTable;
