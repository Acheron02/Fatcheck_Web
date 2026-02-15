"use client";

import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserFormDialog from "./UserCard/UserFormDialog";

export interface User {
  _id: string;
  username?: string;
  email?: string;
  role?: string;
}

interface UserCardProps {
  user: User;
  onUpdate?: (
    userId: string,
    username: string,
    email: string,
    password: string,
    role: string,
  ) => Promise<void>; // optional for RBAC
  onDelete?: (userId: string) => Promise<void>; // optional for RBAC
  description?: string;
  saving?: boolean;
}

export default function UserCard({
  user,
  onUpdate,
  onDelete,
  description,
  saving = false,
}: UserCardProps) {
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <>
      <div className="flex flex-col p-4 dark:bg-gray-700 bg-gray-100 rounded-lg shadow-lg transition-shadow">
        {/* Title + Edit/Delete buttons */}
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">
            {user.username || "Unnamed User"}
          </h2>

          {(onUpdate || onDelete) && (
            <div className="flex gap-1">
              {onUpdate && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenEdit(true);
                  }}
                  className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Pencil size={20} />
                </Button>
              )}

              {onDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await onDelete(user._id);
                  }}
                  className="cursor-pointer hover:bg-red-500 dark:hover:bg-red-700"
                >
                  <Trash2 size={20} />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-2">
          {description ||
            `Email: ${user.email || "-"} | Role: ${user.role || "-"}`}
        </p>
      </div>

      {/* Edit User Dialog */}
      {onUpdate && (
        <UserFormDialog
          open={openEdit}
          title="Edit User"
          isEditing
          saving={saving}
          initialUsername={user.username}
          initialEmail={user.email}
          initialRole={user.role}
          onClose={() => setOpenEdit(false)}
          onSubmit={async (username, email, password, role) => {
            await onUpdate(user._id, username, email, password, role);
            setOpenEdit(false);
          }}
        />
      )}
    </>
  );
}
