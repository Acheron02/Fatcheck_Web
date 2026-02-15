"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/custom_ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import UserCard, { User } from "@/components/custom_ui/userCard";
import AddUserCard from "@/components/custom_ui/UserCard/addUserCard";
import UserFormDialog from "@/components/custom_ui/UserCard/UserFormDialog";
import useAuth from "@/lib/useAuth";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Edit dialog state
  const [editUser, setEditUser] = useState<User | null>(null);

  /* ---------------- Auth Guard ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("fatcheckToken");
    if (!token) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        const token = localStorage.getItem("fatcheckToken");
        if (!token) window.location.replace("/");
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  /* ---------------- Fetch Users ---------------- */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("fatcheckToken");
        if (!token) throw new Error("Unauthorized");

        const res = await fetch("/api/auth/register", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data: User[] = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /* ---------------- Add User ---------------- */
  const handleAddUser = async (
    username: string,
    email: string,
    password: string,
    role: string,
  ) => {
    try {
      const token = localStorage.getItem("fatcheckToken");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email, password, role }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add user");
      }

      const newUser: User = await res.json();
      setUsers((prev) => [...prev, newUser]);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  /* ---------------- Edit User ---------------- */
  const handleEditUser = async (
    userId: string,
    username: string,
    email: string,
    password: string,
    role: string,
  ) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("fatcheckToken");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email, password, role }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update user");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, username, email, role } : u,
        ),
      );

      setEditUser(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Delete User ---------------- */
  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) return;

    try {
      const token = localStorage.getItem("fatcheckToken");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u._id !== userId));
      if (editUser?._id === userId) setEditUser(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  /* ---------------- UI ---------------- */
  const maxVisibleCards = 12;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-background z-10 px-6 pt-12 pb-4">
          <h1 className="text-4xl font-bold">User Management</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
          {loading && (
            <div className="flex justify-center items-center mt-4">
              <Spinner />
            </div>
          )}

          {error && <p className="text-red-500 mt-4">{error}</p>}

          {!loading && !error && (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              style={{
                maxHeight:
                  users.length > maxVisibleCards ? "calc(12*10rem)" : "auto",
                overflowY: users.length > maxVisibleCards ? "auto" : "visible",
              }}
            >
              {/* Existing Users */}
              {users.map((u) => (
                <UserCard
                  key={u._id}
                  user={u}
                  onUpdate={
                    isAdmin
                      ? async (id, username, email, password, role) =>
                          handleEditUser(id, username, email, password, role)
                      : undefined
                  }
                  onDelete={isAdmin ? handleDeleteUser : undefined}
                />
              ))}

              {/* Add User Card */}
              {isAdmin && <AddUserCard onAdd={handleAddUser} />}
            </div>
          )}
        </div>

        {/* Edit User Dialog */}
        {editUser && (
          <UserFormDialog
            open={!!editUser}
            title="Edit User"
            isEditing
            initialUsername={editUser.username}
            initialEmail={editUser.email}
            initialRole={editUser.role}
            saving={saving}
            onClose={() => setEditUser(null)}
            onSubmit={(username, email, password, role) =>
              handleEditUser(editUser._id, username, email, password, role)
            }
          />
        )}

        <div className="col-span-full h-8" />
      </div>
    </div>
  );
}
