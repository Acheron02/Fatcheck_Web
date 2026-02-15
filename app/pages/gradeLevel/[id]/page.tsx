"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/custom_ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import SectionCard from "@/components/custom_ui/sectionCard";
import AddSectionCard from "@/components/custom_ui/SectionCard/addSectionCard";
import SectionFormDialog from "@/components/custom_ui/SectionCard/SectionDialogForm";
import useAuth from "@/lib/useAuth";
import { is } from "date-fns/locale";

interface Section {
  _id: string;
  name: string;
}

export default function GradeLevelDashboard() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [gradeName, setGradeName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("fatcheckToken");
  if (!token) throw new Error("Unauthorized");

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  // Fetch grade name
  useEffect(() => {
    if (!id) return;
    const fetchGradeName = async () => {
      try {
        const res = await fetch(`/api/gradeLevels/${id}`);
        if (!res.ok) throw new Error("Failed to fetch grade level");
        const data = await res.json();
        setGradeName(data.name);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load grade name");
      }
    };
    fetchGradeName();
  }, [id]);

  // Fetch sections
  useEffect(() => {
    if (!id || !gradeName) return;
    const fetchSections = async () => {
      try {
        const res = await fetch(`/api/gradeLevels/${id}/sections`);
        if (!res.ok) throw new Error("Failed to fetch sections");
        const data: Section[] = await res.json();
        setSections(data);
      } catch (err: any) {
        setError(err.message || "Failed to load sections");
      } finally {
        setLoadingSections(false);
      }
    };
    fetchSections();
  }, [id, gradeName]);

  // Add section
  const handleAddSection = async (name: string) => {
    try {
      setSaving(true);

      const token = localStorage.getItem("fatcheckToken");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`/api/gradeLevels/${id}/sections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <-- attach token here
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add section");
      }

      const data = await res.json();
      setSections((prev) => [...prev, { _id: data.insertedId, name }]);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };


  // Edit section
  const handleEditSection = async (name: string) => {
    if (!editSection) return;
    try {
      setSaving(true);

      const token = localStorage.getItem("fatcheckToken");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(
        `/api/gradeLevels/${id}/sections/${editSection._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // <-- attach token here
          },
          body: JSON.stringify({ name }),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update section");
      }

      setSections((prev) =>
        prev.map((s) => (s._id === editSection._id ? { ...s, name } : s)),
      );
      setEditSection(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };


  if (authLoading || !user) return null;

  if (!gradeName) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="w-10 h-10 text-gray-500" />
        </div>
      </div>
    );
  }

  const isAdmin = user.role?.toLowerCase() === "admin";
  const isTeacher = user.role?.toLowerCase() === "teacher";
  const isNurse = user.role?.toLowerCase() === "nurse";

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background px-6 pt-12 pb-4">
          <h1
            className="text-4xl font-bold cursor-pointer w-fit"
            onClick={() => router.push("/pages/main_dashboard")}
          >
            {gradeName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage sections under this grade level
          </p>
        </div>

        {/* Sections Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <SectionCard
                key={section._id}
                section={section}
                onClick={() =>
                  router.push(`/pages/gradeLevel/${id}/sections/${section._id}`)
                }
                onEdit={
                  isAdmin || isNurse
                    ? (sectionId) => {
                        const s = sections.find((x) => x._id === sectionId);
                        if (s) setEditSection(s);
                      }
                    : undefined
                }
                onDelete={
                  isAdmin || isNurse
                    ? async (sectionId) => {
                        try {
                          const token = localStorage.getItem("fatcheckToken");
                          if (!token) throw new Error("Unauthorized");

                          const res = await fetch(
                            `/api/gradeLevels/${id}/sections/${sectionId}`,
                            {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            },
                          );

                          const data = await res.json();

                          if (!res.ok)
                            throw new Error(
                              data.error || "Failed to delete section",
                            );

                          setSections((prev) =>
                            prev.filter((s) => s._id !== sectionId),
                          );
                        } catch (err: any) {
                          console.error(err);
                          alert(err.message);
                        }
                      }
                    : undefined
                }
              />
            ))}

            {/* Only admins can add new sections */}
            {(isAdmin || isNurse) && (
              <AddSectionCard onAdd={handleAddSection} disabled={saving} />
            )}
          </div>
        </div>

        {/* Edit Section Dialog */}
        {editSection && (
          <SectionFormDialog
            open={!!editSection}
            title="Edit Section"
            initialName={editSection.name}
            onClose={() => setEditSection(null)}
            onSubmit={handleEditSection}
            saving={saving}
          />
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
