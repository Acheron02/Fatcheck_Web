"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GradeCardProps {
  grade: {
    _id: string;
    name: string;
  };
  onEdit?: (gradeId: string) => void;
  onDelete?: (gradeId: string) => void; // added for admin
  onClick?: () => void;
  description?: string; // optional
}

export default function GradeCard({
  grade,
  onEdit,
  onDelete,
  onClick,
  description,
}: GradeCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col p-4 dark:bg-gray-700 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Title + Edit/Delete buttons */}
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold">{grade.name}</h2>

        {(onEdit || onDelete) && (
          <div className="flex gap-1">
            {/* Edit button */}
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(grade._id);
                }}
                className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Pencil size={20} />
              </Button>
            )}

            {/* Delete button */}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(grade._id);
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
          "This is a placeholder description for the grade level."}
      </p>
    </div>
  );
}
