import { useState, useEffect } from "react";
import { 
  CreditCard, 
  History, 
  Gift, 
  Share2, 
  UserPlus, 
  LogIn, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Loader2,
  Sparkles
} from "lucide-react";
import { User, HistoryItem } from "../types";
import Markdown from "react-markdown";

export default function DashboardPage({ user, setUser }: { user: User | null; setUser: (u: User) => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [redeemCode, setRedeemCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/history/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setHistory(data);
          setIsLoadingHistory(false);
        })
        .catch(() => setIsLoadingHistory(false));
    }
  }, [user]);

  const handleRedeem = async () => {
    if (!redeemCode.trim() || !user) return;
    setIsRedeeming(true);
    setMessage(null);

    try {
      const res = await fetch("/api/credits/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, code: redeemCode })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Successfully redeemed ${data.value} credits!` });
        setUser({ ...user, credits: user.credits + data.value });
        setRedeemCode("");
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Failed to redeem code" });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleEarn = async (amount: number, action: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/credits/earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, amount, action })
      });
      if (res.ok) {
        setUser({ ...user, credits: user.credits + amount });
        setMessage({ type: 'success', text: `Earned ${amount} credits for ${action}!` });
      }
    } catch (err) {}
  };

  if (!user) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="p-4 bg-white/5 w-fit mx-auto rounded-full">
          <AlertCircle className="w-12 h-12 opacity-20" />
        </div>
        <h1 className="text-2xl font-bold">আপনার ড্যাশবোর্ড দেখতে লগইন করুন</h1>
        <a href="/login" className="inline-block px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold">লগইন করুন</a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">ইউজার ড্যাশবোর্ড</h1>
        <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <CreditCard className="w-6 h-6 text-emerald-500" />
          <div>
            <p className="text-xs opacity-60 font-medium uppercase">অবশিষ্ট ক্রেডিট</p>
            <p className="text-2xl font-black text-emerald-500">{user.credits}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Earn & Redeem */}
        <div className="space-y-8">
          {/* Redeem Code */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" /> কোড রিডিম করুন
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="কোড দিন (যেমন: ABC100)"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 transition-colors"
              />
              <button
                onClick={handleRedeem}
                disabled={isRedeeming || !redeemCode.trim()}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
              >
                {isRedeeming ? <Loader2 className="w-5 h-5 animate-spin" /> : "রিডিম"}
              </button>
            </div>
            {message && (
              <p className={`text-xs font-medium ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                {message.text}
              </p>
            )}
          </section>

          {/* Earn Credits */}
          <section className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" /> ক্রেডিট অর্জন করুন
            </h2>
            <div className="space-y-3">
              <EarnItem 
                icon={<LogIn className="w-4 h-4" />} 
                label="প্রতিদিনের লগইন" 
                reward="+১" 
                onClick={() => handleEarn(1, "Daily Login")} 
              />
              <EarnItem 
                icon={<UserPlus className="w-4 h-4" />} 
                label="বন্ধুকে আমন্ত্রণ" 
                reward="+৫" 
                onClick={() => handleEarn(5, "Invite Friend")} 
              />
              <EarnItem 
                icon={<Share2 className="w-4 h-4" />} 
                label="ওয়েবসাইট শেয়ার" 
                reward="+২" 
                onClick={() => handleEarn(2, "Share Website")} 
              />
            </div>
          </section>

          {/* Buy Credits */}
          <section className="p-6 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold">আরও ক্রেডিট প্রয়োজন?</h2>
            <p className="text-sm opacity-60">টেলিগ্রামের মাধ্যমে ক্রেডিট কিনে আনলিমিটেড অ্যাক্সেস পান।</p>
            <a 
              href="https://t.me/SadmanSupport?text=I%20want%20to%20buy%20Credit%20in%20your%20Accounting%20website." 
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all"
            >
              ক্রেডিট কিনুন <ExternalLink className="w-4 h-4" />
            </a>
          </section>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-500" /> সমাধানের ইতিহাস
          </h2>
          
          <div className="space-y-4">
            {isLoadingHistory ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : history.length > 0 ? (
              history.map((item) => (
                <HistoryCard key={item.id} item={item} />
              ))
            ) : (
              <div className="p-12 bg-white/5 border border-white/10 border-dashed rounded-3xl text-center opacity-40">
                কোন ইতিহাস পাওয়া যায়নি। প্রশ্ন সমাধান শুরু করুন!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EarnItem({ icon, label, reward, onClick }: { icon: React.ReactNode; label: string; reward: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-between w-full p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-xs font-bold text-emerald-500">{reward} Credits</span>
    </button>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-emerald-500/30">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between"
      >
        <div className="space-y-1 overflow-hidden">
          <p className="text-sm font-bold truncate pr-4">{item.question}</p>
          <p className="text-xs opacity-40">{new Date(item.created_at).toLocaleDateString()} • {item.type.toUpperCase()}</p>
        </div>
        <div className="p-2 bg-white/5 rounded-lg">
          {isOpen ? <LogIn className="w-4 h-4 rotate-90" /> : <LogIn className="w-4 h-4 -rotate-90" />}
        </div>
      </button>
      
      {isOpen && (
        <div className="p-6 pt-0 border-t border-white/10 bg-black/20">
          <div className="mt-4 prose prose-invert max-w-none text-sm">
            <div className="markdown-body">
              <Markdown>{item.solution}</Markdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
