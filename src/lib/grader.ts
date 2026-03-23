import { Answer, CodeAnalysis, GradedResponse, Question } from "@/types";

const AP_VOCAB: Record<string, string[]> = {
  purpose: ["purpose", "goal", "designed", "meant to", "solves", "allows", "enables", "creates", "provides", "generates"],
  function: ["input", "output", "takes", "returns", "produces", "displays", "prints", "result", "value", "parameter"],
  data: ["list", "array", "collection", "stores", "data", "element", "index", "item", "value", "dictionary", "map"],
  complexity: ["complex", "without", "manage", "simplif", "reduce", "separate variable", "easier", "efficient", "instead", "would need"],
  procedure: ["procedure", "function", "method", "parameter", "argument", "call", "define", "return", "takes", "accepts"],
  algorithm: ["loop", "iteration", "conditional", "if", "while", "for", "sequen", "selection", "repeat", "condition", "step"],
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function mentionsCodeElement(answer: string, analysis: CodeAnalysis): boolean {
  const lower = answer.toLowerCase();
  const elements = [
    ...analysis.procedures.map(p => p.name.toLowerCase()),
    ...analysis.procedures.flatMap(p => p.parameters.map(param => param.toLowerCase())),
    ...analysis.dataAbstraction.lists.map(l => l.toLowerCase()),
  ].filter(e => e.length > 2 && !e.includes("no explicit"));
  return elements.some(e => lower.includes(e));
}

function countVocab(answer: string, categories: string[]): number {
  const lower = answer.toLowerCase();
  let count = 0;
  for (const cat of categories) {
    const words = AP_VOCAB[cat] ?? [];
    if (words.some(w => lower.includes(w))) count++;
  }
  return count;
}

function gradeQ1Purpose(answer: string, analysis: CodeAnalysis, question: Question): GradedResponse {
  const lower = answer.toLowerCase();
  const words = countWords(answer);
  const hasCodeRef = mentionsCodeElement(answer, analysis);

  const hasPurpose = countVocab(answer, ["purpose"]) >= 1 || lower.includes("program") || lower.includes("designed");
  const hasIO = (
    (countVocab(answer, ["function"]) >= 1 || lower.includes("input") || lower.includes("output")) &&
    words >= 20
  );

  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (words < 15) {
    weaknesses.push("Answer is too short — aim for at least 3–4 sentences");
  } else {
    if (hasPurpose) { score++; strengths.push("Describes the overall purpose of the program"); }
    else weaknesses.push("Does not clearly describe the overall purpose of the program");

    if (hasIO && score > 0) { score++; strengths.push("Describes the program's inputs and/or outputs"); }
    else if (score > 0) weaknesses.push("Does not describe both inputs and outputs of the program");
  }

  if (hasCodeRef) strengths.push("References specific elements from your code");
  else weaknesses.push("Should reference specific names from your code (e.g., procedure names, variable names)");

  const modelAnswer = `The purpose of this program is to ${analysis.purpose.replace(/^A \w+ program that /, "")}. When the program runs, it takes in ${analysis.inputs.slice(0, 2).join(" and ")} as inputs. The program then processes this data and produces ${analysis.outputs.slice(0, 2).join(" and ")} as output. ${analysis.procedures.length > 0 ? `The procedure \`${analysis.procedures[0].name}\` is called to handle the core logic of the program.` : ""}`;

  return {
    questionId: question.id,
    score: Math.min(score, question.maxScore),
    maxScore: question.maxScore,
    strengths,
    weaknesses,
    modelAnswer,
    feedback: score === 2
      ? "Strong answer! You clearly described both the purpose and the input/output behavior."
      : score === 1
      ? "Partial credit — you addressed one aspect but need to also describe the program's inputs and outputs explicitly."
      : "To earn credit, clearly describe what the program is meant to do AND what inputs it takes and what outputs it produces.",
  };
}

function gradeQ2Data(answer: string, analysis: CodeAnalysis, question: Question): GradedResponse {
  const lower = answer.toLowerCase();
  const words = countWords(answer);
  const lists = analysis.dataAbstraction.lists.filter(l => !l.includes("No explicit"));
  const hasListRef = lists.some(l => lower.includes(l.toLowerCase())) || countVocab(answer, ["data"]) >= 2;
  const hasExplanation = words >= 20 && countVocab(answer, ["data"]) >= 1;

  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (words < 12) {
    weaknesses.push("Answer is too short — explain what data the list stores and how it is used");
  } else if (hasListRef && hasExplanation) {
    score = 1;
    strengths.push("Identifies the list and explains the data it stores");
    if (lists.some(l => lower.includes(l.toLowerCase()))) strengths.push("References the specific list name from your code");
  } else {
    if (!hasListRef) weaknesses.push(`Reference the specific list in your code (e.g., \`${lists[0] ?? "your list"}\`) and describe what it stores`);
    if (!hasExplanation) weaknesses.push("Explain how the list is used in the program");
  }

  const listName = lists[0] ?? "myList";
  const modelAnswer = `The list \`${listName}\` is used in this program to store multiple related data values. Instead of creating a separate variable for each item, \`${listName}\` holds all the values in a single collection, making it easy to access, update, and process them. The program uses \`${listName}\` to ${analysis.dataAbstraction.description.toLowerCase().replace(/^the program uses.*to /, "accomplish its purpose — for example, iterating through the stored values to compute results")}.`;

  return {
    questionId: question.id,
    score,
    maxScore: question.maxScore,
    strengths,
    weaknesses,
    modelAnswer,
    feedback: score === 1
      ? "Good — you identified the list and described the data it stores."
      : "Identify the specific list by name, describe what data it stores, and explain how it is used in your program.",
  };
}

