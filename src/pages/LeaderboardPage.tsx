import { useState, useEffect } from "react";
import { Trophy, Medal, User as UserIcon, Loader2 } from "lucide-react";
import { LeaderboardUser } from "../types";
import { clsx } from "clsx";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(res => res.json())
      .then(data => {
        setLeaders(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="p-3 bg-yellow-500/10 w-fit mx-auto rounded-2xl">
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold">শিক্ষার্থী লিডারবোর্ড</h1>
        <p className="opacity-60">অ্যাকাউন্টিং সমস্যা সমাধানে সেরা শিক্ষার্থীদের তালিকা।</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="grid grid-cols-12 p-6 border-b border-white/10 text-sm font-bold opacity-40 uppercase tracking-wider">
          <div className="col-span-2">র‍্যাঙ্ক</div>
          <div className="col-span-7">শিক্ষার্থী</div>
          <div className="col-span-3 text-right">সমাধান সংখ্যা</div>
        </div>

        <div className="divide-y divide-white/5">
          {leaders.map((leader, i) => (
            <div 
              key={i} 
              className={clsx(
                "grid grid-cols-12 p-6 items-center transition-colors hover:bg-white/5",
                i === 0 && "bg-yellow-500/5",
                i === 1 && "bg-slate-400/5",
                i === 2 && "bg-amber-700/5"
              )}
            >
              <div className="col-span-2 flex items-center gap-2">
                {i < 3 ? (
                  <Medal className={clsx(
                    "w-6 h-6",
                    i === 0 && "text-yellow-500",
                    i === 1 && "text-slate-400",
                    i === 2 && "text-amber-700"
                  )} />
                ) : (
                  <span className="text-lg font-bold opacity-40 pl-2">#{i + 1}</span>
                )}
              </div>
              <div className="col-span-7 flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-full">
                  <UserIcon className="w-5 h-5 opacity-60" />
                </div>
                <span className="font-medium truncate">{leader.username}</span>
              </div>
              <div className="col-span-3 text-right font-mono font-bold text-emerald-500">
                {leader.solves}
              </div>
            </div>
          ))}

          {leaders.length === 0 && (
            <div className="p-12 text-center opacity-40">
              No data available yet. Be the first to solve a question!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
