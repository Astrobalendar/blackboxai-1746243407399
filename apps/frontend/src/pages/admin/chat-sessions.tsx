import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface ChatSession {
  id: string;
  user: string;
  role: string;
  startedAt: string;
  chartRef?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  ai: boolean;
}

const ChatSessionsAdmin: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      const db = getFirestore();
      const snap = await getDocs(collection(db, 'aiChatSessions'));
      const sessArr: ChatSession[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
      setSessions(sessArr.sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || '')));
      setLoading(false);
    };
    fetchSessions();
  }, []);

  const fetchMessages = async (sessionId: string) => {
    setLoading(true);
    const db = getFirestore();
    const msgsSnap = await getDocs(query(collection(db, `aiChatSessions/${sessionId}/messages`), orderBy('timestamp')));
    const msgs: ChatMessage[] = msgsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
    setMessages(msgs);
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">AI Chat Sessions Audit</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-2">Sessions</h2>
          {loading && <div>Loading...</div>}
          <ul className="divide-y">
            {sessions.map(sess => (
              <li key={sess.id} className={`py-2 px-2 cursor-pointer hover:bg-gray-100 rounded ${selectedSession?.id === sess.id ? 'bg-indigo-100' : ''}`}
                  onClick={() => { setSelectedSession(sess); fetchMessages(sess.id); }}>
                <div className="font-mono text-xs text-gray-500">{sess.id}</div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">{sess.user}</span>
                  <span className="text-xs bg-gray-200 px-2 rounded">{sess.role}</span>
                  {sess.chartRef && <span className="text-xs text-blue-600">Chart: {sess.chartRef}</span>}
                  <span className="text-xs text-gray-400 ml-auto">{new Date(sess.startedAt).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Messages</h2>
          {selectedSession ? (
            <div className="border rounded p-4 min-h-[200px] max-h-[400px] overflow-y-auto bg-white">
              {messages.map(msg => (
                <div key={msg.id} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-lg ${msg.ai ? 'bg-indigo-100 text-indigo-900' : 'bg-gray-100 text-gray-800'}`}>{msg.text}</div>
                  <div className="ml-2 text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          ) : <div className="text-gray-400">Select a session to view messages.</div>}
        </div>
      </div>
    </div>
  );
};

export default ChatSessionsAdmin;
