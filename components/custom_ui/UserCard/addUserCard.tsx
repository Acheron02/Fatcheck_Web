// AddUserCard.tsx
"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import UserFormDialog from "./UserFormDialog";

interface AddUserCardProps {
  onAdd: (
    username: string,
    email: string,
    password: string,
    role: string,
  ) => Promise<void>;
  disabled?: boolean;
}

export default function AddUserCard({ onAdd, disabled }: AddUserCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Clickable + card */}
      <div
        className={`flex flex-col dark:bg-gray-700 dark:hover:bg-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setOpen(true)}
      >
        <div className="flex items-center justify-center rounded-lg h-full w-full py-9 dark:hover:text-neutral-400 hover:text-emerald-800">
          <Plus size={20} />
        </div>
      </div>

      {/* Dialog for adding a user */}
      <UserFormDialog
        open={open}
        title="Add User"
        onClose={() => setOpen(false)}
        onSubmit={async (username, email, password, role) => {
          await onAdd(username, email, password, role);
          setOpen(false);
        }}
      />
    </>
  );
}
