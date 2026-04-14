import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiUpload, FiUser, FiCpu, FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi';
import { GiPlantSeed } from 'react-icons/gi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'Which crop should I grow this season?',
  'Best fertilizer for wheat?',
  'How to improve soil quality?',
  'Sowing time for tomatoes in India?',
  'How to increase crop yield?',
  'Best irrigation method for rice?'
];

function ChatTab() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: '🌾 Hello! I\'m your AI crop advisor. Ask me anything about farming — crop selection, fertilizers, sowing times, or pest control!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message: msg });
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Could not process request';
      setMessages(prev => [...prev, { role: 'ai', text: `❌ Error: ${errMsg}` }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {msg.role === 'ai' ? <FiCpu size={16} /> : <FiUser size={16} />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'ai' ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200' : 'bg-primary-600 text-white'}`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
              <FiCpu size={16} className="text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 bg-primary-400 rounded-full"
                    animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full border border-primary-200 dark:border-primary-800 hover:bg-primary-100 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            className="input flex-1" placeholder="Ask about crops, fertilizers, seasons..." disabled={loading} />
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMessage()}
            disabled={loading || !input.trim()} className="btn-primary px-4 disabled:opacity-50">
            <FiSend size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function DiseaseTab() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      const { data } = await api.post('/ai/disease', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data.analysis);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze image. Please try again.');
    } finally { setLoading(false); }
  };

  const severityColor = { None: 'text-green-600', Mild: 'text-yellow-600', Moderate: 'text-orange-600', Severe: 'text-red-600' };

  return (
    <div className="p-4 space-y-4">
      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors overflow-hidden">
        {preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt="crop" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white text-sm font-medium">Click to change image</p>
            </div>
          </div>
        ) : (
          <>
            <FiUpload size={32} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 font-medium">Upload crop image</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 5MB</p>
          </>
        )}
        <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
      </label>

      {preview && !result && (
        <motion.button whileTap={{ scale: 0.97 }} onClick={analyze} disabled={loading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {loading
            ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
            : <><FiCpu size={18} /> Detect Disease</>}
        </motion.button>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className={`p-4 rounded-2xl border-2 ${result.disease === 'Healthy Plant' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center gap-3">
                {result.disease === 'Healthy Plant'
                  ? <FiCheckCircle size={24} className="text-green-600" />
                  : <FiAlertTriangle size={24} className="text-red-500" />}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{result.disease}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">Confidence: <span className="font-semibold">{result.confidence}</span></span>
                    <span className={`text-xs font-semibold ${severityColor[result.severity] || 'text-gray-600'}`}>Severity: {result.severity}</span>
                  </div>
                </div>
              </div>
              {result.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{result.description}</p>}
            </div>

            {result.symptoms?.length > 0 && <Section title="🔍 Symptoms" items={result.symptoms} color="yellow" />}
            {result.treatment?.length > 0 && <Section title="💊 Treatment" items={result.treatment} color="blue" />}
            {result.pesticides?.length > 0 && <Section title="🧪 Recommended Pesticides" items={result.pesticides} color="purple" />}
            {result.prevention?.length > 0 && <Section title="🛡️ Prevention" items={result.prevention} color="green" />}

            <button onClick={() => { setResult(null); setImage(null); setPreview(null); }}
              className="w-full py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              <FiX size={14} /> Analyze Another Image
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, items, color }) {
  const colors = {
    yellow: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800',
    blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800',
    green: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800',
  };
  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AIChatbot() {
  const [tab, setTab] = useState('chat');

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
            <GiPlantSeed size={22} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Farm Assistant</h1>
        </div>

        <div className="card overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            {[
              { id: 'chat', label: '🌾 Crop Advisory' },
              { id: 'disease', label: '🔬 Disease Detection' }
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t.id ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'chat' ? <ChatTab /> : <DiseaseTab />}
        </div>
      </div>
    </div>
  );
}
