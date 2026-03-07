import type { BuilderConfig, CanvasBlock } from "@/lib/builder-types";

export function fmtDate(d: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function getSectionNavLinks(config: BuilderConfig) {
  const labels: Record<string, string> = {
    personal: "Home",
    summary: "About",
    experience: "Experience",
    education: "Education",
    projects: "Projects",
    skills: "Skills",
    contact: "Contact",
  };
  return (config.blocks || [])
    .filter((b) => b.type.startsWith("system-") && labels[b.type.replace("system-", "")])
    .map((b) => ({ id: b.type.replace("system-", ""), label: labels[b.type.replace("system-", "")] }));
}

export function applyBlockStyles(block: CanvasBlock) {
  const styles: React.CSSProperties = {};
  if (block.style?.backgroundColor) styles.backgroundColor = block.style.backgroundColor;
  if (block.style?.textColor) styles.color = block.style.textColor;
  return styles;
}

export function getBlockClasses(block: CanvasBlock, defaultPadding = "py-24") {
  return `relative ${block.style?.padding || defaultPadding} ${block.style?.margin || ""}`;
}

export function getContainerWidth(block: CanvasBlock, defaultWidth = "max-w-4xl") {
  return block.style?.width || defaultWidth;
}
