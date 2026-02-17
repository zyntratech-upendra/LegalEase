// Utility functions for calling the LegalEase backend API

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

// ─── Scan Document (Smart Scanner — file upload to backend) ─────────────────
export const scanDocument = async (file) => {
    try {
        const formData = new FormData();
        formData.append('document', file);

        const response = await fetch(`${API_BASE_URL}/api/scan`, {
            method: 'POST',
            body: formData,
            // Do NOT set Content-Type header — browser sets it with boundary for multipart
        });

        if (!response.ok) {
            let errorDetails = 'Unknown error';
            try {
                const errorData = await response.json();
                errorDetails = errorData.error || errorData.details || response.statusText;
            } catch (e) {
                errorDetails = response.statusText;
            }
            throw new Error(errorDetails);
        }

        const data = await response.json();
        return {
            summary: data.summary,
            extractedText: data.extractedText,
            fileName: data.fileName,
            model: data.model,
        };
    } catch (error) {
        console.error("Document Scan Error:", error);
        throw error;
    }
};

// ─── Summarize Legal Text (fallback — text only via chat) ───────────────────
export const summarizeLegalText = async (text) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `You are an expert legal assistant. Analyze the following legal document text and provide a simplified summary.
      
Output format:
- **Root Cause**: What is the main issue?
- **Key Sections**: Which sections of law are involved?
- **Important Information**: Any dates, penalties, or critical details.

Simplify the language for a layperson.

Text to analyze:
"${text}"`
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error("Gemini Summarization Error:", error);
        throw new Error("Failed to analyze document.");
    }
};

export const translateText = async (text, targetLang) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Translate the following text into ${targetLang}. Maintain the formatting (bullet points, bold text).

Text:
"${text}"`
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error("Gemini Translation Error:", error);
        throw new Error("Failed to translate text.");
    }
};

export const chatWithLegalAssistant = async (history, message) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, history }),
        });

        if (!response.ok) {
            let errorDetails = "Unknown error";
            try {
                const errorData = await response.json();
                errorDetails = errorData.error || errorData.details || response.statusText;
            } catch (e) {
                errorDetails = response.statusText;
            }
            throw new Error(`Server Error: ${errorDetails}`);
        }

        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        throw error; // Re-throw to be handled by the component
    }
};
// ─── Generate Speech (ElevenLabs TTS via backend) ──────────────────────────
export const generateSpeech = async (text) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            let errorDetails = "Unknown error";
            try {
                const errorData = await response.json();
                errorDetails = errorData.error || errorData.details || response.statusText;
            } catch (e) {
                errorDetails = response.statusText;
            }
            throw new Error(errorDetails);
        }

        const data = await response.json();
        return data.audioBase64;
    } catch (error) {
        console.error("TTS Error:", error);
        throw error;
    }
};
