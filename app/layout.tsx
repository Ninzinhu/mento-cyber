import type { Metadata } from "next";
import "./globals.css";
import { SmoothScroll } from "./components/behavior/smooth-scroll";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mentocyber.com"),
  title: "MentoCyber — Comunidade de prática em cibersegurança",
  description:
    "Comunidade de prática em cibersegurança, com missões, laboratórios e revisão entre pares.",
  openGraph: {
    title: "MentoCyber",
    description: "Comunidade de prática em cibersegurança.",
    type: "website",
  },
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
