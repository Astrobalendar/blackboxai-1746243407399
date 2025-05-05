import React from 'react';

interface CalendarEventCardProps {
  title: string;
  date: string;
  type?: string;
}

const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ title, date, type }) => {
  return (
    <div className="border p-4 rounded shadow mb-2">
      <h3 className="font-semibold">{title}</h3>
      <p>{date}</p>
      {type && <p className="text-sm text-gray-500">{type}</p>}
    </div>
  );
};

export default CalendarEventCard;
