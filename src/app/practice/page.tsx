"use client";
import { useState, useCallback } from "react";
import CodeInput from "@/components/CodeInput";
import AnalysisCard from "@/components/AnalysisCard";
import QuestionAnswer from "@/components/QuestionAnswer";
import ResultsView from "@/components/ResultsView";
import { Answer, CodeAnalysis, GradedResponse, Question, Session } from "@/types";
import { generateId, saveSession } from "@/lib/storage";

type Stage = "input" | "questions" | "results";

export default function PracticePage() {
  const [stage, setStage] = useState<Stage>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examMode, setExamMode] = useState(false);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [grades, setGrades] = useState<GradedResponse[]>([]);
  const [sessionId, setSessionId] = useState(generateId);

  const handleAnalyze = useCallback(async (
    submittedCode: string,
    submittedDesc: string,
    language: string,
    difficulty: string
  ) => {
    setError(null);
    setLoading(true);
    setCode(submittedCode);
    setDescription(submittedDesc);

    try {
      // Step 1: Analyze
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: submittedCode, description: submittedDesc, language }),
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analysis failed");
      const codeAnalysis: CodeAnalysis = analyzeData.analysis;
      setAnalysis(codeAnalysis);

      // Step 2: Generate questions
      const qRes = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: submittedCode, analysis: codeAnalysis, difficulty }),
      });
      const qData = await qRes.json();
      if (!qRes.ok) throw new Error(qData.error || "Question generation failed");
      setQuestions(qData.questions);
      setStage("questions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmitAnswers = useCallback(async (submittedAnswers: Answer[]) => {
    if (!analysis) return;
    setError(null);
    setLoading(true);
    setAnswers(submittedAnswers);

    try {
      const gradeRes = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, analysis, questions, answers: submittedAnswers }),
      });
      const gradeData = await gradeRes.json();
      if (!gradeRes.ok) throw new Error(gradeData.error || "Grading failed");

      const gradeResults: GradedResponse[] = gradeData.grades;
      setGrades(gradeResults);

      // Save session
      const totalScore = gradeResults.reduce((s, g) => s + g.score, 0);
      const maxTotalScore = gradeResults.reduce((s, g) => s + g.maxScore, 0);
      const session: Session = {
        id: sessionId,
        timestamp: Date.now(),
        code,
        description,
        language: analysis.language,
        analysis,
        questions,
        answers: submittedAnswers,
        grades: gradeResults,
        totalScore,
        maxTotalScore,
      };
      saveSession(session);
      setStage("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Grading failed");
    } finally {
      setLoading(false);
    }
  }, [analysis, code, description, questions, sessionId]);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <strong>Error:</strong> {error}
          {error.includes("API") || error.includes("key") ? (
            <p className="mt-1 text-red-600">Make sure your OPENAI_API_KEY is set in .env.local</p>
          ) : null}
        </div>
      )}

      {stage === "input" && (
        <CodeInput onAnalyze={handleAnalyze} loading={loading} />
      )}

      {stage === "questions" && analysis && (
        <div className="space-y-5">
          <AnalysisCard analysis={analysis} />
          <div className="flex items-center justify-end gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={examMode}
                onChange={(e) => setExamMode(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Exam Mode (timer)
            </label>
          </div>
          <QuestionAnswer
            questions={questions}
            onSubmit={handleSubmitAnswers}
            loading={loading}
            examMode={examMode}
          />
        </div>
      )}

      {stage === "results" && analysis && (
        <ResultsView
          questions={questions}
          grades={grades}
          answers={answers}
          onRetry={() => {
            setAnswers([]);
            setGrades([]);
            setStage("questions");
          }}
          onNewCode={() => {
            setStage("input");
            setAnalysis(null);
            setQuestions([]);
            setAnswers([]);
            setGrades([]);
            setError(null);
            setSessionId(generateId());
          }}
        />
      )}
    </div>
  );
}