function gradeQ3Complexity(answer: string, analysis: CodeAnalysis, question: Question): GradedResponse {
  const lower = answer.toLowerCase();
  const words = countWords(answer);
  const lists = analysis.dataAbstraction.lists.filter(l => !l.includes("No explicit"));
  const hasListRef = lists.some(l => lower.includes(l.toLowerCase())) || lower.includes("list") || lower.includes("array");
  const hasComplexityVocab = countVocab(answer, ["complexity"]) >= 2;

  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (words < 15) {
    weaknesses.push("Answer is too short — explain both HOW the list manages complexity and what the code would look like without it");
  } else if (hasListRef && hasComplexityVocab) {
    score = 1;
    strengths.push("Explains how the list manages complexity");
    if (lower.includes("without") || lower.includes("instead") || lower.includes("would need")) {
      strengths.push("Describes how the program would be more complex without the list");
    } else {
      weaknesses.push("Also describe specifically how the program would be more complex without the list");
    }
  } else {
    if (!hasListRef) weaknesses.push(`Refer to the specific list (e.g., \`${lists[0] ?? "your list"}\`) in your explanation`);
    if (!hasComplexityVocab) weaknesses.push("Use complexity-related language: explain how it simplifies code, reduces variables, or makes the program easier to manage");
  }

  const listName = lists[0] ?? "myList";
  const modelAnswer = `The list \`${listName}\` manages the complexity of the program by allowing multiple related values to be stored and processed together in a single structure. Without \`${listName}\`, the program would need to declare a separate variable for each individual value, making the code significantly longer and harder to maintain. For example, if the list stores 10 items, without it the program would need 10 separate variables and 10 separate lines of code to process each one. The list allows a single loop to process all items, greatly reducing complexity.`;

  return {
    questionId: question.id,
    score,
    maxScore: question.maxScore,
    strengths,
    weaknesses,
    modelAnswer,
    feedback: score === 1
      ? "Good answer on complexity. Make sure you also explain what the code would look like without the list."
      : "Explain how your list reduces complexity AND what the program would need to do differently if the list didn't exist (e.g., using separate variables).",
  };
}

function gradeQ4Procedure(answer: string, analysis: CodeAnalysis, question: Question): GradedResponse {
  const lower = answer.toLowerCase();
  const words = countWords(answer);
  const proc = analysis.procedures[0];
  const hasProcRef = proc
    ? lower.includes(proc.name.toLowerCase())
    : (lower.includes("function") || lower.includes("procedure") || lower.includes("method"));
  const hasParamRef = proc && proc.parameters.length > 0
    ? proc.parameters.some(p => lower.includes(p.toLowerCase())) || lower.includes("parameter") || lower.includes("argument")
    : lower.includes("parameter") || lower.includes("argument") || lower.includes("takes") || lower.includes("accepts");
  const hasDescription = words >= 20 && countVocab(answer, ["procedure"]) >= 1;

  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (words < 12) {
    weaknesses.push("Answer is too short — describe the procedure, its parameters, and what it does");
  } else if (hasProcRef && hasDescription) {
    score = 1;
    if (hasProcRef) strengths.push(`References the specific procedure \`${proc?.name ?? "your procedure"}\``);
    if (hasParamRef) strengths.push("Describes the parameter(s) and their role");
    else weaknesses.push(`Describe the parameter(s) — ${proc?.parameters.join(", ") || "what inputs the procedure takes"} — and what they represent`);
  } else {
    if (!hasProcRef) weaknesses.push(`Reference the specific procedure by name (e.g., \`${proc?.name ?? "yourProcedure"}\`)`);
    if (!hasDescription) weaknesses.push("Describe what the procedure does and how it contributes to the program");
  }

  const procName = proc?.name ?? "myProcedure";
  const params = proc?.parameters.join(", ") ?? "param";
  const modelAnswer = `The procedure \`${procName}\` takes ${proc?.parameters.length ? `the parameter(s) \`${params}\`` : "no parameters"} and is responsible for ${proc?.description ?? "performing a key operation in the program"}. ${proc?.parameters.length ? `The parameter \`${proc.parameters[0]}\` represents the data passed into the procedure, allowing it to work with different values each time it is called.` : ""} This procedure contributes to the program by encapsulating a specific task, which makes the overall program easier to read and allows the logic to be reused without rewriting the same code multiple times.`;

  return {
    questionId: question.id,
    score,
    maxScore: question.maxScore,
    strengths,
    weaknesses,
    modelAnswer,
    feedback: score === 1
      ? "Good — you described the procedure. Make sure to always explain the parameters and their purpose."
      : `Reference the procedure \`${procName}\` by name, describe what it does, and explain what each parameter represents.`,
  };
}

