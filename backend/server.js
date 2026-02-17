import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import scanRoute from './routes/scanRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Serve static audio files
app.use('/uploads/audio', express.static(path.join(__dirname, 'uploads', 'audio')));

// ─── Modular Scan Route (Tesseract OCR + Gemini + ElevenLabs) ──────────────
app.use('/api/scan', scanRoute);

// ─── Multer Configuration ───────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: PDF, JPG, PNG.`), false);
        }
    },
});

// ─── Dual API Keys Configuration ───────────────────────────────────────────
const CHAT_KEY = process.env.CHAT_API_KEY || process.env.GEMINI_API_KEY;
const SCAN_KEY = process.env.SCAN_API_KEY || process.env.GEMINI_API_KEY;

const chatGenAI = new GoogleGenerativeAI(CHAT_KEY);
const scanGenAI = new GoogleGenerativeAI(SCAN_KEY);

// ─── Model Fallback Configuration ───────────────────────────────────────────
const MODEL_CANDIDATES = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite-001',
    'gemini-2.5-flash-lite',
];

let ACTIVE_CHAT_MODEL = null;
let ACTIVE_SCAN_MODEL = null;

// System instruction for legal-only responses (chat)
const LEGAL_SYSTEM_PROMPT = `You are a professional legal assistant specialized in Indian law.
You must only answer questions related to:
- Law
- Legal rights
- Court procedures
- Consumer rights
- Contracts
- Legal documentation
- Criminal law
- Civil law
- Government legal policies

If a user asks anything unrelated to law, respond strictly with:
'I am designed to answer legal-related questions only.'

Do not answer non-legal topics under any circumstances.`;

// Legal document analysis prompt (scanner)
const SCAN_PROMPT = `Analyze this legal document and generate a clear, structured bullet point summary.
Highlight the following:
- **Key Clauses**: Important terms and conditions
- **Obligations**: What each party must do
- **Risks**: Potential legal risks or red flags
- **Important Dates**: Deadlines, effective dates, expiry dates
- **Penalties**: Any fines, consequences for breach
- **Rights**: Rights granted to each party

Use simple language that a layperson can understand. Format as clean bullet points.`;

// ─── Startup Model Probe (with 10s timeout per model) ───────────────────────
async function probeModels(genAIInstance, keyName) {
    const key = (genAIInstance === chatGenAI) ? CHAT_KEY : SCAN_KEY;
    if (!key) {
        console.error(`❌ ${keyName} is not set — feature will not work.`);
        return null;
    }

    console.log(`🔍 Probing available models for ${keyName}...`);
    for (const modelName of MODEL_CANDIDATES) {
        try {
            console.log(`   Testing ${modelName}...`);
            const model = genAIInstance.getGenerativeModel({ model: modelName });

            // Add 10-second timeout to prevent hanging
            const result = await Promise.race([
                model.generateContent('Hi'),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 10s')), 10000))
            ]);

            const text = result.response.text();
            if (text) {
                console.log(`   ✅ ${modelName} is available and working for ${keyName}!`);
                return modelName;
            }
        } catch (err) {
            const shortErr = err.message.split('\n')[0].substring(0, 120);
            console.log(`   ❌ ${modelName} failed for ${keyName}: ${shortErr}`);
        }
    }
    console.error(`❌ No working model found for ${keyName}.`);
    return null;
}

// ─── Helper: Get model for chat (with CHAT_API_KEY) ──────────────────────────
async function getWorkingChatModel() {
    if (ACTIVE_CHAT_MODEL) {
        return chatGenAI.getGenerativeModel({
            model: ACTIVE_CHAT_MODEL,
            systemInstruction: LEGAL_SYSTEM_PROMPT,
        });
    }
    ACTIVE_CHAT_MODEL = await probeModels(chatGenAI, 'CHAT_API_KEY');
    if (!ACTIVE_CHAT_MODEL) {
        throw new Error('No working model available for Chat. Please check CHAT_API_KEY.');
    }
    return chatGenAI.getGenerativeModel({
        model: ACTIVE_CHAT_MODEL,
        systemInstruction: LEGAL_SYSTEM_PROMPT,
    });
}

// ─── Helper: Get model for scanning (with SCAN_API_KEY) ──────────────────────
async function getWorkingScanModel() {
    if (ACTIVE_SCAN_MODEL) {
        return scanGenAI.getGenerativeModel({ model: ACTIVE_SCAN_MODEL });
    }
    ACTIVE_SCAN_MODEL = await probeModels(scanGenAI, 'SCAN_API_KEY');
    if (!ACTIVE_SCAN_MODEL) {
        throw new Error('No working model available for Scan. Please check SCAN_API_KEY.');
    }
    return scanGenAI.getGenerativeModel({ model: ACTIVE_SCAN_MODEL });
}

