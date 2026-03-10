import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Brain, 
  BookOpen, 
  Trophy, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  CreditCard, 
  History, 
  PlusCircle, 
  User as UserIcon,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import HomePage from "./pages/HomePage";
import SolvePage from "./pages/SolvePage";
import FormulaLibraryPage from "./pages/FormulaLibraryPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import { User } from "./types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser); // Set immediately for instant UI response

        try {
          // Background refresh
          const res = await fetch(`/api/user/${parsedUser.id}`);
          const data = await res.json();
          if (data.id) {
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
          }
        } catch (e) {
          console.error("Auth refresh failed", e);
        }
      } else {
        // Guest user initialization
        let guestEmail = localStorage.getItem("guestEmail");
        let guestUsername = localStorage.getItem("guestUsername");
        if (!guestEmail) {
          const randomStr = Math.random().toString(36).substring(7);
          guestEmail = `guest_${randomStr}@guest.com`;
          guestUsername = `guest_${randomStr}`;
          localStorage.setItem("guestEmail", guestEmail);
          localStorage.setItem("guestUsername", guestUsername);
        }
        
        try {
          // Single optimized request for guest auth
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: guestEmail, password: "guest_password" })
          });
          const data = await res.json();
          
          if (data.success) {
            setUser(data.user);
          } else {
            // Register guest if login fails
            const regRes = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: guestEmail, username: guestUsername, password: "guest_password" })
            });
            const regData = await regRes.json();
            if (regData.success) setUser(regData.user);
          }
        } catch (e) {
          console.error("Guest auth failed", e);
        }
      }
    };

    initAuth();
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <Router>
      <div className={cn(
        "min-h-screen transition-colors duration-300",
        isDarkMode ? "bg-[#050505] text-white" : "bg-[#f5f5f5] text-[#141414]"
      )}>
        {/* Navbar */}
        <nav className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-md",
          isDarkMode ? "bg-[#050505]/80 border-white/10" : "bg-white/80 border-black/5"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2 group">
                  <div className="p-2 bg-emerald-500 rounded-lg group-hover:rotate-12 transition-transform">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">Accounting Solver AI</span>
                </Link>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-6">
                <NavLink to="/solve" icon={<PlusCircle className="w-4 h-4" />} label="সমাধান করুন" />
                <NavLink to="/formulas" icon={<BookOpen className="w-4 h-4" />} label="সূত্রাবলী" />
                <NavLink to="/leaderboard" icon={<Trophy className="w-4 h-4" />} label="লিডারবোর্ড" />
                
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  {user ? (
                    <>
                      <div className="flex flex-col items-end mr-2">
                        <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider">ক্রেডিট ব্যালেন্স</span>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-emerald-500" />
                          <span className="text-sm font-bold text-emerald-500">{user.credits}</span>
                        </div>
                      </div>
                      <Link 
                        to="/dashboard" 
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg text-xs font-bold transition-all border border-emerald-500/20"
                      >
                        ক্রেডিট কিনুন
                      </Link>
                      <Link 
                        to="/dashboard" 
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all border border-white/10"
                      >
                        কোড রিডিম
                      </Link>
                      <NavLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="ড্যাশবোর্ড" />
                      {user.role === 'admin' && (
                        <NavLink to="/admin" icon={<ShieldAlert className="w-4 h-4" />} label="অ্যাডমিন" />
                      )}
                      <button 
                        onClick={() => {
                          localStorage.removeItem("user");
                          setUser(null);
                          window.location.href = "/";
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-full text-red-500 transition-colors"
                        title="লগআউট"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
                    >
                      লগইন / রেজিস্ট্রেশন
                    </Link>
                  )}
                </div>

                <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-white/5 transition-colors">
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-4">
                <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-white/5 transition-colors">
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-white/10 bg-[#050505]"
              >
                <div className="px-4 pt-2 pb-6 space-y-1">
                  <MobileNavLink to="/solve" label="সমাধান করুন" onClick={() => setIsMenuOpen(false)} />
                  <MobileNavLink to="/formulas" label="সূত্রাবলী" onClick={() => setIsMenuOpen(false)} />
                  <MobileNavLink to="/leaderboard" label="লিডারবোর্ড" onClick={() => setIsMenuOpen(false)} />
                  {user ? (
                    <>
                      <MobileNavLink to="/dashboard" label="ড্যাশবোর্ড" onClick={() => setIsMenuOpen(false)} />
                      {user.role === 'admin' && (
                        <MobileNavLink to="/admin" label="অ্যাডমিন প্যানেল" onClick={() => setIsMenuOpen(false)} />
                      )}
                      <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-emerald-500" />
                          <span className="font-medium">ক্রেডিট: {user.credits}</span>
                        </div>
                        <button 
                          onClick={() => {
                            localStorage.removeItem("user");
                            setUser(null);
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-2 text-red-500"
                        >
                          <LogOut className="w-5 h-5" /> লগআউট
                        </button>
                      </div>
                    </>
                  ) : (
                    <Link 
                      to="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 bg-emerald-500 text-white rounded-lg font-medium mt-4"
                    >
                      লগইন / রেজিস্ট্রেশন
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/solve" element={<SolvePage user={user} setUser={setUser} />} />
            <Route path="/formulas" element={<FormulaLibraryPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/dashboard" element={<DashboardPage user={user} setUser={setUser} />} />
            <Route path="/admin" element={<AdminPage user={user} />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className={cn(
          "mt-auto border-t py-12",
          isDarkMode ? "bg-[#050505] border-white/10" : "bg-white border-black/5"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-6 h-6 text-emerald-500" />
                  <span className="text-xl font-bold">Accounting Solver AI</span>
                </div>
                <p className="text-sm opacity-60 max-w-xs">
                  বাংলাদেশি SSC এবং HSC শিক্ষার্থীদের জন্য সবচেয়ে শক্তিশালী AI-চালিত অ্যাকাউন্টিং সমাধান প্ল্যাটফর্ম।
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-4">দ্রুত লিঙ্ক</h3>
                <ul className="space-y-2 text-sm opacity-60">
                  <li><Link to="/solve" className="hover:text-emerald-500 transition-colors">প্রশ্ন সমাধান</Link></li>
                  <li><Link to="/formulas" className="hover:text-emerald-500 transition-colors">সূত্রাবলী লাইব্রেরি</Link></li>
                  <li><Link to="/leaderboard" className="hover:text-emerald-500 transition-colors">লিডারবোর্ড</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">সহায়তা</h3>
                <ul className="space-y-2 text-sm opacity-60">
                  <li><a href="https://t.me/SadmanSupport" className="hover:text-emerald-500 transition-colors">যোগাযোগ করুন</a></li>
                  <li><a href="https://t.me/SadmanSupport" className="hover:text-emerald-500 transition-colors">ক্রেডিট কিনুন</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs opacity-40">
              © ২০২৬ Accounting Solver AI. সর্বস্বত্ব সংরক্ষিত। Developed By Sadman Muzahid Ahanaf
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-2 text-sm font-medium transition-colors",
        isActive ? "text-emerald-500" : "opacity-60 hover:opacity-100"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileNavLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={cn(
        "block px-3 py-4 rounded-lg text-base font-medium transition-colors",
        isActive ? "bg-emerald-500/10 text-emerald-500" : "hover:bg-white/5"
      )}
    >
      {label}
    </Link>
  );
}
