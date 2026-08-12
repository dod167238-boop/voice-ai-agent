import { useState, useRef } from "react";

function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const recognitionRef = useRef(null);

  // =========================
  // AI VOICE RESPONSE
  // =========================

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      console.log("Speech synthesis not supported");
      return;
    }

    // Stop previous speech
    window.speechSynthesis.cancel();

    const cleanText = String(text || "").trim();

    if (!cleanText) return;

    const speech = new SpeechSynthesisUtterance(cleanText);

    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => {
      setSpeaking(true);
    };

    speech.onend = () => {
      setSpeaking(false);
    };

    speech.onerror = (error) => {
      console.error("Speech error:", error);
      setSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  };

  // =========================
  // STOP AI VOICE
  // =========================

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(false);
  };

  // =========================
  // SEND MESSAGE TO AI
  // =========================

  const sendMessage = async (text = message) => {
    const userMessage = text.trim();

    if (!userMessage || loading) {
      return;
    }

    // Show user message
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
            Accept: "application/json",
          },

          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Backend request failed: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("AI Response:", data);

      const aiResponse =
        data.response ||
        data.answer ||
        data.message ||
        data.reply ||
        "AI response nahi mila.";

      // Show AI text
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: aiResponse,
        },
      ]);

      // 🔊 AI SPEAKS
      speakText(aiResponse);

    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage =
        "AI se connection nahi ho raha. Please thori dair baad try karein.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: errorMessage,
        },
      ]);

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VOICE INPUT
  // =========================

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

    if (listening) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("Microphone started");
      setListening(true);
    };

    recognition.onresult = (event) => {
      const voiceText =
        event.results[0][0].transcript.trim();

      console.log("Voice text:", voiceText);

      if (voiceText) {
        setMessage(voiceText);

        // Send voice text to AI
        sendMessage(voiceText);
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Voice recognition error:",
        event.error
      );

      setListening(false);

      if (event.error === "not-allowed") {
        alert(
          "Microphone permission allow karein."
        );
      }
    };

    recognition.onend = () => {
      console.log("Microphone stopped");
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Microphone start error:",
        error
      );

      setListening(false);
    }
  };

  // =========================
  // ENTER KEY
  // =========================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  // =========================
  // UI
  // =========================

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
              Speak or type your message
              and I will answer you.
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


        {/* LOADING */}

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

        {/* MICROPHONE */}

        <button
          type="button"
          className={`mic-button ${
            listening ? "listening" : ""
          }`}
          onClick={startVoice}
          disabled={loading}
          title="Voice input"
        >
          {listening ? "🔴" : "🎙️"}
        </button>


        {/* TEXT INPUT */}

        <textarea
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            listening
              ? "Listening..."
              : "Type or speak your message..."
          }
          rows={1}
          disabled={loading}
        />


        {/* SEND */}

        <button
          type="button"
          className="send-button"
          onClick={() => sendMessage()}
          disabled={
            !message.trim() || loading
          }
        >
          ➤
        </button>

      </div>


      {/* VOICE CONTROL */}

      <div className="input-info">

        <span>
          🎙️ Voice Input
        </span>

        <span>
          🔊 AI Voice
        </span>

        {speaking && (
          <button
            type="button"
            onClick={stopSpeaking}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            🛑 Stop Voice
          </button>
        )}

      </div>

    </section>
  );
}

export default AIChat;