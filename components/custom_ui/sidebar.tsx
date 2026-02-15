"use client";

import React, { useState, useEffect } from "react";
import DesktopSidebar from "./Sidebar/desktopSidebar";
import MobileSidebar from "./Sidebar/mobileSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import path from "path";

interface SidebarProps {
  userId?: string;
}

export default function Sidebar({ userId }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname(); // get current route

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Determine if we are on main_dashboard
  const hideGradeLevel = pathname?.includes("/pages/main_dashboard");
  const hideRegisterUser = pathname?.includes("/pages/users")
  const hideUsersPage = pathname?.includes("/pages/register_user");

  return (
    <>
      {/* Desktop Sidebar */}
      <DesktopSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        userId={userId}
        hideGradeLevel={hideGradeLevel}
        hideRegisterUser={hideRegisterUser}
        hideUsersPage={hideUsersPage}
      />

      {/* Mobile Toggle Button */}
      {!mobileOpen && (
        <div className="md:hidden fixed top-4 left-4 z-50 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="cursor-pointer text-gray-700 dark:text-gray-200"
          >
            <Menu size={20} />
          </Button>
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
            FatCheck
          </span>
        </div>
      )}

      {/* Mobile Sidebar */}
      <MobileSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        userId={userId}
        hideGradeLevel={hideGradeLevel} // same for mobile
      />
    </>
  );
}
