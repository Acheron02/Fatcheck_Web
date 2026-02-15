"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/custom_ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import GradeCard from "@/components/custom_ui/gradeCard";
import AddGradeCard from "@/components/custom_ui/GradeCard/AddGradeCard";
import GradeFormDialog from "@/components/custom_ui/GradeCard/GradeFormDialog";
import useAuth from "@/lib/useAuth";
import { useRouter } from "next/navigation";

interface Grade {
  _id: string;
  name: string;
}

export default function MainDashboard() {
  // Auth
  const { user } = useAuth(); // assumes user.name exists
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isNurse = user?.role?.toLowerCase() === "nurse";

  // Edit dialog state
  const [editGrade, setEditGrade] = useState<Grade | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("fatcheckToken");
    if (!token) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // Fired when navigating back/forward
      if (event.persisted) {
        const token = localStorage.getItem("fatcheckToken");
        if (!token) {
          window.location.replace("/");
        }
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // Fetch grades
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await fetch("/api/gradeLevels");
        if (!res.ok) throw new Error("Failed to fetch grades");
        const data: Grade[] = await res.json();
        setGrades(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // Add new grade
  const handleAddGrade = async (name: string) => {
    try {
      const token = localStorage.getItem("fatcheckToken");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch("/api/gradeLevels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <-- attach token here
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add grade");
      }

      const data = await res.json(); // { insertedId }
      setGrades([...grades, { _id: data.insertedId, name }]);
    } catch (err: any) {
      console.error("Failed to add grade:", err);
      alert(err.message);
    }
  };


  // Edit existing grade
  const handleEditGrade = async (name: string) => {
    if (!editGrade) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("fatcheckToken");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`/api/gradeLevels/${editGrade._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to edit grade");
      }

      setGrades((prev) =>
        prev.map((g) => (g._id === editGrade._id ? { ...g, name } : g)),
      );
      setEditGrade(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };


  const handleDeleteGrade = async (gradeId: string) => {
    if (!isAdmin) return; // RBAC on frontend

    try {
      const token = localStorage.getItem("fatcheckToken");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`/api/gradeLevels/${gradeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete grade");
      }

      setGrades((prev) => prev.filter((g) => g._id !== gradeId));
      if (editGrade?._id === gradeId) setEditGrade(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };


  const navigateToSectionsList = (gradeId: string) => {
    router.push(`/pages/gradeLevel/${gradeId}`);
  };

  // Limit number of visible cards before scrolling
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
          <h1 className="text-4xl font-bold">
            {user
              ? `Welcome to FatCheck, ${user.username || "User"}!`
              : "All Grade Levels"}
          </h1>
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
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}
              style={{
                maxHeight:
                  grades.length > maxVisibleCards ? "calc(12*10rem)" : "auto",
                overflowY: grades.length > maxVisibleCards ? "auto" : "visible",
              }}
            >
              {/* Existing Grades */}
              {grades.map((grade) => (
                <GradeCard
                  key={grade._id}
                  grade={grade}
                  onEdit={
                    isAdmin || isNurse
                      ? (id) => {
                          const g = grades.find((g) => g._id === id);
                          if (g) setEditGrade(g);
                        }
                      : undefined
                  }
                  onDelete={isAdmin ? handleDeleteGrade : undefined}
                  description={`Description for ${grade.name}`}
                  onClick={() => navigateToSectionsList(grade._id)}
                />
              ))}
              {/* Add Grade Card */}
              {isAdmin && <AddGradeCard onAdd={handleAddGrade} />}
            </div>
          )}
        </div>

        {/* Edit Grade Dialog */}
        {editGrade && (
          <GradeFormDialog
            open={!!editGrade}
            onClose={() => setEditGrade(null)}
            onSubmit={handleEditGrade}
            initialName={editGrade.name}
            title={`Edit ${editGrade.name}`}
            saving={saving}
          />
        )}
        <div className="col-span-full h-8" />
      </div>
    </div>
  );
}
