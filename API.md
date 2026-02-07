# Nvidia Parakeet ASR API

## Direct HuggingFace API (Recommended)

```
POST https://api-inference.huggingface.co/models/nvidia/parakeet-tdt-0.6b-v3
```

**Headers:**
```bash
Authorization: Bearer HF_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "inputs": "<base64-encoded-audio>"
}
```

## cURL Example
```bash
curl -X POST "https://api-inference.huggingface.co/models/nvidia/parakeet-tdt-0.6b-v3" \
  -H "Authorization: Bearer HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "<base64-audio>"}'
```

## Python Example
```python
import requests
import base64

def transcribe(audio_path, hf_token):
    with open(audio_path, "rb") as f:
        audio = base64.b64encode(f.read()).decode()
    
    response = requests.post(
        "https://api-inference.huggingface.co/models/nvidia/parakeet-tdt-0.6b-v3",
        headers={"Authorization": f"Bearer {hf_token}"},
        json={"inputs": audio}
    )
    return response.json()

# Usage
result = transcribe("audio.wav", "hf_xxxxxxxxxxxx")
print(result["text"])
```

## Node.js Example
```javascript
const fs = require('fs');
const fetch = require('node-fetch');

async function transcribe(audioPath, hfToken) {
    const audio = fs.readFileSync(audioPath).toString('base64');
    
    const res = await fetch(
        "https://api-inference.huggingface.co/models/nvidia/parakeet-tdt-0.6b-v3",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${hfToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: audio })
        }
    );
    
    return await res.json();
}

// Usage
transcribe("audio.wav", "hf_xxxxxxxxxxxx").then(console.log);
```

## Audio Requirements
- Format: WAV, OGG, MP3
- Sample Rate: 16kHz
- Channels: Mono
- Encoding: 16-bit PCM

## Model Info
- **Name:** nvidia/parakeet-tdt-0.6b-v3
- **Languages:** 25+ European languages
- **License:** CC-BY-4.0 (free for commercial use)
- **Leaderboard:** Top of HuggingFace OpenASR Leaderboard

## Get Your Token
https://huggingface.co/settings/tokens

---

# XTTS-v2 Text-to-Speech API

Add voice synthesis to your app!

## Using TTS Library (Recommended)

```bash
pip install TTS
```

## Python Example
```python
from TTS.api import TTS

# Initialize (uses GPU if available)
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=True)

# Generate speech with voice cloning
tts.tts_to_file(
    text="Hello! This is my voice cloned.",
    file_path="output.wav",
    speaker_wav="reference_audio.wav",  # 6+ second sample of target voice
    language="en"
)
```

## Requirements
- Python 3.8+
- PyTorch
- 2GB+ GPU VRAM (or run on CPU)
- 6+ second reference audio for voice cloning

## Supported Languages (17)
en, es, fr, de, it, pt, pl, tr, ru, nl, cs, ar, zh-cn, ja, hu, ko, hi

## Free API Alternative
https://huggingface.co/spaces/coqui/xtts-v2

## Resources
- Docs: https://tts.readthedocs.io
- GitHub: https://github.com/coqui-ai/TTS
