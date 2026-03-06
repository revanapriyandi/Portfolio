"use client";

import { Render } from "@measured/puck/rsc";


import { config, type UserConfig, type CustomRootProps } from "@/puck.config";

import type { Data } from "@measured/puck";

export function PuckRenderer({ data }: { data: Data<UserConfig, CustomRootProps> }) {
  // Extract custom root props (or use defaults if none exist)
  const bgColor = data.root.props?.bgColor || "#000000";
  const accentColor = data.root.props?.accentColor || "#6366f1";
  const customCss = data.root.props?.customCss || "";

  // Use the RSC Render component which does not include the Puck editor UI/styles
  return (
    <div 
      className="font-sans antialiased text-[#fafafa] min-h-screen relative"
      style={{ 
        backgroundColor: bgColor,
        "--app-bg": bgColor, 
        "--app-accent": accentColor 
      } as React.CSSProperties}
    >
      {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
      <Render config={config} data={data} />
    </div>
  );
}
