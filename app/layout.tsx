import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";  
import  ThemeWrapper  from "@/components/wrapper/ThemeWrapper";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FatCheck",
  description:
    "Machine Learning-Based Body Fat Analysis & Status Classification System",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* main content wrapper */}
        <main className="flex-1 flex flex-col">
          <ThemeWrapper>{children}</ThemeWrapper>
        </main>
      </body>
    </html>
  );
}
