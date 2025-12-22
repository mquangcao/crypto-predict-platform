import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
}

export function SubmitButton({
  children,
  isLoading,
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || isLoading}
      className={cn("relative overflow-hidden hover:cursor-pointer", className)}
      {...props}
    >
      <span
        className={cn(
          "flex items-center justify-center transition-all duration-300",
          isLoading ? "opacity-0 translate-y-full" : "opacity-100 translate-y-0"
        )}
      >
        {children}
      </span>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-300",
          isLoading
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full"
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    </Button>
  );
}
