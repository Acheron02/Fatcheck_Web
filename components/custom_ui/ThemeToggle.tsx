"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Switch
    suppressHydrationWarning
      checked={mounted && resolvedTheme === "dark"}
      onCheckedChange={(val) => setTheme(val ? "dark" : "light")}
    />
  );
}
