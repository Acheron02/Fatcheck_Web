"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, LogOut, UserPlus, User, Home, SunMoon, Users } from "lucide-react";
import MenuItem from "./menuItem";
import GradeList from "./gradeList";
import ThemeToggle from "../ThemeToggle";
import Footer from "../footer";
import { useRouter } from "next/navigation";
import useAuth from "@/lib/useAuth";

interface DesktopSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userId?: string;
  hideGradeLevel?: boolean;
  hideRegisterUser?: boolean;
  hideUsersPage?: boolean;
}

export default function DesktopSidebar({
  collapsed,
  setCollapsed,
  userId,
  hideGradeLevel,
  hideRegisterUser,
  hideUsersPage,
}: DesktopSidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const COLLAPSED_WIDTH = 62 + 8 * 5;
  const EXPANDED_WIDTH = 256;

  return (
    <aside
      className={`hidden md:flex flex-col justify-between bg-sidebar text-sidebar-foreground h-screen min-w-0 overflow-hidden
        transition-all duration-300 ease-in-out`}
      style={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
    >
      {/* HEADER + MENU */}
      <div className="flex flex-col flex-1">
        <div
          className={`shrink-0 flex items-center py-4 min-w-0 ${
            collapsed ? "justify-center" : "justify-between px-4"
          }`}
        >
          {!collapsed && (
            <h1 className="font-bold text-lg truncate">FatCheck</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="cursor-pointer text-gray-700 dark:text-gray-200"
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>

        {/* MENU */}
        <div className="overflow-y-auto scrollbar-hide flex-1">
          <MenuItem
            icon={<Home size={20} />}
            label="Dashboard"
            collapsed={collapsed}
            isMobile={false}
            href="/pages/main_dashboard"
          />

          {!hideGradeLevel && (
            <GradeList collapsed={collapsed} isMobile={false} router={router} />
          )}

          <MenuItem
            icon={<User size={20} />}
            label="Profile"
            collapsed={collapsed}
            isMobile={false}
            href={user ? `/pages/profile/${user.id}` : "/"}
          />

          {/* Only admins can register new users */}
          {!hideRegisterUser && user?.role?.toLowerCase() === "admin" && (
            <MenuItem
              icon={<UserPlus size={20} />}
              label="Register User"
              collapsed={collapsed}
              isMobile={false}
              onClick={() => router.push("/pages/register_user")}
            />
          )}

          {!hideUsersPage && user?.role?.toLowerCase() === "admin" && (
            <MenuItem
              icon={<Users size={20} />}
              label="Users"
              collapsed={collapsed}
              isMobile={false}
              onClick={() => router.push("/pages/users")}
            />
          )}

          {/* THEME TOGGLE */}
          {!collapsed ? (
            // Expanded state: show icon + label + toggle
            <MenuItem
              icon={<SunMoon size={20} />}
              label="Theme"
              collapsed={collapsed}
              isMobile={false}
              customRight={<ThemeToggle />}
            />
          ) : (
            // Collapsed state: only show the toggle centered
            <div className="flex justify-center py-3 mx-2 my-1">
              <ThemeToggle />
            </div>
          )}

          <MenuItem
            icon={<LogOut size={20} />}
            label="Logout"
            collapsed={collapsed}
            isMobile={false}
            onClick={() => {
              localStorage.removeItem("fatcheckToken");
              window.location.replace("/");
            }}
          />
        </div>
      </div>

      {/* FOOTER - only render when not collapsed */}
      {!collapsed && <Footer />}
    </aside>
  );
}
