import React, { useState, useRef, useEffect } from 'react';
import { chatWithLegalAssistant } from '../utils/gemini';
import { Send, Mic, User, Scale, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const AIChat = () => {
    const [messages, setMessages] = useState([
        { role: 'model', text: "Hello! I am your Legal Assistant. How can I help you with legal queries today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Prepare history for Gemini
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const responseText = await chatWithLegalAssistant(history, input);

            setMessages(prev => [...prev, { role: 'model', text: responseText }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                text: `⚠️ Error: ${error.message.replace('Server Error: ', '')}. Please try again later.`
            }]);
        }
        setLoading(false);
    };

    const handleMic = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 m-6">
            <div className="bg-primary/5 p-4 rounded-t-2xl border-b border-primary/10 flex items-center">
                <Scale className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-lg font-bold text-primary">Legal Assistant Chat</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[75%] p-4 rounded-2xl ${msg.role === 'user'
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-gray-100 text-text-main rounded-bl-none'
                            }`}>
                            <p className="whitespace-pre-line text-sm">{msg.text}</p>
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none flex items-center">
                            <Loader className="w-4 h-4 mr-2 animate-spin text-gray-500" />
                            <span className="text-gray-500 text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-secondary transition-colors">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-transparent border-none outline-none text-text-main placeholder-gray-400"
                        placeholder="Type your legal question..."
                        disabled={loading}
                    />
                    <button
                        onClick={handleMic}
                        className={`p-2 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-primary'}`}
                        title="Voice Input"
                    >
                        <Mic className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="ml-2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
