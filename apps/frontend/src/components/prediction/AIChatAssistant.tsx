import React, { useState, useRef, useEffect } from 'react';

interface AIChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

interface AIChatAssistantProps {
  sessionId: string;
  user: { uid: string; role: string; fullName?: string };
  chartContext?: any;
  dasaContext?: any;
  predictionContext?: any;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ sessionId, user, chartContext, dasaContext, predictionContext }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: AIChatMessage = {
      sender: 'user',
      text: input,
      timestamp: Date.now(),
    };
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/aiChatAssistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMsg.text,
          user: user.uid,
          role: user.role,
          chartContext,
          dasaContext,
          predictionContext,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI error');
      setMessages(msgs => [...msgs, { sender: 'ai', text: data.aiResponse, timestamp: Date.now() }]);
    } catch (err: any) {
      setError(err.message || 'AI error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg shadow bg-white flex flex-col h-96 max-w-xl">
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-3 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-100 text-indigo-900' : 'bg-gray-100 text-gray-800'}`}>{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && <div className="text-red-600 p-2 text-xs">{error}</div>}
      <div className="flex border-t p-2 gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Ask about this chart, Dasa, or prediction..."
          disabled={loading}
        />
        <button
          className="bg-indigo-600 text-white px-4 py-1 rounded disabled:opacity-50"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default AIChatAssistant;
