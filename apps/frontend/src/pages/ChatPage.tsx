import React from 'react';
import Chat from '../components/Chat';

const ChatPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-blue-500 text-white p-4 text-center">
        <h1 className="text-xl font-bold">Astrobalendar Chat</h1>
      </header>
      <main className="flex-grow">
        <Chat />
      </main>
    </div>
  );
};

export default ChatPage;