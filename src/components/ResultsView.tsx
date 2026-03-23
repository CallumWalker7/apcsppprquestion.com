"use client";
import { useState } from "react";
import { GradedResponse, Question } from "@/types";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, BookOpen, Star } from "lucide-react";
import clsx from "clsx";

interface Props {
  questions: Question[];
  grades: GradedResponse[];
  answers: { questionId: string; text: string }[];
  onRetry: () => void;
  onNewCode: () => void;
}

function ScoreCircle({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? score / max : 0;
  const color = pct === 1 ? "text-green-600" : pct >= 0.5 ? "text-amber-500" : "text-red-500";
  return (
    <div className={`text-3xl font-bold ${color}`}>
      {score}<span className="text-lg text-slate-400">/{max}</span>
    </div>
  );
}

function QuestionResult({ question, grade, answer }: { question: Question; grade: GradedResponse; answer: string }) {
  const [open, setOpen] = useState(false);
  const pct = grade.maxScore > 0 ? grade.score / grade.maxScore : 0;
  const scoreColor = pct === 1 ? "bg-green-100 border-green-300" : pct >= 0.5 ? "bg-amber-50 border-amber-300" : "bg-red-50 border-red-300";
  const scoreBadgeColor = pct === 1 ? "bg-green-500" : pct >= 0.5 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className={`rounded-xl border ${scoreColor} overflow-hidden`}>
      <button
        className="w-full flex items-start gap-4 p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className={`${scoreBadgeColor} text-white text-sm font-bold px-2.5 py-1 rounded-lg flex-shrink-0`}>
          {grade.score}/{grade.maxScore}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{question.categoryLabel}</div>
          <div className="text-sm text-slate-800 line-clamp-2">{question.prompt}</div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="border-t border-inherit bg-white p-5 space-y-5">
          {/* Student answer */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Your Answer</div>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 prose-answer">
              {answer || <span className="italic text-slate-400">No answer provided</span>}
            </div>
          </div>

          {/* Feedback */}
          <div className="text-sm text-slate-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
            {grade.feedback}
          </div>

          {/* Strengths */}
          {grade.strengths.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Strengths
              </div>
              <ul className="space-y-1">
                {grade.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-green-500 mt-0.5">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {grade.weaknesses.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> What&apos;s Missing
              </div>
              <ul className="space-y-1">
                {grade.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-red-400 mt-0.5">•</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Model answer */}
          <div>
            <div className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Star className="w-3.5 h-3.5" /> Model High-Scoring Answer
            </div>
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-sm text-slate-700 prose-answer">
              {grade.modelAnswer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsView({ questions, grades, answers, onRetry, onNewCode }: Props) {
  const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
  const maxScore = grades.reduce((sum, g) => sum + g.maxScore, 0);
  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const scoreLabel = pct >= 85 ? "Excellent!" : pct >= 65 ? "Good Progress" : "Needs Work";
  const scoreBg = pct >= 85 ? "from-green-500 to-emerald-600" : pct >= 65 ? "from-amber-400 to-orange-500" : "from-red-500 to-rose-600";

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className={`bg-gradient-to-br ${scoreBg} rounded-2xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/80 text-sm font-medium mb-1">Total Score</div>
            <div className="text-5xl font-bold">{totalScore}<span className="text-2xl text-white/70">/{maxScore}</span></div>
            <div className="text-white/90 text-lg font-semibold mt-1">{scoreLabel}</div>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold">{pct}%</div>
            <div className="text-white/80 text-sm">
              {grades.filter(g => g.score === g.maxScore).length}/{grades.length} full credit
            </div>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-2.5">
          <div className="bg-white rounded-full h-2.5 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Per-question breakdown */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">Question Breakdown</h2>
        <div className="space-y-3">
          {questions.map((q) => {
            const grade = grades.find((g) => g.questionId === q.id)!;
            const answer = answers.find((a) => a.questionId === q.id)?.text ?? "";
            return <QuestionResult key={q.id} question={q} grade={grade} answer={answer} />;
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          <BookOpen className="w-4 h-4" /> Try Again
        </button>
        <button
          onClick={onNewCode}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          New Code Project
        </button>
      </div>
    </div>
  );
}
