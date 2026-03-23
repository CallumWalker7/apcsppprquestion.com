import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/questionTemplates";
import { CodeAnalysis } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { analysis, difficulty = "standard" }: { analysis: CodeAnalysis; difficulty: string } = await req.json();
    const questions = generateQuestions(analysis, difficulty);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error("Generate questions error:", err);
    return NextResponse.json({ error: "Question generation failed." }, { status: 500 });
  }
}
