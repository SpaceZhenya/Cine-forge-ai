"use client";

import { useState } from "react";
import { PROJECT_FILES, FileNode } from "@/lib/types";
import { useAgent } from "@/hooks/useAgent";

function FileTree({ node, depth = 0, activeFile, onFileSelect }: { node: FileNode; depth?: number; activeFile: string; onFileSelect: (p: string) => void }) {
  const [expanded, setExpanded] = useState(depth < 2);

  const isFolder = node.type === "folder";
  const isActive = node.path === activeFile;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer text-sm rounded-sm ${
          isActive ? "bg-[#37373d] text-white" : "text-[#cccccc] hover:bg-[#2a2d2e]"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => {
          if (isFolder) setExpanded(!expanded);
          else onFileSelect(node.path);
        }}
      >
        {isFolder ? (
          <span className="text-xs w-4">{expanded ? "▼" : "▶"}</span>
        ) : (
          <span className="text-xs w-4">📄</span>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {isFolder && expanded && node.children?.map((child) => (
        <FileTree key={child.path} node={child} depth={depth + 1} activeFile={activeFile} onFileSelect={onFileSelect} />
      ))}
    </div>
  );
}

export function FileExplorer({ activeFile, onFileSelect }: { activeFile: string; onFileSelect: (p: string) => void }) {
  const { state } = useAgent();

  return (
    <div className="py-2">
      {state.filesModified.length > 0 && (
        <div className="px-3 mb-2">
          <div className="text-xs text-[#858585] uppercase tracking-wider mb-1">Modified</div>
          {state.filesModified.map((f) => (
            <div
              key={f}
              className="flex items-center gap-1.5 py-1 px-2 cursor-pointer text-sm text-[#4ec9b0] hover:bg-[#2a2d2e] rounded-sm"
              onClick={() => onFileSelect(f)}
              style={{ paddingLeft: "28px" }}
            >
              <span className="text-xs">📄</span>
              <span className="truncate">{f.split("/").pop()}</span>
            </div>
          ))}
          <div className="border-t border-[#3c3c3c] my-2" />
        </div>
      )}
      <div className="px-3 mb-1">
        <div className="text-xs text-[#858585] uppercase tracking-wider">Workspace</div>
      </div>
      {PROJECT_FILES.map((node) => (
        <FileTree key={node.path} node={node} activeFile={activeFile} onFileSelect={onFileSelect} />
      ))}
    </div>
  );
}
