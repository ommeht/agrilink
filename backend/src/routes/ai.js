const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const getModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// Crop Advisory Chat
router.post('/chat', protect, authorize('farmer'), async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const model = getModel();
    const prompt = `You are an expert agricultural advisor for Indian farmers. Answer the following farming question with practical, actionable advice. Include specific recommendations for crops, fertilizers, seasons, and regional considerations where relevant. Keep the response concise and farmer-friendly.

Question: ${message}

Provide response in this format:
- Direct answer
- Key recommendations (bullet points)
- Important tips`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ reply: text });
  } catch (err) { next(err); }
});

// Plant Disease Detection
router.post('/disease', protect, authorize('farmer'), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    const model = getModel();
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype
      }
    };

    const prompt = `You are an expert plant pathologist. Analyze this crop/plant image and provide a detailed disease diagnosis.

Respond in this exact JSON format:
{
  "disease": "Disease name or 'Healthy Plant'",
  "confidence": "High/Medium/Low",
  "description": "Brief description of the disease",
  "symptoms": ["symptom 1", "symptom 2"],
  "treatment": ["treatment step 1", "treatment step 2"],
  "pesticides": ["pesticide 1", "pesticide 2"],
  "prevention": ["prevention tip 1", "prevention tip 2"],
  "severity": "Mild/Moderate/Severe/None"
}`;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ message: 'Could not analyze image' });

    const analysis = JSON.parse(jsonMatch[0]);
    res.json({ analysis });
  } catch (err) { next(err); }
});

module.exports = router;
