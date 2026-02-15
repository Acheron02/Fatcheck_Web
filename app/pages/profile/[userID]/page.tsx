"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/custom_ui/sidebar";
import useAuth from "@/lib/useAuth";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const { loading, user } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [role, setRole] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileHeaderRef = useRef<HTMLHeadingElement>(null);

  const handleInputChange = () => {
    if (error) setError(null);
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setRedirecting(true);
        router.replace("/");
      } else {
        setUsername(user.username || "");
        setEmail(user.email);
        setRole(user.role || "");
      }
    }
  }, [loading, user, router]);

  if (loading || redirecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Spinner className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("fatcheckToken")}`,
        },
        body: JSON.stringify({ username, email, role }),
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);

    if (newPassword.length < 6) return setPasswordError("Password too short");
    if (newPassword !== confirmPassword)
      return setPasswordError("Passwords do not match");

    setSavingPassword(true);

    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("fatcheckToken")}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        // API returned error
        setPasswordError(data.error || "Failed to update password");
        return;
      }

      if (data.success) {
        // Clear fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Show success notification
        setPasswordSuccess(true);
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setPasswordError("Failed to update password");
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };


  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 flex items-center justify-center px-4">
        <main className="w-full max-w-2xl h-[90vh] flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* Fixed top headers */}
          <div className="shrink-0 px-6 pt-6 text-center">
            <h1 className="text-3xl font-bold mb-1">Your Profile</h1>
            <p className="text-muted-foreground">
              Manage your account details and security
            </p>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 space-y-8 scrollbar-hide">
            <div className="relative">
              {/* Profile Information Section */}
              <section>
                <h2
                  ref={profileHeaderRef}
                  className="text-lg font-semibold sticky top-0 bg-card z-10 pt-2 pb-2 border-b"
                >
                  Profile Information
                </h2>

                {/* All fields always visible */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    handleProfileSave();
                  }}
                  className="space-y-2 pt-2"
                  autoComplete="off"
                >
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Username</label>
                    <Input
                      value={username}
                      disabled={!isEditing}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={email}
                      disabled={!isEditing}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Role</label>
                    <Input
                      value={role}
                      disabled={
                        !isEditing ||
                        (isEditing && user?.role?.toLowerCase() !== "admin")
                      }
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">User ID</label>
                    <Input value={user?.id} disabled />
                  </div>

                  <div className="flex gap-3 pt-2">
                    {!isEditing && (
                      <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="cursor-pointer"
                      >
                        Edit Profile
                      </Button>
                    )}
                    {isEditing && (
                      <>
                        <Button
                          type="submit"
                          disabled={savingProfile}
                          className="cursor-pointer"
                        >
                          {savingProfile ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setUsername(user?.username || "");
                            setEmail(user?.email || "");
                            setRole(user?.role || "");
                          }}
                          className="cursor-pointer"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </section>

              {/* Change Password Section */}
              <section className="mt-4 mb-8">
                <h2
                  className="text-lg font-semibold sticky z-10 pt-2 pb-2 border-b bg-card"
                  style={{ top: profileHeaderRef.current?.offsetHeight ?? 0 }}
                >
                  Change Password
                </h2>

                <div className="space-y-2 pt-2">
                  {/* Current Password */}
                  <div className="grid w-full items-center space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative w-full">
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="currentPassword"
                        value={currentPassword}
                        placeholder="********"
                        className="pr-12"
                        spellCheck={false}
                        autoComplete="current-password"
                        required
                        onChange={(e) => setCurrentPassword(e.target.value)}
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
                            showPassword
                              ? "/icons/eye.svg"
                              : "/icons/eyeclosed.svg"
                          }
                          alt={showPassword ? "Hide password" : "Show password"}
                          className="h-5 w-5 dark:hidden"
                        />
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

                  {/* New Password */}
                  <div className="grid w-full items-center space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative w-full">
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        value={newPassword}
                        placeholder="********"
                        spellCheck={false}
                        autoComplete="new-password"
                        className="pr-12"
                        required
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="grid w-full items-center space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative w-full">
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        spellCheck={false}
                        autoComplete="confirm-password"
                        placeholder="********"
                        className="pr-12"
                        required
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}

                  <Button
                    onClick={handlePasswordChange}
                    disabled={savingPassword}
                    className="cursor-pointer"
                  >
                    {savingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </section>
            </div>
          </div>
          <div className="h-6"></div>
        </main>

        {/* Password success notification */}
        {passwordSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
            Password updated successfully!
          </div>
        )}
      </div>

      {/* Tailwind animation */}
      <style jsx>{`
        @keyframes fade-in-out {
          0%,
          100% {
            opacity: 0;
          }
          10%,
          90% {
            opacity: 1;
          }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease forwards;
        }
      `}</style>
    </div>
  );
}
