import React, { useEffect, useState } from 'react';
// Placeholder for calendar component import, e.g., react-calendar or fullcalendar
// import Calendar from 'react-calendar';

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // TODO: Fetch calendar events from backend API
    // Placeholder fetch
    setEvents([
      { id: '1', title: 'Prediction for John', date: '2025-05-01' },
      { id: '2', title: 'Prediction for Jane', date: '2025-05-02' },
    ]);
  }, []);

  const onEventClick = (eventId: string) => {
    // TODO: Open modal or navigate to prediction detail page
    alert(`Clicked event ${eventId}`);
  };

  return (
    <div>
      <h2>Calendar</h2>
      {/* TODO: Replace with actual calendar component */}
      <ul>
        {events.map(event => (
          <li key={event.id} onClick={() => onEventClick(event.id)}>
            {event.title} - {event.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CalendarPage;
