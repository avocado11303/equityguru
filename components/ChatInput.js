import { useState } from 'react';

const ChatInput = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {  // Send message on Enter
      e.preventDefault();     // Prevents adding a newline
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', marginTop: '10px' }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}  // Added Enter key functionality
        style={{
          flex: 1,
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          fontFamily: 'Verdana, sans-serif'
        }}
        placeholder="Ask about any Indian stock..."
      />
      <button
        onClick={handleSend}
        style={{
          marginLeft: '5px',
          padding: '10px 20px',
          fontFamily: 'Verdana, sans-serif'
        }}
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;