// ─── API Route: /api/chat ───────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message || typeof message !== 'string') {
            console.error('[Chat] Invalid message format');
            return res.status(400).json({ error: 'Invalid message format' });
        }

        console.log('[Chat] Received message:', message);

        const model = await getWorkingChatModel();
        console.log(`[Chat] Using model: ${ACTIVE_CHAT_MODEL}`);

        let chatHistory = [];
        if (Array.isArray(history)) {
            chatHistory = history.map(h => ({
                role: h.role,
                parts: h.parts || [{ text: h.text }]
            })).filter(h => h.role === 'user' || h.role === 'model');

            while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
                chatHistory.shift();
            }
        }

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: { maxOutputTokens: 1000 },
        });

        const result = await chat.sendMessage(message);
        const text = result.response.text();

        console.log('[Chat] AI Response:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
        return res.json({ reply: text });

    } catch (error) {
        console.error('[Chat Error]:', error.message);

        if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('429') || error.message.includes('quota')) {
            console.log(`[Chat] Model ${ACTIVE_CHAT_MODEL} hit an error — will re-probe.`);
            ACTIVE_CHAT_MODEL = null;
        }

        let statusCode = 500;
        let errorMessage = 'Failed to process request';

        if (error.message.includes('API key')) {
            statusCode = 401;
            errorMessage = 'Invalid or missing API Key';
        } else if (error.message.includes('429') || error.message.includes('quota')) {
            statusCode = 429;
            errorMessage = 'Chat quota exceeded — try again later';
        }

        res.status(statusCode).json({ error: errorMessage, details: error.message });
    }
});

// ─── API Route: /api/scan (Smart Legal Scanner) ─────────────────────────────
// ─── Old /api/scan removed — now handled by routes/scanRoute.js ─────────────

// ─── API Route: /api/generate-audio (ElevenLabs TTS) ────────────────────────
const ELEVEN_LABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (working ID)

app.post('/api/generate-audio', async (req, res) => {
    try {
        const { text } = req.body;
        const apiKey = process.env.ELEVEN_LABS_API_KEY;

        if (!apiKey) {
            console.error('[TTS] ElevenLabs API Key missing');
            return res.status(401).json({ error: 'ElevenLabs API Key is missing from server configuration.' });
        }

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text is required for speech generation.' });
        }

        console.log(`[TTS] Generating audio for text (${text.length} chars)...`);

        // Limit text length to avoid token overflow
        const truncatedText = text.substring(0, 5000);

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}`, {
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
            console.error(`[TTS Error] ElevenLabs API returned ${response.status}:`, errorBody);
            return res.status(response.status).json({
                error: 'ElevenLabs API failure',
                details: errorBody
            });
        }

        const audioBuffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = audioBuffer.toString('base64');

        console.log('[TTS] Audio generated successfully');
        return res.json({
            audioBase64: base64Audio,
            mimeType: 'audio/mpeg'
        });

    } catch (error) {
        console.error('[TTS Error]:', error.message);
        res.status(500).json({ error: 'Failed to generate speech', details: error.message });
    }
});

// ─── Multer error handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('[Multer Error]:', err.message);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err.message && err.message.includes('Invalid file type')) {
        console.error('[File Validation Error]:', err.message);
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

// ─── Health check endpoint ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        chatKeyLoaded: !!CHAT_KEY,
        scanKeyLoaded: !!SCAN_KEY,
        activeChatModel: ACTIVE_CHAT_MODEL || 'none (will probe)',
        activeScanModel: ACTIVE_SCAN_MODEL || 'none (will probe)',
        endpoints: ['/api/chat', '/api/scan', '/api/health'],
    });
});

// ─── Start Server ───────────────────────────────────────────────────────────
const server = app.listen(PORT, async () => {
    console.log(`🚀 LegalEase API Server running on http://localhost:${PORT}`);
    console.log(`🔑 Chat API Key: ${CHAT_KEY ? 'Loaded ✅' : 'Missing ❌'}`);
    console.log(`🔑 Scan API Key: ${SCAN_KEY ? 'Loaded ✅' : 'Missing ❌'}`);

    // Probe models at startup
    ACTIVE_CHAT_MODEL = await probeModels(chatGenAI, 'CHAT_API_KEY');
    ACTIVE_SCAN_MODEL = await probeModels(scanGenAI, 'SCAN_API_KEY');

    if (ACTIVE_CHAT_MODEL) console.log(`✨ Chat active model: ${ACTIVE_CHAT_MODEL}`);
    if (ACTIVE_SCAN_MODEL) console.log(`✨ Scan active model: ${ACTIVE_SCAN_MODEL}`);

});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Kill the existing process or use a different port.`);
    } else {
        console.error('Server error:', e);
    }
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
