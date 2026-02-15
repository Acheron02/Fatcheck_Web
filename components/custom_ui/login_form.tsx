"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      // 🔹 Call the login API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("fatcheckToken", data.token); // ✅ store token
        router.push("/pages/main_dashboard");
      } else {
        setError(data.message || "Login failed");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = () => {
    if (error) setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          Login
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your FatCheck account.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-4" onSubmit={handleSubmit} autoComplete="off">
          {/* Email */}
          <div className="grid w-full items-center gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="you@gmail.com"
              required
              onChange={handleInputChange}
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
                onChange={handleInputChange}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-transparent hover:cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <img
                  src={showPassword ? "/icons/eye.svg" : "/icons/eyeclosed.svg"}
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

          {/* Error message */}
          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
