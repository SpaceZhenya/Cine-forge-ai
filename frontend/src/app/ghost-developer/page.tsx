"use client";

import { useState, useEffect } from "react";
import { VSCodeLayout } from "@/components/VSCodeLayout";
import { AgentProvider } from "@/hooks/useAgent";

export default function GhostDeveloperPage() {
  return (
    <AgentProvider>
      <VSCodeLayout />
    </AgentProvider>
  );
}
