"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentCardProps {
  student: {
    _id: string;
    name?: string;
    email?: string;
    schoolStudentId?: string;
    lrn?: string;
  };
  onEdit?: (studentId: string) => void; // optional for RBAC
  onDelete?: (studentId: string) => void; // optional for RBAC
  onClick?: () => void;
  description?: string;
}

export interface Student {
  _id: string;
  name?: string;
  email?: string;
  schoolStudentId?: string;
  lrn?: string;
}

export default function StudentCard({
  student,
  onEdit,
  onDelete,
  onClick,
  description,
}: StudentCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col p-4 dark:bg-gray-700 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Title + Edit/Delete buttons */}
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold">
          {student.name || "Unnamed Student"}
        </h2>

        {(onEdit || onDelete) && (
          <div className="flex gap-1">
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(student._id);
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
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(student._id);
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
          `Email: ${student.email || "-"} | Student ID: ${student.schoolStudentId || "-"} | LRN: ${student.lrn || "-"}`}
      </p>
    </div>
  );
}
