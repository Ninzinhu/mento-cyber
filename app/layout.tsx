import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MentoCyber — Escola de prática em cibersegurança",
  description:
    "Formação prática em cibersegurança, com roadmaps, laboratórios e mentorias.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-brand="lichen">
      <body>{children}</body>
    </html>
  );
}
