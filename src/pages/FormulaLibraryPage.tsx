import { ACCOUNTING_FORMULAS } from "../constants";
import { BookOpen, Search } from "lucide-react";
import { useState } from "react";

export default function FormulaLibraryPage() {
  const [search, setSearch] = useState("");

  const filteredFormulas = ACCOUNTING_FORMULAS.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="p-3 bg-emerald-500/10 w-fit mx-auto rounded-2xl">
          <BookOpen className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-bold">অ্যাকাউন্টিং সূত্রাবলী লাইব্রেরি</h1>
        <p className="opacity-60 max-w-2xl mx-auto">
          SSC এবং HSC শিক্ষার্থীদের জন্য প্রয়োজনীয় সকল অ্যাকাউন্টিং সূত্র এবং সমীকরণ।
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30" />
        <input
          type="text"
          placeholder="সূত্র খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-500/50 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFormulas.map((formula, i) => (
          <div 
            key={i}
            className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 hover:border-emerald-500/30 transition-all group"
          >
            <h3 className="text-xl font-bold text-emerald-400">{formula.name}</h3>
            <div className="p-4 bg-black/20 rounded-xl font-mono text-sm border border-white/5 group-hover:border-emerald-500/20 transition-colors">
              {formula.formula}
            </div>
            <p className="text-sm opacity-60 leading-relaxed">
              {formula.description}
            </p>
          </div>
        ))}
      </div>

      {filteredFormulas.length === 0 && (
        <div className="text-center py-20 opacity-40">
          No formulas found matching your search.
        </div>
      )}
    </div>
  );
}