function gradeQ5Algorithm(answer: string, analysis: CodeAnalysis, question: Question): GradedResponse {
  const lower = answer.toLowerCase();
  const words = countWords(answer);
  const hasIteration = lower.includes("loop") || lower.includes("for") || lower.includes("while") || lower.includes("iteration") || lower.includes("repeat");
  const hasSelection = lower.includes("if") || lower.includes("conditional") || lower.includes("selection") || lower.includes("check") || lower.includes("decision");
  const hasSequencing = lower.includes("sequen") || lower.includes("step") || lower.includes("order") || lower.includes("first") || lower.includes("then") || lower.includes("next");
  const hasCodeRef = mentionsCodeElement(answer, analysis);

  let score = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const criteriaCount = [hasIteration, hasSelection, hasSequencing].filter(Boolean).length;

  if (words < 15) {
    weaknesses.push("Answer is too short — describe the specific algorithm steps including iteration, selection, and sequencing");
  } else if (criteriaCount >= 2) {
    score = 1;
    if (hasIteration) strengths.push("Describes iteration (loop) in the algorithm");
    if (hasSelection) strengths.push("Describes selection (conditional/if statement) in the algorithm");
    if (hasSequencing) strengths.push("Describes sequencing (ordered steps) in the algorithm");
    if (hasCodeRef) strengths.push("References specific code elements");
    else weaknesses.push("Reference specific variable names or procedure names from your code");
  } else {
    if (!hasIteration) weaknesses.push("Describe how a loop (iteration) is used in the algorithm");
    if (!hasSelection) weaknesses.push("Describe how an if/conditional (selection) is used in the algorithm");
    if (!hasSequencing) weaknesses.push("Describe the sequence of steps (sequencing) in the algorithm");
  }

  const loopEx = analysis.algorithms.loops[0] ?? "a for loop";
  const condEx = analysis.algorithms.conditionals[0] ?? "an if statement";
  const proc = analysis.procedures[0];
  const modelAnswer = `The algorithm in this program uses sequencing, selection, and iteration to accomplish its purpose. First, the program sets up its data structures and initial values (sequencing). Then, ${loopEx.toLowerCase()} processes each element in sequence (iteration). Inside the loop, ${condEx.toLowerCase()} determines what action to take based on a condition (selection). ${proc ? `The procedure \`${proc.name}\` organizes these steps so they execute in the correct order.` : ""} Together, these three components allow the algorithm to process all inputs and produce the correct output.`;

  return {
    questionId: question.id,
    score,
    maxScore: question.maxScore,
    strengths,
    weaknesses,
    modelAnswer,
    feedback: score === 1
      ? "Good algorithm explanation! Reference specific code names (variable/procedure names) to strengthen the answer."
      : "Describe all three components: sequencing (steps in order), selection (if/conditional), and iteration (loop), referencing specific parts of your code.",
  };
}

export function gradeAllAnswers(answers: Answer[], questions: Question[], analysis: CodeAnalysis): GradedResponse[] {
  return questions.map(question => {
    const answer = answers.find(a => a.questionId === question.id)?.text?.trim() ?? "";
    switch (question.category) {
      case "purpose": return gradeQ1Purpose(answer, analysis, question);
      case "data": return gradeQ2Data(answer, analysis, question);
      case "complexity": return gradeQ3Complexity(answer, analysis, question);
      case "procedure": return gradeQ4Procedure(answer, analysis, question);
      case "algorithm": return gradeQ5Algorithm(answer, analysis, question);
      default: return gradeQ1Purpose(answer, analysis, question);
    }
  });
}
