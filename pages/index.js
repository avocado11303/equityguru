import { useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';

export default function Home() {
  const [messages, setMessages] = useState([]);

  const sendMessage = async (msg) => {
    const newMessages = [...messages, { message: msg, isUser: true }];
    setMessages(newMessages);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, conversation: newMessages })
    });

    const data = await res.json();
    setMessages([...newMessages, { message: data.message, isUser: false }]);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>StockSage - AI Stock Chat</h1>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', minHeight: '400px' }}>
        {messages.map((m, i) => <ChatBubble key={i} message={m.message} isUser={m.isUser} />)}
      </div>
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
