"use client";

import { useState } from "react";
import { ActivityBar } from "./ActivityBar";
import { Sidebar } from "./Sidebar";
import { MonacoEditor } from "./MonacoEditor";
import { Terminal } from "./Terminal";
import { ChatInput } from "./ChatInput";
import { StatusPanel } from "./StatusPanel";
import { useAgent } from "@/hooks/useAgent";

export function VSCodeLayout() {
  const { state, startTask, stopTask } = useAgent();
  const [sidebarView, setSidebarView] = useState<"files" | "search" | "timeline">("files");
  const [activeFile, setActiveFile] = useState("/src/pages/Login.tsx");

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar activeView={sidebarView} onViewChange={setSidebarView} />

        <Sidebar view={sidebarView} activeFile={activeFile} onFileSelect={setActiveFile} />

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-1 min-h-0">
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center h-9 bg-[#252526] border-b border-[#3c3c3c] px-4 text-xs text-[#cccccc] overflow-x-auto gap-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${state.connected ? "bg-green-500 status-dot" : "bg-red-500"}`} />
                  <span className="text-[#858585]">GHOST DEVELOPER</span>
                </div>
                <span className="mx-3 text-[#3c3c3c]">|</span>
                <span className="text-[#858585]">Agent Status:</span>
                <span className="text-[#4ec9b0]">{state.running ? "Running" : state.events.length > 0 ? "Completed" : "Idle"}</span>
                {state.running && <span className="w-1.5 h-1.5 rounded-full bg-green-500 status-dot ml-1" />}
                {state.currentFile && (
                  <>
                    <span className="mx-3 text-[#3c3c3c]">|</span>
                    <span className="text-[#858585]">File:</span>
                    <span className="text-[#569cd6]">{state.currentFile}</span>
                  </>
                )}
              </div>

              <MonacoEditor filePath={activeFile} />
            </div>
          </div>

          <Terminal />
        </div>
      </div>

      <ChatInput onSend={startTask} onStop={stopTask} running={state.running} />

      <StatusPanel progress={state.progress} elapsed={state.elapsed} filesModified={state.filesModified.length} commands={state.terminalOutput.length} currentFile={state.currentFile} />
    </div>
  );
}
