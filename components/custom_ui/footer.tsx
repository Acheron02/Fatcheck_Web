"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full text-center text-muted-foreground py-4">
      © {year ?? ""} FatCheck. All rights reserved.
    </footer>
  );
}
