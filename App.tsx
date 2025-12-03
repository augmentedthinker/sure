import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Zap, 
  MessageSquare, 
  Share2, 
  Terminal, 
  ShoppingBag, 
  ArrowLeft, 
  Send, 
  Download, 
  Maximize2, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { ViewState, ChatMessage, LogEntry, AccentColor } from './types';

// Configuration & Data
const ACCENT_COLORS: AccentColor[] = [
  { name: 'Cyan', hex: '#06b6d4', glow: 'shadow-[0_0_20px_#06b6d4]' },
  { name: 'Magenta', hex: '#d946ef', glow: 'shadow-[0_0_20px_#d946ef]' },
  { name: 'Lime', hex: '#84cc16', glow: 'shadow-[0_0_20px_#84cc16]' },
  { name: 'Electric', hex: '#3b82f6', glow: 'shadow-[0_0_20px_#3b82f6]' },
  { name: 'Amber', hex: '#f59e0b', glow: 'shadow-[0_0_20px_#f59e0b]' },
];

const DEV_LOGS: LogEntry[] = [
  { day: '01', title: 'Genesis', desc: 'System initialization. Utility -> AI -> Architecture -> Identity -> Polish.' },
  { day: '02', title: 'Neural Link', desc: 'Integrated Pollinations.ai for external visual processing.' },
  { day: '03', title: 'Haptics', desc: 'Tactile feedback engine online. Reality sync established.' },
];

