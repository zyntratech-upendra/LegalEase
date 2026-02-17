// ─── OCR Service (Tesseract.js) ─────────────────────────────────────────────
// Self-hosted OCR — unlimited usage, no external API dependency
// Handles both images and PDFs

import Tesseract from 'tesseract.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extract text from a file (PDF or Image)
 * @param {Buffer} fileBuffer - The file content as a buffer
 * @param {string} mimeType - MIME type of the file
 * @param {string} originalName - Original filename
 * @returns {Promise<{text: string, method: string}>}
 */
export async function extractText(fileBuffer, mimeType, originalName) {
    if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error('Empty file received');
    }

    const isPdf = mimeType === 'application/pdf' || originalName?.toLowerCase().endsWith('.pdf');

    if (isPdf) {
        return await extractFromPdf(fileBuffer);
    } else {
        return await extractFromImage(fileBuffer);
    }
}

/**
 * Extract text from PDF — tries text-layer first, falls back to OCR
 */
async function extractFromPdf(pdfBuffer) {
    try {
        // Step 1: Try to extract embedded text (text-based PDFs)
        const pdfData = await pdfParse(pdfBuffer);
        const text = pdfData.text?.trim();

        if (text && text.length > 50) {
            console.log(`[OCR] PDF text-layer extraction successful (${text.length} chars)`);
            return { text, method: 'pdf-text-layer' };
        }

        // Step 2: If text layer is empty/minimal, try OCR
        console.log('[OCR] PDF has minimal text layer, attempting OCR on PDF buffer...');
        const ocrResult = await ocrFromBuffer(pdfBuffer);
        return { text: ocrResult, method: 'tesseract-ocr-pdf' };

    } catch (err) {
        console.error('[OCR] PDF extraction error:', err.message);
        try {
            const ocrResult = await ocrFromBuffer(pdfBuffer);
            if (ocrResult && ocrResult.length > 10) {
                return { text: ocrResult, method: 'tesseract-ocr-fallback' };
            }
        } catch (ocrErr) {
            console.error('[OCR] Fallback OCR also failed:', ocrErr.message);
        }
        throw new Error(`Failed to extract text from PDF: ${err.message}`);
    }
}

/**
 * Extract text from an image using Tesseract OCR
 */
async function extractFromImage(imageBuffer) {
    try {
        const text = await ocrFromBuffer(imageBuffer);
        if (!text || text.length < 5) {
            throw new Error('No readable text found in image');
        }
        console.log(`[OCR] Image OCR successful (${text.length} chars)`);
        return { text, method: 'tesseract-ocr-image' };
    } catch (err) {
        throw new Error(`Failed to extract text from image: ${err.message}`);
    }
}

/**
 * Run Tesseract OCR on a buffer
 */
async function ocrFromBuffer(buffer) {
    console.log('[OCR] Running Tesseract OCR...');
    const startTime = Date.now();

    const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
        logger: (m) => {
            if (m.status === 'recognizing text') {
                const pct = Math.round((m.progress || 0) * 100);
                if (pct % 25 === 0) {
                    console.log(`[OCR] Progress: ${pct}%`);
                }
            }
        }
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[OCR] Tesseract completed in ${elapsed}s (${text.length} chars)`);

    return text.trim();
}
