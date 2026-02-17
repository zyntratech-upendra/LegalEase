import React, { useState } from 'react';
import { Volume2, Loader2, Upload, FileText, Play, Languages, Archive, Check, Loader, AlertCircle } from 'lucide-react';
import { generateSpeech, scanDocument, translateText } from '../utils/gemini';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const SmartScanner = () => {
    const [file, setFile] = useState(null);
    const [ocrText, setOcrText] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [language, setLanguage] = useState('English');
    const [aiAudio, setAiAudio] = useState(null);
    const [isAiPlaying, setIsAiPlaying] = useState(false);
    const [isBrowserPlaying, setIsBrowserPlaying] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);

    // eslint-disable-next-line no-unused-vars
    const [browserUtterance, setBrowserUtterance] = useState(null);

    const { currentUser } = useAuth();

    // Stop all audio on unmount or file change
    React.useEffect(() => {
        return () => {
            if (aiAudio) {
                aiAudio.pause();
                setAiAudio(null);
            }
            window.speechSynthesis.cancel();
        };
    }, [aiAudio]);

    const stopAllAudio = () => {
        if (aiAudio) {
            aiAudio.pause();
            setIsAiPlaying(false);
        }
        window.speechSynthesis.cancel();
        setIsBrowserPlaying(false);
    };

    const validateFile = (selectedFile) => {
        const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return `Invalid file type (${ext}). Allowed: PDF, JPG, PNG.`;
        }
        if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            return `File too large (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB). Maximum: ${MAX_FILE_SIZE_MB} MB.`;
        }
        return null;
    };

    const handleFileChange = (e) => {
        stopAllAudio(); // Stop any playing audio
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const validationError = validateFile(selectedFile);
        if (validationError) {
            setErrorMsg(validationError);
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setOcrText('');
        setSummary('');
        setStatus('');
        setErrorMsg('');
        setAiAudio(null); // Reset AI audio
    };

    const processDocument = async () => {
        stopAllAudio();
        if (!file) return;
        setLoading(true);
        setErrorMsg('');
        setStatus('Uploading & analyzing document...');

        try {
            const result = await scanDocument(file);
            setSummary(result.summary);
            setOcrText(result.extractedText || '');
            setStatus(`Done — analyzed with ${result.model}`);
        } catch (error) {
            console.error('Document processing error:', error);
            setErrorMsg(error.message || 'Error processing document.');
            setStatus('');
        }
        setLoading(false);
    };

    const handleTranslate = async (lang) => {
        stopAllAudio();
        if (!summary) return;
        setLoading(true);
        setErrorMsg('');
        setStatus(`Translating to ${lang}...`);
        try {
            const translated = await translateText(summary, lang);
            setSummary(translated);
            setLanguage(lang);
            setStatus('Translation complete');
            setAiAudio(null); // Reset AI audio as text changed
        } catch (error) {
            setErrorMsg('Translation failed. Please try again.');
            setStatus('');
        }
        setLoading(false);
    };

    const handleSpeak = () => {
        // Pause AI if playing
        if (isAiPlaying && aiAudio) {
            aiAudio.pause();
            setIsAiPlaying(false);
        }

        const synth = window.speechSynthesis;

        if (synth.speaking) {
            if (synth.paused) {
                synth.resume();
                setIsBrowserPlaying(true);
            } else {
                synth.pause();
                setIsBrowserPlaying(false);
            }
        } else {
            // Start new
            if (!summary) return;
            synth.cancel();

            const utterance = new SpeechSynthesisUtterance(summary);
            utterance.lang = language === 'Hindi' ? 'hi-IN' : language === 'Telugu' ? 'te-IN' : 'en-US';

            utterance.onend = () => {
                setIsBrowserPlaying(false);
            };

            synth.speak(utterance);
            setIsBrowserPlaying(true);
            setBrowserUtterance(utterance);
        }
    };

    const handleListenAI = async () => {
        // Stop Browser audio if playing
        window.speechSynthesis.cancel();
        setIsBrowserPlaying(false);

        // 1. Resume existing
        if (aiAudio && !isAiPlaying) {
            aiAudio.play();
            setIsAiPlaying(true);
            return;
        }

        // 2. Pause existing
        if (aiAudio && isAiPlaying) {
            aiAudio.pause();
            setIsAiPlaying(false);
            return;
        }

        // 3. Start New
        if (!summary) return;
        setAudioLoading(true);
        setStatus('Generating AI voice...');
        try {
            const audioBase64 = await generateSpeech(summary);
            const audioSrc = `data:audio/mpeg;base64,${audioBase64}`;
            const audio = new Audio(audioSrc);

            audio.onended = () => {
                setIsAiPlaying(false);
                setStatus('');
            };

            audio.play();
            setAiAudio(audio);
            setIsAiPlaying(true);
            setStatus('Playing AI Summary');
        } catch (error) {
            console.error('TTS Error:', error);
            setErrorMsg('AI Voice generation failed. Try again later.');
            setStatus('');
        }
        setAudioLoading(false);
    };

    const handleArchive = async () => {
        if (!summary || !currentUser) return;
        setLoading(true);
        try {
            await addDoc(collection(db, "vault"), {
                userId: currentUser.uid,
                summary: summary,
                originalText: ocrText,
                fileName: file.name,
                createdAt: new Date(),
                language: language
            });
            setStatus('Saved to Secure Vault');
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            console.error(error);
            setErrorMsg('Failed to archive document.');
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-primary mb-6 flex items-center">
                <FileText className="mr-3" /> Smart Legal Scanner
            </h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-center">
                <input
                    type="file"
                    id="doc-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                />
                <label
                    htmlFor="doc-upload"
                    className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition-colors"
                >
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-text-main font-medium">{file ? file.name : "Upload Document or Take Photo"}</span>
                    <span className="text-sm text-text-secondary mt-1">Supports JPG, PNG, PDF (max {MAX_FILE_SIZE_MB} MB)</span>
                </label>

                {file && !summary && (
                    <button
                        onClick={processDocument}
                        disabled={loading}
                        className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Scan & Analyze'}
                    </button>
                )}
            </div>

            {errorMsg && (
                <div className="text-center text-sm text-red-600 font-medium mb-4 flex items-center justify-center bg-red-50 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {errorMsg}
                </div>
            )}

            {status && (
                <div className="text-center text-sm text-secondary font-medium mb-4 flex items-center justify-center">
                    {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    {status}
                </div>
            )}

            {summary && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
                    <div className="flex flex-wrap items-center justify-between mb-4 border-b border-gray-100 pb-4">
                        <h3 className="text-lg font-bold text-primary">Analysis Summary</h3>
                        <div className="flex space-x-2">
                            <button onClick={() => handleTranslate('English')} className={`px-3 py-1 rounded-lg text-xs font-medium ${language === 'English' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600'}`}>English</button>
                            <button onClick={() => handleTranslate('Telugu')} className={`px-3 py-1 rounded-lg text-xs font-medium ${language === 'Telugu' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600'}`}>Telugu</button>
                            <button onClick={() => handleTranslate('Hindi')} className={`px-3 py-1 rounded-lg text-xs font-medium ${language === 'Hindi' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600'}`}>Hindi</button>
                        </div>
                    </div>

                    <div className="prose prose-sm max-w-none text-text-secondary mb-6 whitespace-pre-line">
                        {typeof summary === 'string' ? summary : JSON.stringify(summary)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* ─── AI Audio Button (ElevenLabs) ──────────────── */}
                        <button
                            onClick={handleListenAI}
                            disabled={audioLoading}
                            className={`flex items-center px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 shadow-sm ${isAiPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-secondary hover:bg-secondary/90 text-white'
                                }`}
                        >
                            {audioLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : isAiPlaying ? (
                                <span className="mr-2 font-bold leading-none">||</span>
                            ) : (
                                <Volume2 className="w-4 h-4 mr-2" />
                            )}
                            {audioLoading ? 'Generating Audio...' : isAiPlaying ? 'Pause AI' : aiAudio ? 'Resume AI' : 'Listen to Summary (AI)'}
                        </button>

                        {/* ─── Browser Audio Button ──────────────────────── */}
                        <button
                            onClick={handleSpeak}
                            className={`flex items-center font-medium px-4 py-2 rounded-xl border transition-colors ${isBrowserPlaying
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'text-primary hover:bg-primary/5 border-primary/20'
                                }`}
                        >
                            {isBrowserPlaying ? <span className="mr-2 font-bold leading-none">||</span> : <Play className="w-4 h-4 mr-2" />}
                            {isBrowserPlaying ? 'Pause (Browser)' : 'Play (Browser)'}
                        </button>

                        <button
                            onClick={handleArchive}
                            className="flex items-center text-text-main font-medium hover:bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 transition-colors"
                        >
                            <Archive className="w-4 h-4 mr-2" /> Archive to Vault
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartScanner;
