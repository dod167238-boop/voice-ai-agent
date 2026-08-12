import AIChat from "./AIChat";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          VOICE<span>AI</span>
        </div>

        <div className="backend-status">
          <span className="status-dot"></span>
          Backend Connected
        </div>
      </header>

      <main className="main">
        <div className="hero">
          <div className="badge">
            ✦ AI VOICE AGENT
          </div>

          <h1>
            Talk with your
            <span> AI Assistant</span>
          </h1>

          <p>
            Speak naturally with your AI assistant.
            Your local backend handles Ollama and the AI response.
          </p>
        </div>

        <AIChat />
      </main>
    </div>
  );
}

export default App;