"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export default function ThemeWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {mounted ? children : null}
    </ThemeProvider>
  );
}

