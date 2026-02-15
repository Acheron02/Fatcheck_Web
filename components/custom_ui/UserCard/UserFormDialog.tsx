"use client";

import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    username: string,
    email: string,
    password: string,
    role: string,
  ) => Promise<void>;
  onDelete?: () => Promise<void>;
  title: string;

  initialUsername?: string;
  initialEmail?: string;
  initialRole?: string;

  saving?: boolean;
  deleting?: boolean;
  isEditing?: boolean;
}

export default function UserFormDialog({
  open,
  onClose,
  onSubmit,
  title,
  initialUsername = "",
  initialEmail = "",
  initialRole = "Teacher",
  saving = false,
  isEditing = false,
}: UserFormDialogProps) {
  const [username, setUsername] = useState(initialUsername);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);

  // Prefill when dialog opens
  useEffect(() => {
    if (open) {
      setUsername(initialUsername);
      setEmail(initialEmail);
      setPassword("");
      setRole(initialRole);
      setShowPassword(false);
    }
  }, [open, initialUsername, initialEmail, initialRole]);

  const handleSubmit = async () => {
    if (!username.trim() || !email.trim() || saving) return;
    await onSubmit(username.trim(), email.trim(), password, role);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Username */}
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Email */}
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Password */}
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="********"
                className="pr-12"
                value={password}
                spellCheck={false}
                autoComplete="password"
                onChange={handlePasswordChange}
                onKeyDown={handleKeyDown}
                disabled={isEditing}
              />
              {!isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-transparent hover:cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {/* Light theme */}
                  <img
                    src={
                      showPassword ? "/icons/eye.svg" : "/icons/eyeclosed.svg"
                    }
                    alt={showPassword ? "Hide password" : "Show password"}
                    className="h-5 w-5 dark:hidden"
                  />
                  {/* Dark theme */}
                  <img
                    src={
                      showPassword
                        ? "/icons/eye_light.svg"
                        : "/icons/eyeclosed_light.svg"
                    }
                    alt={showPassword ? "Hide password" : "Show password"}
                    className="h-5 w-5 hidden dark:block"
                  />
                </Button>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="grid items-center gap-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Nurse">Nurse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-2">
            <div className="flex gap-2 ml-auto">
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
