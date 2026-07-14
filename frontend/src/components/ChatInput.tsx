"use client";

import { useState } from "react";

const EXAMPLES = [
  "Create a login page",
  "Fix authentication error",
  "Add user dashboard",
  "Implement API client",
  "Add error handling",
];

export function ChatInput({ onSend, onStop, running }: { onSend: (text: string) => void; onStop: () => void; running: boolean }) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim() || running) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="bg-[#252526] border-t border-[#3c3c3c] px-4 py-3 shrink-0">
      <div className="max-w-4xl mx-auto flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          placeholder={running ? "Agent is running..." : "Describe a coding task..."}
          disabled={running}
          className="flex-1 p-3 rounded-lg bg-[#3c3c3c] border border-[#4c4c4c] text-[#cccccc] text-sm placeholder-[#858585] outline-none focus:border-[#007acc] disabled:opacity-50 transition-colors"
        />
        {running ? (
          <button onClick={onStop} className="px-6 py-3 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shrink-0">
            Stop
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!input.trim()} className="px-6 py-3 rounded-lg bg-[#007acc] text-white text-sm font-medium hover:bg-[#0098ff] disabled:opacity-30 transition-colors shrink-0">
            Run
          </button>
        )}
      </div>
      {!running && (
        <div className="max-w-4xl mx-auto mt-2 flex gap-2 overflow-x-auto">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => { setInput(ex); }}
              className="text-xs px-3 py-1.5 rounded-full bg-[#333333] text-[#858585] hover:text-white hover:bg-[#3c3c3c] whitespace-nowrap transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
