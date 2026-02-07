# XTTS-v2 Voice Cloning

Text-to-Speech with voice cloning using Coqui's XTTS-v2 model.

## Features
- 🎙️ Voice cloning (6-second sample)
- 🌍 17 languages
- 🔊 Text-to-Speech

## Usage

```bash
pip install TTS torch
```

```python
from TTS.api import TTS

tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

# Generate speech with voice cloning
tts.tts_to_file(
    text="Hello! This is my cloned voice.",
    file_path="output.wav",
    speaker_wav="reference.wav",  # 6+ second voice sample
    language="en"
)
```

## Demo
https://huggingface.co/spaces/coqui/xtts-v2

## Local Setup
```bash
pip install TTS
python xtts.py --text "Hello" --voice voice.wav --lang en
```
