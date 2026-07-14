"use client";

import { FileExplorer } from "./FileExplorer";
import { AgentTimeline } from "./AgentTimeline";

type View = "files" | "search" | "timeline";

export function Sidebar({ view, activeFile, onFileSelect }: { view: View; activeFile: string; onFileSelect: (p: string) => void }) {
  return (
    <div className="w-60 bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0 overflow-hidden">
      <div className="h-9 flex items-center px-4 text-xs font-medium uppercase tracking-wider text-[#858585] border-b border-[#3c3c3c] shrink-0">
        {view === "files" && "Explorer"}
        {view === "search" && "Search"}
        {view === "timeline" && "Agent Timeline"}
      </div>
      <div className="flex-1 overflow-y-auto">
        {view === "files" && <FileExplorer activeFile={activeFile} onFileSelect={onFileSelect} />}
        {view === "search" && (
          <div className="p-4 text-sm text-[#858585]">
            <input
              placeholder="Search files..."
              className="w-full p-2 rounded bg-[#3c3c3c] text-[#cccccc] text-sm border border-[#4c4c4c] outline-none focus:border-[#007acc]"
            />
            <p className="mt-4 text-center">Type to search across files</p>
          </div>
        )}
        {view === "timeline" && <AgentTimeline />}
      </div>
    </div>
  );
}
