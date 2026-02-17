// ─── TTS Service (ElevenLabs) ───────────────────────────────────────────────
// Converts text summaries to speech using ElevenLabs REST API
// Saves MP3 files locally for playback

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

/**
 * Generate audio from text using ElevenLabs
 * @param {string} text - Text to convert to speech
 * @param {string} apiKey - ElevenLabs API key
 * @returns {Promise<{audioBase64: string, audioPath: string, mimeType: string}>}
 */
export async function generateAudio(text, apiKey) {
    if (!apiKey) {
        throw new Error('ElevenLabs API key is not configured');
    }
    if (!text || text.trim().length < 5) {
        throw new Error('Text is too short for audio generation');
    }

    // Truncate to avoid token overflow (ElevenLabs limit)
    const truncatedText = text.substring(0, 5000);

    console.log(`[TTS] Generating audio for ${truncatedText.length} chars...`);
    const startTime = Date.now();

    try {
        const response = await fetch(`${ELEVENLABS_BASE_URL}/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: truncatedText,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[TTS] ElevenLabs API error ${response.status}:`, errorBody);
            throw new Error(`ElevenLabs API returned ${response.status}: ${errorBody}`);
        }

        const audioBuffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = audioBuffer.toString('base64');

        // Save to file
        const audioDir = path.join(__dirname, '..', 'uploads', 'audio');
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }

        const fileName = `scan_${Date.now()}.mp3`;
        const filePath = path.join(audioDir, fileName);
        fs.writeFileSync(filePath, audioBuffer);

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[TTS] Audio generated in ${elapsed}s → ${fileName}`);

        return {
            audioBase64: base64Audio,
            audioPath: `/uploads/audio/${fileName}`,
            mimeType: 'audio/mpeg',
        };

    } catch (err) {
        if (err.message.includes('ElevenLabs')) throw err;
        throw new Error(`TTS generation failed: ${err.message}`);
    }
}
