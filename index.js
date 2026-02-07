const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Get audio file path from args or use default sample
const audioFile = process.argv[2] || 'sample.wav';
const HF_TOKEN = process.env.HF_TOKEN || '';

async function transcribe() {
  if (!HF_TOKEN) {
    console.log('Error: Set HF_TOKEN environment variable');
    console.log('Get free token at: https://huggingface.co/settings/tokens');
    return;
  }

  if (!fs.existsSync(audioFile)) {
    console.log(`Error: Audio file not found: ${audioFile}`);
    console.log('Usage: node index.js <audio-file.wav>');
    console.log('\nDownload sample: wget https://dldata-public.s3.us-east-2.amazonaws.com/2086-149220-0033.wav');
    return;
  }

  console.log(`Transcribing: ${audioFile}...`);

  const audioBuffer = fs.readFileSync(audioFile);
  const base64Audio = audioBuffer.toString('base64');

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/nvidia/parakeet-tdt-0.6b-v3',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: base64Audio }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.log(`Error: ${response.status} - ${error}`);
      return;
    }

    const result = await response.json();
    console.log('\nTranscription:');
    console.log(result.text || JSON.stringify(result, null, 2));
  } catch (err) {
    console.log('Error:', err.message);
  }
}

transcribe();
