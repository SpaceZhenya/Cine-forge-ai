export type EventType =
  | "scanning"
  | "searching"
  | "reading_file"
  | "editing_file"
  | "creating_file"
  | "terminal_output"
  | "npm_install"
  | "npm_test"
  | "build_start"
  | "build_success"
  | "build_failed"
  | "fixing_errors"
  | "completed"
  | "error"
  | "status_update"
  | "thinking";

export interface AgentEvent {
  type: EventType;
  path?: string;
  text?: string;
  content?: string;
  timestamp: number;
  sessionId: string;
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
      { name: "package.json", path: "/package.json", type: "file", content: "{\n  \"name\": \"my-app\",\n  \"version\": \"1.0.0\"\n}" },
      {
        name: "src", path: "/src", type: "folder", children: [
          { name: "App.tsx", path: "/src/App.tsx", type: "file", content: "// App component" },
          { name: "main.tsx", path: "/src/main.tsx", type: "file", content: "// Entry point" },
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
