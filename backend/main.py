from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

load_dotenv()

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


@app.get("/api/key-test")
def key_test():
    api_key = os.getenv("OLLAMA_API_KEY")

    return {
        "configured": bool(api_key),
        "length": len(api_key) if api_key else 0
    }


@app.post("/chat")
def chat(data: dict):

    user_message = data.get("message", "").strip()

    if not user_message:
        return {
            "response": "Please enter a message."
        }

    try:

        api_key = os.getenv("OLLAMA_API_KEY")

        if not api_key:
            return {
                "response": "OLLAMA_API_KEY is not configured."
            }

        response = requests.post(
            "https://ollama.com/api/generate",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-oss:120b",
                "prompt": user_message,
                "stream": False
            },
            timeout=300
        )

        response.raise_for_status()

        result = response.json()

        return {
            "response": result.get(
                "response",
                "AI did not return a response."
            )
        }

    except requests.exceptions.Timeout:

        return {
            "response": "AI took too long to respond."
        }

    except requests.exceptions.ConnectionError:

        return {
            "response": "Cannot connect to Ollama Cloud."
        }

    except requests.exceptions.HTTPError as e:

        return {
            "response": f"Ollama API error: {str(e)}"
        }

    except Exception as e:

        return {
            "response": f"Backend error: {str(e)}"
        }