import { useState } from 'react';

const ChatInput = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', marginTop: '10px' }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        placeholder="Ask about any Indian stock..."
      />
      <button onClick={handleSend} style={{ marginLeft: '5px', padding: '10px 20px' }}>Send</button>
    </div>
  );
};

export default ChatInput;
