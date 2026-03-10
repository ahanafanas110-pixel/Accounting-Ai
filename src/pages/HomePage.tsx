import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Brain, Image as ImageIcon, FileText, CheckCircle, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { User } from "../types";

export default function HomePage({ user }: { user: User | null }) {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
        
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-sm font-semibold tracking-wide uppercase">
              অ্যাকাউন্টিং শিক্ষার ভবিষ্যৎ
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
          >
            অ্যাকাউন্টিং প্রশ্নের সমাধান <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              AI এর মাধ্যমে মুহূর্তেই
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl opacity-60 max-w-2xl mx-auto"
          >
            আপনার অ্যাকাউন্টিং প্রশ্নের ছবি আপলোড করুন অথবা টাইপ করুন। SSC এবং HSC শিক্ষার্থীদের জন্য ধাপে ধাপে বাংলা সমাধান পান।
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to="/solve" 
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              সমাধান শুরু করুন <ArrowRight className="w-5 h-5" />
            </Link>
            {!user && (
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-lg transition-all"
              >
                ফ্রি অ্যাকাউন্ট তৈরি করুন
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<ImageIcon className="w-8 h-8 text-emerald-500" />}
          title="ইমেজ সলভার"
          description="আপনার প্রশ্নের একটি ছবি তুলুন এবং আমাদের AI কে বাকি কাজ করতে দিন।"
        />
        <FeatureCard 
          icon={<FileText className="w-8 h-8 text-cyan-500" />}
          title="টেক্সট সলভার"
          description="বিস্তারিত বাংলা সমাধানের জন্য আপনার অ্যাকাউন্টিং সমস্যাটি পেস্ট বা টাইপ করুন।"
        />
        <FeatureCard 
          icon={<Zap className="w-8 h-8 text-yellow-500" />}
          title="তাত্ক্ষণিক ফলাফল"
          description="ঘন্টার পর ঘন্টা নয়, কয়েক সেকেন্ডের মধ্যেই সঠিক সমাধান পান।"
        />
      </section>

      {/* Topics Section */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">সমর্থিত অ্যাকাউন্টিং বিষয়সমূহ</h2>
          <p className="opacity-60">আমরা SSC এবং HSC এর সকল গুরুত্বপূর্ণ বিষয় কভার করি।</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          {[
            "জাবেদা (Journal)", "খতিয়ান (Ledger)", "রেওয়ামিল (Trial Balance)", "নগদান বই (Cash Book)", 
            "আয় বিবরণী (Income Statement)", "আর্থিক অবস্থার বিবরণী (Balance Sheet)", "অবচয় (Depreciation)", "অংশীদারি কারবার (Partnership)", 
            "যৌথ মূলধনী কোম্পানি", "উৎপাদন ব্যয় হিসাব"
          ].map((topic, i) => (
            <motion.div
              key={topic}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-medium"
            >
              {topic}
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">এটি যেভাবে কাজ করে</h2>
            <div className="space-y-8">
              <Step 
                num="০১" 
                title="প্রশ্ন ইনপুট দিন" 
                desc="আপনার অ্যাকাউন্টিং প্রশ্নের ছবি আপলোড করুন অথবা ম্যানুয়ালি টাইপ করুন।" 
              />
              <Step 
                num="০২" 
                title="AI প্রসেসিং" 
                desc="আমাদের উন্নত AI অ্যাকাউন্টিং নীতিমালা ব্যবহার করে সমস্যাটি বিশ্লেষণ করে।" 
              />
              <Step 
                num="০৩" 
                title="সমাধান পান" 
                desc="সঠিক ছক এবং ধাপে ধাপে বাংলা সমাধান গ্রহণ করুন।" 
              />
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
              <Brain className="w-32 h-32 text-emerald-500 animate-pulse" />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 p-4 bg-emerald-500 rounded-xl shadow-xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 p-4 bg-cyan-500 rounded-xl shadow-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4"
    >
      <div className="p-3 bg-white/5 w-fit rounded-2xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="opacity-60 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-6">
      <span className="text-4xl font-black text-emerald-500/20">{num}</span>
      <div className="space-y-1">
        <h4 className="text-xl font-bold">{title}</h4>
        <p className="opacity-60 text-sm">{desc}</p>
      </div>
    </div>
  );
}
