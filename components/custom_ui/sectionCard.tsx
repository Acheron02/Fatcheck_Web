"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionCardProps {
  section: {
    _id: string;
    name: string;
  };
  onEdit?: (sectionId: string) => void; // optional
  onDelete?: (sectionId: string) => void; // optional
  onClick?: () => void;
  description?: string; // optional
}

export default function SectionCard({
  section,
  onEdit,
  onDelete,
  onClick,
  description,
}: SectionCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col p-4 dark:bg-gray-700 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Title + Edit/Delete buttons */}
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold">{section.name}</h2>

        {/* Only render buttons if callbacks exist */}
        {(onEdit || onDelete) && (
          <div className="flex space-x-1">
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(section._id);
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
                  onDelete(section._id);
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
        {description || "View students in this section."}
      </p>
    </div>
  );
}
