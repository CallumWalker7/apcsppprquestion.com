"use client";
import { useState, useEffect } from "react";
import { Answer, Question } from "@/types";
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Loader2 } from "lucide-react";

interface Props {
  questions: Question[];
  onSubmit: (answers: Answer[]) => Promise<void>;
  loading: boolean;
  examMode: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  purpose: "bg-violet-100 text-violet-700 border-violet-200",
  data: "bg-blue-100 text-blue-700 border-blue-200",
  complexity: "bg-amber-100 text-amber-700 border-amber-200",
  procedure: "bg-green-100 text-green-700 border-green-200",
  algorithm: "bg-rose-100 text-rose-700 border-rose-200",
  function: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

function ScoreBadge({ max }: { max: number }) {
  return (
    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border">
      {max} point{max > 1 ? "s" : ""}
    </span>
  );
}

export default function QuestionAnswer({ questions, onSubmit, loading, examMode }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [viewAll, setViewAll] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive] = useState(examMode);

  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  const setAnswer = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = () => {
    const answersArray: Answer[] = questions.map((q) => ({
      questionId: q.id,
      text: answers[q.id] ?? "",
    }));
    onSubmit(answersArray);
  };

  const answeredCount = questions.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;

  if (viewAll) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Answer All Questions</h2>
          <button onClick={() => setViewAll(false)} className="text-sm text-blue-600 hover:underline">
            One at a time
          </button>
        </div>
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-slate-500">Q{idx + 1}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[q.category] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {q.categoryLabel}
                </span>
                <ScoreBadge max={q.maxScore} />
              </div>
            </div>
            <p className="text-slate-800 text-sm leading-relaxed mb-3">{q.prompt}</p>
            <textarea
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              placeholder="Type your response here..."
              className="w-full h-32 text-sm border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            <div className="text-xs text-slate-400 text-right mt-1">
              {(answers[q.id] ?? "").length} characters
            </div>
          </div>
        ))}
        <SubmitBar answeredCount={answeredCount} total={questions.length} onSubmit={handleSubmit} loading={loading} />
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Written Response</h2>
        <div className="flex items-center gap-3">
          {timerActive && (
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span>
            </div>
          )}
          <button onClick={() => setViewAll(true)} className="text-sm text-blue-600 hover:underline">
            View all
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrent(i)}
            className={`flex-1 h-2 rounded-full transition-colors ${
              i === current
                ? "bg-blue-500"
                : (answers[q.id] ?? "").trim()
                ? "bg-green-400"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <div className="text-xs text-slate-500 text-center">
        Question {current + 1} of {questions.length} · {answeredCount} answered
      </div>

      {/* Question card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[q.category] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
            {q.categoryLabel}
          </span>
          <ScoreBadge max={q.maxScore} />
        </div>
        <p className="text-slate-800 leading-relaxed mb-5">{q.prompt}</p>
        <textarea
          value={answers[q.id] ?? ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder="Type your response here..."
          className="w-full h-40 text-sm border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          autoFocus
        />
        <div className="text-xs text-slate-400 text-right mt-1">
          {(answers[q.id] ?? "").length} characters
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent(current + 1)}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <SubmitBar answeredCount={answeredCount} total={questions.length} onSubmit={handleSubmit} loading={loading} inline />
        )}
      </div>
    </div>
  );
}

function SubmitBar({ answeredCount, total, onSubmit, loading, inline }: {
  answeredCount: number; total: number; onSubmit: () => void; loading: boolean; inline?: boolean;
}) {
  const allAnswered = answeredCount === total;
  const btn = (
    <button
      onClick={onSubmit}
      disabled={answeredCount === 0 || loading}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
      {loading ? "Grading..." : `Submit ${answeredCount}/${total} Answers`}
    </button>
  );
  if (inline) return btn;
  return (
    <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="text-sm text-slate-600">
        {allAnswered ? "All questions answered!" : `${total - answeredCount} question${total - answeredCount !== 1 ? "s" : ""} unanswered`}
      </div>
      {btn}
    </div>
  );
}
