import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineForge AI — One Prompt, Full Movie",
  description: "AI-powered film generation platform. Turn any idea into a complete movie.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-darker">
        <nav className="fixed top-0 w-full z-50 glass-card border-b border-border">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold font-display gradient-text">CineForge</span>
              <span className="text-xs text-muted font-mono">AI</span>
            </a>
          </div>
        </nav>
        <main className="pt-20 pb-12">{children}</main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#12121a",
              color: "#e0e0e0",
              border: "1px solid #1e1e2a",
            },
          }}
        />
      </body>
    </html>
  );
}
