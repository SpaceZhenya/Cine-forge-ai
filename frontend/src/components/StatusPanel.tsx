"use client";

export function StatusPanel({ progress, elapsed, filesModified, commands, currentFile }: {
  progress: number;
  elapsed: number;
  filesModified: number;
  commands: number;
  currentFile: string | null;
}) {
  return (
    <div className="h-6 bg-[#007acc] flex items-center px-4 text-xs text-white shrink-0">
      <div className="flex items-center gap-1">
        <span>●</span>
        <span className="ml-1">Ghost Developer</span>
      </div>
      <span className="mx-3 opacity-50">|</span>
      <span>Progress: {Math.round(progress)}%</span>
      <span className="mx-3 opacity-50">|</span>
      <span>Elapsed: {elapsed}s</span>
      {filesModified > 0 && (
        <>
          <span className="mx-3 opacity-50">|</span>
          <span>Files: {filesModified}</span>
        </>
      )}
      {commands > 0 && (
        <>
          <span className="mx-3 opacity-50">|</span>
          <span>Commands: {commands}</span>
        </>
      )}
      <div className="flex-1" />
      {currentFile && (
        <span className="truncate max-w-[300px]">{currentFile}</span>
      )}
    </div>
  );
}
