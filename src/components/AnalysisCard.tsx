"use client";
import { CodeAnalysis } from "@/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function AnalysisCard({ analysis }: { analysis: CodeAnalysis }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-green-200 bg-green-50 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <div>
          <div className="text-sm font-semibold text-green-800">Code Analysis Complete</div>
          <div className="text-xs text-green-700 mt-0.5 line-clamp-1">{analysis.purpose}</div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-green-700 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-green-700 flex-shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-green-200 p-4 bg-white grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-slate-700 mb-1">Purpose</div>
            <div className="text-slate-600">{analysis.purpose}</div>
          </div>
          <div>
            <div className="font-semibold text-slate-700 mb-1">Language</div>
            <div className="text-slate-600">{analysis.language}</div>
          </div>
          <div>
            <div className="font-semibold text-slate-700 mb-1">Inputs & Outputs</div>
            <div className="text-slate-600">
              <span className="font-medium">In:</span> {analysis.inputs.join(", ") || "none detected"}<br/>
              <span className="font-medium">Out:</span> {analysis.outputs.join(", ") || "none detected"}
            </div>
          </div>
          <div>
            <div className="font-semibold text-slate-700 mb-1">Data Structures</div>
            <div className="text-slate-600">{analysis.dataAbstraction.lists.join(", ") || "none detected"}</div>
          </div>
          <div>
            <div className="font-semibold text-slate-700 mb-1">Procedures</div>
            <div className="text-slate-600">{analysis.procedures.map(p => p.name).join(", ") || "none detected"}</div>
          </div>
          <div>
            <div className="font-semibold text-slate-700 mb-1">Algorithms</div>
            <div className="text-slate-600 line-clamp-3">{analysis.algorithms.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}
