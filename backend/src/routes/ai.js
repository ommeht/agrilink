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
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error('Chat error:', err.message);
    next(err);
  }
});

// Plant Disease Detection
router.post('/disease', protect, authorize('farmer'), (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Image upload failed' });
    try {
      if (!req.file) return res.status(400).json({ message: 'Image is required' });

      const model = getModel();

      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString('base64'),
          mimeType: req.file.mimetype
        }
      };

      const prompt = `You are an expert plant pathologist. Analyze this crop/plant image carefully.

Respond ONLY with valid JSON in this exact format, no extra text:
{
  "disease": "Disease name or Healthy Plant",
  "confidence": "High or Medium or Low",
  "description": "Brief description",
  "symptoms": ["symptom 1", "symptom 2"],
  "treatment": ["treatment 1", "treatment 2"],
  "pesticides": ["pesticide 1", "pesticide 2"],
  "prevention": ["tip 1", "tip 2"],
  "severity": "None or Mild or Moderate or Severe"
}`;

      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text().trim();

      // Extract JSON — handle markdown code blocks too
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return res.status(500).json({ message: 'Could not parse AI response' });

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const analysis = JSON.parse(jsonStr);
      res.json({ analysis });
    } catch (err) {
      console.error('Disease detection error:', err.message);
      res.status(500).json({ message: err.message || 'Failed to analyze image' });
    }
  });
});

module.exports = router;
