from faster_whisper import WhisperModel

print("Whisper loading...")

model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8"
)

print("Whisper ready!")

segments, info = model.transcribe("test.wav")

text = " ".join(segment.text for segment in segments)

print("LANGUAGE:", info.language)
print("TEXT:", text)