"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginDialog from "@/components/custom_ui/login_form";
import Footer from "@/components/custom_ui/footer";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("fatcheckToken");

    if (token) {
      // User is logged in → force them back to dashboard
      router.replace("/pages/main_dashboard");
    }
  }, [router]);

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Light mode background */}
      <img
        src="/fatcheck_bg.png"
        alt="FatCheck Background Light"
        className="absolute inset-0 w-full h-full object-cover z-0 block dark:hidden"
      />

      {/* Dark mode background */}
      <img
        src="/fatcheck_bg_dark.png"
        alt="FatCheck Background Dark"
        className="absolute inset-0 w-full h-full object-cover z-0 hidden dark:block"
      />

      {/* hero section */}
      <section className="relative flex flex-col items-center justify-center flex-1 text-center px-6 sm:px-10 md:px-20 lg:px-40 py-16 md:py-24 lg:py-32 z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          <span className="text-primary">FatCheck</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl text-muted-foreground">
          Machine Learning-Based Body Fat Analysis & Status Classification
          System
        </p>

        <LoginDialog />
      </section>

      <Footer />
    </div>
  );
}
