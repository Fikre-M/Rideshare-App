// @ts-nocheck
import { useChat } from "ai/react";

const EnhancedChatBot = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/ai/chat",
    body: {
      // Add context about the user's current state
      currentLocation: userLocation,
      rideHistory: recentRides,
      preferences: userPreferences,
    },
  });

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.role}`}>
            {m.content}
            {m.images?.map((img, i) => (
              <img key={i} src={img} alt="AI generated" />
            ))}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about your ride..."
        />
        <button type="button" onClick={handleVoiceInput}>
          🎤
        </button>
      </form>
    </div>
  );
};
