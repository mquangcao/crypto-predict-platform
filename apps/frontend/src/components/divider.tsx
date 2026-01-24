import { cn } from "@/lib/utils";

interface DividerProps {
  /**
   * Orientation of the divider
   * @default 'horizontal'
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Variant style of the divider
   * @default 'default'
   */
  variant?: "default" | "gradient" | "dashed" | "dotted" | "line";
  /**
   * Height for vertical dividers (only applies when orientation is vertical)
   */
  height?: string;
}

export function Divider({
  orientation = "horizontal",
  className,
  variant = "default",
  height,
}: DividerProps) {
  const variantStyles = {
    default: "bg-border",
    gradient:
      "bg-gradient-to-r from-transparent via-border to-transparent dark:via-border",
    dashed: "border-t-2 border-dashed border-border bg-transparent",
    dotted: "border-t-2 border-dotted border-border bg-transparent",
    line: "bg-slate-300",
  };

  const orientationStyles = {
    horizontal: {
      default: "h-px w-full",
      gradient: "h-px w-full",
      dashed: "h-0 w-full",
      dotted: "h-0 w-full",
      line: "h-px w-full",
    },
    vertical: {
      default: "w-px h-full",
      gradient: "w-px h-full bg-gradient-to-b",
      dashed: "w-0 h-full border-l-2 border-t-0",
      dotted: "w-0 h-full border-l-2 border-t-0",
      line: "w-px h-full",
    },
  };

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0",
        orientationStyles[orientation][variant],
        variantStyles[variant],
        className,
      )}
      style={orientation === "vertical" && height ? { height } : undefined}
    />
  );
}