export default function App() {
  // --- State ---
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [accent, setAccent] = useState<AccentColor>(ACCENT_COLORS[0]);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(0); // Transition effect

  // Animation State
  const [waveIndex, setWaveIndex] = useState<number>(-1);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'assistant', content: 'System Online. Protocol GPT-4o active. Awaiting input.', timestamp: Date.now() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dreamscape State
  const [dreamPrompt, setDreamPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Affiliate State
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (view === ViewState.CHAT) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, view]);

  useEffect(() => {
    if (bgImage) {
      setBgOpacity(1);
    }
  }, [bgImage]);

  // --- Utilities ---
  const playTechBlip = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.error('Audio disabled or failed', e);
    }
  };

  const triggerWave = () => {
    setWaveIndex(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setWaveIndex(i);
      if (i > 6) {
        clearInterval(interval);
        setWaveIndex(-1);
      }
    }, 80); // Speed of wave
  };

  const handleTitleInteract = () => {
    // Haptic
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    // Sound
    playTechBlip();
    // Color
    const nextColor = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
    setAccent(nextColor);
    // Animation
    triggerWave();
  };

  const handleBack = () => {
    setView(ViewState.HOME);
  };

  // --- Logic: Dreamscape ---
  const handleGenerateDream = async () => {
    if (!dreamPrompt.trim()) return;
    setIsGenerating(true);
    
    // Using flux model via pollinations
    const encodedPrompt = encodeURIComponent(dreamPrompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=1080&height=1920&nologo=true&seed=${Date.now()}`;
    
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setGeneratedImage(url);
      setBgImage(url);
      setIsGenerating(false);
    };
    img.onerror = () => {
      setIsGenerating(false);
      alert('Generation Protocol Failed. Retrying recommended.');
    };
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dreamscape-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
      window.open(generatedImage, '_blank');
    }
  };

  // --- Logic: Chat ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userText = chatInput;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsTyping(true);

    try {
      // Build context string
      const conversationHistory = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
      const fullPrompt = `${conversationHistory}\nuser: ${userText}\nassistant:`;
      
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai`);
      
      if (!response.ok) throw new Error('API Error');
      
      const text = await response.text();
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '[SYSTEM ERROR] Connection to GPT-4o Neural Node failed.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- Render Helpers ---
  const glassCardClass = `
    backdrop-blur-md bg-white/20 border border-white/40 
    shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] 
    rounded-xl overflow-hidden transition-all duration-300
  `;

  const buttonClass = (index: number) => `
    relative group w-full p-6 text-left mb-4 
    ${glassCardClass}
    active:scale-95 hover:bg-white/30
    ${waveIndex === index ? `border-2 ${accent.glow}` : 'border-white/40'}
    transition-all duration-300
  `;

  // --- Views ---

  const renderHome = () => (
    <div className="flex flex-col h-full p-4 space-y-4 max-w-md mx-auto w-full pt-12">
      {/* Title Card */}
      <button 
        onClick={handleTitleInteract}
        className={`w-full p-8 mb-6 text-center ${glassCardClass} active:scale-95 group`}
        style={{ borderColor: waveIndex === 0 ? accent.hex : 'rgba(255,255,255,0.4)' }}
      >
        <div className="flex justify-center mb-2">
          <Activity className="w-12 h-12" style={{ color: accent.hex }} />
        </div>
        <h1 className="text-3xl font-bold tracking-tighter text-slate-900 group-active:animate-pulse">
          THE APPLICATION
        </h1>
        <p className="text-xs font-bold text-slate-700 tracking-[0.3em] mt-2">BETA 1.1 // R&D</p>
      </button>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <button onClick={() => setView(ViewState.DREAMSCAPE)} className={buttonClass(1)} style={{borderColor: waveIndex === 1 ? accent.hex : ''}}>
          <div className="flex items-center space-x-4">
            <Zap className="w-8 h-8 text-slate-800" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Dreamscape</h2>
              <p className="text-xs text-slate-700">Visual Synthesis Engine (Flux)</p>
            </div>
          </div>
        </button>

        <button onClick={() => setView(ViewState.CHAT)} className={buttonClass(2)} style={{borderColor: waveIndex === 2 ? accent.hex : ''}}>
          <div className="flex items-center space-x-4">
            <MessageSquare className="w-8 h-8 text-slate-800" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Chat</h2>
              <p className="text-xs text-slate-700">Neural Interface (GPT-4o)</p>
            </div>
          </div>
        </button>

        <button onClick={() => setView(ViewState.SHARE)} className={buttonClass(3)} style={{borderColor: waveIndex === 3 ? accent.hex : ''}}>
          <div className="flex items-center space-x-4">
            <Share2 className="w-8 h-8 text-slate-800" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Share App</h2>
              <p className="text-xs text-slate-700">Propagate System</p>
            </div>
          </div>
        </button>

        <button onClick={() => setView(ViewState.DEV_LOG)} className={buttonClass(4)} style={{borderColor: waveIndex === 4 ? accent.hex : ''}}>
          <div className="flex items-center space-x-4">
            <Terminal className="w-8 h-8 text-slate-800" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Dev Log</h2>
              <p className="text-xs text-slate-700">System History</p>
            </div>
          </div>
        </button>

        {/* Affiliate Button */}
        <button 
          onClick={() => setShowAffiliateModal(true)} 
          className={`${buttonClass(5)} overflow-hidden relative`} 
          style={{borderColor: waveIndex === 5 ? accent.hex : ''}}
        >
          {/* Dynamic Background for this button */}
          <div className="absolute inset-0 z-0">
             <img 
               src="https://image.pollinations.ai/prompt/cyberpunk%20streetwear?model=flux&width=400&height=200&nologo=true" 
               alt="ad-bg" 
               className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-slate-200/90 to-transparent"></div>
          </div>
          <div className="relative z-10 flex items-center space-x-4">
            <div className="relative">
              <ShoppingBag className="w-8 h-8 text-slate-900" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 rounded">AD</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Affiliate Marketing</h2>
              <p className="text-xs text-slate-900 font-semibold">Augmented Shop</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderDreamscape = () => (
    <div className="flex flex-col h-full p-4 pt-safe max-w-md mx-auto w-full">
      <div className={`p-6 mb-4 ${glassCardClass}`}>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900">
          <Zap className="w-6 h-6" /> Dreamscape
        </h2>
        <div className="space-y-4">
          <textarea
            value={dreamPrompt}
            onChange={(e) => setDreamPrompt(e.target.value)}
            placeholder="Describe your vision (e.g. 'cyberpunk city')"
            className="w-full bg-white/40 border border-white/50 rounded-lg p-3 text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
            rows={3}
          />
          <button
            onClick={handleGenerateDream}
            disabled={isGenerating}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            style={{ backgroundColor: accent.hex }}
          >
            {isGenerating ? 'SYNTHESIZING...' : 'GENERATE'}
          </button>
        </div>
      </div>

      {generatedImage && (
        <div className={`flex-1 min-h-0 flex flex-col items-center justify-center p-4 ${glassCardClass}`}>
          <div className="relative w-48 h-48 rounded-full border-4 border-white/50 shadow-2xl overflow-hidden cursor-pointer group" onClick={() => setIsLightboxOpen(true)}>
             <img src={generatedImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Generated" />
             <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
             </div>
          </div>
          <button onClick={downloadImage} className="mt-6 flex items-center gap-2 text-slate-900 font-bold bg-white/40 px-6 py-2 rounded-full hover:bg-white/60">
            <Download className="w-4 h-4" /> SAVE ASSET
          </button>
        </div>
      )}
    </div>
  );

  const renderChat = () => (
    <div className="flex flex-col h-full p-4 max-w-md mx-auto w-full">
      <div className={`p-4 mb-2 flex items-center justify-between ${glassCardClass}`}>
        <div className="flex items-center gap-2">
           <MessageSquare className="w-6 h-6 text-slate-900" />
           <div>
             <h2 className="text-lg font-bold text-slate-900">AI Chat</h2>
             <span className="text-[10px] font-mono bg-green-400/20 text-green-800 px-1 rounded border border-green-500/30">GPT-4o ACTIVE</span>
           </div>
        </div>
      </div>
      
      <div className={`flex-1 overflow-y-auto mb-4 p-4 space-y-4 ${glassCardClass}`}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-br-none' : 'bg-white/60 text-slate-900 rounded-bl-none border border-white/50'}`}>
              <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white/40 px-3 py-2 rounded-lg text-xs animate-pulse text-slate-700">GPT-4o is thinking...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className={`p-2 flex gap-2 ${glassCardClass}`}>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Enter command..."
          className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 placeholder-slate-600 px-2"
        />
        <button 
          onClick={handleSendMessage}
          className="p-2 rounded-lg text-white transition-colors active:scale-95"
          style={{ backgroundColor: accent.hex }}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderShare = () => (
    <div className="flex flex-col items-center justify-center h-full p-4 max-w-md mx-auto w-full">
      <div className={`w-full aspect-square flex flex-col items-center justify-center p-8 text-center ${glassCardClass}`}>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">SCAN TO ACCESS</h2>
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://augmentedthinker.github.io/DecemberApp/" 
            alt="QR Code" 
            className="w-48 h-48"
          />
        </div>
        <p className="text-xs font-mono text-slate-700 break-all">
          https://augmentedthinker.github.io/DecemberApp/
        </p>
      </div>
    </div>
  );

  const renderDevLog = () => (
    <div className="flex flex-col h-full p-4 max-w-md mx-auto w-full pt-10">
      <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <Terminal className="w-8 h-8" /> SYSTEM LOGS
      </h2>
      <div className="space-y-4 overflow-y-auto pb-20 no-scrollbar">
        {DEV_LOGS.map((log, idx) => (
          <div key={idx} className={`p-5 ${glassCardClass}`}>
            <div className="flex justify-between items-baseline mb-2 border-b border-slate-500/30 pb-2">
              <span className="text-xl font-bold text-slate-900">DAY {log.day}</span>
              <span className="text-xs text-slate-600 font-mono uppercase tracking-widest">{log.title}</span>
            </div>
            <p className="text-sm text-slate-800 font-mono leading-relaxed">
              {log.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Main Render ---
  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-400 font-mono text-slate-900">
      {/* Background Layer */}
      {bgImage && (
         <div 
           className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
           style={{ backgroundImage: `url(${bgImage})`, opacity: bgOpacity }}
         />
      )}
      <div className="absolute inset-0 z-0 bg-slate-300/30 backdrop-blur-[2px]"></div>
      
      {/* Main Content Area */}
      <div className="relative z-10 h-full flex flex-col">
        {view !== ViewState.HOME && (
          <div className="absolute top-0 left-0 w-full p-4 z-50 pointer-events-none">
            <button 
              onClick={handleBack}
              className="pointer-events-auto bg-white/20 backdrop-blur-md border border-white/40 p-2 rounded-full text-slate-900 hover:bg-white/40 transition-all shadow-lg active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
        )}

        <div className="flex-1 h-full overflow-hidden">
          {view === ViewState.HOME && renderHome()}
          {view === ViewState.DREAMSCAPE && renderDreamscape()}
          {view === ViewState.CHAT && renderChat()}
          {view === ViewState.SHARE && renderShare()}
          {view === ViewState.DEV_LOG && renderDevLog()}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && generatedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>
          <img src={generatedImage} className="max-w-full max-h-full rounded-lg shadow-2xl" alt="Full view" />
        </div>
      )}

      {/* Affiliate Warning Modal */}
      {showAffiliateModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in zoom-in-95 duration-200">
          <div className="bg-white/90 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">LEAVING SECURE ENVIRONMENT</h3>
              <p className="text-sm text-slate-600">
                You are about to access the external node: <br/>
                <span className="font-bold text-slate-800">Augmented Thinker Shop</span>
              </p>
              <div className="flex w-full gap-3 mt-4">
                <button 
                  onClick={() => setShowAffiliateModal(false)}
                  className="flex-1 py-3 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                >
                  ABORT
                </button>
                <button 
                  onClick={() => {
                    window.open('https://augmentedthinker-shop.fourthwall.com/', '_blank');
                    setShowAffiliateModal(false);
                  }}
                  className="flex-1 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                >
                  PROCEED
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}