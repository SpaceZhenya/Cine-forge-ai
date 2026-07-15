"use client";

import { useAgent } from "@/hooks/useAgent";
import { motion, AnimatePresence } from "framer-motion";

export function AgentTimeline() {
  const { state } = useAgent();
  const { timeline, progress, elapsed } = state;

  const totalSteps = 31;
  const currentStep = timeline.length;

  return (
    <div className="w-72 bg-[#1e1e1e] border-l border-[#3c3c3c] flex flex-col overflow-hidden shrink-0">
      <div className="h-9 flex items-center px-4 text-xs font-medium uppercase tracking-wider text-[#858585] border-b border-[#3c3c3c] shrink-0">
        Agent Activity
      </div>

      <div className="px-4 py-3 border-b border-[#3c3c3c] shrink-0">
        <div className="flex justify-between text-xs text-[#858585] mb-1.5">
          <span>{currentStep}/{totalSteps} steps</span>
          <span>{elapsed}s elapsed</span>
        </div>
        <div className="h-1.5 bg-[#3c3c3c] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#007acc] to-[#4ec9b0] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <AnimatePresence>
          {timeline.length === 0 && (
            <div className="px-4 py-8 text-center text-[#858585] text-xs">
              <p className="mb-2">🤖</p>
              <p>Ghost Developer is idle.</p>
              <p className="mt-1">Type a task below to start.</p>
            </div>
          )}
          {timeline.map((item, i) => (
            <motion.div
              key={`${item.label}-${i}`}
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="gd-timeline-item"
            >
              <div className="flex items-start gap-3 px-4 py-2 hover:bg-[#2a2d2e]">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                  item.active ? "bg-[#007acc]/20 text-[#4ec9b0]" : "bg-[#333333] text-[#858585]"
                }`}>
                  {item.active && i === timeline.length - 1 ? (
                    <span className="w-2 h-2 rounded-full bg-green-500 status-dot" />
                  ) : (
                    <span>{item.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium ${item.active && i === timeline.length - 1 ? "text-[#4ec9b0]" : "text-[#cccccc]"}`}>
                    {item.label}
                  </div>
                </div>
              </div>
              {i < timeline.length - 1 && (
                <div className="ml-[26px] border-l border-[#3c3c3c] h-2" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
