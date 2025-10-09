import React from "react";
import ReactMarkdown from "react-markdown";

const ChatBubble = ({ message, isUser }) => {
  return (
    <div
      style={{
        textAlign: isUser ? "right" : "left",
        margin: "10px",
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "10px",
          borderRadius: "10px",
          backgroundColor: isUser ? "#4CAF50" : "#e0e0e0",
          color: isUser ? "white" : "black",
          maxWidth: "70%",
          textAlign: "left",
          lineHeight: "1.5",
        }}
      >
        {/* Render Gemini's markdown output properly */}
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 style={{ fontSize: "1.3em", fontWeight: "bold", marginBottom: "5px" }} {...props} />,
            h2: ({node, ...props}) => <h2 style={{ fontSize: "1.2em", fontWeight: "bold", marginBottom: "5px" }} {...props} />,
            h3: ({node, ...props}) => <h3 style={{ fontSize: "1.1em", fontWeight: "bold", marginBottom: "5px" }} {...props} />,
            li: ({node, ...props}) => <li style={{ marginLeft: "15px" }} {...props} />,
          }}
        >
          {message}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ChatBubble;
