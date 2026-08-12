from faster_whisper import WhisperModel

model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8"
)


def speech_to_text(audio_file: str):

    segments, info = model.transcribe(
        audio_file,
        beam_size=5
    )

    text = " ".join(
        segment.text for segment in segments
    )

    return text.strip(), info.language