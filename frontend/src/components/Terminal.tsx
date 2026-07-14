"use client";

import { useRef, useEffect } from "react";
import { useAgent } from "@/hooks/useAgent";

export function Terminal() {
  const { state } = useAgent();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.terminalOutput]);

  const lines = state.terminalOutput.length > 0
    ? state.terminalOutput
    : [
        "Ghost Developer Terminal",
        "------------------------------",
        "Ready. Send a task to begin.",
        "",
      ];

  return (
    <div className="h-44 bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col shrink-0">
      <div className="h-8 flex items-center px-4 bg-[#252526] border-b border-[#3c3c3c] shrink-0">
        <span className="text-xs text-[#858585] font-medium">TERMINAL</span>
        <div className="flex gap-3 ml-6">
          {["PROBLEMS", "OUTPUT", "DEBUG CONSOLE", "TERMINAL"].map((tab) => (
            <span key={tab} className={`text-xs ${tab === "TERMINAL" ? "text-white border-b-2 border-[#007acc] pb-0.5" : "text-[#858585]"}`}>{tab}</span>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${
              line.startsWith("$ ") ? "text-[#4ec9b0]" : line.includes("error") || line.includes("Error") || line.includes("FAIL") ? "text-[#f44747]" : line.includes("passed") || line.includes("success") ? "text-[#4ec9b0]" : "text-[#cccccc]"
            } ${i === lines.length - 1 ? "cursor-blink" : ""}`}
          >
            {line}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
