const fetch = require('node-fetch');

// Try OpenAI TTS API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, voice, language } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'text required' });
    }

    // Try OpenAI TTS
    if (OPENAI_API_KEY) {
        try {
            const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'tts-1',
                    input: text,
                    voice: 'alloy'
                })
            });

            if (response.ok) {
                const buffer = await response.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                return res.status(200).json({ 
                    audio: `data:audio/mp3;base64,${base64}`,
                    provider: 'openai'
                });
            }
        } catch (e) {
            console.error('OpenAI error:', e.message);
        }
    }

    // Fallback: Browser Speech Synthesis (no API needed)
    return res.status(200).json({
        text: text,
        language: language,
        message: 'Use browser speech synthesis or configure OPENAI_API_KEY',
        browserspeech: true
    });
}
