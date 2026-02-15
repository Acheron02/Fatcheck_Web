"use client";

import React from "react";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  isMobile: boolean;
  href?: string;
  onClick?: () => void;
  customRight?: React.ReactNode;
}

export default function MenuItem({
  icon,
  label,
  collapsed,
  isMobile,
  href,
  onClick,
  customRight,
}: MenuItemProps) {
  // If using onClick (JS navigation), use <div>
  if (onClick) {
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className={`flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-md hover:bg-accent min-w-0 hover:cursor-pointer ${
          collapsed && !isMobile ? "justify-center" : ""
        }`}
      >
        <span className="shrink-0">{icon}</span>
        {(!collapsed || isMobile) && (
          <span className="flex-1 flex items-center justify-between">
            <span className="truncate">{label}</span>
            {customRight && <span>{customRight}</span>}
          </span>
        )}
      </div>
    );
  }

  // Otherwise, use <a> for normal href
  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-md hover:bg-accent min-w-0 hover:cursor-pointer ${
        collapsed && !isMobile ? "justify-center" : ""
      }`}
    >
      <span className="shrink-0">{icon}</span>
      {(!collapsed || isMobile) && (
        <span className="flex-1 flex items-center justify-between">
          <span className="truncate">{label}</span>
          {customRight && <span>{customRight}</span>}
        </span>
      )}
    </a>
  );
}
