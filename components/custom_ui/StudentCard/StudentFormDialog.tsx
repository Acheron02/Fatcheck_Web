"use client";

import React, { useState, useEffect, KeyboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    email?: string,
    schoolStudentId?: string,
    lrn?: string,
  ) => Promise<void>;
  onDelete?: () => Promise<void>;
  title: string;
  initialName?: string;
  initialEmail?: string;
  initialSchoolStudentId?: string;
  initialLrn?: string;
  saving?: boolean;
  deleting?: boolean;
}

export default function StudentFormDialog({
  open,
  onClose,
  onSubmit,
  onDelete,
  title,
  initialName = "",
  initialEmail = "",
  initialSchoolStudentId = "",
  initialLrn = "",
  saving = false,
  deleting = false,
}: StudentFormDialogProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [schoolStudentId, setSchoolStudentId] = useState(
    initialSchoolStudentId,
  );
  const [lrn, setLrn] = useState(initialLrn);

  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    schoolStudentId?: string;
    lrn?: string;
  }>({});

  // Prefill inputs when dialog opens
  useEffect(() => {
    if (open) {
      setName(initialName);
      setEmail(initialEmail);
      setSchoolStudentId(initialSchoolStudentId);
      setLrn(initialLrn);
      setErrors({});
    }
  }, [open, initialName, initialEmail, initialSchoolStudentId, initialLrn]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!schoolStudentId.trim())
      newErrors.schoolStudentId = "Student ID is required";
    if (!lrn.trim()) newErrors.lrn = "LRN is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (saving) return;

    if (!validate()) return; // do not close dialog if validation fails

    try {
      await onSubmit(
        name.trim(),
        email.trim(),
        schoolStudentId.trim(),
        lrn.trim(),
      );
    } catch (err) {
      console.error(err);
      // Optional: show global error if API fails
      alert((err as any)?.message || "Failed to save student");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Name */}
          <div className="flex flex-col">
            <Input
              placeholder="Student Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={handleKeyDown}
              required
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <span className="text-red-500 text-sm mt-1">{errors.name}</span>
            )}
          </div>

          {/* Student Email */}
          <div className="flex flex-col">
            <Input
              placeholder="Student Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              required
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <span className="text-red-500 text-sm mt-1">{errors.email}</span>
            )}
          </div>

          {/* Student ID */}
          <div className="flex flex-col">
            <Input
              placeholder="Student ID"
              value={schoolStudentId}
              onChange={(e) => setSchoolStudentId(e.target.value)}
              onKeyDown={handleKeyDown}
              required
              className={errors.schoolStudentId ? "border-red-500" : ""}
            />
            {errors.schoolStudentId && (
              <span className="text-red-500 text-sm mt-1">
                {errors.schoolStudentId}
              </span>
            )}
          </div>

          {/* LRN */}
          <div className="flex flex-col">
            <Input
              placeholder="LRN"
              value={lrn}
              onChange={(e) => setLrn(e.target.value)}
              onKeyDown={handleKeyDown}
              required
              className={errors.lrn ? "border-red-500" : ""}
            />
            {errors.lrn && (
              <span className="text-red-500 text-sm mt-1">{errors.lrn}</span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-2">
            <div className="flex gap-2 ml-auto cursor-pointer">
              <Button
                variant="ghost"
                onClick={onClose}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <Spinner className="w-5 h-5 text-white animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
