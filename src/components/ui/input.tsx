import * as React from "react";
import { cn } from "@/src/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base: clean, subtle input
        "bg-muted/20 placeholder:primary-colors primary-colors",
        "rounded-md px-3 py-2 w-full text-sm outline-none",
                
        // Smooth transition and light shadow
        "transition-all duration-200",

        // Disabled styling
        "disabled:opacity-50 disabled:pointer-events-none",

        className
      )}
      {...props}
    />
  );
}

export { Input };
