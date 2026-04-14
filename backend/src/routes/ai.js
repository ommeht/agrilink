const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const callAI = async (messages, model = 'openrouter/auto') => {
  const res = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    { model, messages },
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://agrilink-fs3v.vercel.app',
        'X-Title': 'AgriLink'
      }
    }
  );
  return res.data.choices[0].message.content;
};

// Crop Advisory Chat
router.post('/chat', protect, authorize('farmer'), async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const reply = await callAI([
      {
        role: 'system',
        content: 'You are an expert agricultural advisor for Indian farmers. Give practical, concise advice about crops, fertilizers, seasons, soil, and pest control. Use bullet points for recommendations.'
      },
      { role: 'user', content: message }
    ]);

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.error?.message || err.message });
  }
});

// Plant Disease Detection
router.post('/disease', protect, authorize('farmer'), (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Image upload failed' });
    try {
      if (!req.file) return res.status(400).json({ message: 'Image is required' });

      const base64 = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      const reply = await callAI([
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert plant pathologist. Analyze this crop image and respond ONLY with valid JSON, no extra text:
{
  "disease": "Disease name or Healthy Plant",
  "confidence": "High or Medium or Low",
  "description": "Brief description",
  "symptoms": ["symptom 1", "symptom 2"],
  "treatment": ["treatment 1", "treatment 2"],
  "pesticides": ["pesticide 1", "pesticide 2"],
  "prevention": ["tip 1", "tip 2"],
  "severity": "None or Mild or Moderate or Severe"
}`
            },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` }
            }
          ]
        }
      ], 'openrouter/auto');

      const jsonMatch = reply.match(/```json\s*([\s\S]*?)```/) || reply.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return res.status(500).json({ message: 'Could not parse AI response' });

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const analysis = JSON.parse(jsonStr);
      res.json({ analysis });
    } catch (err) {
      console.error('Disease error:', err.response?.data || err.message);
      res.status(500).json({ message: err.response?.data?.error?.message || err.message || 'Failed to analyze image' });
    }
  });
});

module.exports = router;
