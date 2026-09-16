import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SagipIsip - Your Mental Health Sanctuary",
  description: "AI-powered mental health companion and workbook platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
