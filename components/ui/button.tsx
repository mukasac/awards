import * as React from "react";
import { cn } from "@/utils/utils";
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:hover:bg-slate-800 dark:hover:text-slate-100",
          {
            'bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900':
              variant === 'default',
            'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100':
              variant === 'secondary',
            'border border-slate-200 hover:bg-slate-100 dark:border-slate-700':
              variant === 'outline',
            'hover:bg-slate-100 dark:hover:bg-slate-800': variant === 'ghost',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };