// AddStudentCard.tsx
"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import StudentFormDialog from "./StudentFormDialog";

interface AddStudentCardProps {
  onAdd: (name: string, email?: string, schoolStudentId?: string, lrn?: string) => Promise<void>;
  disabled?: boolean; // optional, like saving state
}

export default function AddStudentCard({
  onAdd,
  disabled,
}: AddStudentCardProps) {
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

      {/* Dialog for adding a student */}
      <StudentFormDialog
        open={open}
        title="Add Student"
        onClose={() => setOpen(false)}
        onSubmit={async (name, email, schoolStudentId, lrn) => {
          await onAdd(name, email, schoolStudentId, lrn);
          setOpen(false); // close dialog only after adding
        }}
      />
    </>
  );
}
