import { Orbit } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSize = size === "sm" ? 16 : 20;
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 ring-1 ring-violet-500/30">
        <Orbit size={iconSize} className="text-violet-400" />
      </div>
      {showText && (
        <span className={`font-semibold tracking-wider text-white ${textClass}`}>
          NEBULA DEPLOY
        </span>
      )}
    </div>
  );
}
