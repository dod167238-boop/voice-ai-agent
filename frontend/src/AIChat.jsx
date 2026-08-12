import { useState, useRef } from "react";

function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const recognitionRef = useRef(null);

  // =========================
  // AI VOICE
  // =========================

  const speakText = (text) => {
    if (!window.speechSynthesis) {
      console.log("Text to Speech supported nahi hai");
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

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

    speech.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  };

  // =========================
  // STOP VOICE
  // =========================

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // =========================
  // SEND MESSAGE
  // =========================

  const sendMessage = async (text, isVoice = false) => {
    const userMessage = text.trim();

    if (!userMessage || loading) return;

    // User message screen par
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
          `Backend Error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("AI:", data);

      const aiResponse =
        data.response ||
        data.answer ||
        data.message ||
        data.reply ||
        "AI response nahi mila.";

      // AI TEXT RESPONSE
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: aiResponse,
        },
      ]);

      // IMPORTANT:
      // Sirf voice input par AI bolega
      if (isVoice) {
        speakText(aiResponse);
      }

    } catch (error) {
      console.error("Chat Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "AI se connection nahi ho raha. Please dobara try karein.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // TEXT SEND
  // =========================

  const sendTextMessage = () => {
    if (!message.trim()) return;

    sendMessage(message, false);
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

    if (listening) return;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("Listening...");
      setListening(true);
    };

    recognition.onresult = (event) => {
      const voiceText =
        event.results[0][0].transcript.trim();

      console.log("You said:", voiceText);

      if (voiceText) {
        setMessage(voiceText);

        // IMPORTANT:
        // Voice input = true
        // Is wajah se AI voice mein jawab dega
        sendMessage(voiceText, true);
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Microphone Error:",
        event.error
      );

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(error);
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

      sendTextMessage();
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
              Type your message or speak
              with your AI agent.
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
        >
          {listening ? "🔴" : "🎙️"}
        </button>


        {/* TEXT BOX */}

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
          rows={1}
        />


        {/* SEND */}

        <button
          type="button"
          className="send-button"
          onClick={sendTextMessage}
          disabled={
            !message.trim() || loading
          }
        >
          ➤
        </button>

      </div>


      {/* BOTTOM INFO */}

      <div className="input-info">

        <span>
          🎙️ Voice
        </span>

        <span>
          ⌨️ Text
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