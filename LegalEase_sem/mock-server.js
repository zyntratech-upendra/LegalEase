import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mock legal responses database
const LEGAL_RESPONSES = {
    "contract": "A contract is a legally binding agreement between two or more parties. In India, contracts are governed by the Indian Contract Act, 1872. Key elements include offer, acceptance, consideration, and lawful object. For a contract to be valid, the parties must be competent to contract, there must be free consent, a lawful consideration, and a lawful object.",

    "marriage age": "The legal age for marriage in India is 18 years for women and 21 years for men, as per The Prohibition of Child Marriage Act, 2006. Child marriage is a punishable offense with imprisonment and/or fine for those who perform, promote, or permit such marriages.",

    "dowry": "Dowry is illegal in India under the Dowry Prohibition Act, 1961. Giving or taking dowry can result in imprisonment for up to 5 years and/or fine up to ₹15,000 or the value of dowry, whichever is more. The law prohibits the demand, payment, or acceptance of dowry before, during, or after marriage.",

    "consumer rights": "Consumer rights in India are protected under the Consumer Protection Act, 2019. Consumers have six basic rights: Right to Safety, Right to Information, Right to Choose, Right to be Heard, Right to Redressal, and Right to Consumer Education. Complaints can be filed with District, State, or National Consumer Commissions.",

    "fir": "FIR (First Information Report) is a written document prepared by police when they receive information about a cognizable offense. Under Section 154 of CrPC, any person can report a cognizable offense orally or in writing. Police are legally bound to register an FIR and provide a copy to the complainant free of cost.",

    "bail": "Bail is the provisional release of an accused person awaiting trial. Under Indian law, there are three types: Regular bail, Anticipatory bail, and Interim bail. For non-serious offenses, bail is generally granted. For serious offenses, courts consider factors like severity of crime, evidence, and likelihood of accused fleeing.",

    "property": "Property law in India is governed by multiple acts including the Transfer of Property Act, 1882. Property can be movable or immovable. Sale, mortgage, lease, exchange, and gift are common property transactions. Registration of property documents is mandatory for transactions above ₹100.",

    "will": "A will is a legal document by which a person expresses their wishes regarding property distribution after death. Under Indian Succession Act, 1925, any person of sound mind and not a minor can make a will. It must be in writing, signed by the testator, and attested by at least two witnesses.",

    "divorce": "Divorce in India can be obtained through mutual consent or contested proceedings. Grounds include cruelty, adultery, desertion, conversion, mental disorder, venereal disease, renunciation, and presumption of death. Under Hindu Marriage Act, couples must complete one year of marriage before filing for divorce (except in special cases).",

    "default": "As a professional legal assistant specialized in Indian law, I can help you with questions about: Law, Legal rights, Court procedures, Consumer rights, Contracts, Legal documentation, Criminal law, Civil law, and Government legal policies. Could you please provide more details about your specific legal question?"
};

// Mock chat endpoint
app.post('/api/chat', (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Invalid message format' });
        }

        console.log('[MOCK API] Received:', message);

        // Check if it's a non-legal question
        const nonLegalKeywords = [
            'weather', 'cricket', 'food', 'movie', 'song', 'game',
            'sports', 'recipe', 'cooking', 'travel', 'hotel',
            'prime minister', 'president', 'politics', 'election'
        ];

        const isNonLegal = nonLegalKeywords.some(word =>
            message.toLowerCase().includes(word)
        );

        if (isNonLegal) {
            return res.json({
                reply: "I am designed to answer legal-related questions only."
            });
        }

        // Find matching legal topic
        let response = LEGAL_RESPONSES.default;

        const lowerMessage = message.toLowerCase();
        for (const [keyword, answer] of Object.entries(LEGAL_RESPONSES)) {
            if (lowerMessage.includes(keyword)) {
                response = answer;
                break;
            }
        }

        console.log('[MOCK API] Responding with:', response.substring(0, 50) + '...');
        res.json({ reply: response });

    } catch (error) {
        console.error('[MOCK API Error]:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK (MOCK MODE)',
        timestamp: new Date().toISOString(),
        mode: 'mock',
        message: 'Using mock responses - not real AI'
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log('🔧 MOCK Server running on http://localhost:' + PORT);
    console.log('⚠️  WARNING: Using mock responses (not real AI)');
    console.log('✅ This is for development/testing while API key issue is resolved');
    console.log('');
    console.log('Available mock topics:');
    console.log('- Contract, Marriage, Dowry, Consumer Rights');
    console.log('- FIR, Bail, Property, Will, Divorce');
});
