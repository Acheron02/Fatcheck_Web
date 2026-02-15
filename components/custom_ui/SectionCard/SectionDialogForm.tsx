"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface SectionFormDialogProps {
  open: boolean;
  title: string;
  initialName?: string;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>; // async
  saving?: boolean;
}

export default function SectionFormDialog({
  open,
  title,
  initialName = "",
  onClose,
  onSubmit,
  saving = false,
}: SectionFormDialogProps) {
  const [name, setName] = useState(initialName);

  // Prefill input when dialog opens
  useEffect(() => {
    if (open) setName(initialName);
  }, [initialName, open]);

  const handleSubmit = async () => {
    if (!name.trim() || saving) return;
    await onSubmit(name.trim());
    // Do NOT clear input while saving; only close dialog when needed
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
          <Input
            placeholder="Section name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={handleKeyDown}
            className="cursor-pointer"
          />

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
              className="cursor-pointer flex items-center gap-2"
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
