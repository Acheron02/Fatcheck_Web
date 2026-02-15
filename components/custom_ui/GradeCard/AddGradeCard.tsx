"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import GradeFormDialog from "./GradeFormDialog";

interface AddGradeCardProps {
  onAdd: (name: string) => void;
}

export default function AddGradeCard({ onAdd }: AddGradeCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="flex flex-col dark:bg-gray-700 dark:hover:bg-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center justify-center rounded-lg h-full w-full py-9 dark:hover:text-neutral-400 hover:text-emerald-800">
          <Plus size={20} />
        </div>
      </div>

      <GradeFormDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(name) => {
          onAdd(name);
          setOpen(false);
        }}
        title="Add Grade"
      />
    </>
  );
}
