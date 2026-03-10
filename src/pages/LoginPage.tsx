import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Mail, Lock, Loader2, AlertCircle, User as UserIcon } from "lucide-react";
import { User } from "../types";

export default function LoginPage({ setUser }: { setUser: (u: User) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password })
      });
      
      const data = await res.json().catch(() => ({ success: false, message: "সার্ভার থেকে ভুল রেসপন্স এসেছে।" }));
      
      if (data.success) {
        // Instant feedback and redirect
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard", { replace: true });
      } else {
        setError(data.message || "লগইন করতে সমস্যা হয়েছে।");
        setIsLoading(false);
      }
    } catch (err) {
      setError("সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। আবার চেষ্টা করুন।");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10 pb-20">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8 shadow-2xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{isLogin ? "স্বাগতম" : "অ্যাকাউন্ট তৈরি করুন"}</h1>
          <p className="opacity-60 text-sm">
            {isLogin ? "আপনার ক্রেডিট এবং ইতিহাস দেখতে লগইন করুন" : "রেজিস্ট্রেশন করে প্রতিদিন ৫টি ফ্রি ক্রেডিট পান"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold opacity-40 uppercase ml-1">ইমেইল ঠিকানা</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-500/50 transition-colors outline-none"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold opacity-40 uppercase ml-1">ইউজারনেম</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-500/50 transition-colors outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold opacity-40 uppercase ml-1">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-500/50 transition-colors outline-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-sm animate-shake">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-80 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isLogin ? "লগইন হচ্ছে..." : "রেজিস্ট্রেশন হচ্ছে..."}
              </>
            ) : (
              <>
                {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                {isLogin ? "লগইন" : "রেজিস্ট্রেশন"}
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-emerald-500 hover:underline transition-all"
          >
            {isLogin ? "অ্যাকাউন্ট নেই? রেজিস্ট্রেশন করুন" : "অ্যাকাউন্ট আছে? লগইন করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}
