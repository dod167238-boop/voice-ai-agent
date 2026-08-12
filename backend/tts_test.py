import pyttsx3

engine = pyttsx3.init()

engine.setProperty("rate", 160)
engine.setProperty("volume", 1.0)

text = "Hello! I am your AI voice agent. I can understand your voice and give you an AI response."

print("🔊 Speaking...")

engine.say(text)
engine.runAndWait()

print("✅ Voice finished!")