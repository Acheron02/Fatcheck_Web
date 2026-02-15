"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Pencil, Plus, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface GradeListProps {
  collapsed: boolean;
  isMobile: boolean;
  router: ReturnType<typeof useRouter>;
}

interface Grade {
  _id: string;
  name: string;
}

export default function GradeList({
  collapsed,
  isMobile,
  router,
}: GradeListProps) {
  const [open, setOpen] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGrade, setNewGrade] = useState("Grade 1");

  // Fetch grades from MongoDB
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await fetch("/api/gradeLevels");
        const data: Grade[] = await res.json();
        setGrades(data);
      } catch (err) {
        console.error("Failed to fetch grades:", err);
      }
    };
    fetchGrades();
  }, []);

  const navigateToGrade = (grade: Grade) => {
    router.push(`/pages/gradeLevel/${grade._id}`); 
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(grades[index].name);
  };

  const saveGradeEdit = async (index: number) => {
    if (index < 0 || index >= grades.length) return;

    const grade = grades[index];
    const trimmed = editValue.trim();
    if (!trimmed) return;

    try {
      const token = localStorage.getItem("fatcheckToken");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`/api/gradeLevels/${grade._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ attach token
        },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update grade");
      }

      const updated = [...grades];
      updated[index].name = trimmed;
      setGrades(updated);
      setEditingIndex(null);
    } catch (err: any) {
      console.error(err);
    }
  };


  const handleAddGrade = async () => {
    if (!newGrade.trim()) return;

    try {
      const res = await fetch("/api/gradeLevels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGrade.trim() }),
      });
      const data = await res.json(); // expect { insertedId: string }
      setGrades([...grades, { _id: data.insertedId, name: newGrade.trim() }]);
      setNewGrade("Grade 1");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Grade Level Header */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-md hover:bg-accent cursor-pointer ${
          collapsed && !isMobile ? "justify-center" : "justify-between"
        }`}
      >
        <School size={20} />
        {(!collapsed || isMobile) && (
          <span className="flex-1 flex items-center justify-between cursor-pointer">
            <span className="truncate">Grade Level</span>
            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </span>
        )}
      </button>

      {/* Grades List */}
      {open && (!collapsed || isMobile) && (
        <div className="flex flex-col mt-2 px-4 min-w-0">
          {/* Scrollable container for grades */}
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto scrollbar-hide">
            {grades.map((grade, index) => (
              <div
                key={grade._id}
                className="flex items-center justify-between gap-2 min-w-0"
              >
                {editingIndex === index ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveGradeEdit(index);
                      if (e.key === "Escape") setEditingIndex(null);
                    }}
                    onBlur={() => saveGradeEdit(index)}
                    className="flex-1 px-2 py-1 text-sm rounded bg-background min-w-0"
                  />
                ) : (
                  <button
                    onClick={() => navigateToGrade(grade)}
                    className="flex-1 text-left px-3 py-2 text-sm rounded-md truncate hover:bg-accent min-w-0 cursor-pointer"
                  >
                    {grade.name}
                  </button>
                )}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEditing(index)}
                    className="cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Grade */}
          <div className="mt-2 flex items-center gap-2 w-full">
            {!showAddForm ? (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 w-full cursor-pointer"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={14} /> Add Grade
              </Button>
            ) : (
              <>
                <input
                  autoFocus
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddGrade();
                  }}
                  className="flex-1 px-2 py-1 text-sm rounded bg-background min-w-0"
                  placeholder="Grade name"
                />
                <Button
                  size="icon"
                  onClick={handleAddGrade}
                  className="cursor-pointer"
                >
                  +
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
