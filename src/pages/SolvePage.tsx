import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  Image as ImageIcon, 
  Type, 
  Send, 
  Loader2, 
  Camera, 
  X, 
  Copy, 
  Download,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Share,
  Facebook,
  MessageCircle,
  Send as SendIcon,
  Twitter,
  Linkedin,
  QrCode
} from "lucide-react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { User } from "../types";

export default function SolvePage({ user, setUser }: { user: User | null; setUser: (u: User) => void }) {
  const [inputType, setInputType] = useState<'text' | 'image'>('text');
  const [textInput, setTextInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redeemCode, setRedeemCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRedeem = async () => {
    if (!redeemCode.trim() || !user) return;
    setIsRedeeming(true);
    try {
      const res = await fetch("/api/credits/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, code: redeemCode })
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, credits: user.credits + data.value });
        setRedeemSuccess(`সফলভাবে ${data.value} ক্রেডিট যোগ করা হয়েছে!`);
        setRedeemCode("");
        setTimeout(() => setRedeemSuccess(null), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("কোড রিডিম করতে সমস্যা হয়েছে।");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleShare = async (platform: string) => {
    const shareUrl = window.location.origin;
    const shareText = "Accounting Solver AI - বাংলাদেশি শিক্ষার্থীদের জন্য সেরা অ্যাকাউন্টিং সমাধান প্ল্যাটফর্ম!";
    
    let url = "";
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        alert("লিঙ্ক কপি করা হয়েছে!");
        break;
    }

    if (url) window.open(url, '_blank');

    // Give bonus credits for sharing
    if (user) {
      try {
        await fetch("/api/credits/earn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, amount: 2, action: "share_website" })
        });
        setUser({ ...user, credits: user.credits + 2 });
        alert("শেয়ার করার জন্য আপনাকে ২ বোনাস ক্রেডিট দেওয়া হয়েছে!");
      } catch (e) {
        console.error("Failed to give share bonus", e);
      }
    }
    setShowShareOptions(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (inputType === 'text' && !textInput.trim()) return;
    if (inputType === 'image' && !image) return;

    // Check credits
    if (user && user.credits <= 0) {
      setError("Insufficient credits. Please buy or earn more credits.");
      return;
    }

    setIsSolving(true);
    setError(null);
    setSolution(null);

    try {
      // 1. Consume credit
      const consumeRes = await fetch("/api/credits/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id || 0 }) // 0 for guest (handled on server)
      });
      
      if (!consumeRes.ok) {
        const err = await consumeRes.json();
        throw new Error(err.message || "Failed to consume credits");
      }

      const { remaining } = await consumeRes.json();
      if (user) setUser({ ...user, credits: remaining });

      // 2. Solve with AI
      const payload = inputType === 'image' 
        ? { image: image?.split(',')[1], mimeType: 'image/png' }
        : { text: textInput };

      // In a real app, we'd call the Gemini API via our server to protect the key
      // But for this environment, we can call it from the frontend if we want,
      // however the instructions say "Always call Gemini API from the frontend".
      // Wait, I already set up a geminiService.ts. Let's use it.
      
      const { solveAccountingQuestion } = await import("../services/geminiService");
      
      let aiResponse = "";
      if (inputType === 'image') {
        aiResponse = await solveAccountingQuestion({
          mimeType: 'image/png',
          data: image!.split(',')[1]
        }, true);
      } else {
        aiResponse = await solveAccountingQuestion(textInput, false);
      }

      setSolution(aiResponse);

      // 3. Save to history
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || 0,
          question: inputType === 'text' ? textInput : "Image Question",
          solution: aiResponse,
          type: inputType
        })
      });

    } catch (err: any) {
      setError(err.message || "An error occurred while solving.");
    } finally {
      setIsSolving(false);
    }
  };

  const copyToClipboard = () => {
    if (solution) {
      navigator.clipboard.writeText(solution);
      alert("Solution copied to clipboard!");
    }
  };

  const downloadAsText = () => {
    if (solution) {
      const element = document.createElement("a");
      const file = new Blob([solution], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = "accounting_solution.txt";
      document.body.appendChild(element);
      element.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">অ্যাকাউন্টিং প্রশ্ন সমাধান করুন</h1>
        <p className="opacity-60">ধাপে ধাপে বাংলা সমাধান মুহূর্তেই পান</p>
      </div>

      {/* Input Type Toggle */}
      <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-fit mx-auto">
        <button
          onClick={() => setInputType('text')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
            inputType === 'text' ? 'bg-emerald-500 text-white shadow-lg' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <Type className="w-4 h-4" /> টেক্সট
        </button>
        <button
          onClick={() => setInputType('image')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
            inputType === 'image' ? 'bg-emerald-500 text-white shadow-lg' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> ইমেজ
        </button>
      </div>

      {/* Input Area */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium opacity-60">প্রশ্ন ইনপুট করুন</span>
          </div>
          <button 
            onClick={() => setShowShareOptions(!showShareOptions)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/10"
          >
            <Share className="w-3 h-3" /> ওয়েবসাইট শেয়ার করুন (+২ ক্রেডিট)
          </button>
        </div>

        <AnimatePresence>
          {showShareOptions && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-4 border-b border-white/10"
            >
              <button onClick={() => handleShare('copy')} className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs transition-colors">
                <Copy className="w-3 h-3" /> লিঙ্ক কপি
              </button>
              <button onClick={() => handleShare('whatsapp')} className="flex items-center justify-center gap-2 p-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg text-xs transition-colors">
                <MessageCircle className="w-3 h-3" /> WhatsApp
              </button>
              <button onClick={() => handleShare('telegram')} className="flex items-center justify-center gap-2 p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg text-xs transition-colors">
                <SendIcon className="w-3 h-3" /> Telegram
              </button>
              <button onClick={() => handleShare('facebook')} className="flex items-center justify-center gap-2 p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg text-xs transition-colors">
                <Facebook className="w-3 h-3" /> Facebook
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {inputType === 'text' ? (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="আপনার অ্যাকাউন্টিং প্রশ্নটি এখানে টাইপ করুন বা পেস্ট করুন... (যেমন: আসবাবপত্র ক্রয় ৫০০০ টাকা, বিক্রয় ৩০০০ টাকা। জাবেদা দাখিলা প্রস্তুত কর।)"
            className="w-full h-48 bg-transparent border-none focus:ring-0 text-lg placeholder:opacity-30 resize-none"
          />
        ) : (
          <div 
            onClick={() => !image && fileInputRef.current?.click()}
            className={`relative w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              image ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5'
            }`}
          >
            {image ? (
              <>
                <img src={image} alt="Uploaded" className="h-full w-full object-contain rounded-xl p-2" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setImage(null); }}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="p-4 bg-white/5 rounded-full mb-4">
                  <Upload className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-medium">ছবি আপলোড করতে ক্লিক করুন অথবা ড্র্যাগ করুন</p>
                <p className="text-xs opacity-40 mt-1">PNG, JPG সর্বোচ্চ ১০ মেগাবাইট</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm opacity-60">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>AI ধাপে ধাপে বাংলা সমাধান তৈরি করবে</span>
          </div>
          <button
            onClick={handleSolve}
            disabled={isSolving || (inputType === 'text' ? !textInput.trim() : !image)}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {isSolving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> সমাধান করা হচ্ছে...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> সমাধান করুন
              </>
            )}
          </button>
        </div>
      </div>

      {/* Redeem Code Section */}
      {user && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold flex items-center justify-center md:justify-start gap-2">
              <QrCode className="w-5 h-5 text-emerald-500" /> প্রোমো কোড রিডিম করুন
            </h3>
            <p className="text-sm opacity-60">আপনার কাছে কোনো রিডিম কোড থাকলে এখানে ইনপুট করুন</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input 
              type="text" 
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              placeholder="কোড লিখুন..."
              className="flex-1 md:w-48 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            <button 
              onClick={handleRedeem}
              disabled={isRedeeming || !redeemCode.trim()}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
            >
              {isRedeeming ? <Loader2 className="w-5 h-5 animate-spin" /> : "অ্যাপ্লাই"}
            </button>
          </div>
        </div>
      )}

      {/* Error & Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
        {redeemSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-500"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{redeemSuccess}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solution Area */}
      <AnimatePresence>
        {solution && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/5">
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">সমাধান কার্ড</h2>
                    <p className="text-xs opacity-50">AI দ্বারা জেনারেট করা নির্ভুল উত্তর</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Copy className="w-4 h-4" /> উত্তর কপি করুন
                  </button>
                  <button 
                    onClick={downloadAsText}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors border border-white/10" 
                    title="ডাউনলোড করুন"
                  >
                    <Download className="w-5 h-5 opacity-60" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 md:p-8 space-y-8">
                {/* Question Summary */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2">আপনার প্রশ্ন</h3>
                  <p className="text-sm italic opacity-80">
                    {inputType === 'text' ? textInput : "ইমেজ থেকে সংগৃহীত প্রশ্ন"}
                  </p>
                </div>

                {/* AI Solution */}
                <div className="prose prose-invert max-w-none prose-emerald">
                  <div className="markdown-body">
                    <Markdown rehypePlugins={[rehypeRaw]}>{solution}</Markdown>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/5 border-t border-white/10 text-center">
                <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">
                  Accounting Solver AI - নির্ভুলতা নিশ্চিত করতে আপনার শিক্ষকের সাথে যাচাই করুন
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credits Info */}
      <div className="text-center pt-8">
        <p className="text-sm opacity-40">
          প্রতিটি সমাধানের জন্য ১ ক্রেডিট খরচ হবে। {user ? `আপনার ${user.credits} ক্রেডিট অবশিষ্ট আছে।` : "গেস্ট ইউজাররা প্রতিদিন ২ ক্রেডিট ফ্রি পাবেন।"}
        </p>
      </div>
    </div>
  );
}
