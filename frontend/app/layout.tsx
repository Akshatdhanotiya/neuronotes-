import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroNotes — AI-Powered Study Assistant",
  description: "Transform your notes, PDFs and text into flashcards, summaries and quizzes using AI.",
  keywords: "AI notes, flashcards, study assistant, PDF summarizer, NeuroNotes",
  authors: [{ name: "NeuroNotes" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
