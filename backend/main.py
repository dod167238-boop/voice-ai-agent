from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "AI Voice Agent Backend is Running"
    }


@app.get("/api/test")
def test():
    return {
        "status": "success",
        "message": "Frontend successfully connected to backend!"
    }


@app.post("/chat")
def chat(data: dict):

    user_message = data.get("message", "").strip()

    if not user_message:
        return {
            "response": "Please enter a message."
        }

    try:

        ollama_response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "llama3:latest",
                "prompt": user_message,
                "stream": False
            },
            timeout=300
        )

        ollama_response.raise_for_status()

        result = ollama_response.json()

        return {
            "response": result.get(
                "response",
                "Ollama did not return a response."
            )
        }

    except requests.exceptions.Timeout:

        return {
            "response": "Ollama took too long to respond."
        }

    except requests.exceptions.ConnectionError:

        return {
            "response": "Cannot connect to Ollama."
        }

    except Exception as e:

        return {
            "response": f"Backend error: {str(e)}"
        }