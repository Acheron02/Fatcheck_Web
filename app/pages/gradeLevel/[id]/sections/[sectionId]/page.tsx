"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/custom_ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import StudentCard, { Student } from "@/components/custom_ui/studentCard";
import AddStudentCard from "@/components/custom_ui/StudentCard/addStudentCard";
import StudentFormDialog from "@/components/custom_ui/StudentCard/StudentFormDialog";
import useAuth from "@/lib/useAuth";

export default function SectionDashboard() {
  const { id, sectionId } = useParams<{ id: string; sectionId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [sectionName, setSectionName] = useState<string | null>(null);
  const [gradeName, setGradeName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isTeacher = user?.role?.toLowerCase() === "teacher";
  const isNurse = user?.role?.toLowerCase() === "nurse";

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  // Fetch section name
  useEffect(() => {
    if (!sectionId) return;
    const fetchSection = async () => {
      try {
        const res = await fetch(`/api/gradeLevels/${id}/sections/${sectionId}`);
        if (!res.ok) throw new Error("Failed to fetch section");
        const data = await res.json();
        setSectionName(data?.name || "Unknown Section");
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load section");
      }
    };
    fetchSection();
  }, [sectionId, id]);

  // Fetch grade name
  useEffect(() => {
    if (!id) return;
    const fetchGrade = async () => {
      try {
        const res = await fetch(`/api/gradeLevels/${id}/`);
        if (!res.ok) throw new Error("Failed to fetch grade");
        const data = await res.json();
        setGradeName(data?.name || "Unknown Grade");
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load grade");
      }
    };
    fetchGrade();
  }, [id]);

  // Fetch students
  useEffect(() => {
    if (!sectionId || !sectionName) return;
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `/api/gradeLevels/${id}/sections/${sectionId}/students`,
        );
        if (!res.ok) throw new Error("Failed to fetch students");
        const data: Student[] = await res.json();
        setStudents(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load students");
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [sectionId, sectionName, id]);

  // Add student
  const handleAddStudent = async (
    name: string,
    email?: string,
    schoolStudentId?: string,
    lrn?: string,
    birthday?: string, // added birthday
  ) => {
    if (!isAdmin && !isNurse) return; // RBAC guard
    try {
      setSaving(true);

      const token = localStorage.getItem("fatcheckToken");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(
        `/api/gradeLevels/${id}/sections/${sectionId}/students`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email, schoolStudentId, lrn, birthday }), // include birthday
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add student");
      }

      const data = await res.json();
      setStudents((prev) => [
        ...prev,
        { _id: data.insertedId, name, email, schoolStudentId, lrn, birthday },
      ]);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Edit student
  const handleEditStudent = async (
    studentId: string,
    name: string,
    email?: string,
    schoolStudentId?: string,
    lrn?: string,
    birthday?: string, // added birthday
  ) => {
    if (!isAdmin && !isNurse) return; // RBAC guard
    try {
      setSaving(true);

      const token = localStorage.getItem("fatcheckToken");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(
        `/api/gradeLevels/${id}/sections/${sectionId}/students/${studentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // <-- attach token
          },
          body: JSON.stringify({ name, email, schoolStudentId, lrn, birthday }), // include birthday
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update student");
      }

      setStudents((prev) =>
        prev.map((s) =>
          s._id === studentId
            ? { ...s, name, email, schoolStudentId, lrn, birthday }
            : s,
        ),
      );
      setEditingStudent(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message); // optional: show error to user
    } finally {
      setSaving(false);
    }
  };

  // Delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (!isAdmin && !isNurse) return;

    try {
      const token = localStorage.getItem("fatcheckToken");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(
        `/api/gradeLevels/${id}/sections/${sectionId}/students/${studentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete student");

      // Remove from state
      setStudents((prev) => prev.filter((s) => s._id !== studentId));

      // Close edit dialog if that student was open
      if (editingStudent?._id === studentId) setEditingStudent(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  if (authLoading || !user) return null;

  if (!sectionName) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="w-10 h-10 text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background px-6 pt-12 pb-4">
          <h1 className="text-4xl font-bold w-fit">
            <span
              className="cursor-pointer"
              onClick={() => router.push(`/pages/main_dashboard/`)}
            >
              {gradeName || "-"}
            </span>
            /{" "}
            <span
              className="cursor-pointer"
              onClick={() => router.push(`/pages/gradeLevel/${id}/`)}
            >
              {sectionName || "-"}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage students in this section
          </p>
        </div>

        {/* Students Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingStudents ? (
              <div className="col-span-full flex justify-center">
                <Spinner className="w-10 h-10 text-gray-500" />
              </div>
            ) : (
              <>
                {students.map((student) => (
                  <StudentCard
                    key={student._id}
                    student={student}
                    onClick={() =>
                      router.push(
                        `/pages/gradeLevel/${id}/sections/${sectionId}/student/${student._id}`,
                      )
                    }
                    onEdit={
                      isAdmin || isNurse
                        ? (id) => setEditingStudent(student)
                        : undefined
                    }
                    onDelete={
                      isAdmin || isNurse ? handleDeleteStudent : undefined
                    }
                    description={`Email: ${student.email || "-"} | Student ID: ${
                      student.schoolStudentId || "-"
                    } | LRN: ${student.lrn || "-"} | Birthday: ${
                      student.birthday
                        ? new Date(student.birthday).toLocaleDateString()
                        : "-"
                    }`}
                  />
                ))}

                {(isAdmin || isNurse) && (
                  <AddStudentCard onAdd={handleAddStudent} />
                )}
              </>
            )}
          </div>
        </div>

        {/* Edit Student Dialog */}
        {editingStudent && (
          <StudentFormDialog
            open={!!editingStudent}
            title="Edit Student"
            initialName={editingStudent.name || ""}
            initialEmail={editingStudent.email}
            initialSchoolStudentId={editingStudent.schoolStudentId}
            initialLrn={editingStudent.lrn}
            initialBirthday={editingStudent.birthday} // added birthday here
            saving={saving}
            onClose={() => setEditingStudent(null)}
            onSubmit={(name, email, schoolStudentId, lrn, birthday) =>
              handleEditStudent(
                editingStudent._id,
                name,
                email,
                schoolStudentId,
                lrn,
                birthday, // pass birthday to edit
              )
            }
          />
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
