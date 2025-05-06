import React, { useState } from 'react';
import axios from 'axios';

const Chat: React.FunctionComponent = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post<{ answer: string }>(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        question: input,
      });

      const assistantMessage = { role: 'assistant', content: response.data.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching GPT answer:', error);
    }

    setInput('');
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-grow overflow-y-auto border rounded p-4 mb-4 bg-gray-100">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded ${
              msg.role === 'user' ? 'bg-blue-200 text-right' : 'bg-green-200 text-left'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow border rounded p-2 mr-2"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;