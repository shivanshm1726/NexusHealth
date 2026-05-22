import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "NexusHealth — Smart Hospital Management",
  description: "Book appointments, consult doctors online, and manage your health — all in one place.",
};

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Using a placeholder Client ID if NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

  return (
    <html lang="en">
      <body className={`${font.variable} font-sans antialiased bg-background text-foreground`}>
        <GoogleOAuthProvider clientId={clientId}>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
