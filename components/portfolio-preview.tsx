"use client";
import React from "react";
import type { BuilderConfig } from "@/lib/builder-types";
import type { PortfolioData } from "@/lib/portfolio-types";
import { ModernTemplate, MinimalTemplate, ClassicTemplate } from "./builder/templates";

// Re-export PortfolioData for backwards compatibility in other parts of the app
export type { PortfolioData } from "@/lib/portfolio-types";

/* ── Main Export ──────────────────────────────────────────────── */
export function PortfolioPreview({ 
  data, 
  config, 
  isEditable,
  onConfigChange,
  activeBlockId,
  onBlockSelect
}: { 
  data: PortfolioData; 
  config: BuilderConfig; 
  isEditable?: boolean;
  onConfigChange?: (c: BuilderConfig) => void;
  activeBlockId?: string | null;
  onBlockSelect?: (id: string | null) => void;
}) {
  // Graceful fallback for legacy configurations missing 'blocks'
  const effectiveConfig = config.blocks ? config : { ...config, blocks: [] };
  
  switch (config.template) {
    case "minimal": return <MinimalTemplate data={data} config={effectiveConfig} isEditable={isEditable} onConfigChange={onConfigChange} activeBlockId={activeBlockId} onBlockSelect={onBlockSelect} />;
    case "classic": return <ClassicTemplate data={data} config={effectiveConfig} isEditable={isEditable} onConfigChange={onConfigChange} activeBlockId={activeBlockId} onBlockSelect={onBlockSelect} />;
    default:        return <ModernTemplate data={data} config={effectiveConfig} isEditable={isEditable} onConfigChange={onConfigChange} activeBlockId={activeBlockId} onBlockSelect={onBlockSelect} />;
  }
}
