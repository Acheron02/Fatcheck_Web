"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/custom_ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type Role = "Admin" | "Teacher" | "Nurse";
const roles: Role[] = ["Admin", "Teacher", "Nurse"];

export default function RegisterUser() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Teacher");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = () => {
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      showNotification("error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification("error", data.error || "Failed to register user.");
      } else {
        showNotification("success", "User registered successfully!");

        setName("");
        setEmail("");
        setPassword("");
        setRole("Teacher");
      }
    } catch (err: any) {
      console.error(err);
      showNotification("error", err.message || "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background px-6 pt-12 pb-4">
          <h1 className="text-4xl font-bold">Register User</h1>
          <p className="text-muted-foreground mt-1">
            Create a new admin, teacher, or nurse account
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-md mx-auto rounded-lg bg-card border shadow-sm p-6">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              {/* Name */}
              <div>
                <Label htmlFor="name" className="mb-1 block font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="mb-1 block font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
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
                    spellCheck={false}
                    autoComplete="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-transparent hover:cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <img
                      src={
                        showPassword ? "/icons/eye.svg" : "/icons/eyeclosed.svg"
                      }
                      alt={showPassword ? "Hide password" : "Show password"}
                      className="h-5 w-5 dark:hidden"
                    />

                    {/* Dark theme icon */}
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
                </div>
              </div>

              {/* Role */}
              <div>
                <Label htmlFor="role" className="mb-1 block font-medium">
                  Role
                </Label>
                <Select
                  value={role}
                  onValueChange={(val) => setRole(val as Role)}
                >
                  <SelectTrigger id="role" className="w-full cursor-pointer">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r} className="cursor-pointer">
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full flex items-center justify-center cursor-pointer"
                disabled={loading}
              >
                {loading && <Spinner className="w-5 h-5 mr-2 animate-spin" />}
                Register
              </Button>
            </form>
          </div>
        </div>

        <div className="h-8" />
      </div>

      {/* Top-right notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 w-[320px] animate-in fade-in slide-in-from-top-2">
          <Alert
            variant={notification.type === "error" ? "destructive" : "default"}
          >
            <AlertTitle>
              {notification.type === "error" ? "Error" : "Success"}
            </AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
