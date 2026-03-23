import { NextRequest, NextResponse } from "next/server";
import { analyzeCode } from "@/lib/codeAnalyzer";

export async function POST(req: NextRequest) {
  try {
    const { code, description, language } = await req.json();
    if (!code || code.trim().length < 10) {
      return NextResponse.json({ error: "Please provide valid code." }, { status: 400 });
    }
    const analysis = analyzeCode(code, description ?? "", language ?? "");
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Analysis failed. Please check your code and try again." }, { status: 500 });
  }
}
