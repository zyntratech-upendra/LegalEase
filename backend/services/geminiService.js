// ─── Gemini AI Service ──────────────────────────────────────────────────────
// Uses @google/generative-ai SDK (no manual REST calls)
// Summarizes legal text into bullet points

import { GoogleGenerativeAI } from '@google/generative-ai';

// Legal summarization prompt
const LEGAL_SUMMARY_PROMPT = `You are an expert legal document analyst. Summarize the following legal document into concise bullet points.

RULES:
- Use simple, easy-to-understand language
- Highlight key legal obligations
- Highlight important dates and deadlines
- Highlight penalties, fines, or consequences
- Highlight actions required by each party
- Keep each bullet point to 1-2 sentences maximum
- Use bullet points (•) for formatting
- If the document is not legal, still summarize it clearly

DOCUMENT TEXT:
`;

// Model candidates in priority order
const MODEL_CANDIDATES = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite-001',
];

let activeModel = null;

/**
 * Find a working Gemini model
 */
async function probeModel(genAI) {
    for (const modelName of MODEL_CANDIDATES) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say OK');
            const text = result.response.text();
            if (text) {
                console.log(`[Gemini] ✅ Model "${modelName}" is available`);
                return modelName;
            }
        } catch (err) {
            console.log(`[Gemini] ❌ Model "${modelName}" failed: ${err.message.substring(0, 80)}`);
        }
    }
    return null;
}

/**
 * Summarize extracted text using Gemini
 * @param {string} extractedText - Raw text from OCR
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<{summary: string, model: string}>}
 */
export async function summarizeText(extractedText, apiKey) {
    if (!apiKey) {
        throw new Error('Gemini API key is not configured');
    }
    if (!extractedText || extractedText.trim().length < 10) {
        throw new Error('Extracted text is too short to summarize');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // If no active model, probe for one
    if (!activeModel) {
        console.log('[Gemini] Probing for available model...');
        activeModel = await probeModel(genAI);
        if (!activeModel) {
            throw new Error('No Gemini model is available. Check your API key and quota.');
        }
    }

    try {
        const model = genAI.getGenerativeModel({ model: activeModel });

        // Truncate very long documents to avoid token limits
        const maxChars = 50000;
        const truncatedText = extractedText.length > maxChars
            ? extractedText.substring(0, maxChars) + '\n\n[Document truncated due to length...]'
            : extractedText;

        const prompt = LEGAL_SUMMARY_PROMPT + truncatedText;

        console.log(`[Gemini] Sending ${truncatedText.length} chars to ${activeModel}...`);
        const startTime = Date.now();

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Gemini] Summary generated in ${elapsed}s (${summary.length} chars)`);

        return { summary, model: activeModel };

    } catch (err) {
        // If model failed (quota/404), reset and retry once
        if (err.message.includes('404') || err.message.includes('429') || err.message.includes('quota')) {
            console.log(`[Gemini] Model ${activeModel} failed, re-probing...`);
            activeModel = null;
            activeModel = await probeModel(genAI);
            if (activeModel) {
                const model = genAI.getGenerativeModel({ model: activeModel });
                const result = await model.generateContent(LEGAL_SUMMARY_PROMPT + extractedText.substring(0, 50000));
                return { summary: result.response.text(), model: activeModel };
            }
        }
        throw new Error(`Gemini summarization failed: ${err.message}`);
    }
}
