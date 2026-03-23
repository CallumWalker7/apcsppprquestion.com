"use client";
import { useState } from "react";
import { Code2, FileText, Loader2, ChevronDown } from "lucide-react";

interface Props {
  onAnalyze: (code: string, description: string, language: string, difficulty: string) => Promise<void>;
  loading: boolean;
}

const LANGUAGES = ["Auto-detect", "Python", "JavaScript", "Java", "C++", "Scratch", "Other"];
const DIFFICULTIES = [
  { value: "standard", label: "Standard (AP Exam Level)" },
  { value: "hard", label: "Harder (Advanced Practice)" },
];

const SAMPLE_CODE = `def find_most_common(items):
    counts = {}
    for item in items:
        if item in counts:
            counts[item] += 1
        else:
            counts[item] = 1

    most_common = None
    max_count = 0
    for item, count in counts.items():
        if count > max_count:
            max_count = count
            most_common = item

    return most_common, max_count

def analyze_scores(scores):
    total = sum(scores)
    average = total / len(scores)
    above_avg = [s for s in scores if s > average]
    return {
        "average": average,
        "above_average": above_avg,
        "count": len(scores)
    }

test_scores = [85, 92, 78, 95, 88, 72, 91, 85, 79, 85]
common_score, freq = find_most_common(test_scores)
print(f"Most common score: {common_score} (appeared {freq} times)")

result = analyze_scores(test_scores)
print(f"Class average: {result['average']:.1f}")
print(f"Students above average: {len(result['above_average'])}")`;

export default function CodeInput({ onAnalyze, loading }: Props) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("Auto-detect");
  const [difficulty, setDifficulty] = useState("standard");
  const [showRubric, setShowRubric] = useState(false);

  const handleSubmit = () => {
    if (!code.trim()) return;
    onAnalyze(code, description, language === "Auto-detect" ? "" : language, difficulty);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analyze My Project</h1>
        <p className="text-slate-600 text-sm mt-1">
          Paste your code below to generate personalized AP CSP performance task questions.
        </p>
      </div>

      {/* Code textarea */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Code2 className="w-4 h-4" />
          Your Code <span className="text-red-500">*</span>
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your full program code here..."
          className="w-full h-64 font-mono text-sm bg-slate-900 text-slate-100 rounded-lg p-4 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        <button
          type="button"
          onClick={() => setCode(SAMPLE_CODE)}
          className="text-xs text-blue-600 hover:text-blue-700 underline"
        >
          Load sample code (Python score analyzer)
        </button>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <FileText className="w-4 h-4" />
          Program Description <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Briefly describe what your program does in plain English..."
          className="w-full h-20 text-sm bg-white rounded-lg p-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Options row */}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>

      {/* Rubric viewer toggle */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRubric(!showRubric)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span>AP CSP Rubric Reference</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showRubric ? "rotate-180" : ""}`} />
        </button>
        {showRubric && (
          <div className="p-4 space-y-2 text-sm text-slate-700 bg-white">
            {[
              ["Row 1 — Program Purpose & Function (2 pts)", "Describes the overall purpose, what inputs are taken and outputs produced, and explains what the program does."],
              ["Row 2 — Data Abstraction (1 pt)", "Identifies a list/collection and explains how it stores multiple related pieces of data."],
              ["Row 3 — Managing Complexity (1 pt)", "Explains how the list manages complexity — how without it, the program would be more complex."],
              ["Row 4 — Procedural Abstraction (1 pt)", "Describes a student-developed procedure with parameters and explains what it does."],
              ["Row 5 — Algorithm Implementation (1 pt)", "Explains how an algorithm with sequencing, selection, and iteration works in the program."],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <div className="w-1 bg-blue-400 rounded flex-shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">{title}</div>
                  <div className="text-slate-600 text-xs mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!code.trim() || loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing your code...
          </>
        ) : (
          "Analyze My Project"
        )}
      </button>
    </div>
  );
}
