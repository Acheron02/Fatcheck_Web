"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import SectionFormDialog from "./SectionDialogForm";

interface AddSectionCardProps {
  onAdd: (name: string) => Promise<void>; // async
  disabled?: boolean;
  saving?: boolean; // optional: pass saving state
}

export default function AddSectionCard({
  onAdd,
  disabled,
  saving,
}: AddSectionCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
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

      <SectionFormDialog
        open={open}
        title="Add Section"
        onClose={() => setOpen(false)}
        onSubmit={async (name) => {
          await onAdd(name); // wait for saving
          // only close dialog if needed; otherwise keep input
          setOpen(false);
        }}
        saving={saving}
      />
    </>
  );
}
