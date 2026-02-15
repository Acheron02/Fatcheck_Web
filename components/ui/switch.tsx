"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeSwitchProps extends React.ComponentProps<
  typeof SwitchPrimitive.Root
> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: "sm" | "default";
}

export function Switch({
  checked,
  onCheckedChange,
  size = "default",
  className,
  ...props
}: ThemeSwitchProps) {
  // Track & thumb sizes in px
  const trackWidth = size === "default" ? 64 : 48; // Tailwind w-16 / w-12
  const trackHeight = size === "default" ? 32 : 24; // Tailwind h-8 / h-6
  const thumbSize = size === "default" ? 28 : 20; // Tailwind h-7 / h-5

  // Compute translation dynamically
  const translateX = checked ? trackWidth - thumbSize : 0;

  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "inline-flex items-center rounded-full bg-input shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer",
        size === "default" ? "h-8 w-16" : "h-6 w-12",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "flex items-center justify-center rounded-full bg-background shadow-md transition-transform duration-200 ease-in-out",
        )}
        style={{
          width: thumbSize,
          height: thumbSize,
          transform: `translateX(${translateX}px)`,
        }}
      >
        {checked ? (
          <Moon className="h-4 w-4 text-blue-500" />
        ) : (
          <Sun className="h-4 w-4 text-yellow-400" />
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}
