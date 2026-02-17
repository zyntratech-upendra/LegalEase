// ─── Scan Controller ────────────────────────────────────────────────────────
// Orchestrates: Upload → OCR → Gemini → ElevenLabs → Response

import { extractText } from '../services/ocrService.js';
import { summarizeText } from '../services/geminiService.js';
import { generateAudio } from '../services/ttsService.js';

/**
 * Handle document scan request
 * Flow: File Upload → OCR → AI Summary → TTS → JSON Response
 */
export async function handleScan(req, res) {
    const startTime = Date.now();

    try {
        // ── Step 0: Validate upload ─────────────────────────────────────────
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded. Please upload a PDF or image file.',
            });
        }

        const { buffer, mimetype, originalname, size } = req.file;
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`[Scan] New request: ${originalname} (${(size / 1024).toFixed(1)} KB, ${mimetype})`);

        // ── Step 1: OCR — Extract text ──────────────────────────────────────
        console.log('[Scan] Step 1/3: Extracting text...');
        const ocrResult = await extractText(buffer, mimetype, originalname);
        console.log(`[Scan] ✅ Text extracted via ${ocrResult.method} (${ocrResult.text.length} chars)`);

        if (!ocrResult.text || ocrResult.text.length < 10) {
            return res.status(422).json({
                success: false,
                error: 'Could not extract readable text from the document.',
                extractedText: ocrResult.text || '',
            });
        }

        // ── Step 2: AI — Summarize with Gemini ──────────────────────────────
        console.log('[Scan] Step 2/3: Summarizing with Gemini...');
        const scanApiKey = process.env.SCAN_API_KEY || process.env.GEMINI_API_KEY;
        const aiResult = await summarizeText(ocrResult.text, scanApiKey);
        console.log(`[Scan] ✅ Summary generated via ${aiResult.model}`);

        // ── Step 3: TTS — Generate audio ────────────────────────────────────
        let audioResult = null;
        const elevenLabsKey = process.env.ELEVEN_LABS_API_KEY;
        if (elevenLabsKey) {
            try {
                console.log('[Scan] Step 3/3: Generating audio...');
                audioResult = await generateAudio(aiResult.summary, elevenLabsKey);
                console.log(`[Scan] ✅ Audio generated → ${audioResult.audioPath}`);
            } catch (ttsErr) {
                console.error('[Scan] ⚠️ TTS failed (non-fatal):', ttsErr.message);
            }
        } else {
            console.log('[Scan] ⏭️ Skipping TTS (no ElevenLabs API key)');
        }

        // ── Build Response ──────────────────────────────────────────────────
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Scan] ✅ Complete in ${elapsed}s`);
        console.log(`${'═'.repeat(60)}\n`);

        return res.json({
            success: true,
            extractedText: ocrResult.text,
            ocrMethod: ocrResult.method,
            summary: aiResult.summary,
            model: aiResult.model,
            audioBase64: audioResult?.audioBase64 || null,
            audioPath: audioResult?.audioPath || null,
            mimeType: audioResult?.mimeType || null,
            fileName: originalname,
            processingTime: `${elapsed}s`,
        });

    } catch (error) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.error(`[Scan] ❌ Failed after ${elapsed}s:`, error.message);

        let statusCode = 500;
        if (error.message.includes('API key')) statusCode = 401;
        else if (error.message.includes('SAFETY')) statusCode = 400;
        else if (error.message.includes('429') || error.message.includes('quota')) statusCode = 429;
        else if (error.message.includes('too large') || error.message.includes('payload')) statusCode = 413;
        else if (error.message.includes('No readable text')) statusCode = 422;

        return res.status(statusCode).json({
            success: false,
            error: error.message,
            processingTime: `${elapsed}s`,
        });
    }
}
