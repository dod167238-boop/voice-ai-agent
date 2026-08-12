import requests


def ask_ollama(text):

    prompt = f"""
You are a helpful AI voice assistant.

User said:
{text}

Answer naturally and clearly.
If the user speaks Urdu, answer in Urdu.
If the user speaks English, answer in English.
If the user speaks another language, answer in that same language.
"""

    response = requests.post(
        "http://127.0.0.1:11434/api/generate",
        json={
            "model": "llama3:latest",
            "prompt": prompt,
            "stream": False
        }
    )

    response.raise_for_status()

    data = response.json()

    return data["response"]