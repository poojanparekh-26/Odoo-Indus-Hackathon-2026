import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SWRegistration } from "@/components/providers/SWRegistration";

export const metadata: Metadata = {
  title: "Inventory Management System",
  description: "Warehouse & Inventory Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <AuthProvider>
          <SWRegistration />
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
