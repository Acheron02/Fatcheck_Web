"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface StudentCardProps {
  student: {
    _id: string;
    name?: string;
    email?: string;
    schoolStudentId?: string;
    lrn?: string;
    birthday?: string;
  };
  onEdit?: (studentId: string) => void;
  onDelete?: (studentId: string) => void;
  onClick?: () => void;
  description?: string;
}

export interface Student {
  _id: string;
  name?: string;
  email?: string;
  schoolStudentId?: string;
  lrn?: string;
  birthday?: string;
}

export default function StudentCard({
  student,
  onEdit,
  onDelete,
  onClick,
  description,
}: StudentCardProps) {
  const formattedBirthday = student.birthday
    ? format(new Date(student.birthday), "PPP")
    : "-";

  const age = student.birthday
    ? Math.floor(
        (Date.now() - new Date(student.birthday).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25),
      )
    : null;

  return (
    <div
      onClick={onClick}
      className="flex flex-col p-4 dark:bg-gray-700 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
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

      <p className="text-sm text-muted-foreground mt-2">
        {description ||
          `Email: ${student.email || "-"} | Student ID: ${student.schoolStudentId || "-"} | LRN: ${student.lrn || "-"} | Birthday: ${formattedBirthday}${age !== null ? ` (${age} yrs)` : ""}`}
      </p>
    </div>
  );
}
