const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const connectDB = require('./config/db');
const webhookRoutes = require('./routes/webhookRoutes');



const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://elogixa.vercel.app', 'https://elogixa.onrender.com'],
    credentials: true
}));
app.use(express.json());

//Connect DB
connectDB();






app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/webhook',webhookRoutes)

// // Dialogflow webhook — handles contact intent + Groq AI for everything else
// let groq;
// try {
//     groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// } catch (e) {
//     console.warn("Groq not initialized:", e.message);
// }

// app.post('/webhook', async (req, res) => {
//     console.log("Webhook received:", JSON.stringify(req.body, null, 2));

//     const queryResult = req.body?.queryResult;
//     if (!queryResult?.queryText) {
//         return res.status(400).json({ fulfillmentText: "Invalid request format." });
//     }

//     const intentName = queryResult?.intent?.displayName || "";

//     // Contact intent → save to MongoDB
//     if (intentName.toLowerCase().includes("contact")) {
//         return dialogflowWebhook(req, res);
//     }

//     // All other intents → Groq AI
//     try {
//         const completion = await groq.chat.completions.create({
//             model: "llama-3.3-70b-versatile",
//             messages: [
//                 {
//                     role: "system",
//                     content: "You are Elogixa Bot, an assistant for Elogixa company. Keep answers short and concise. Only on the very first message in a conversation, briefly introduce yourself as Elogixa Bot and mention that you help users with Elogixa's IT services. After that, just answer questions directly without re-introducing yourself."
//                 },
//                 { role: "user", content: queryResult.queryText }
//             ],
//         });
//         res.json({ fulfillmentText: completion.choices[0].message.content });
//     } catch (error) {
//         console.error("Groq API error:", error?.message || error);
//         res.json({ fulfillmentText: "Sorry, I couldn't process your request right now." });
//     }
// });

app.get('/', (req, res) => {
    res.send('Elogixa API is running');
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});