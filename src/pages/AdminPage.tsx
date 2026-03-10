import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Search,
  RefreshCw,
  Key,
  Settings,
  Ban,
  UserCheck
} from "lucide-react";
import { User, AdminStats } from "../types";

export default function AdminPage({ user }: { user: User | null }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'codes' | 'settings'>('stats');
  
  // Code generation state
  const [newCode, setNewCode] = useState("");
  const [newValue, setNewValue] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, codesRes, settingsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/codes"),
        fetch("/api/admin/settings")
      ]);
      
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setCodes(await codesRes.json());
      setSettings(await settingsRes.json());
    } catch (err) {}
    setIsLoading(false);
  };

  const handleGenerateCode = async () => {
    if (!newCode.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode, value: newValue })
      });
      if (res.ok) {
        setNewCode("");
        fetchData();
      }
    } catch (err) {}
    setIsGenerating(false);
  };

  const handleUpdateCredits = async (userId: number, currentCredits: number) => {
    const newCredits = prompt("Enter new credit balance:", currentCredits.toString());
    if (newCredits !== null) {
      try {
        await fetch("/api/admin/update-credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, credits: parseInt(newCredits) })
        });
        fetchData();
      } catch (err) {}
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'BAN' : 'UNBAN'} this user?`)) return;
    try {
      await fetch("/api/admin/toggle-user-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, is_active: !currentStatus })
      });
      fetchData();
    } catch (err) {}
  };

  const handleUpdateSettings = async () => {
    try {
      await fetch("/api/admin/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings })
      });
      alert("Settings updated successfully!");
      fetchData();
    } catch (err) {}
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="p-4 bg-red-500/10 w-fit mx-auto rounded-full">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="opacity-60">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-emerald-500" /> অ্যাডমিন ড্যাশবোর্ড
        </h1>
        <button 
          onClick={fetchData} 
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl w-fit overflow-x-auto">
        <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="পরিসংখ্যান" icon={<FileText className="w-4 h-4" />} />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="ব্যবহারকারী" icon={<Users className="w-4 h-4" />} />
        <TabButton active={activeTab === 'codes'} onClick={() => setActiveTab('codes')} label="রিডিম কোড" icon={<Key className="w-4 h-4" />} />
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="সেটিংস" icon={<Settings className="w-4 h-4" />} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="space-y-8">
          {activeTab === 'stats' && stats && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard label="মোট ব্যবহারকারী" value={stats.totalUsers} icon={<Users className="w-6 h-6 text-blue-500" />} />
                <StatCard label="মোট সমাধান" value={stats.totalSolves} icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />} />
              </div>
              
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">সাম্প্রতিক সমাধানসমূহ</h2>
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs font-bold opacity-40 uppercase">
                      <tr>
                        <th className="px-6 py-4">ব্যবহারকারী</th>
                        <th className="px-6 py-4">ধরণ</th>
                        <th className="px-6 py-4">তারিখ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.recentSolves.map((solve, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm">{solve.username}</td>
                          <td className="px-6 py-4 text-sm uppercase">{solve.type === 'image' ? 'ইমেজ' : 'টেক্সট'}</td>
                          <td className="px-6 py-4 text-sm opacity-40">{new Date(solve.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'users' && (
            <section className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-xs font-bold opacity-40 uppercase">
                    <tr>
                      <th className="px-6 py-4">ইউজারনেম</th>
                      <th className="px-6 py-4">ইমেইল</th>
                      <th className="px-6 py-4">রোল</th>
                      <th className="px-6 py-4">ক্রেডিট</th>
                      <th className="px-6 py-4">স্ট্যাটাস</th>
                      <th className="px-6 py-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className={`hover:bg-white/5 transition-colors ${!u.is_active ? 'opacity-50 grayscale' : ''}`}>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-500">{u.username}</td>
                        <td className="px-6 py-4 text-sm font-medium">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'}`}>
                            {u.role === 'admin' ? 'অ্যাডমিন' : 'ইউজার'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono font-bold text-emerald-500">{u.credits}</td>
                        <td className="px-6 py-4">
                          {u.is_active ? (
                            <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> সক্রিয়
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
                              <Ban className="w-3 h-3" /> নিষিদ্ধ
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => handleUpdateCredits(u.id, u.credits)}
                              className="text-xs font-bold text-emerald-500 hover:underline"
                            >
                              ক্রেডিট
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(u.id, !!u.is_active)}
                              className={`text-xs font-bold hover:underline ${u.is_active ? 'text-red-500' : 'text-emerald-500'}`}
                            >
                              {u.is_active ? 'ব্যান করুন' : 'আনব্যান'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">অ্যাপ সেটিংস</h2>
                <button 
                  onClick={handleUpdateSettings}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  সেভ করুন
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {settings.map((s, i) => (
                  <div key={s.key} className="space-y-2">
                    <label className="text-xs font-bold opacity-40 uppercase ml-1">
                      {s.key.replace(/_/g, ' ')}
                    </label>
                    <input 
                      type="text" 
                      value={s.value}
                      onChange={(e) => {
                        const newSettings = [...settings];
                        newSettings[i].value = e.target.value;
                        setSettings(newSettings);
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-500/50 outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'codes' && (
            <div className="space-y-8">
              <section className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                <h2 className="text-2xl font-bold">রিডিম কোড তৈরি করুন</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold opacity-40 uppercase ml-1">কোড নাম</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: SPECIAL100" 
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold opacity-40 uppercase ml-1">ক্রেডিট ভ্যালু</label>
                    <input 
                      type="number" 
                      value={newValue}
                      onChange={(e) => setNewValue(parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={handleGenerateCode}
                      disabled={isGenerating || !newCode.trim()}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} তৈরি করুন
                    </button>
                  </div>
                </div>
              </section>

              <section className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-xs font-bold opacity-40 uppercase">
                    <tr>
                      <th className="px-6 py-4">কোড</th>
                      <th className="px-6 py-4">ভ্যালু</th>
                      <th className="px-6 py-4">স্ট্যাটাস</th>
                      <th className="px-6 py-4">তৈরি হয়েছে</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {codes.map((c) => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono font-bold">{c.code}</td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-500">{c.value}</td>
                        <td className="px-6 py-4">
                          {c.is_active ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                              <CheckCircle2 className="w-3 h-3" /> সক্রিয়
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase">
                              <XCircle className="w-3 h-3" /> ব্যবহৃত
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm opacity-40">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="p-8 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-bold opacity-40 uppercase">{label}</p>
        <p className="text-4xl font-black">{value}</p>
      </div>
      <div className="p-4 bg-white/5 rounded-2xl">
        {icon}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
        active ? 'bg-emerald-500 text-white shadow-lg font-bold' : 'opacity-60 hover:opacity-100'
      }`}
    >
      {icon} {label}
    </button>
  );
}
