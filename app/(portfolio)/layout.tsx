import { DynamicNavbar } from "@/components/dynamic-navbar";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DynamicNavbar />
      <div className="pt-16">{children}</div>
    </>
  );
}
