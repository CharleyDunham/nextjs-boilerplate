import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Remote Exoskeleton",
  description: "Control panel for remote exoskeleton system",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 min-h-screen`}
      >
        {/* 🔹 Navbar */}
        <nav className="bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Exoskeleton Control</h1>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="text-blue-500 hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/device-panel" className="text-blue-500 hover:underline">
                  Device Panel
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* 🔹 Main content */}
        <main className="container mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
