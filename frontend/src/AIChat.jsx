import { useState, useRef } from "react";

function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  const sendMessage = async (text = message) => {
    if (!text.trim() || loading) return;

    const userMessage = text.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://voice-ai-agent.fastapicloud.dev/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      const aiResponse =
        data.response ||
        data.answer ||
        data.message ||
        data.reply ||
        "AI response nahi mila.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: aiResponse,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "AI se connection nahi ho raha. Please thori dair baad try karein.",
        },
      ]);
    }

    setLoading(false);
  };

  /* =========================
     VOICE INPUT
  ========================= */

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Aapke browser mein voice recognition supported nahi hai."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const voiceText =
        event.results[0][0].transcript;

      setMessage(voiceText);

      sendMessage(voiceText);
    };

    recognition.onerror = (event) => {
      console.error("Voice error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  /* =========================
     ENTER KEY
  ========================= */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="chat-box">

      {/* HEADER */}

      <div className="chat-header">

        <div className="agent">

          <div className="agent-icon">
            AI
          </div>

          <div>
            <h2>AI Assistant</h2>

            <p>
              Ollama Powered
            </p>
          </div>

        </div>

        <div className="online">
          <span></span>
          Online
        </div>

      </div>

      {/* MESSAGES */}

      <div className="messages">

        {messages.length === 0 && (

          <div className="welcome">

            <div className="ai-circle">
              ✦
            </div>

            <h2>
              How can I help you?
            </h2>

            <p>
              Type your message or use the microphone
              to talk with your AI agent.
            </p>

          </div>

        )}

        {messages.map((item, index) => (

          <div
            key={index}
            className={`message-row ${item.role}`}
          >

            {item.role === "assistant" && (
              <div className="mini-ai">
                AI
              </div>
            )}

            <div className="message">
              {item.text}
            </div>

          </div>

        ))}

        {loading && (

          <div className="message-row assistant">

            <div className="mini-ai">
              AI
            </div>

            <div className="message typing">

              <span></span>
              <span></span>
              <span></span>

            </div>

          </div>

        )}

      </div>

      {/* INPUT */}

      <div className="input-area">

        <button
          className={`mic-button ${
            listening ? "listening" : ""
          }`}
          onClick={startVoice}
          title="Voice input"
        >
          🎙️
        </button>

        <textarea
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder={
            listening
              ? "Listening..."
              : "Type or speak your message..."
          }
          rows="1"
        />

        <button
          className="send-button"
          onClick={() => sendMessage()}
          disabled={!message.trim() || loading}
        >
          ➤
        </button>

      </div>

      <div className="input-info">

        <span>
          🎙️ Voice
        </span>

        <span>
          Enter to send
        </span>

        <span>
          Ollama AI
        </span>

      </div>

    </section>
  );
}

export default AIChat;