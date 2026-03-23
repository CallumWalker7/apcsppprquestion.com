import { NextRequest, NextResponse } from "next/server";
import { gradeAllAnswers } from "@/lib/grader";
import { Answer, CodeAnalysis, Question } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { analysis, questions, answers }: {
      analysis: CodeAnalysis;
      questions: Question[];
      answers: Answer[];
    } = await req.json();
    const grades = gradeAllAnswers(answers, questions, analysis);
    return NextResponse.json({ grades });
  } catch (err) {
    console.error("Grade error:", err);
    return NextResponse.json({ error: "Grading failed." }, { status: 500 });
  }
}
