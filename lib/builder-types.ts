export type BlockType = 
  | "system-personal" | "system-experience" | "system-education" 
  | "system-projects" | "system-skills" | "system-contact"
  | "custom-hero" | "custom-text" | "custom-image" | "custom-spacer" | "custom-code"
  | "text" | "spacer" | "divider";

export interface CanvasBlock {
  id: string; // Unique drag & drop ID
  type: BlockType;
  style: {
    padding?: string; 
    margin?: string;
    maxWidth?: string; 
    backgroundColor?: string;
    textColor?: string;
    width?: string;
  };
  data?: Record<string, unknown>; // For text content or filters (e.g., specific skill categories)
}

export type BuilderConfig = {
  template: "modern" | "minimal" | "classic";
  theme: {
    primaryColor: string;
    backgroundColor: string;
    accentColor: string;
    fontFamily: string;
    fontSize: number;
    globalPadding: number;
    containerWidth: number;
  };
  blocks: CanvasBlock[];
};

export const DEFAULT_CONFIG: BuilderConfig = {
  template: "modern",
  theme: {
    primaryColor:    "#6366f1",
    backgroundColor: "#09090b",
    accentColor:     "#818cf8",
    fontFamily:      "Inter",
    fontSize:        16,
    globalPadding:   80,
    containerWidth:  1152, // max-w-6xl
  },
  blocks: [
    { id: "personal", type: "system-personal", style: {} },
    { id: "experience", type: "system-experience", style: {} },
    { id: "education", type: "system-education", style: {} },
    { id: "projects", type: "system-projects", style: {} },
    { id: "skills", type: "system-skills", style: {} },
    { id: "contact", type: "system-contact", style: {} },
  ]
};
