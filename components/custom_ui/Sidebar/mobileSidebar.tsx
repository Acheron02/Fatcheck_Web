"use client";

import React from "react";
import { ChevronLeft, Home, User, LogOut, SunMoon, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuItem from "./menuItem";
import GradeList from "./gradeList";
import ThemeToggle from "../ThemeToggle";
import Footer from "../footer";
import { useRouter } from "next/navigation";
import useAuth from "@/lib/useAuth";

interface MobileSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  userId?: string;
  hideGradeLevel?: boolean;
}

export default function MobileSidebar({
  mobileOpen,
  setMobileOpen,
  userId,
  hideGradeLevel
}: MobileSidebarProps) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-40 flex md:hidden">
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`bg-sidebar text-sidebar-foreground w-64 h-screen flex flex-col overflow-hidden z-50
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="shrink-0 flex items-center justify-between px-4 py-4 min-w-0">
          <h1 className="font-bold text-lg truncate">FatCheck</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
          >
            <ChevronLeft size={20} />
          </Button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {/* Dashboard */}
            <MenuItem
              icon={<Home size={20} />}
              label="Dashboard"
              collapsed={false}
              isMobile={true}
              href="/pages/main_dashboard"
              onClick={() => setMobileOpen(false)}
            />

            {/* Grade Levels */}
            {!hideGradeLevel && (
              <GradeList collapsed={false} isMobile={true} router={router} />
            )}

            {/* Profile */}
            <MenuItem
              icon={<User size={20} />}
              label="Profile"
              collapsed={false}
              isMobile={true}
              onClick={() => user && router.push(`/pages/profile/${user.id}`)}
            />

            {/* Only admins can register new users */}
            {user && user.role?.toLowerCase() === "admin" && (
              <MenuItem
                icon={<UserPlus size={20} />}
                label="Register User"
                collapsed={false} // mobile never collapses
                isMobile={true}
                onClick={() => {
                  router.push("/pages/register_user");
                  setMobileOpen(false);
                }}
              />
            )}

            {/* Theme */}
            {!mobileOpen ? null : (
              <MenuItem
                icon={<SunMoon size={20} />}
                label="Theme"
                collapsed={false} // mobile is never collapsed horizontally
                isMobile={true}
                customRight={<ThemeToggle />}
              />
            )}

            {/* Logout */}
            <MenuItem
              icon={<LogOut size={20} />}
              label="Logout"
              collapsed={false}
              isMobile={true}
              onClick={() => {
                localStorage.removeItem("fatcheckToken");
                router.push("/");
                setMobileOpen(false);
              }}
            />
          </div>
        </div>

        <Footer />
      </aside>
    </div>
  );
}
