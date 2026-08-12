import sounddevice as sd
from scipy.io.wavfile import write

duration = 8
sample_rate = 44100
device = 1

print("🎤 Recording start...")
print("8 seconds tak bolo...")

audio = sd.rec(
    int(duration * sample_rate),
    samplerate=sample_rate,
    channels=1,
    dtype="int16",
    device=device
)

sd.wait()

write("test.wav", sample_rate, audio)

print("✅ Recording complete!")
print("📁 Saved as: test.wav")