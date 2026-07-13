import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineForge AI — One Prompt, Full Movie",
  description: "AI-powered film generation platform. One line → full movie with script, visuals, music, voice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-darker">
        <nav className="fixed top-0 w-full z-50 glass-card border-b border-border">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="text-2xl font-bold gradient-text">CineForge AI</a>
          </div>
        </nav>
        <main className="pt-20 pb-12">{children}</main>
      </body>
    </html>
  );
}
