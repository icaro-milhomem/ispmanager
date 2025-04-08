import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const Spinner = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      ref={ref}
      {...props}
    >
      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
    </div>
  );
});

Spinner.displayName = "Spinner";

export { Spinner };