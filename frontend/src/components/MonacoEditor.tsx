"use client";

import { useRef, useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useAgent } from "@/hooks/useAgent";

const FILE_CONTENTS: Record<string, string> = {
  "/package.json": JSON.stringify({ name: "my-app", version: "1.0.0", scripts: { dev: "vite", build: "tsc && vite build" }, dependencies: { react: "^18.2.0", "react-dom": "^18.2.0" } }, null, 2),
  "/src/main.tsx": `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  "/src/App.tsx": `import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;`,
  "/src/pages/Login.tsx": `import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded mb-4" />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded mb-6" />
        <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded">
          Sign In
        </button>
      </form>
    </div>
  );
}`,
  "/src/pages/Dashboard.tsx": `import { useState, useEffect } from "react";

export function Dashboard() {
  const [users, setUsers] = useState([
    { id: "1", name: "Alice", email: "alice@example.com" },
    { id: "2", name: "Bob", email: "bob@example.com" },
  ]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.id} className="p-4 border rounded-lg shadow-sm">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  "/src/lib/api.ts": `const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string }>("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getUsers: () => request<{ id: string; name: string; email: string }[]>("/api/users"),
};`,
};

const EXT_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  json: "json",
  css: "css",
  html: "html",
};

export function MonacoEditor({ filePath }: { filePath: string }) {
  const { state } = useAgent();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const [content, setContent] = useState(FILE_CONTENTS[filePath] || "// Select a file");

  useEffect(() => {
    if (state.fileContent && state.currentFile === filePath) {
      setContent(state.fileContent);
      // Animate: highlight lines
      if (editorRef.current) {
        const lineCount = state.fileContent.split("\n").length;
        editorRef.current.revealLine(lineCount);
        editorRef.current.setSelection({
          startLineNumber: Math.max(1, lineCount - 3),
          startColumn: 1,
          endLineNumber: lineCount,
          endColumn: 1,
        });
      }
    }
  }, [state.fileContent, state.currentFile, filePath]);

  useEffect(() => {
    if (FILE_CONTENTS[filePath]) {
      setContent(FILE_CONTENTS[filePath]);
    }
  }, [filePath]);

  const ext = filePath.split(".").pop() || "ts";
  const lang = EXT_MAP[ext] || "plaintext";

  return (
    <div className="flex-1 relative overflow-hidden">
      <Editor
        language={lang}
        value={content}
        theme="vs-dark"
        onChange={(v) => v && setContent(v)}
        onMount={(editor) => { editorRef.current = editor; }}
        options={{
          fontSize: 14,
          fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          renderLineHighlight: "all",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          padding: { top: 16 },
          automaticLayout: true,
          tabSize: 2,
          bracketPairColorization: { enabled: true },
          guides: { indentation: true, bracketPairs: true },
          folding: true,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
