# Nvidia Parakeet ASR API

## Endpoint
```
POST https://parakeet-test-sandy.vercel.app/api/transcribe
```

## Request
```bash
curl -X POST https://parakeet-test-sandy.vercel.app/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"audio": "<base64-encoded-audio>"}'
```

## Audio Requirements
- Format: WAV, OGG, MP3
- Sample Rate: 16kHz
- Channels: Mono
- Encoding: 16-bit PCM recommended

## Response
```json
{
  "text": "Transcribed text here",
  "confidence": 0.95,
  "duration": 5.2
}
```

## Direct HuggingFace API (No UI)

If you want to call HuggingFace directly:

```bash
curl -X POST "https://api-inference.huggingface.co/models/nvidia/parakeet-tdt-0.6b-v3" \
  -H "Authorization: Bearer YOUR_HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "<base64-audio>"}'
```

## Python Example
```python
import requests
import base64

def transcribe(audio_path):
    with open(audio_path, "rb") as f:
        audio = base64.b64encode(f.read()).decode()
    
    response = requests.post(
        "https://parakeet-test-sandy.vercel.app/api/transcribe",
        json={"audio": audio}
    )
    return response.json()

# Usage
result = transcribe("audio.wav")
print(result["text"])
```

## JavaScript Example
```javascript
async function transcribe(audioPath) {
  const audio = await fetch(audioPath)
    .then(r => r.arrayBuffer())
    .then(buf => Buffer.from(buf).toString('base64'));

  const res = await fetch('https://parakeet-test-sandy.vercel.app/api/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio })
  });
  
  return await res.json();
}

// Usage
transcribe('audio.wav').then(console.log);
```

## Supported Languages (25+)
English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Ukrainian, Polish, Czech, Romanian, Greek, Hungarian, Swedish, Danish, Finnish, Bulgarian, Slovak, Slovenian, Croatian, Estonian, Latvian, Lithuanian, Maltese

## Notes
- First request may be slow (model loading)
- Free tier has rate limits
- For production, add your own HF_TOKEN in Vercel settings
