"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/custom_ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import useAuth from "@/lib/useAuth";
import { UserCircle, FileText, FileSpreadsheet, File } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email?: string;
  schoolStudentId?: string;
  lrn?: string;
  birthday?: string; // ISO string
  gradeName?: string;
  sectionName?: string;
}

interface Record {
  _id: string;
  type: "pdf" | "xls" | "other";
  filename: string;
  date: string; // ISO string
  url: string; // path to file on Raspi
}

export default function StudentProfilePage() {
  const { id, sectionId, studentId } = useParams<{
    id: string;
    sectionId: string;
    studentId: string;
  }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [student, setStudent] = useState<Student | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [records, setRecords] = useState<Record[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [authLoading, user, router]);

  // Fetch student data
  useEffect(() => {
    if (!studentId || !sectionId || !id) return;

    const fetchStudent = async () => {
      try {
        setLoadingStudent(true);
        const token = localStorage.getItem("fatcheckToken");
        if (!token) throw new Error("Unauthorized");

        // Fetch student
        const res = await fetch(
          `/api/gradeLevels/${id}/sections/${sectionId}/students/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) throw new Error("Failed to fetch student");

        const data: Student = await res.json();

        // Fetch grade and section names
        const gradeRes = await fetch(`/api/gradeLevels/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const gradeData = gradeRes.ok ? await gradeRes.json() : { name: "" };

        const sectionRes = await fetch(
          `/api/gradeLevels/${id}/sections/${sectionId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const sectionData = sectionRes.ok
          ? await sectionRes.json()
          : { name: "" };

        setStudent({
          ...data,
          gradeName: gradeData.name || "",
          sectionName: sectionData.name || "",
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load student");
      } finally {
        setLoadingStudent(false);
      }
    };

    fetchStudent();
  }, [studentId, sectionId, id]);

  // Fetch student health records
  useEffect(() => {
    if (!studentId) return;

    const fetchRecords = async () => {
      try {
        setLoadingRecords(true);
        const res = await fetch(`/api/students/${studentId}/records`);
        if (!res.ok) throw new Error("Failed to fetch records");
        const data: Record[] = await res.json();
        setRecords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRecords(false);
      }
    };

    fetchRecords();
  }, [studentId]);

  if (authLoading || loadingStudent || !user)
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="w-10 h-10 text-gray-500" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-red-500">
          {error}
        </div>
      </div>
    );

  if (!student)
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          Student not found
        </div>
      </div>
    );

  const birthdayDisplay = student.birthday
    ? `${new Date(student.birthday).toLocaleDateString()} (${Math.floor(
        (Date.now() - new Date(student.birthday).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25),
      )} yrs)`
    : "-";

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto px-6 py-6">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background pb-4">
          <div className="flex items-center gap-2">
            <UserCircle className="w-20 h-20 text-gray-500" />
            <h1 className="text-3xl font-bold">{student.name}</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-md">Student Profile</p>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 mt-1 text-sm">
            <p>
              <strong>Email:</strong> {student.email || "-"}
            </p>
            <p>
              <strong>Student ID:</strong> {student.schoolStudentId || "-"}
            </p>
            <p>
              <strong>LRN:</strong> {student.lrn || "-"}
            </p>
            <p>
              <strong>Birthday:</strong> {birthdayDisplay}
            </p>
            <p>
              <strong>Grade Level:</strong>{" "}
              <span
                className="cursor-pointer"
                onClick={() => router.push(`/pages/gradeLevel/${id}`)}
              >
                {student.gradeName || "-"}
              </span>
            </p>
            <p>
              <strong>Section:</strong>{" "}
              <span
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/pages/gradeLevel/${id}/sections/${sectionId}`)
                }
              >
                {student.sectionName || "-"}
              </span>
            </p>
          </div>
        </div>

        {/* Health Records Section */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Health Records</h2>

          {loadingRecords ? (
            <div className="flex justify-center items-center">
              <Spinner className="w-8 h-8 text-gray-500" />
            </div>
          ) : records.length === 0 ? (
            <p className="text-sm text-gray-500">No records available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {records.map((record) => {
                const Icon =
                  record.type === "pdf"
                    ? File
                    : record.type === "xls"
                      ? FileSpreadsheet
                      : FileText;

                return (
                  <div
                    key={record._id}
                    className="flex items-center gap-2 p-3 border rounded hover:shadow cursor-pointer"
                    onClick={() => window.open(record.url, "_blank")}
                  >
                    <Icon className="w-6 h-6 text-gray-600" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {record.filename}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />
      </div>
    </div>
  );
}
