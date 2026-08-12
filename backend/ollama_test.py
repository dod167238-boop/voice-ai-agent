import requests

print("Connecting to Ollama...")

response = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "llama3:latest",
        "prompt": "Hello! Introduce yourself in one short sentence.",
        "stream": False
    }
)

if response.status_code == 200:
    data = response.json()

    print("\n🤖 OLLAMA RESPONSE:")
    print(data["response"])

else:
    print("❌ Ollama Error:", response.status_code)
    print(response.text)