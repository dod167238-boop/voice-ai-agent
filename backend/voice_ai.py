from faster_whisper import WhisperModel
import requests
import subprocess


# =========================================================
# WHISPER
# =========================================================

print("Loading Whisper...")

whisper = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8"
)

print("Whisper ready!")


# =========================================================
# OLLAMA
# =========================================================

def ask_ollama(text):

    print("🤖 Asking Ollama...")

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3:latest",

            "prompt": f"""
You are a voice AI real estate assistant.

User question:
{text}

STRICT RULES:
1. Answer directly.
2. Maximum 2 short sentences.
3. Maximum 30 words.
4. Do not give a long explanation.
5. Do not repeat the question.
6. Do not add unnecessary information.
7. Speak naturally like a helpful voice assistant.
""",

            "stream": False,

            "options": {
                "temperature": 0.3,
                "num_predict": 50
            }
        },

        timeout=180
    )

    response.raise_for_status()

    return response.json()["response"].strip()


# =========================================================
# TEXT TO SPEECH
# =========================================================

def speak(text):

    print("🔊 AI speaking...")

    # Escape quotes for PowerShell
    safe_text = text.replace("'", "''")

    powershell_script = f"""
Add-Type -AssemblyName System.Speech

$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer

$speak.Rate = 0
$speak.Volume = 100

$speak.Speak('{safe_text}')

$speak.Dispose()
"""

    subprocess.run(
        [
            "powershell",
            "-NoProfile",
            "-Command",
            powershell_script
        ],
        check=True
    )


# =========================================================
# VOICE → WHISPER → OLLAMA → VOICE
# =========================================================

def voice_to_ai(audio_file):

    print("🎤 Reading test.wav...")

    segments, info = whisper.transcribe(
        audio_file
    )

    text = " ".join(
        segment.text for segment in segments
    ).strip()

    print("📝 YOU:", text)

    if not text:

        print("❌ Voice not detected.")

        return


    # Ask Ollama
    answer = ask_ollama(text)


    print()
    print("🤖 AI RESPONSE:")
    print(answer)
    print()


    # Speak answer
    speak(answer)


# =========================================================
# START
# =========================================================

if __name__ == "__main__":

    voice_to_ai("test.wav")