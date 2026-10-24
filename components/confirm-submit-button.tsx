"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfirmSubmitButton({
  children,
  message,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  message: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
          return;
        }
        props.onClick?.(event);
      }}
      className={cn(className, "disabled:opacity-50")}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : children}
    </button>
  );
}
