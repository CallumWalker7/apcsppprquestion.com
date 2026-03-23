"use client";
import { useEffect, useState } from "react";
import { Session } from "@/types";
import { getSessions } from "@/lib/storage";
import Link from "next/link";
import { ArrowRight, TrendingUp, Target, Award, BarChart3 } from "lucide-react";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const color = pct >= 85 ? "bg-green-500" : pct >= 65 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-700 w-16 text-right">
        {score}/{max} ({pct}%)
      </span>
    </div>
  );
}

export default function ProgressPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">No practice sessions yet</h2>
        <p className="text-slate-500 mb-6 text-sm">Complete a practice session to see your progress here.</p>
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Start Practicing <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const totalSessions = sessions.length;
  const avgPct = Math.round(
    sessions.reduce((sum, s) => sum + (s.maxTotalScore > 0 ? s.totalScore / s.maxTotalScore : 0), 0) / totalSessions * 100
  );
  const bestPct = Math.round(
    Math.max(...sessions.map(s => s.maxTotalScore > 0 ? s.totalScore / s.maxTotalScore : 0)) * 100
  );

  // Category averages
  const categoryTotals: Record<string, { score: number; max: number; count: number }> = {};
  sessions.forEach(session => {
    session.questions.forEach(q => {
      const grade = session.grades.find(g => g.questionId === q.id);
      if (!grade) return;
      if (!categoryTotals[q.categoryLabel]) {
        categoryTotals[q.categoryLabel] = { score: 0, max: 0, count: 0 };
      }
      categoryTotals[q.categoryLabel].score += grade.score;
      categoryTotals[q.categoryLabel].max += grade.maxScore;
      categoryTotals[q.categoryLabel].count++;
    });
  });

  const recentTrend = sessions.slice(0, 5).reverse().map(s =>
    s.maxTotalScore > 0 ? Math.round(s.totalScore / s.maxTotalScore * 100) : 0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Progress Dashboard</h1>
        <p className="text-slate-600 text-sm mt-1">Track your improvement across {totalSessions} practice session{totalSessions !== 1 ? "s" : ""}.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BarChart3, label: "Sessions", value: totalSessions, color: "text-blue-600 bg-blue-50" },
          { icon: Target, label: "Average", value: `${avgPct}%`, color: "text-amber-600 bg-amber-50" },
          { icon: Award, label: "Best Score", value: `${bestPct}%`, color: "text-green-600 bg-green-50" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-2`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Trend */}
      {recentTrend.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-slate-800">Recent Trend (last 5 sessions)</h2>
          </div>
          <div className="flex items-end gap-2 h-20">
            {recentTrend.map((pct, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all ${pct >= 85 ? "bg-green-400" : pct >= 65 ? "bg-amber-400" : "bg-red-400"}`}
                  style={{ height: `${Math.max(4, pct * 0.7)}px` }}
                />
                <span className="text-xs text-slate-500">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Performance by Category</h2>
          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([label, { score, max }]) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">{label}</span>
                  <span className="text-slate-500 text-xs">{score}/{max} pts total</span>
                </div>
                <ScoreBar score={score} max={max} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions list */}
      <div className="space-y-3">
        <h2 className="font-semibold text-slate-800">Session History</h2>
        {sessions.map((session) => {
          const pct = session.maxTotalScore > 0
            ? Math.round(session.totalScore / session.maxTotalScore * 100)
            : 0;
          const color = pct >= 85 ? "bg-green-500" : pct >= 65 ? "bg-amber-400" : "bg-red-400";
          return (
            <div key={session.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 line-clamp-1">
                    {session.analysis?.purpose || "Code project"}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {formatDate(session.timestamp)} · {session.language}
                  </div>
                </div>
                <div className={`${color} text-white text-sm font-bold px-2.5 py-1 rounded-lg flex-shrink-0`}>
                  {pct}%
                </div>
              </div>
              <div className="mt-3">
                <ScoreBar score={session.totalScore} max={session.maxTotalScore} />
              </div>
              <div className="mt-2 flex gap-1 flex-wrap">
                {session.grades.map((g) => {
                  const q = session.questions.find(q => q.id === g.questionId);
                  const gPct = g.maxScore > 0 ? g.score / g.maxScore : 0;
                  const dot = gPct === 1 ? "bg-green-400" : gPct >= 0.5 ? "bg-amber-400" : "bg-red-400";
                  return (
                    <div key={g.questionId} title={q?.categoryLabel} className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/practice"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
      >
        Practice Again <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
