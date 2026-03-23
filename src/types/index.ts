export interface CodeAnalysis {
  purpose: string;
  inputs: string[];
  outputs: string[];
  dataAbstraction: {
    lists: string[];
    description: string;
  };
  algorithms: {
    loops: string[];
    conditionals: string[];
    description: string;
  };
  procedures: {
    name: string;
    parameters: string[];
    description: string;
  }[];
  complexity: string;
  language: string;
}

export interface Question {
  id: string;
  category: "purpose" | "data" | "complexity" | "procedure" | "algorithm" | "function";
  categoryLabel: string;
  prompt: string;
  maxScore: number;
  rubricHints: string[];
}

export interface Answer {
  questionId: string;
  text: string;
}

export interface GradedResponse {
  questionId: string;
  score: number;
  maxScore: number;
  strengths: string[];
  weaknesses: string[];
  modelAnswer: string;
  feedback: string;
}

export interface Session {
  id: string;
  timestamp: number;
  code: string;
  description: string;
  language: string;
  analysis: CodeAnalysis;
  questions: Question[];
  answers: Answer[];
  grades: GradedResponse[];
  totalScore: number;
  maxTotalScore: number;
}
