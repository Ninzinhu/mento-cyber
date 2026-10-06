import type { Metadata } from "next";
import "./globals.css";
import { SmoothScroll } from "./components/behavior/smooth-scroll";

export const metadata: Metadata = {
  title: "MentoCyber — Comunidade de prática em cibersegurança",
  description:
    "Comunidade de prática em cibersegurança, com missões, laboratórios e revisão entre pares.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-brand="lichen">
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
