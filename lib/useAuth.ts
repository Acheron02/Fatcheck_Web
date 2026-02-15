"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
}

export default function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("fatcheckToken");
      if (!token) {
        setLoading(false); // stop spinner before redirect
        router.replace("/");
        return;
      }

      try {
        const res = await fetch("/api/validate", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!data.valid) {
          localStorage.removeItem("fatcheckToken");
          router.replace("/");
        } else {
          setUser({
            id: data.user.id,
            email: data.user.email,
            username: data.user.username,
            role: data.user.role,
          });
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("fatcheckToken");
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { loading, user };
}
