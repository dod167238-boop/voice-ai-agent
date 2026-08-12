import { useState, useRef } from "react";

function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const recognitionRef = useRef(null);

  // =========================
  // AI TEXT TO SPEECH
  // =========================

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      console.log("Text to Speech supported nahi hai.");
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    // English / Roman Urdu ke liye
    speech.lang = "en-US";

    speech.rate = 0.95;
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
  // SEND MESSAGE TO BACKEND
  // =========================

  const sendMessage = async (text, isVoice = false) => {
    const userMessage = text.trim();

    if (!userMessage || loading) {
      return;
    }

    // User message
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

      console.log("AI Response:", data);

      const aiResponse =
        data.response ||
        data.answer ||
        data.message ||
        data.reply ||
        "AI response nahi mila.";

      // =========================
      // AI TEXT RESPONSE
      // =========================

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: aiResponse,
        },
      ]);

      // =========================
      // VOICE INPUT
      // =========================
      // Agar user ne mic se poocha hai,
      // to AI text ke saath voice mein bhi jawab dega.

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
  // TEXT MESSAGE
  // =========================

  const sendTextMessage = () => {
    if (!message.trim()) {
      return;
    }

    // false = text input
    // Isliye AI sirf text mein reply karega.

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

    if (listening || loading) {
      return;
    }

    // Agar AI pehle se bol raha hai
    // to uski voice stop karo.

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log("Microphone listening...");
      setListening(true);
    };

    recognition.onresult = (event) => {
      const voiceText =
        event.results[0][0].transcript.trim();

      console.log("User said:", voiceText);

      if (voiceText) {
        setMessage(voiceText);

        // TRUE = voice input
        // AI voice mein answer karega.

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
      console.error(
        "Could not start microphone:",
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
            <h2>Dreamy World AI</h2>

            <p>
              Property Assistant
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
              Ask me about properties,
              buying, renting or real estate.
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


      {/* INPUT AREA */}

      <div className="input-area">

        {/* MICROPHONE */}

        <button
          type="button"
          className={`mic-button ${
            listening ? "listening" : ""
          }`}
          onClick={startVoice}
          disabled={loading}
          title="Talk to AI"
        >
          {listening ? "🔴" : "🎙️"}
        </button>


        {/* TEXT INPUT */}

        <textarea
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder={
            listening
              ? "Listening..."
              : "Type your property question..."
          }
          rows={1}
        />


        {/* SEND BUTTON */}

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
          🎙️ Voice → Voice
        </span>

        <span>
          ⌨️ Text → Text
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