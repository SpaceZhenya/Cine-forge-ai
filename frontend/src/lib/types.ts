export type EventType =
  | "scan_start" | "scan_progress" | "scan_complete"
  | "read_file" | "edit_file" | "create_file"
  | "npm_start" | "npm_progress" | "npm_complete"
  | "build_start" | "build_progress" | "build_error"
  | "build_complete"
  | "test_start" | "test_result"
  | "task_complete"
  | "terminal_output"
  | "session_start" | "session_end";

export interface AgentEvent {
  type: EventType;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
}

export const PROJECT_FILES: FileNode[] = [
  {
    name: "my-app",
    path: "/",
    type: "folder",
    children: [
      { name: "package.json", path: "/package.json", type: "file", content: '{\n  "name": "my-app",\n  "version": "1.0.0"\n}' },
      {
        name: "src", path: "/src", type: "folder", children: [
          { name: "App.tsx", path: "/src/App.tsx", type: "file", content: "// App component" },
          { name: "main.tsx", path: "/src/main.tsx", type: "file", content: '// Entry point' },
          {
            name: "pages", path: "/src/pages", type: "folder", children: [
              { name: "Login.tsx", path: "/src/pages/Login.tsx", type: "file", content: "// Login page" },
              { name: "Dashboard.tsx", path: "/src/pages/Dashboard.tsx", type: "file", content: "// Dashboard" },
            ]
          },
          {
            name: "lib", path: "/src/lib", type: "folder", children: [
              { name: "api.ts", path: "/src/lib/api.ts", type: "file", content: "// API client" },
            ]
          },
        ]
      },
    ]
  },
];
