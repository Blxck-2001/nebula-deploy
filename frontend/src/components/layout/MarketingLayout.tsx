import { Navbar } from "@/components/landing/Navbar";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-nebula-gradient" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />

      <div className="relative">
        <Navbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
