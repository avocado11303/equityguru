import { useState, useEffect, useRef } from 'react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null); // Ref to auto-scroll

  // Load conversation from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    setMessages(saved);
  }, []);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (msg) => {
    // Add user message
    let newMessages = [...messages, { message: msg, isUser: true }];
    setMessages(newMessages);
    localStorage.setItem('chatHistory', JSON.stringify(newMessages));

    // Call backend API
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();

    // Add AI response
    newMessages = [...newMessages, { message: data.message, isUser: false }];
    setMessages(newMessages);
    localStorage.setItem('chatHistory', JSON.stringify(newMessages));
  };

  // Clear conversation
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      minHeight: '100vh',
      backgroundColor: 'rgba(228,194,148)', // light pastel background
      padding: '50px 20px',
      fontFamily: 'Verdana',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '4px', lineHeight: '1.2' }}>EquityGuru</h1>
        <p style={{ marginTop: '0', fontStyle: 'italic', fontSize: '14px', color: '#555' }}>
          AI Stock Assistant
        </p>

        {/* Chat container with scrolling */}
        <div style={{ 
          border: '1px solid #ccc',
          padding: '20px',
          borderRadius: '10px',
          minHeight: '500px',
          maxHeight: '500px',      // fixed height for scrolling
          backgroundColor: 'white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          overflowY: 'auto',       // enable scroll when messages exceed container
        }}>
          {messages.map((m, i) => <ChatBubble key={i} message={m.message} isUser={m.isUser} />)}
          <div ref={chatEndRef} /> {/* dummy div to scroll into view */}
        </div>

        {/* Chat input */}
        <ChatInput onSend={sendMessage} />

        {/* Clear chat button */}
        {messages.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button onClick={clearChat} style={{
              padding: '8px 16px',
              borderRadius: '5px',
              backgroundColor: 'black',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Verdana, sans-serif'
            }}>
              Clear Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
