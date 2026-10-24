"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  pendingChildren,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingChildren?: ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      className={cn(className, "disabled:opacity-60")}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingChildren ?? "Working…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
