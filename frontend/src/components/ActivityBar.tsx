"use client";

const ACTIVITIES = [
  { id: "files", icon: "📁", label: "Explorer" },
  { id: "search", icon: "🔍", label: "Search" },
  { id: "timeline", icon: "📋", label: "Agent Timeline" },
] as const;

type View = "files" | "search" | "timeline";

export function ActivityBar({ activeView, onViewChange }: { activeView: View; onViewChange: (v: View) => void }) {
  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center gap-2 pt-2 shrink-0 border-r border-[#252526]">
      {ACTIVITIES.map((a) => (
        <button
          key={a.id}
          onClick={() => onViewChange(a.id as View)}
          className={`w-10 h-10 flex items-center justify-center rounded text-lg transition-all relative ${
            activeView === a.id ? "text-white before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-white" : "text-[#858585] hover:text-white"
          }`}
          title={a.label}
        >
          {a.icon}
        </button>
      ))}
      <div className="flex-1" />
      <div className="mb-2 text-[#858585] text-xs text-center">⚙️</div>
    </div>
  );
}
