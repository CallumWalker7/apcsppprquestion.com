import { CodeAnalysis, Question } from "@/types";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateQuestions(analysis: CodeAnalysis, difficulty: string): Question[] {
  const { procedures, dataAbstraction, algorithms, inputs, outputs, purpose, language, complexity } = analysis;
  const proc = procedures[0];
  const list = dataAbstraction.lists[0] ?? "your list";
  const loop = algorithms.loops[0] ?? "a loop";
  const cond = algorithms.conditionals[0] ?? "a conditional";
  const hard = difficulty === "hard";

  // Q1: Program Purpose & Function (2 pts)
  const q1Prompts = [
    `Describe the overall purpose of the program. Then explain what the program does, what input(s) it uses, and what output(s) it produces.`,
    hard
      ? `Describe the overall purpose of the program and explain how it functions, including the inputs it accepts, the outputs it produces, and how the program achieves its goal.`
      : `Describe the overall purpose of your program. Identify the inputs that your program uses and the outputs that it produces.`,
  ];

  // Q2: Data Abstraction (1 pt)
  const q2Prompts = list && !list.includes("No explicit")
    ? [
        `Identify the list \`${list}\` used in your program. Describe what data is stored in \`${list}\` and explain how it is used to fulfill the program's purpose.`,
        hard
          ? `The list \`${list}\` is used in your program. Explain what data the list stores, how the list is populated, and how it contributes to the program's overall functionality.`
          : `Identify the data stored in the list \`${list}\`. Explain how this list is used within the program.`,
      ]
    : [
        `Identify a collection or list used in your program. Describe what data is stored in that collection and explain how it contributes to the program's purpose.`,
      ];

  // Q3: Managing Complexity (1 pt)
  const q3Prompts = list && !list.includes("No explicit")
    ? [
        `Explain how the use of the list \`${list}\` manages the complexity of your program. Describe how your program would be different or more complex if you did not use the list.`,
        hard
          ? `Explain in detail how the use of \`${list}\` manages complexity. What would need to change in your code if \`${list}\` did not exist, and why does using a list make the program easier to develop and maintain?`
          : `Explain how your list manages the complexity of your program. How would your program be different without it?`,
      ]
    : [
        `Explain how your use of data collections or procedures manages the complexity of your program. Describe how the program would be different without this abstraction.`,
      ];

  // Q4: Procedural Abstraction (1 pt)
  const q4Prompts = proc
    ? [
        `Describe what the procedure \`${proc.name}\` does and explain how it contributes to the overall functionality of the program. ${proc.parameters.length > 0 ? `Include a description of what the parameter(s) \`${proc.parameters.join(", ")}\` represent.` : ""}`,
        hard
          ? `The procedure \`${proc.name}\` is defined in your program. Explain what it does, what parameter(s) it takes and why, and how it is called within the program. Describe what would happen if this procedure did not exist.`
          : `Describe the procedure \`${proc.name}\`. What are its parameters and what does it do?`,
      ]
    : [
        `Identify a student-developed procedure in your program. Describe what the procedure does and explain the role of its parameters.`,
      ];

  // Q5: Algorithm Implementation (1 pt)
  const hasLoop = algorithms.loops.length > 0;
  const hasCond = algorithms.conditionals.length > 0;
  const q5Prompts = [
    `Explain how your program uses ${hasLoop ? "iteration" : "sequencing"}${hasCond ? " and selection" : ""} to implement its algorithm. Describe a specific part of your code that shows this, including how the steps are ordered and what decisions are made.`,
    hard
      ? `Describe the algorithm implemented in your program that involves sequencing, selection, and iteration. Explain how each of these three components appears in your code and what role each plays in achieving the program's purpose.`
      : `Explain how your program uses a loop${hasCond ? " and a conditional" : ""} to implement its algorithm. Describe the specific steps your algorithm takes.`,
  ];

  return [
    {
      id: "q1",
      category: "purpose",
      categoryLabel: "Program Purpose & Function",
      prompt: pick(q1Prompts),
      maxScore: 2,
      rubricHints: [
        "Describe the overall purpose of the program (what problem it solves or what it is meant to do)",
        `Describe what the program does: its inputs (${inputs.slice(0,2).join(", ")}), its outputs (${outputs.slice(0,2).join(", ")}), and how it functions`,
      ],
    },
    {
      id: "q2",
      category: "data",
      categoryLabel: "Data Abstraction",
      prompt: pick(q2Prompts),
      maxScore: 1,
      rubricHints: [
        `Identify the list/collection (e.g., ${list}) and describe what data it stores`,
        "Explain how the list is used in the program to accomplish its purpose",
      ],
    },
    {
      id: "q3",
      category: "complexity",
      categoryLabel: "Managing Complexity",
      prompt: pick(q3Prompts),
      maxScore: 1,
      rubricHints: [
        `Explain how the list (e.g., ${list}) manages complexity`,
        "Describe how the program would be more complex or harder to write without the list",
      ],
    },
    {
      id: "q4",
      category: "procedure",
      categoryLabel: "Procedural Abstraction",
      prompt: pick(q4Prompts),
      maxScore: 1,
      rubricHints: [
        proc ? `Describe what ${proc.name} does and its parameters (${proc.parameters.join(", ") || "none"})` : "Describe the student-developed procedure and its parameters",
        "Explain how the procedure contributes to the program's overall functionality",
      ],
    },
    {
      id: "q5",
      category: "algorithm",
      categoryLabel: "Algorithm Implementation",
      prompt: pick(q5Prompts),
      maxScore: 1,
      rubricHints: [
        "Describe the algorithm with sequencing (steps in order), selection (if/conditional), and iteration (loop)",
        "Explain the specific logic: what condition is checked, how many times the loop runs, what the result is",
      ],
    },
  ];
}
