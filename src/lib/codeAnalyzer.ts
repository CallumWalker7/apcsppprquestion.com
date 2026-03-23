import { CodeAnalysis } from "@/types";

export function detectLanguage(code: string, hint = ""): string {
  if (hint && hint !== "Auto-detect") return hint;
  if (/\bpublic\s+class\b/.test(code) && /\bSystem\.out\b/.test(code)) return "Java";
  if (/\bdef\s+\w+\s*\(/.test(code) || /\bprint\s*\(/.test(code) || /\belif\b/.test(code)) return "Python";
  if (/\bfunction\s+\w+\s*\(/.test(code) || /=>\s*[{(]/.test(code) || /\bconsole\.log\b/.test(code)) return "JavaScript";
  if (/#include\b/.test(code) || /\bstd::\b/.test(code)) return "C++";
  return "Python"; // default
}

function unique(arr: string[]): string[] {
  return [...new Set(arr)];
}

function findProcedures(code: string, lang: string) {
  const procs: { name: string; parameters: string[]; description: string }[] = [];

  if (lang === "Python") {
    const re = /def\s+(\w+)\s*\(([^)]*)\)\s*:/g;
    let m;
    while ((m = re.exec(code)) !== null) {
      const params = m[2].split(",").map(p => p.split("=")[0].trim()).filter(Boolean);
      procs.push({ name: m[1], parameters: params, description: `Procedure that ${m[1].replace(/_/g, " ")}` });
    }
  } else if (lang === "JavaScript") {
    const re1 = /function\s+(\w+)\s*\(([^)]*)\)/g;
    let m;
    while ((m = re1.exec(code)) !== null) {
      const params = m[2].split(",").map(p => p.trim()).filter(Boolean);
      procs.push({ name: m[1], parameters: params, description: `Function that ${m[1].replace(/([A-Z])/g, " $1").toLowerCase()}` });
    }
    const re2 = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;
    while ((m = re2.exec(code)) !== null) {
      const params = m[2].split(",").map(p => p.trim()).filter(Boolean);
      procs.push({ name: m[1], parameters: params, description: `Arrow function that ${m[1].replace(/([A-Z])/g, " $1").toLowerCase()}` });
    }
  } else if (lang === "Java") {
    const re = /(?:public|private|protected|static|void|\s)+\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\s*\{/g;
    let m;
    while ((m = re.exec(code)) !== null) {
      if (!["if","for","while","switch","catch","class"].includes(m[1])) {
        const params = m[2].split(",").map(p => p.trim()).filter(Boolean);
        procs.push({ name: m[1], parameters: params, description: `Method that ${m[1].replace(/([A-Z])/g, " $1").toLowerCase()}` });
      }
    }
  } else if (lang === "C++") {
    const re = /(?:void|int|string|bool|float|double|auto)\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
    let m;
    while ((m = re.exec(code)) !== null) {
      if (!["main","if","for","while"].includes(m[1])) {
        const params = m[2].split(",").map(p => p.trim()).filter(Boolean);
        procs.push({ name: m[1], parameters: params, description: `Function that ${m[1].replace(/([A-Z])/g, " $1").toLowerCase()}` });
      }
    }
  }

  return procs.filter(p => p.name !== "main").slice(0, 6);
}

function findLists(code: string, lang: string): string[] {
  const names: string[] = [];
  if (lang === "Python") {
    let m;
    const re1 = /(\w+)\s*=\s*\[/g; while ((m = re1.exec(code)) !== null) names.push(m[1]);
    const re2 = /(\w+)\s*=\s*\{\s*(?:'|"|\w)/g; while ((m = re2.exec(code)) !== null) names.push(m[1]);
    const re3 = /(\w+)\s*=\s*(?:list|dict|set)\s*\(/g; while ((m = re3.exec(code)) !== null) names.push(m[1]);
  } else if (lang === "JavaScript") {
    let m;
    const re1 = /(?:const|let|var)\s+(\w+)\s*=\s*\[/g; while ((m = re1.exec(code)) !== null) names.push(m[1]);
    const re2 = /(?:const|let|var)\s+(\w+)\s*=\s*\{\s*(?:'|"|\w)/g; while ((m = re2.exec(code)) !== null) names.push(m[1]);
  } else if (lang === "Java") {
    let m;
    const re = /(?:ArrayList|LinkedList|List|HashMap|int\[\]|String\[\]|double\[\])<?\w*>?\s+(\w+)/g;
    while ((m = re.exec(code)) !== null) names.push(m[1]);
  } else if (lang === "C++") {
    let m;
    const re = /(?:vector|map|set|list|array)<\w+>\s+(\w+)/g;
    while ((m = re.exec(code)) !== null) names.push(m[1]);
  }
  return unique(names).filter(n => !["i","j","k","n","m","x","y","result","temp","count","total","sum"].includes(n)).slice(0, 5);
}

function findLoops(code: string): string[] {
  const loops: string[] = [];
  if (/\bfor\s+\w+\s+in\s+/.test(code)) loops.push("A for-in loop that iterates through a collection");
  if (/\bfor\s*\(/.test(code)) loops.push("A for loop that repeats a block of code");
  if (/\bwhile\s*\(/.test(code) || /\bwhile\s+\w+/.test(code)) loops.push("A while loop that repeats while a condition is true");
  if (/\.forEach\s*\(/.test(code)) loops.push("A forEach loop that processes each element");
  if (/\.map\s*\(/.test(code)) loops.push("A map operation that transforms each element");
  return loops;
}

function findConditionals(code: string): string[] {
  const conds: string[] = [];
  if (/\bif\b/.test(code)) conds.push("An if statement that checks a condition before executing");
  if (/\belif\b|\belse\s+if\b/.test(code)) conds.push("An elif/else-if for handling multiple conditions");
  if (/\belse\b/.test(code)) conds.push("An else clause providing an alternative execution path");
  if (/\bswitch\b/.test(code)) conds.push("A switch statement for multi-branch selection");
  return conds;
}

function findIO(code: string, lang: string) {
  const inputs: string[] = [];
  const outputs: string[] = [];
  if (lang === "Python") {
    if (/\binput\s*\(/.test(code)) inputs.push("User keyboard input via input()");
    if (/\bopen\s*\(/.test(code)) inputs.push("File input");
    if (/\bprint\s*\(/.test(code)) outputs.push("Printed text via print()");
    if (/\breturn\b/.test(code)) outputs.push("Return values from functions");
  } else if (lang === "JavaScript") {
    if (/\bprompt\s*\(/.test(code)) inputs.push("User input via prompt()");
    if (/querySelector|getElementById|addEventListener/.test(code)) inputs.push("User interface events/input");
    if (/\bconsole\.log/.test(code)) outputs.push("Console output via console.log()");
    if (/innerHTML|textContent|innerText/.test(code)) outputs.push("Web page output");
    if (/\breturn\b/.test(code)) outputs.push("Return values from functions");
  } else if (lang === "Java") {
    if (/\bScanner\b/.test(code)) inputs.push("User input via Scanner");
    if (/\bSystem\.out\.print/.test(code)) outputs.push("Console output via System.out.println");
    if (/\breturn\b/.test(code)) outputs.push("Return values from methods");
  } else if (lang === "C++") {
    if (/\bcin\b/.test(code)) inputs.push("User input via cin");
    if (/\bcout\b/.test(code)) outputs.push("Console output via cout");
    if (/\breturn\b/.test(code)) outputs.push("Return values from functions");
  }
  if (inputs.length === 0) inputs.push("Function parameters and program data");
  if (outputs.length === 0) outputs.push("Computed results and return values");
  return { inputs, outputs };
}

function inferPurpose(code: string, description: string, lang: string, procs: ReturnType<typeof findProcedures>, lists: string[]): string {
  if (description?.trim().length > 15) return description.trim();
  const names = procs.map(p => p.name).join(", ");
  if (lists.length > 0 && procs.length > 0)
    return `A ${lang} program that uses procedures (${names}) to organize and process data stored in lists/collections (${lists.slice(0, 2).join(", ")}).`;
  if (procs.length > 0)
    return `A ${lang} program that uses student-developed procedures (${names}) to implement its functionality.`;
  if (lists.length > 0)
    return `A ${lang} program that stores and processes data using collections (${lists.slice(0, 2).join(", ")}).`;
  return `A ${lang} program that uses algorithms including loops and conditionals to process data and produce results.`;
}

export function analyzeCode(code: string, description: string, langHint: string): CodeAnalysis {
  const language = detectLanguage(code, langHint);
  const procedures = findProcedures(code, language);
  const lists = findLists(code, language);
  const loops = findLoops(code);
  const conditionals = findConditionals(code);
  const { inputs, outputs } = findIO(code, language);
  const purpose = inferPurpose(code, description, language, procedures, lists);

  const dataDesc = lists.length > 0
    ? `The program uses ${lists.length} collection(s) (${lists.join(", ")}) to store multiple related data values, avoiding the need for separate variables for each item.`
    : `Data is managed through function parameters and return values.`;

  const algoDesc = [
    loops.length > 0 ? `Iteration: ${loops[0]}` : null,
    conditionals.length > 0 ? `Selection: ${conditionals[0]}` : null,
    procedures.length > 0 ? `Sequencing: Instructions execute in order within each procedure` : null,
  ].filter(Boolean).join(". ") || "The program uses sequencing and selection to control execution flow.";

  const complexity = lists.length > 0
    ? `The list(s) (${lists.slice(0, 2).join(", ")}) manage complexity by storing multiple values in a single structure. Without these lists, the program would need separate variables for each value, making the code longer and harder to maintain.`
    : `The program manages complexity through its procedure structure, which breaks the problem into smaller, reusable parts.`;

  return { purpose, language, inputs, outputs, dataAbstraction: { lists: lists.length > 0 ? lists : ["No explicit lists detected — use a list to store multiple related values"], description: dataDesc }, algorithms: { loops, conditionals, description: algoDesc }, procedures, complexity };
}
