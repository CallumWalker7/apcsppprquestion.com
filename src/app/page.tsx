import Link from "next/link";
import { ArrowRight, Brain, ClipboardCheck, TrendingUp, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Code Analysis",
    desc: "Paste your code and our AI identifies purpose, data abstraction, algorithms, and procedures.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: ClipboardCheck,
    title: "Personalized Questions",
    desc: "Get 4–6 AP-style questions tailored to YOUR specific code — not generic prompts.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Zap,
    title: "Instant Grading",
    desc: "Receive rubric-based scores (0–1 or 0–2) with detailed strengths/weaknesses feedback.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    desc: "Track your scores over time, spot weak areas, and measure improvement.",
    color: "bg-green-50 text-green-600",
  },
];

const categories = [
  "Program Purpose & Function",
  "Data Abstraction",
  "Managing Complexity",
  "Procedural Abstraction",
  "Algorithm Implementation",
];

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center pt-8 space-y-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full border border-blue-200">
          AP CSP Performance Task Prep
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
          Ace Your AP CSP
          <br />
          <span className="text-blue-600">Create Task</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Paste your code project and get AI-generated AP-style written response questions,
          instant rubric-based grading, and actionable feedback — tailored to your specific program.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Start Practicing
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/progress"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium px-6 py-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white"
          >
            View Progress
          </Link>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">How It Works</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className={`inline-flex p-2 rounded-lg ${color} mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white rounded-xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Rubric Categories Covered</h2>
        <p className="text-slate-600 text-sm mb-6">
          Questions are generated across all official AP CSP Performance Task rubric rows:
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full border border-blue-100"
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to practice?</h2>
          <p className="text-blue-100 mb-6 text-sm">
            It only takes a minute to paste your code and get started.
          </p>
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Analyze My Project
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
