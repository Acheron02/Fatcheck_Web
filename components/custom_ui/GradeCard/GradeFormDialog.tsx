"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface GradeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialName?: string; // for editing
  title?: string;
  saving?: boolean; // optional, shows spinner if true
}

export default function GradeFormDialog({
  open,
  onClose,
  onSubmit,
  initialName = "",
  title = "Add Grade",
  saving = false,
}: GradeFormDialogProps) {
  const [name, setName] = useState(initialName);

  // Reset input only when dialog opens
  useEffect(() => {
    if (open) {
      setName(initialName);
    }
  }, [open, initialName]);

  const handleSubmit = () => {
    if (!name.trim() || saving) return; // prevent submitting while saving
    onSubmit(name.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <Input
            autoFocus
            placeholder="Grade name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={saving} // disable input while saving
          />
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="cursor-pointer"
            disabled={saving}
          >
            {saving ? (
              <Spinner className="w-5 h-5 text-white animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
