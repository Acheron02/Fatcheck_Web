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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    email?: string,
    schoolStudentId?: string,
    lrn?: string,
    birthday?: string,
  ) => Promise<void>;
  title: string;
  initialName?: string;
  initialEmail?: string;
  initialSchoolStudentId?: string;
  initialLrn?: string;
  initialBirthday?: string;
  saving?: boolean;
}

export default function StudentFormDialog({
  open,
  onClose,
  onSubmit,
  title,
  initialName = "",
  initialEmail = "",
  initialSchoolStudentId = "",
  initialLrn = "",
  initialBirthday = "",
  saving = false,
}: StudentFormDialogProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [schoolStudentId, setSchoolStudentId] = useState(
    initialSchoolStudentId,
  );
  const [lrn, setLrn] = useState(initialLrn);
  const [birthday, setBirthday] = useState<Date | undefined>(
    initialBirthday ? new Date(initialBirthday) : undefined,
  );

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    schoolStudentId?: string;
    lrn?: string;
    birthday?: string;
  }>({});

  useEffect(() => {
    if (open) {
      setName(initialName);
      setEmail(initialEmail);
      setSchoolStudentId(initialSchoolStudentId);
      setLrn(initialLrn);
      setBirthday(initialBirthday ? new Date(initialBirthday) : undefined);
      setErrors({});
    }
  }, [
    open,
    initialName,
    initialEmail,
    initialSchoolStudentId,
    initialLrn,
    initialBirthday,
  ]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!schoolStudentId.trim())
      newErrors.schoolStudentId = "Student ID is required";
    if (!lrn.trim()) newErrors.lrn = "LRN is required";
    if (!birthday) newErrors.birthday = "Birthday is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (saving) return;
    if (!validate()) return;

    // Format birthday in local time YYYY-MM-DD
    const pad = (n: number) => n.toString().padStart(2, "0");
    const localDateString = birthday
      ? `${birthday.getFullYear()}-${pad(birthday.getMonth() + 1)}-${pad(
          birthday.getDate(),
        )}`
      : undefined;

    await onSubmit(
      name.trim(),
      email.trim(),
      schoolStudentId.trim(),
      lrn.trim(),
      localDateString, // Correct local date
    );
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
          {/* Name */}
          <Input
            placeholder="Student Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className={errors.name ? "border-red-500" : ""}
          />

          {/* Email */}
          <Input
            placeholder="Student Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className={errors.email ? "border-red-500" : ""}
          />

          {/* Birthday (Calendar) */}
          <div className="flex flex-col">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !birthday && "text-muted-foreground",
                    errors.birthday && "border-red-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthday ? format(birthday, "PPP") : "Select birthday"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthday}
                  onSelect={setBirthday}
                  captionLayout="dropdown"
                  fromYear={1990}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>

            {errors.birthday && (
              <span className="text-red-500 text-sm mt-1">
                {errors.birthday}
              </span>
            )}
          </div>

          {/* Student ID */}
          <Input
            placeholder="Student ID"
            value={schoolStudentId}
            onChange={(e) => setSchoolStudentId(e.target.value)}
            onKeyDown={handleKeyDown}
            className={errors.schoolStudentId ? "border-red-500" : ""}
          />

          {/* LRN */}
          <Input
            placeholder="LRN"
            value={lrn}
            onChange={(e) => setLrn(e.target.value)}
            onKeyDown={handleKeyDown}
            className={errors.lrn ? "border-red-500" : ""}
          />

          {/* Buttons */}
          <div className="flex justify-end gap-2">
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
              className="cursor-pointer"
            >
              {saving ? (
                <Spinner className="w-5 h-5 text-white animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
